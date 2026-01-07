/**
 * Test Response Parser Minimum Screens Validation
 *
 * This test verifies that the response parser correctly validates
 * minimum screen requirements from the architecture plan.
 */

import { ResponseParser, createResponseParser } from "./services/response-parser";
import { ArchitecturePlan } from "../architecture/model";
import { ParsedFile } from "./models/generated-artifact";

// Mock architecture plan with screen requirements
const createMockArchitecture = (minimum: number, recommended: number, maximum: number): ArchitecturePlan => ({
  plan_id: "test-plan-id",
  project_identity_id: "test-identity-id",
  conceptual_category: "utility",
  complexity_level: "simple",
  structural_philosophy: "multi_screen",
  execution_model: {
    entry_point: "lib/main.dart",
    app_lifecycle: "stateful",
    navigation_pattern: "tab_navigation",
    screen_transitions: "material",
  },
  concern_separation: {
    screen_organization: "screen_per_file",
    widget_separation: "separate_widget_files",
    model_layer: "separate_model_files",
    service_layer: "service_classes",
  },
  state_management: {
    primary_pattern: "setState",
    state_scope: "local_state",
    data_flow: "top_down",
    persistence: "none",
  },
  file_strategy: {
    initial_file_count: 6,
    project_structure: "layer_first",
    screen_files: [],
    widget_files: [],
    model_files: [],
    service_files: [],
    decomposition_strategy: "by_feature",
    split_triggers: {
      lines_per_file: 200,
      widgets_per_file: 5,
      screens_per_feature: 1,
      complexity_threshold: "medium",
    },
  },
  ui_architecture: {
    widget_composition: "compositional",
    reusability_level: "parametric",
    styling_approach: "theme_based",
    responsive_strategy: "adaptive",
  },
  navigation_architecture: {
    routing_approach: "named_routes",
    navigation_stack: "tab_based",
    deep_linking: false,
    route_guards: false,
    transition_animations: true,
  },
  naming_conventions: {
    files: "snake_case",
    classes: "PascalCase",
    widgets: "PascalCase",
    variables: "camelCase",
    constants: "UPPER_CASE",
    private_members: "_underscore",
    folders: "snake_case",
  },
  performance_strategy: {
    build_optimization: "const_constructors",
    state_optimization: "selective_rebuilds",
    memory_management: "dispose_controllers",
    rendering_optimization: "repaint_boundaries",
  },
  feature_analysis: {
    identified_features: [
      {
        name: "home",
        type: "dashboard",
        description: "Home dashboard",
        primary: true,
        suggested_screen: "home_screen",
      },
      {
        name: "profile",
        type: "profile",
        description: "User profile",
        primary: true,
        suggested_screen: "profile_screen",
      },
    ],
    screen_requirements: {
      minimum,
      recommended,
      maximum,
      suggested_screens: [
        {
          name: "home_screen",
          file_name: "home_screen.dart",
          covers_features: ["home"],
          description: "Home dashboard",
          is_home: true,
        },
        {
          name: "profile_screen",
          file_name: "profile_screen.dart",
          covers_features: ["profile"],
          description: "User profile",
          is_home: false,
        },
      ],
    },
    widget_candidates: [],
  },
  extensibility_model: "modular_growth",
  maintenance_strategy: "structured",
  platform_constraints: {
    target_platform: "android",
    ui_only: true,
    no_backend: true,
    no_networking: true,
    no_databases: true,
  },
  created_at: new Date(),
});

// Mock response with screens
const mockResponseWithScreens = `
<<<ROUTER_ADDITIONS>>>
IMPORTS:
import '../screens/home_screen.dart';
import '../screens/profile_screen.dart';

ROUTES:
static const homeRoute = '/home';
static const profileRoute = '/profile';

CASES:
case homeRoute:
  return HomeScreen();
case profileRoute:
  return ProfileScreen();
<<<END_ROUTER_ADDITIONS>>>

<<<FILE_START>>>
<<<FILE_PATH>>>lib/screens/home_screen.dart
<<<FILE_CONTENT>>>
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(child: Text('Home Screen')),
    );
  }
}
<<<END_FILE>>>

<<<FILE_START>>>
<<<FILE_PATH>>>lib/screens/profile_screen.dart
<<<FILE_CONTENT>>>
import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Profile')),
      body: Center(child: Text('Profile Screen')),
    );
  }
}
<<<END_FILE>>>
`;

// Mock response with insufficient screens
const mockResponseWithInsufficientScreens = `
<<<ROUTER_ADDITIONS>>>
IMPORTS:
import '../screens/home_screen.dart';

ROUTES:
static const homeRoute = '/home';

CASES:
case homeRoute:
  return HomeScreen();
<<<END_ROUTER_ADDITIONS>>>

<<<FILE_START>>>
<<<FILE_PATH>>>lib/screens/home_screen.dart
<<<FILE_CONTENT>>>
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(child: Text('Home Screen')),
    );
  }
}
<<<END_FILE>>>
`;

// Test function
function testMinimumScreensValidation() {
  console.log("🧪 Testing Response Parser Minimum Screens Validation\n");

  const parser = createResponseParser();

  // Test 1: Sufficient screens (should pass)
  console.log("Test 1: Sufficient screens (2 screens, minimum 2)");
  const architecture1 = createMockArchitecture(2, 3, 5);
  const result1 = parser.parseResponse(mockResponseWithScreens, architecture1);
  
  console.log(`   Success: ${result1.success}`);
  console.log(`   Errors: ${result1.errors.length}`);
  console.log(`   Warnings: ${result1.warnings.length}`);
  if (result1.errors.length > 0) {
    console.log(`   Error details: ${result1.errors.map(e => e.message).join("; ")}`);
  }
  console.log(`   ✅ Expected: Pass, Actual: ${result1.success ? "Pass" : "Fail"}\n`);

  // Test 2: Insufficient screens (should fail)
  console.log("Test 2: Insufficient screens (1 screen, minimum 2)");
  const architecture2 = createMockArchitecture(2, 3, 5);
  const result2 = parser.parseResponse(mockResponseWithInsufficientScreens, architecture2);
  
  console.log(`   Success: ${result2.success}`);
  console.log(`   Errors: ${result2.errors.length}`);
  console.log(`   Warnings: ${result2.warnings.length}`);
  if (result2.errors.length > 0) {
    console.log(`   Error details: ${result2.errors.map(e => e.message).join("; ")}`);
  }
  console.log(`   ✅ Expected: Fail, Actual: ${result2.success ? "Pass" : "Fail"}\n`);

  // Test 3: Below recommended but above minimum (should pass with warning)
  console.log("Test 3: Below recommended (2 screens, minimum 2, recommended 3)");
  const architecture3 = createMockArchitecture(2, 3, 5);
  const result3 = parser.parseResponse(mockResponseWithScreens, architecture3);
  
  console.log(`   Success: ${result3.success}`);
  console.log(`   Errors: ${result3.errors.length}`);
  console.log(`   Warnings: ${result3.warnings.length}`);
  if (result3.warnings.length > 0) {
    console.log(`   Warning details: ${result3.warnings.map(e => e.message).join("; ")}`);
  }
  console.log(`   ✅ Expected: Pass with warning, Actual: ${result3.success ? "Pass" : "Fail"}\n`);

  // Test 4: Exceeding maximum (should pass with warning)
  console.log("Test 4: Exceeding maximum (2 screens, maximum 1)");
  const architecture4 = createMockArchitecture(1, 2, 1);
  const result4 = parser.parseResponse(mockResponseWithScreens, architecture4);
  
  console.log(`   Success: ${result4.success}`);
  console.log(`   Errors: ${result4.errors.length}`);
  console.log(`   Warnings: ${result4.warnings.length}`);
  if (result4.warnings.length > 0) {
    console.log(`   Warning details: ${result4.warnings.map(e => e.message).join("; ")}`);
  }
  console.log(`   ✅ Expected: Pass with warning, Actual: ${result4.success ? "Pass" : "Fail"}\n`);

  // Test 5: No architecture plan (fallback validation)
  console.log("Test 5: No architecture plan (fallback validation)");
  const result5 = parser.parseResponse(mockResponseWithInsufficientScreens);
  
  console.log(`   Success: ${result5.success}`);
  console.log(`   Errors: ${result5.errors.length}`);
  console.log(`   Warnings: ${result5.warnings.length}`);
  if (result5.errors.length > 0) {
    console.log(`   Error details: ${result5.errors.map(e => e.message).join("; ")}`);
  }
  console.log(`   ✅ Expected: Pass (fallback), Actual: ${result5.success ? "Pass" : "Fail"}\n`);

  console.log("🎉 Minimum screens validation tests completed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  testMinimumScreensValidation();
}

export { testMinimumScreensValidation };
