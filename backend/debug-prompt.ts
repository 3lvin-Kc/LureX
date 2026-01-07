/**
 * Debug script to inspect the actual prompt being sent to LLM
 * and analyze why screens are not being generated correctly.
 *
 * Run with: npx ts-node debug-prompt.ts
 */

import * as dotenv from "dotenv";
dotenv.config();

import { ProjectIdentityService } from "./project-identity/project-identity-service";
import { ProjectIdentityRepository } from "./project-identity/repository";
import { ArchitectureService } from "./architecture/architecture-service";
import { ArchitectureRepository } from "./architecture/repository";
import { PromptAssembler } from "./code-generation/services/prompt-assembler";
import { ScaffoldInjector } from "./code-generation/services/scaffold-injector";
import { ResponseParser } from "./code-generation/services/response-parser";
import { getActiveAIProvider } from "./code-generation/services/ai-provider-factory";
import {
  validatePromptCategory,
  SUPPORTED_CATEGORIES,
} from "./architecture/feature-extractor";
import * as fs from "fs";

// Test prompts to analyze
const TEST_PROMPTS = [
  "build a todo app",
  // "Create a dating app with swipeable cards, matches list, and user profile",
  // "Create a music player app with library, now playing, and playlists",
];

async function analyzePromptGeneration(userPrompt: string) {
  console.log("\n" + "=".repeat(80));
  console.log("ANALYZING PROMPT:");
  console.log("=".repeat(80));
  console.log(`"${userPrompt}"`);
  console.log("=".repeat(80));

  // Step 1: Validate category
  console.log("\n📋 Step 1: Category Validation");
  const categoryValidation = validatePromptCategory(userPrompt);
  if (!categoryValidation.valid) {
    console.log(`   ❌ REJECTED: ${categoryValidation.error}`);
    return;
  }
  console.log(`   ✅ Category: ${categoryValidation.category}`);

  // Step 2: Create identity
  console.log("\n📋 Step 2: Creating Project Identity...");
  const identityService = new ProjectIdentityService(
    new ProjectIdentityRepository(),
  );
  const identity = await identityService.create({ purpose: userPrompt });
  console.log(`   ✅ Identity ID: ${identity.identity_id}`);
  console.log(`   Purpose: ${identity.core_definition.purpose}`);

  // Step 3: Create architecture plan
  console.log("\n📋 Step 3: Creating Architecture Plan...");
  const architectureService = new ArchitectureService(
    new ArchitectureRepository(),
  );

  let architecture;
  try {
    architecture = await architectureService.createArchitecturePlan(identity);
  } catch (e: any) {
    if (e.message.includes("already exists")) {
      architecture = await architectureService.getArchitecturePlan(
        identity.identity_id,
      );
    } else {
      throw e;
    }
  }

  if (!architecture) {
    console.log("   ❌ Failed to create architecture plan");
    return;
  }

  console.log(`   ✅ Plan ID: ${architecture.plan_id}`);
  console.log(`   Complexity: ${architecture.complexity_level}`);

  if (architecture.feature_analysis) {
    const fa = architecture.feature_analysis;
    console.log("\n   📊 Feature Analysis:");
    console.log(
      `      - Identified Features: ${fa.identified_features.length}`,
    );
    fa.identified_features.forEach((f, i) => {
      console.log(
        `        ${i + 1}. ${f.name} (${f.type}) - Primary: ${f.primary}`,
      );
    });

    console.log(`\n      - Screen Requirements:`);
    console.log(`        Minimum: ${fa.screen_requirements.minimum}`);
    console.log(`        Recommended: ${fa.screen_requirements.recommended}`);
    console.log(`        Maximum: ${fa.screen_requirements.maximum}`);

    if (fa.screen_requirements.suggested_screens) {
      console.log(`\n      - Suggested Screens:`);
      fa.screen_requirements.suggested_screens.forEach((s, i) => {
        console.log(`        ${i + 1}. ${s.file_name} - ${s.description}`);
      });
    }

    if (fa.widget_candidates && fa.widget_candidates.length > 0) {
      console.log(`\n      - Widget Candidates:`);
      fa.widget_candidates.forEach((w, i) => {
        console.log(`        ${i + 1}. ${w.file_name} - ${w.reason}`);
      });
    }
  }

  // Step 4: Generate scaffold
  console.log("\n📋 Step 4: Generating Scaffold...");
  const scaffoldInjector = new ScaffoldInjector();
  const scaffold = scaffoldInjector.generateScaffold(identity);
  console.log(`   ✅ Generated ${scaffold.files.length} scaffold files`);

  // Step 5: Assemble the prompt
  console.log("\n📋 Step 5: Assembling Prompt...");
  const promptAssembler = new PromptAssembler();
  const fullPrompt = promptAssembler.assembleScaffoldBasedPrompt(
    userPrompt,
    identity,
    architecture,
    scaffold,
  );

  // Save prompt to file for inspection
  const promptFileName = `debug_prompt_${Date.now()}.txt`;
  fs.writeFileSync(promptFileName, fullPrompt);
  console.log(`   ✅ Prompt saved to: ${promptFileName}`);
  console.log(`   Prompt length: ${fullPrompt.length} characters`);
  console.log(`   Estimated tokens: ~${Math.ceil(fullPrompt.length / 4)}`);

  // Show key sections of the prompt
  console.log("\n📋 Step 6: Prompt Analysis...");

  // Check for screen requirements section
  const screenReqMatch = fullPrompt.match(
    /MINIMUM REQUIRED:\s*(\d+)\s*screens/i,
  );
  if (screenReqMatch) {
    console.log(`   ✅ Screen requirement found: ${screenReqMatch[1]} screens`);
  } else {
    console.log("   ⚠️ Screen requirement NOT found in prompt!");
  }

  // Check for suggested screens
  const suggestedScreenMatches = fullPrompt.match(
    /lib\/screens\/\w+_screen\.dart/g,
  );
  if (suggestedScreenMatches) {
    console.log(
      `   ✅ Suggested screens in prompt: ${suggestedScreenMatches.length}`,
    );
    suggestedScreenMatches.forEach((s) => console.log(`      - ${s}`));
  }

  // Check for output format section
  if (fullPrompt.includes("<<<ROUTER_ADDITIONS>>>")) {
    console.log("   ✅ Router additions format present");
  } else {
    console.log("   ⚠️ Router additions format MISSING!");
  }

  if (fullPrompt.includes("<<<FILE_START>>>")) {
    console.log("   ✅ File delimiter format present");
  } else {
    console.log("   ⚠️ File delimiter format MISSING!");
  }

  // Step 7: Actually call the LLM (optional - expensive)
  const shouldCallLLM = process.argv.includes("--call-llm");
  if (shouldCallLLM) {
    console.log("\n📋 Step 7: Calling LLM...");
    try {
      const aiProvider = getActiveAIProvider();
      console.log(`   Using model: ${aiProvider.getModel()}`);

      let fullResponse = "";
      const response = await aiProvider.streamGenerateWithRetry(
        fullPrompt,
        {},
        0,
        (chunk) => {
          fullResponse += chunk;
          process.stdout.write(".");
        },
      );
      console.log("\n   ✅ LLM Response received");
      console.log(`   Response length: ${response.content.length} characters`);
      console.log(
        `   Tokens used: ${response.usage.promptTokens} prompt + ${response.usage.completionTokens} completion`,
      );

      // Save response to file
      const responseFileName = `debug_response_${Date.now()}.txt`;
      fs.writeFileSync(responseFileName, response.content);
      console.log(`   Response saved to: ${responseFileName}`);

      // Parse the response
      console.log("\n📋 Step 8: Parsing Response...");
      const parser = new ResponseParser();
      const parsed = parser.parseResponse(response.content, architecture);

      console.log(`   Success: ${parsed.success}`);
      console.log(`   Files parsed: ${parsed.files.length}`);
      parsed.files.forEach((f) => console.log(`      - ${f.path}`));

      if (parsed.errors.length > 0) {
        console.log(`   Errors (${parsed.errors.length}):`);
        parsed.errors.forEach((e) => console.log(`      ❌ ${e.message}`));
      }

      if (parsed.warnings.length > 0) {
        console.log(`   Warnings (${parsed.warnings.length}):`);
        parsed.warnings.forEach((w) => console.log(`      ⚠️ ${w.message}`));
      }

      // Show router additions
      if (parsed.routerAdditions.imports.length > 0) {
        console.log(
          `   Router imports: ${parsed.routerAdditions.imports.length}`,
        );
      } else {
        console.log("   ⚠️ No router imports found!");
      }

      // Show first 500 chars of response for debugging
      console.log("\n   First 500 chars of response:");
      console.log("   " + "-".repeat(60));
      console.log(
        "   " + response.content.substring(0, 500).replace(/\n/g, "\n   "),
      );
      console.log("   " + "-".repeat(60));
    } catch (error: any) {
      console.log(`   ❌ LLM call failed: ${error.message}`);
    }
  } else {
    console.log("\n📋 Step 7: Skipping LLM call (use --call-llm to enable)");
  }

  console.log("\n" + "=".repeat(80));
  console.log("ANALYSIS COMPLETE");
  console.log("=".repeat(80));
}

async function main() {
  console.log("🔍 Prompt Debug Tool");
  console.log("====================\n");

  console.log("Supported Categories:");
  SUPPORTED_CATEGORIES.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));

  // Use command line argument if provided, otherwise use first test prompt
  const userPrompt = process.argv[2] || TEST_PROMPTS[0];

  try {
    await analyzePromptGeneration(userPrompt);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
  }
}

main();
