/**
 * Scaffold Injector Service
 *
 * Responsible for injecting and managing the base Flutter project scaffold.
 * These files are GOVERNED INFRASTRUCTURE - the LLM operates within this scaffold,
 * not by recreating it.
 *
 * File Governance Tiers:
 * - LOCKED: pubspec.yaml, main.dart - completely immutable
 * - RESTRICTED: app.dart - only title can change (derived from identity, not LLM)
 * - ADDITIVE: app_router.dart - LLM can add imports, routes, cases (not modify existing)
 * - CREATE: screens/, widgets/ - LLM has full control to create new files
 */

import { ProjectIdentity } from "../../project-identity/model";

// ============================================================================
// Types
// ============================================================================

export interface ScaffoldFile {
  path: string;
  content: string;
  governance: "locked" | "restricted" | "additive";
}

export interface RouterAdditions {
  imports: string[];
  routeConstants: string[];
  routeCases: string[];
}

export interface GeneratedScaffold {
  files: ScaffoldFile[];
  appName: string;
  appTitle: string;
}

// ============================================================================
// Scaffold Templates
// ============================================================================

/**
 * Template markers for additive sections in app_router.dart
 */
export const ROUTER_MARKERS = {
  IMPORTS_START: "// <<<SCREEN_IMPORTS>>>",
  IMPORTS_END: "// <<<END_SCREEN_IMPORTS>>>",
  CONSTANTS_START: "// <<<ROUTE_CONSTANTS>>>",
  CONSTANTS_END: "// <<<END_ROUTE_CONSTANTS>>>",
  CASES_START: "// <<<ROUTE_CASES>>>",
  CASES_END: "// <<<END_ROUTE_CASES>>>",
} as const;

/**
 * Generates pubspec.yaml content (LOCKED)
 */
function generatePubspecYaml(appName: string): string {
  return `name: ${appName}
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
  uses-material-design: true
`;
}

/**
 * Generates main.dart content (LOCKED)
 */
function generateMainDart(): string {
  return `import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const App());
}
`;
}

/**
 * Generates app.dart content (RESTRICTED - title derived from identity)
 */
function generateAppDart(appTitle: string): string {
  return `import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'routing/app_router.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return ShadApp(
      title: '${appTitle}',
      themeMode: ThemeMode.system,
      home: const AppRouter(),
    );
  }
}
`;
}

/**
 * Generates app_router.dart content (ADDITIVE - marked sections for LLM additions)
 */
function generateAppRouterDart(): string {
  return `import 'package:flutter/material.dart';
${ROUTER_MARKERS.IMPORTS_START}
import '../screens/home_screen.dart';
${ROUTER_MARKERS.IMPORTS_END}

class AppRouter extends StatelessWidget {
  const AppRouter({super.key});

  ${ROUTER_MARKERS.CONSTANTS_START}
  static const String home = '/';
  ${ROUTER_MARKERS.CONSTANTS_END}

  @override
  Widget build(BuildContext context) {
    return Navigator(
      initialRoute: home,
      onGenerateRoute: _onGenerateRoute,
    );
  }

  static Route<dynamic> _onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      ${ROUTER_MARKERS.CASES_START}
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      ${ROUTER_MARKERS.CASES_END}
      default:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
    }
  }
}
`;
}

/**
 * Generates the default home_screen.dart as a starting point
 */
function generateDefaultHomeScreen(appTitle: string): string {
  return `import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${appTitle}'),
      ),
      body: const Center(
        child: Text('Welcome! Build your app here.'),
      ),
    );
  }
}
`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Derives a valid Dart package name from project identity
 * Rules: lowercase, underscores only, must start with letter
 */
export function deriveAppName(identity: ProjectIdentity): string {
  const purpose = identity.core_definition.purpose || "flutter_app";

  // Extract key words and create a snake_case name
  const cleaned = purpose
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .trim()
    .split(/\s+/) // Split by whitespace
    .slice(0, 3) // Take first 3 words max
    .join("_");

  // Ensure it starts with a letter
  const name = cleaned.match(/^[a-z]/) ? cleaned : `app_${cleaned}`;

  // Ensure minimum length and valid format
  return name.length > 0 ? name.substring(0, 30) : "flutter_app";
}

/**
 * Derives a human-readable app title from project identity
 */
export function deriveAppTitle(identity: ProjectIdentity): string {
  const purpose = identity.core_definition.purpose || "Flutter App";

  // Capitalize first letter of each word, limit length
  const words = purpose.split(/\s+/).slice(0, 5);
  const title = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return title.length > 50 ? title.substring(0, 47) + "..." : title;
}

// ============================================================================
// Scaffold Injector Class
// ============================================================================

export class ScaffoldInjector {
  /**
   * Generates the complete scaffold for a new project
   */
  generateScaffold(identity: ProjectIdentity): GeneratedScaffold {
    const appName = deriveAppName(identity);
    const appTitle = deriveAppTitle(identity);

    const files: ScaffoldFile[] = [
      {
        path: "pubspec.yaml",
        content: generatePubspecYaml(appName),
        governance: "locked",
      },
      {
        path: "lib/main.dart",
        content: generateMainDart(),
        governance: "locked",
      },
      {
        path: "lib/app.dart",
        content: generateAppDart(appTitle),
        governance: "restricted",
      },
      {
        path: "lib/routing/app_router.dart",
        content: generateAppRouterDart(),
        governance: "additive",
      },
    ];

    return {
      files,
      appName,
      appTitle,
    };
  }

  /**
   * Generates just the default home screen (for initial scaffold)
   */
  generateDefaultHomeScreen(identity: ProjectIdentity): ScaffoldFile {
    const appTitle = deriveAppTitle(identity);
    return {
      path: "lib/screens/home_screen.dart",
      content: generateDefaultHomeScreen(appTitle),
      governance: "locked", // This is a placeholder, LLM will replace it
    };
  }

  /**
   * Merges router additions into the app_router.dart template
   */
  mergeRouterAdditions(
    baseRouter: string,
    additions: RouterAdditions
  ): string {
    let result = baseRouter;

    // Merge imports
    if (additions.imports.length > 0) {
      const importsSection = additions.imports
        .map((imp) => imp.trim())
        .filter((imp) => imp.length > 0)
        .join("\n");

      result = result.replace(
        ROUTER_MARKERS.IMPORTS_END,
        `${importsSection}\n${ROUTER_MARKERS.IMPORTS_END}`
      );
    }

    // Merge route constants
    if (additions.routeConstants.length > 0) {
      const constantsSection = additions.routeConstants
        .map((c) => `  ${c.trim()}`)
        .filter((c) => c.trim().length > 0)
        .join("\n");

      result = result.replace(
        ROUTER_MARKERS.CONSTANTS_END,
        `${constantsSection}\n  ${ROUTER_MARKERS.CONSTANTS_END}`
      );
    }

    // Merge route cases
    if (additions.routeCases.length > 0) {
      const casesSection = additions.routeCases
        .map((c) => `      ${c.trim()}`)
        .filter((c) => c.trim().length > 0)
        .join("\n");

      result = result.replace(
        ROUTER_MARKERS.CASES_END,
        `${casesSection}\n      ${ROUTER_MARKERS.CASES_END}`
      );
    }

    return result;
  }

  /**
   * Parses router additions from LLM output
   */
  parseRouterAdditions(llmOutput: string): RouterAdditions {
    const additions: RouterAdditions = {
      imports: [],
      routeConstants: [],
      routeCases: [],
    };

    // Look for router additions section
    const routerMatch = llmOutput.match(
      /<<<ROUTER_ADDITIONS>>>([\s\S]*?)<<<END_ROUTER_ADDITIONS>>>/
    );

    if (!routerMatch) {
      return additions;
    }

    const routerContent = routerMatch[1];

    // Parse IMPORTS section
    const importsMatch = routerContent.match(
      /IMPORTS:\s*([\s\S]*?)(?=ROUTES:|CASES:|$)/i
    );
    if (importsMatch) {
      additions.imports = importsMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("import "));
    }

    // Parse ROUTES section (constants)
    const routesMatch = routerContent.match(
      /ROUTES:\s*([\s\S]*?)(?=CASES:|IMPORTS:|$)/i
    );
    if (routesMatch) {
      additions.routeConstants = routesMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("static const"));
    }

    // Parse CASES section
    const casesMatch = routerContent.match(
      /CASES:\s*([\s\S]*?)(?=IMPORTS:|ROUTES:|$)/i
    );
    if (casesMatch) {
      // Parse case blocks (case X: return ...)
      const caseLines = casesMatch[1].split("\n").map((line) => line.trim());
      let currentCase = "";

      for (const line of caseLines) {
        if (line.startsWith("case ")) {
          if (currentCase) {
            additions.routeCases.push(currentCase);
          }
          currentCase = line;
        } else if (currentCase && line) {
          currentCase += "\n        " + line;
          if (line.includes(";")) {
            additions.routeCases.push(currentCase);
            currentCase = "";
          }
        }
      }

      if (currentCase) {
        additions.routeCases.push(currentCase);
      }
    }

    return additions;
  }

  /**
   * Validates that router additions reference screens that are being created
   */
  validateRouterAdditions(
    additions: RouterAdditions,
    createdScreenPaths: string[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Extract screen names from imports
    for (const imp of additions.imports) {
      const match = imp.match(/import\s+['"]\.\.\/screens\/(\w+)\.dart['"]/);
      if (match) {
        const screenFile = `lib/screens/${match[1]}.dart`;
        if (!createdScreenPaths.includes(screenFile)) {
          errors.push(
            `Router imports '${screenFile}' but this screen was not created`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets the scaffold file paths that LLM should NOT create
   */
  getLockedFilePaths(): string[] {
    return [
      "pubspec.yaml",
      "lib/main.dart",
      "lib/app.dart",
      "lib/routing/app_router.dart",
    ];
  }

  /**
   * Checks if a file path is a locked scaffold file
   */
  isLockedFile(filePath: string): boolean {
    return this.getLockedFilePaths().includes(filePath);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultInjector: ScaffoldInjector | null = null;

/**
 * Get the default ScaffoldInjector instance
 */
export function getScaffoldInjector(): ScaffoldInjector {
  if (!defaultInjector) {
    defaultInjector = new ScaffoldInjector();
  }
  return defaultInjector;
}

/**
 * Create a new ScaffoldInjector instance
 */
export function createScaffoldInjector(): ScaffoldInjector {
  return new ScaffoldInjector();
}
