/**
 * Prompt Assembler Service
 *
 * Responsible for constructing the AI prompt that will be sent to OpenRouter
 * for code generation.
 *
 * SCAFFOLD-BASED APPROACH:
 * The base files (pubspec.yaml, main.dart, app.dart, app_router.dart) are
 * INJECTED by the system - the LLM does NOT create them.
 *
 * The LLM's role is to:
 * 1. Create screen files in lib/screens/
 * 2. Create widget files in lib/widgets/ (if needed)
 * 3. Provide router additions (imports, routes, cases) for new screens
 *
 * This reduces hallucination and ensures consistent project structure.
 */

import { ProjectIdentity } from "../../project-identity/model";
import { ArchitecturePlan } from "../../architecture/model";
import {
  GeneratedScaffold,
  ROUTER_MARKERS,
  deriveAppTitle,
} from "./scaffold-injector";
import { DELIMITERS } from "./base-structure-template";

// ============================================================================
// Prompt Templates
// ============================================================================

const SCAFFOLD_BASED_AUTHORITY = `
# YOUR ROLE

You are a senior Flutter developer implementing screens and widgets for a Flutter application.
The project scaffold (base files) ALREADY EXISTS - you do NOT create them.

## ABSOLUTE RULES (VIOLATION = FAILURE):

1. ❌ NEVER create: pubspec.yaml, main.dart, app.dart, or app_router.dart
2. ✅ ONLY create files in: lib/screens/ and lib/widgets/
3. ✅ MUST provide ROUTER_ADDITIONS for EVERY screen you create
4. ✅ MUST create ALL widget files that you import
5. ❌ NEVER use TODO, FIXME, or placeholder comments
6. ❌ NEVER import app_router.dart from screen files
7. ❌ NEVER import one screen from another screen
8. ✅ Screens can ONLY import: packages and widgets (../widgets/*.dart)
`.trim();

const PLATFORM_CONSTRAINTS = `
# PLATFORM CONSTRAINTS

This is a UI-ONLY platform. You are generating Flutter UI code only.

STRICT RULES:
- NO backend code, NO API calls, NO networking
- NO database operations, NO server-side logic
- NO http package, NO dio, NO Firebase calls
- ONLY Flutter UI code with shadcn_ui components
- Use MOCK/STATIC data for all content

Focus entirely on building a beautiful, functional UI.
`.trim();

const IMPORT_RULES = `
# IMPORT RULES (CRITICAL)

## What Screen Files CAN Import:
✅ import 'package:flutter/material.dart';
✅ import 'package:shadcn_ui/shadcn_ui.dart';
✅ import '../widgets/my_widget.dart';  (ONLY if you create this widget file)

## What Screen Files CANNOT Import:
❌ import '../routing/app_router.dart';  (FORBIDDEN)
❌ import '../screens/other_screen.dart';  (FORBIDDEN)
❌ import '../main.dart';  (FORBIDDEN)
❌ import 'package:http/http.dart';  (FORBIDDEN)

## IMPORT CONSISTENCY RULE:
If you write: import '../widgets/user_card.dart';
Then you MUST create: lib/widgets/user_card.dart

FAILURE TO CREATE IMPORTED WIDGETS = GENERATION FAILURE
`.trim();

// ============================================================================
// Prompt Assembler Class
// ============================================================================

export class PromptAssembler {
  /**
   * Assembles the prompt for scaffold-based code generation.
   * Shows the existing scaffold and asks LLM to create only screens/widgets.
   */
  assembleScaffoldBasedPrompt(
    userPrompt: string,
    identity: ProjectIdentity,
    architecture: ArchitecturePlan,
    scaffold: GeneratedScaffold,
  ): string {
    const sections = [
      SCAFFOLD_BASED_AUTHORITY,
      PLATFORM_CONSTRAINTS,
      IMPORT_RULES,
      this.buildExistingScaffoldSection(scaffold),
      this.buildDesignSystemSection(),
      this.buildFeatureAnalysisSection(architecture),
      this.buildTaskSection(userPrompt, scaffold.appTitle, architecture),
      this.buildOutputFormatSection(architecture),
      this.buildFinalChecklist(architecture),
    ];

    return sections.join("\n\n---\n\n");
  }

  /**
   * Builds the feature analysis section for the prompt.
   * This section provides the LLM with specific guidance on screen count and types.
   */
  private buildFeatureAnalysisSection(architecture: ArchitecturePlan): string {
    if (!architecture.feature_analysis) {
      return `
# SCREEN REQUIREMENTS

You MUST create at least 1 screen file.
Create additional screens as needed for the app's functionality.
`.trim();
    }

    const { identified_features, screen_requirements, widget_candidates } =
      architecture.feature_analysis;

    let section = `
# ⚠️ MANDATORY SCREEN & WIDGET REQUIREMENTS ⚠️

## CRITICAL: SCREEN COUNT REQUIREMENTS

╔════════════════════════════════════════════════════════════════╗
║  YOU MUST CREATE EXACTLY ${screen_requirements.minimum} OR MORE SCREEN FILES              ║
║  GENERATING FEWER THAN ${screen_requirements.minimum} SCREENS = AUTOMATIC FAILURE        ║
╚════════════════════════════════════════════════════════════════╝

- MINIMUM REQUIRED: ${screen_requirements.minimum} screens (HARD REQUIREMENT)
- RECOMMENDED: ${screen_requirements.recommended} screens
- MAXIMUM: ${screen_requirements.maximum} screens

DO NOT PROCEED with less than ${screen_requirements.minimum} screen files.
Each screen listed below MUST have its own file in lib/screens/.
`;

    // List required screens
    if (
      screen_requirements.suggested_screens &&
      screen_requirements.suggested_screens.length > 0
    ) {
      section += `\n## REQUIRED SCREENS - CREATE ALL ${screen_requirements.suggested_screens.length} FILES:\n`;
      section += `\n| # | File Path | Purpose |\n`;
      section += `|---|-----------|----------|\n`;
      screen_requirements.suggested_screens.forEach((screen, index) => {
        const homeLabel = screen.is_home ? " (HOME)" : "";
        section += `| ${index + 1} | lib/screens/${screen.file_name} | ${screen.description}${homeLabel} |\n`;
      });
      section += `\n⚠️ CREATE ALL ${screen_requirements.suggested_screens.length} SCREEN FILES LISTED ABOVE.\n`;
    }

    // List required widgets
    if (widget_candidates && widget_candidates.length > 0) {
      section += `\n## REQUIRED WIDGETS (create if used in screens):\n`;
      widget_candidates.forEach((widget, index) => {
        section += `${index + 1}. **lib/widgets/${widget.file_name}**\n`;
        section += `   - Used in: ${widget.used_in.join(", ")}\n`;
        section += `   - Purpose: ${widget.reason}\n`;
      });
      section += `\n⚠️ If you import a widget, you MUST create its file. Missing widget = failure.\n`;
    }

    // List identified features
    if (identified_features && identified_features.length > 0) {
      section += `\n## APP FEATURES TO IMPLEMENT:\n`;
      identified_features.forEach((feature, index) => {
        const primaryLabel = feature.primary ? " [PRIMARY]" : "";
        section += `${index + 1}. ${feature.name}${primaryLabel}: ${feature.description}\n`;
      });
    }

    return section.trim();
  }

  /**
   * Assembles a retry prompt after validation failure
   */
  assembleRetryPrompt(
    originalPrompt: string,
    errorMessage: string,
    previousOutput: string,
    scaffold: GeneratedScaffold,
  ): string {
    return `
${SCAFFOLD_BASED_AUTHORITY}

${IMPORT_RULES}

# ⚠️ RETRY - YOUR PREVIOUS ATTEMPT FAILED

## Error Message:
${errorMessage}

## Your Previous Output (REJECTED):
\`\`\`
${previousOutput.substring(0, 2000)}${previousOutput.length > 2000 ? "\n...[truncated]" : ""}
\`\`\`

# WHAT YOU MUST FIX:

1. Read the error message carefully
2. If "missing widget" - CREATE the widget file you imported
3. If "missing router" - ADD router additions for all screens
4. If "screen count" - CREATE more screen files
5. If "forbidden import" - REMOVE the forbidden import

# RULES REMINDER:
- Every screen needs a ROUTER_ADDITIONS entry
- Every imported widget needs its file created
- Screens cannot import app_router.dart or other screens

${this.buildOutputFormatSection()}

# ORIGINAL REQUEST:
${originalPrompt}

Generate the CORRECTED output now. Follow the format exactly.
`.trim();
  }

  // ============================================================================
  // Private Section Builders
  // ============================================================================

  /**
   * Shows the existing scaffold files so LLM understands the context
   */
  private buildExistingScaffoldSection(scaffold: GeneratedScaffold): string {
    return `
# EXISTING PROJECT SCAFFOLD (DO NOT RECREATE)

These files are LOCKED and already exist. Do NOT output these files.

## pubspec.yaml (EXISTS)
\`\`\`yaml
${scaffold.files.find((f) => f.path === "pubspec.yaml")?.content || ""}
\`\`\`

## lib/main.dart (EXISTS)
\`\`\`dart
${scaffold.files.find((f) => f.path === "lib/main.dart")?.content || ""}
\`\`\`

## lib/app.dart (EXISTS)
\`\`\`dart
${scaffold.files.find((f) => f.path === "lib/app.dart")?.content || ""}
\`\`\`

## lib/routing/app_router.dart (EXISTS - YOU ADD TO IT)

This file exists with marked sections. You provide ADDITIONS via ROUTER_ADDITIONS.

\`\`\`dart
${scaffold.files.find((f) => f.path === "lib/routing/app_router.dart")?.content || ""}
\`\`\`

Your ROUTER_ADDITIONS will be merged into:
- ${ROUTER_MARKERS.IMPORTS_START} → Add screen imports here
- ${ROUTER_MARKERS.CONSTANTS_START} → Add route constants here
- ${ROUTER_MARKERS.CASES_START} → Add route cases here
`.trim();
  }

  /**
   * Explains the shadcn_ui design system
   */
  private buildDesignSystemSection(): string {
    return `
# DESIGN SYSTEM: shadcn_ui

You MUST use shadcn_ui components for all UI elements.

## Import:
\`\`\`dart
import 'package:shadcn_ui/shadcn_ui.dart';
\`\`\`

## Primary Components (USE THESE):
| Component | Use Instead Of |
|-----------|----------------|
| ShadButton | ElevatedButton, TextButton |
| ShadCard | Card, Container |
| ShadInput | TextField, TextFormField |
| ShadSelect | DropdownButton |
| ShadCheckbox | Checkbox |
| ShadSwitch | Switch |
| ShadDialog | AlertDialog, showDialog |
| ShadSheet | BottomSheet |
| ShadToast | SnackBar |
| ShadAvatar | CircleAvatar |
| ShadBadge | Chip |
| ShadTabs | TabBar |
| ShadProgress | LinearProgressIndicator |

## Layout Structure:
- Use Scaffold for page structure
- Use AppBar for navigation headers
- Use shadcn_ui widgets for interactive elements
- Use Material widgets (Row, Column, Container) for layout
`.trim();
  }

  /**
   * Defines what the LLM should create
   */
  private buildTaskSection(
    userPrompt: string,
    appTitle: string,
    architecture: ArchitecturePlan,
  ): string {
    const minScreens =
      architecture.feature_analysis?.screen_requirements?.minimum || 1;
    const widgetCount =
      architecture.feature_analysis?.widget_candidates?.length || 0;

    return `
# YOUR TASK

**App Title:** "${appTitle}"

**User Request:**
"${userPrompt}"

## WHAT YOU MUST CREATE:

### 1. Screen Files (REQUIRED - minimum ${minScreens})
Location: lib/screens/
Naming: snake_case (e.g., home_screen.dart, settings_screen.dart)

Requirements:
- Each screen must be a StatelessWidget or StatefulWidget
- Each screen must have a const constructor with super.key
- Use shadcn_ui components for UI elements
- Include complete, working implementations

### 2. Widget Files (REQUIRED if imported - ${widgetCount} suggested)
Location: lib/widgets/
Naming: snake_case (e.g., user_card.dart, song_tile.dart)

Requirements:
- Create reusable widgets for repeated UI patterns
- If a screen imports a widget, THAT WIDGET MUST EXIST
- Use const constructors where possible

### 3. Router Additions (REQUIRED for EVERY screen)
You MUST provide router additions that include:
- Import statement for each screen
- Route constant for each screen
- Case statement for each screen

## CODE QUALITY REQUIREMENTS:
- Use \`const\` constructors where possible
- Use \`super.key\` in widget constructors
- NO TODO comments, NO FIXME, NO placeholders
- Complete implementations only
- Proper null safety
- Meaningful variable and function names
`.trim();
  }

  /**
   * Defines the exact output format expected
   */
  private buildOutputFormatSection(architecture?: ArchitecturePlan): string {
    const screens =
      architecture?.feature_analysis?.screen_requirements?.suggested_screens ||
      [];
    const widgets = architecture?.feature_analysis?.widget_candidates || [];

    // Build example router additions based on actual screens
    let exampleImports = "import '../screens/home_screen.dart';";
    let exampleRoutes = "static const String home = '/';";
    let exampleCases =
      "case home:\n  return MaterialPageRoute(builder: (_) => const HomeScreen());";

    if (screens.length > 1) {
      exampleImports += `\nimport '../screens/${screens[1].file_name}';`;
      const routeName = screens[1].name.replace("_screen", "");
      exampleRoutes += `\nstatic const String ${routeName} = '/${routeName}';`;
      const className = this.toClassName(screens[1].name);
      exampleCases += `\ncase ${routeName}:\n  return MaterialPageRoute(builder: (_) => const ${className}());`;
    }

    return `
# OUTPUT FORMAT (FOLLOW EXACTLY)

Your response must contain these sections IN ORDER:

## SECTION 1: ROUTER_ADDITIONS (REQUIRED FIRST)

\`\`\`
<<<ROUTER_ADDITIONS>>>
IMPORTS:
${exampleImports}

ROUTES:
${exampleRoutes}

CASES:
${exampleCases}
<<<END_ROUTER_ADDITIONS>>>
\`\`\`

## SECTION 2: SCREEN FILES (REQUIRED)

For EACH screen, use this exact format:

${DELIMITERS.FILE_START}
${DELIMITERS.FILE_PATH}
lib/screens/home_screen.dart
${DELIMITERS.FILE_CONTENT}
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: Center(
        child: ShadButton(
          onPressed: () {},
          child: const Text('Hello'),
        ),
      ),
    );
  }
}
${DELIMITERS.FILE_END}

## SECTION 3: WIDGET FILES (IF YOU IMPORT ANY)

${DELIMITERS.FILE_START}
${DELIMITERS.FILE_PATH}
lib/widgets/example_widget.dart
${DELIMITERS.FILE_CONTENT}
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class ExampleWidget extends StatelessWidget {
  const ExampleWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShadCard(
      child: Text('Example'),
    );
  }
}
${DELIMITERS.FILE_END}

## FORMAT RULES:
1. Start with <<<ROUTER_ADDITIONS>>> section
2. Each file uses ${DELIMITERS.FILE_START} and ${DELIMITERS.FILE_END}
3. Path goes after ${DELIMITERS.FILE_PATH}
4. Code goes after ${DELIMITERS.FILE_CONTENT}
5. NO markdown, NO explanations between files
6. Write raw Dart code - no escaping needed
`.trim();
  }

  /**
   * Builds a final checklist for the LLM to verify before outputting
   */
  private buildFinalChecklist(architecture: ArchitecturePlan): string {
    const minScreens =
      architecture.feature_analysis?.screen_requirements?.minimum || 1;
    const suggestedScreens =
      architecture.feature_analysis?.screen_requirements?.suggested_screens ||
      [];
    const widgets = architecture.feature_analysis?.widget_candidates || [];

    const screenList = suggestedScreens
      .map((s) => `lib/screens/${s.file_name}`)
      .join(", ");

    return `
# ⚠️ FINAL VERIFICATION CHECKLIST ⚠️

## SCREEN COUNT CHECK (MOST IMPORTANT):
You are about to output. Count your screen files:
- Required minimum: ${minScreens} screens
- You MUST create: ${screenList || "at least " + minScreens + " screen files"}

╔════════════════════════════════════════════════════════════════╗
║  IF YOU HAVE FEWER THAN ${minScreens} SCREEN FILES, STOP AND ADD MORE!     ║
╚════════════════════════════════════════════════════════════════╝

## COMPLETE CHECKLIST:
□ ROUTER_ADDITIONS section comes FIRST
□ Created ${minScreens}+ screen files (COUNT THEM!)
□ Every screen has router import, route constant, and case
□ Every imported widget file exists
□ No screen imports app_router.dart
□ No screen imports another screen
□ Using shadcn_ui components
□ No TODO/FIXME comments
□ All classes have const constructor with super.key

## YOUR OUTPUT MUST CONTAIN:
1. <<<ROUTER_ADDITIONS>>> ... <<<END_ROUTER_ADDITIONS>>>
2. ${minScreens}+ screen files with ${DELIMITERS.FILE_START}...${DELIMITERS.FILE_END}
3. Any widget files you imported

NOW OUTPUT THE COMPLETE GENERATION:
`.trim();
  }

  /**
   * Converts snake_case to PascalCase class name
   */
  private toClassName(snakeCaseName: string): string {
    return snakeCaseName
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Estimates the token count for a prompt (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncates prompt if it exceeds token limit while preserving structure
 */
export function truncatePromptIfNeeded(
  prompt: string,
): string {
  // No truncation - return prompt as-is
  return prompt;
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultAssembler: PromptAssembler | null = null;

export function getPromptAssembler(): PromptAssembler {
  if (!defaultAssembler) {
    defaultAssembler = new PromptAssembler();
  }
  return defaultAssembler;
}

export function createPromptAssembler(): PromptAssembler {
  return new PromptAssembler();
}
