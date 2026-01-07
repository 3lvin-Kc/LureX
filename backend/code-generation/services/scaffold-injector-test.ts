/**
 * Test the surgical router injection fixes
 */

import { ScaffoldInjector, RouterAdditions } from "./scaffold-injector";

const injector = new ScaffoldInjector();

const baseRouter = `import 'package:flutter/material.dart';
// <<<SCREEN_IMPORTS>>>
import '../screens/home_screen.dart';
// <<<END_SCREEN_IMPORTS>>>

class AppRouter extends StatelessWidget {
  const AppRouter({super.key});

  // <<<ROUTE_CONSTANTS>>>
  static const String home = '/';
  // <<<END_ROUTE_CONSTANTS>>>

  @override
  Widget build(BuildContext context) {
    return Navigator(
      initialRoute: home,
      onGenerateRoute: _onGenerateRoute,
    );
  }

  static Route<dynamic> _onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      // <<<ROUTE_CASES>>>
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      // <<<END_ROUTE_CASES>>>
      default:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
    }
  }
}`;

const testAdditions: RouterAdditions = {
  imports: [
    "import '../screens/home_screen.dart';", // Duplicate - should be skipped
    "import '../screens/profile_screen.dart';", // New - should be added
  ],
  routeConstants: [
    "static const String home = '/';", // Duplicate - should be skipped
    "static const String profile = '/profile';", // New - should be added
  ],
  routeCases: [
    `case home:
      return MaterialPageRoute(builder: (_) => const HomeScreen());`, // Duplicate - should be skipped
    `case profile:
      return MaterialPageRoute(builder: (_) => const ProfileScreen());`, // New - should be added
  ],
};

console.log("=== Testing Surgical Router Injection Fixes ===");

try {
  const result = injector.mergeRouterAdditions(baseRouter, testAdditions);
  console.log("SUCCESS: Surgical injection completed");
  console.log("\nResult:");
  console.log(result);
  
  // Verify no duplicates
  const importMatches = result.match(/import\s+['"][^'"]+['"]/g) || [];
  const homeImportCount = importMatches.filter(imp => imp.includes('home_screen.dart')).length;
  const profileImportCount = importMatches.filter(imp => imp.includes('profile_screen.dart')).length;
  
  console.log(`\nDuplicate checks:`);
  console.log(`  home_screen.dart imports: ${homeImportCount} (should be 1)`);
  console.log(`  profile_screen.dart imports: ${profileImportCount} (should be 1)`);
  
  const constantMatches = result.match(/static const String \w+ = '\/[^']*';/g) || [];
  const homeConstantCount = constantMatches.filter(c => c.includes('home')).length;
  const profileConstantCount = constantMatches.filter(c => c.includes('profile')).length;
  
  console.log(`  home constants: ${homeConstantCount} (should be 1)`);
  console.log(`  profile constants: ${profileConstantCount} (should be 1)`);
  
  const caseMatches = result.match(/case \w+:/g) || [];
  const homeCaseCount = caseMatches.filter(c => c.includes('home')).length;
  const profileCaseCount = caseMatches.filter(c => c.includes('profile')).length;
  
  console.log(`  home cases: ${homeCaseCount} (should be 1)`);
  console.log(`  profile cases: ${profileCaseCount} (should be 1)`);
  
  const allGood = homeImportCount === 1 && profileImportCount === 1 && 
                  homeConstantCount === 1 && profileConstantCount === 1 &&
                  homeCaseCount === 1 && profileCaseCount === 1;
  
  console.log(`\nOverall: ${allGood ? '✅ ALL FIXES WORKING' : '❌ ISSUES REMAIN'}`);
  
} catch (error) {
  console.error("ERROR:", error);
}
