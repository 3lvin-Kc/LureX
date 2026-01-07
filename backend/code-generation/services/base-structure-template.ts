/**
 * Base Flutter Structure Template
 *
 * SINGLE SOURCE OF TRUTH for the invariant project structure that ALL Flutter apps must follow.
 *
 * This is a UI-ONLY platform. We generate Flutter client-side applications with:
 * - Material as the infrastructure layer (Flutter's foundation)
 * - shadcn_ui as the design system layer (actual UI components)
 *
 * The LLM decides how many files to create based on app requirements.
 * We only enforce:
 * - 4 mandatory base files (pubspec.yaml, main.dart, app.dart, app_router.dart)
 * - Screens must be in lib/screens/*
 * - Widgets must be in lib/widgets/*
 */

// ============================================================================
// Constants - Mandatory Structure
// ============================================================================

/**
 * The 4 mandatory base files that EVERY Flutter app must have.
 * These are non-negotiable regardless of app complexity.
 */
export const MANDATORY_FILES = {
  root: ["pubspec.yaml"] as const,
  lib: [
    "lib/main.dart",
    "lib/app.dart",
    "lib/routing/app_router.dart",
  ] as const,
} as const;

/**
 * All mandatory files combined for easy validation
 */
export const ALL_MANDATORY_FILES = [
  "pubspec.yaml",
  "lib/main.dart",
  "lib/app.dart",
  "lib/routing/app_router.dart",
] as const;

/**
 * Folder conventions - screens and widgets must be in these locations
 */
export const FOLDER_CONVENTIONS = {
  screens: "lib/screens/",
  widgets: "lib/widgets/",
  routing: "lib/routing/",
} as const;

// ============================================================================
// Delimiter Format Constants
// ============================================================================

/**
 * Delimiters for parsing LLM output.
 * Using delimiters instead of JSON avoids escaping issues with Dart code.
 */
export const DELIMITERS = {
  FILE_START: "<<<FILE_START>>>",
  FILE_PATH: "<<<PATH>>>",
  FILE_CONTENT: "<<<CONTENT>>>",
  FILE_END: "<<<FILE_END>>>",
} as const;

// ============================================================================
// Prompt Generation Functions
// ============================================================================

/**
 * Generates the output format instructions using delimiter format
 */
export function getOutputFormatInstructions(): string {
  return `
# OUTPUT FORMAT

You MUST return files using this EXACT delimiter format. Do NOT use JSON.

For each file, use this structure:

${DELIMITERS.FILE_START}
${DELIMITERS.FILE_PATH}
lib/main.dart
${DELIMITERS.FILE_CONTENT}
import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const App());
}
${DELIMITERS.FILE_END}

${DELIMITERS.FILE_START}
${DELIMITERS.FILE_PATH}
lib/screens/home_screen.dart
${DELIMITERS.FILE_CONTENT}
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
// ... rest of the code
${DELIMITERS.FILE_END}

CRITICAL OUTPUT RULES:
1. Start each file with ${DELIMITERS.FILE_START}
2. Put the file path after ${DELIMITERS.FILE_PATH} on its own line
3. Put the full code after ${DELIMITERS.FILE_CONTENT}
4. End each file with ${DELIMITERS.FILE_END}
5. No markdown, no explanations, no JSON - ONLY the delimiter format
6. Write Dart code naturally - no escaping needed
7. Every file must contain COMPLETE, VALID Dart code
8. No TODO comments, no placeholder code, no stub functions
`.trim();
}

/**
 * Generates the pubspec.yaml template
 */
export function getPubspecTemplate(appName: string): string {
  return `name: ${appName.toLowerCase().replace(/[^a-z0-9_]/g, "_")}
description: A Flutter application built with shadcn_ui
version: 1.0.0+1
publish_to: 'none'

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  shadcn_ui: ^0.10.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`;
}

/**
 * Generates the mandatory project structure section for prompts
 */
export function getMandatoryStructurePrompt(): string {
  return `
# MANDATORY PROJECT STRUCTURE

Every Flutter app MUST have these 4 base files. This is non-negotiable.

## Required Base Files:

1. **pubspec.yaml** - Project configuration with shadcn_ui dependency
2. **lib/main.dart** - Entry point ONLY (just runApp call, no widget definitions)
3. **lib/app.dart** - App configuration with ShadApp widget
4. **lib/routing/app_router.dart** - Centralized route definitions

## Folder Conventions:

- All screen files MUST be in \`lib/screens/\` (e.g., \`lib/screens/home_screen.dart\`)
- All reusable widget files MUST be in \`lib/widgets/\` (e.g., \`lib/widgets/custom_button.dart\`)
- Routing files are in \`lib/routing/\`

## File Naming:

- Screens: \`*_screen.dart\` (e.g., \`home_screen.dart\`, \`settings_screen.dart\`)
- Widgets: descriptive snake_case (e.g., \`user_avatar.dart\`, \`action_button.dart\`)
- Use snake_case for all file names
- Use PascalCase for class names
`.trim();
}

/**
 * Generates the architecture principles section for prompts
 * This teaches the LLM HOW to think, not WHAT to copy
 */
export function getArchitecturePrinciplesPrompt(): string {
  return `
# ARCHITECTURE PRINCIPLES

## UI Layer Architecture

- **Material** = Infrastructure layer (Flutter's foundation, Scaffold, Navigator, etc.)
- **shadcn_ui** = Design system layer (ShadButton, ShadCard, ShadInput, etc.)

Always use shadcn_ui components over Material equivalents when available.

## Entry Point Pattern

The app follows a clear initialization chain:
\`main.dart\` → \`app.dart\` → \`app_router.dart\` → screens

\`\`\`dart
// lib/main.dart - ENTRY POINT ONLY
import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const App());
}
\`\`\`

\`\`\`dart
// lib/app.dart - App configuration
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'routing/app_router.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return ShadApp(
      title: 'App Name',
      themeMode: ThemeMode.system,
      onGenerateRoute: AppRouter.onGenerateRoute,
      initialRoute: AppRouter.initialRoute,
    );
  }
}
\`\`\`

\`\`\`dart
// lib/routing/app_router.dart - Centralized routing
import 'package:flutter/material.dart';
import '../screens/home_screen.dart';

class AppRouter {
  static const String initialRoute = '/';
  static const String home = '/';
  // Add more route constants as needed

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      // Add more routes as needed
      default:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
    }
  }
}
\`\`\`

## Widget Composition Principles

1. **One primary widget per file** - Keep files focused
2. **Extract reusable widgets** - If a widget is used 2+ times, extract it to lib/widgets/
3. **Compose, don't inherit** - Build complex UIs by composing smaller widgets
4. **Use const constructors** - For widgets that don't change

## Screen Structure

Each screen should:
- Be in its own file in lib/screens/
- Have a single primary StatelessWidget or StatefulWidget
- Import shadcn_ui for UI components
- Handle its own layout and composition

## Decision Making

YOU decide based on the app requirements:
- How many screens are needed
- Which widgets should be extracted and reused
- The appropriate level of decomposition
- Screen names based on their purpose

Keep it simple for simple apps. Add complexity only when needed.
`.trim();
}

/**
 * Generates the design system section for prompts
 */
export function getDesignSystemPrompt(): string {
  return `
# DESIGN SYSTEM: shadcn_ui

You MUST use shadcn_ui as the primary UI component library.

Package: shadcn_ui (https://pub.dev/packages/shadcn_ui)
Import: import 'package:shadcn_ui/shadcn_ui.dart';

## Core Rules:

1. Use **ShadApp** as the root widget (not MaterialApp)
2. Use **ShadTheme** for consistent theming
3. Use **Shad*** components for UI elements
4. Material widgets are OK for infrastructure (Scaffold, Navigator, etc.)

## Available Components (use these over Material equivalents):

**Buttons & Actions:**
- ShadButton, ShadButtonGroup

**Cards & Containers:**
- ShadCard, ShadCardHeader, ShadCardContent, ShadCardFooter

**Form Inputs:**
- ShadInput, ShadInputFormField
- ShadSelect, ShadSelectItem
- ShadCheckbox, ShadRadio, ShadSwitch

**Overlays & Dialogs:**
- ShadDialog, ShadSheet, ShadPopover
- ShadToast, ShadAlert

**Display:**
- ShadAvatar, ShadBadge
- ShadProgress, ShadSlider
- ShadTable, ShadTableRow, ShadTableCell
- ShadTabs, ShadTabBar

## Example Usage:

\`\`\`dart
// Using ShadButton instead of ElevatedButton
ShadButton(
  onPressed: () => print('Clicked'),
  child: const Text('Click me'),
)

// Using ShadCard
ShadCard(
  child: Column(
    children: [
      ShadCardHeader(child: Text('Title')),
      ShadCardContent(child: Text('Content here')),
      ShadCardFooter(child: ShadButton(...)),
    ],
  ),
)

// Using ShadInput
ShadInput(
  placeholder: const Text('Enter your name'),
  onChanged: (value) => print(value),
)
\`\`\`

If shadcn_ui doesn't have a specific component, use Flutter's standard Material widgets.
`.trim();
}

/**
 * Generates the code quality requirements section for prompts
 */
export function getCodeQualityPrompt(): string {
  return `
# CODE QUALITY REQUIREMENTS

## Completeness:
- Every widget must have full implementation
- Every screen must be fully interactive
- All buttons must have onPressed handlers
- No TODO comments, no placeholders, no stubs

## Dart Best Practices:
- Use \`const\` constructors where possible
- Proper null safety (avoid unnecessary \`!\`)
- Meaningful variable and function names
- Use proper typing (avoid \`dynamic\`)
- Use \`super.key\` in widget constructors

## File Organization:
- One primary class per file
- Consistent import ordering (dart:, package:, relative)
- No circular dependencies
- All imports must reference files you create or valid packages
`.trim();
}

/**
 * Assembles the complete file strategy section for prompts
 */
export function getFileStrategyPrompt(): string {
  return `
${getMandatoryStructurePrompt()}

${getArchitecturePrinciplesPrompt()}

${getDesignSystemPrompt()}

${getCodeQualityPrompt()}

${getOutputFormatInstructions()}
`.trim();
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Checks if a file path is a valid screen location
 */
export function isValidScreenPath(filePath: string): boolean {
  return (
    filePath.startsWith(FOLDER_CONVENTIONS.screens) &&
    filePath.endsWith(".dart")
  );
}

/**
 * Checks if a file path is a valid widget location
 */
export function isValidWidgetPath(filePath: string): boolean {
  return (
    filePath.startsWith(FOLDER_CONVENTIONS.widgets) &&
    filePath.endsWith(".dart")
  );
}

/**
 * Checks if a file path is one of the mandatory base files
 */
export function isMandatoryFile(filePath: string): boolean {
  return ALL_MANDATORY_FILES.includes(
    filePath as (typeof ALL_MANDATORY_FILES)[number],
  );
}

/**
 * Checks if a file path is in a valid location
 * Valid locations: mandatory files, screens/, widgets/, routing/
 */
export function isValidFilePath(filePath: string): boolean {
  // Mandatory files are always valid
  if (isMandatoryFile(filePath)) {
    return true;
  }

  // Check valid folder locations
  if (filePath.startsWith(FOLDER_CONVENTIONS.screens)) return true;
  if (filePath.startsWith(FOLDER_CONVENTIONS.widgets)) return true;
  if (filePath.startsWith(FOLDER_CONVENTIONS.routing)) return true;

  // pubspec.yaml is valid
  if (filePath === "pubspec.yaml") return true;

  return false;
}

/**
 * Determines what type of file this is based on its path
 */
export function getFileType(
  filePath: string,
): "mandatory" | "screen" | "widget" | "routing" | "config" | "unknown" {
  if (filePath === "pubspec.yaml") return "config";
  if (
    MANDATORY_FILES.lib.includes(
      filePath as (typeof MANDATORY_FILES.lib)[number],
    )
  )
    return "mandatory";
  if (filePath.startsWith(FOLDER_CONVENTIONS.screens)) return "screen";
  if (filePath.startsWith(FOLDER_CONVENTIONS.widgets)) return "widget";
  if (filePath.startsWith(FOLDER_CONVENTIONS.routing)) return "routing";
  return "unknown";
}

/**
 * Gets all missing mandatory files from a list of file paths
 */
export function getMissingMandatoryFiles(filePaths: string[]): string[] {
  return ALL_MANDATORY_FILES.filter(
    (required) => !filePaths.includes(required),
  );
}

/**
 * Validates that all files are in correct locations
 * Returns an object with valid status and any errors
 */
export function validateFileLocations(filePaths: string[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check mandatory files
  const missingMandatory = getMissingMandatoryFiles(filePaths);
  for (const missing of missingMandatory) {
    errors.push(`Missing mandatory file: ${missing}`);
  }

  // Check each file is in a valid location
  for (const filePath of filePaths) {
    const fileType = getFileType(filePath);

    if (fileType === "unknown") {
      // Check if it looks like a screen but is in wrong location
      if (
        filePath.endsWith("_screen.dart") &&
        !filePath.startsWith(FOLDER_CONVENTIONS.screens)
      ) {
        errors.push(
          `Screen file "${filePath}" must be in ${FOLDER_CONVENTIONS.screens}`,
        );
      }
      // Check if it looks like a widget but is in wrong location
      else if (
        filePath.startsWith("lib/") &&
        filePath.endsWith(".dart") &&
        !filePath.includes("/screens/") &&
        !filePath.includes("/routing/")
      ) {
        // This might be a widget in wrong location
        if (!isMandatoryFile(filePath)) {
          errors.push(
            `File "${filePath}" is in invalid location. Widgets must be in ${FOLDER_CONVENTIONS.widgets}, screens in ${FOLDER_CONVENTIONS.screens}`,
          );
        }
      }
    }
  }

  // Check for at least one screen
  const hasScreen = filePaths.some((p) =>
    p.startsWith(FOLDER_CONVENTIONS.screens),
  );
  if (!hasScreen) {
    errors.push(
      `At least one screen file is required in ${FOLDER_CONVENTIONS.screens}`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
