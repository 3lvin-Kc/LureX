import { v4 as uuidv4 } from "uuid";
import { ProjectIdentity } from "../project-identity/model";
import {
  ArchitecturePlan,
  FeatureAnalysis,
  FlutterAppComplexity,
  FlutterProjectStructure,
  FlutterStatePattern,
  FlutterNavigationPattern,
  ALL_MANDATORY_FILES,
} from "./model";
import { FeatureExtractor, getFeatureExtractor } from "./feature-extractor";

// ============================================================================
// Professional Structure Constants
// ============================================================================

/**
 * Minimum file count - this is just a hint for the architecture plan.
 * The LLM decides actual file count based on app requirements.
 * We keep this for backwards compatibility with the schema.
 */
const MIN_FILE_COUNT = 5; // pubspec.yaml + main.dart + app.dart + app_router.dart + at least 1 screen

/**
 * Base files that ALL apps must have (regardless of complexity)
 * These are the mandatory lib files plus a home screen
 */
const PROFESSIONAL_SCREEN_FILES = [
  ...ALL_MANDATORY_FILES.filter((f) => f.startsWith("lib/")),
  "lib/screens/home_screen.dart",
];

/**
 * Professional concern separation - enforced for ALL complexity levels
 * Complexity affects feature depth, NOT structural discipline
 */
const PROFESSIONAL_CONCERN_SEPARATION = {
  screen_organization: "screen_per_file" as const,
  widget_separation: "separate_widget_files" as const,
  model_layer: "separate_model_files" as const,
  service_layer: "service_classes" as const,
};

export class ArchitectureDecisionEngine {
  private static featureExtractor: FeatureExtractor = getFeatureExtractor();

  /**
   * Main entry point - generates architecture plan based on project identity
   * Now includes feature analysis for screen prescription
   */
  public static generatePlan(identity: ProjectIdentity): ArchitecturePlan {
    // Step 1: Extract features and determine screen requirements
    const featureAnalysis = this.featureExtractor.analyzeIdentity(identity);

    // Step 2: Determine complexity (may be influenced by feature analysis)
    const complexity = this.determineComplexityWithFeatures(
      identity,
      featureAnalysis,
    );
    const appCategory = this.determineAppCategory(identity);
    const navigationNeeds = this.analyzeNavigationNeeds(identity);
    const stateRequirements = this.analyzeStateRequirements(identity);

    let plan: ArchitecturePlan;

    switch (complexity) {
      case "simple":
        plan = this.createSimpleAppPlan(
          identity,
          appCategory,
          navigationNeeds,
          stateRequirements,
        );
        break;
      case "moderate":
        plan = this.createModerateAppPlan(
          identity,
          appCategory,
          navigationNeeds,
          stateRequirements,
        );
        break;
      case "complex":
        plan = this.createComplexAppPlan(
          identity,
          appCategory,
          navigationNeeds,
          stateRequirements,
        );
        break;
      case "enterprise":
        plan = this.createEnterpriseAppPlan(
          identity,
          appCategory,
          navigationNeeds,
          stateRequirements,
        );
        break;
      default:
        plan = this.createModerateAppPlan(
          identity,
          appCategory,
          navigationNeeds,
          stateRequirements,
        );
    }

    // Step 3: Attach feature analysis to the plan
    plan.feature_analysis = featureAnalysis;

    // Step 4: Update file strategy based on feature analysis
    plan.file_strategy = this.updateFileStrategyFromFeatures(
      plan.file_strategy,
      featureAnalysis,
    );

    return plan;
  }

  /**
   * Determines complexity, considering feature analysis results
   * More features / screens may bump up complexity
   */
  private static determineComplexityWithFeatures(
    identity: ProjectIdentity,
    featureAnalysis: FeatureAnalysis,
  ): FlutterAppComplexity {
    // Start with base complexity from identity
    const baseComplexity = this.determineComplexity(identity);

    // Feature count can influence complexity
    const featureCount = featureAnalysis.identified_features.length;
    const recommendedScreens = featureAnalysis.screen_requirements.recommended;

    // If feature analysis suggests more complexity, bump up
    if (baseComplexity === "simple" && recommendedScreens >= 3) {
      return "moderate";
    }
    if (baseComplexity === "moderate" && recommendedScreens >= 6) {
      return "complex";
    }
    if (baseComplexity === "complex" && recommendedScreens >= 10) {
      return "enterprise";
    }

    return baseComplexity;
  }

  /**
   * Updates file strategy based on feature analysis
   */
  private static updateFileStrategyFromFeatures(
    fileStrategy: ArchitecturePlan["file_strategy"],
    featureAnalysis: FeatureAnalysis,
  ): ArchitecturePlan["file_strategy"] {
    const { screen_requirements, widget_candidates } = featureAnalysis;

    // Update screen files based on suggested screens
    const screenFiles = screen_requirements.suggested_screens.map(
      (s) => `lib/screens/${s.file_name}`,
    );

    // Update widget files based on candidates
    const widgetFiles = widget_candidates.map(
      (w) => `lib/widgets/${w.file_name}`,
    );

    // Calculate new file count
    const baseFileCount = 4; // pubspec.yaml, main.dart, app.dart, app_router.dart
    const newFileCount =
      baseFileCount + screenFiles.length + widgetFiles.length;

    return {
      ...fileStrategy,
      initial_file_count: Math.max(
        fileStrategy.initial_file_count,
        newFileCount,
      ),
      screen_files:
        screenFiles.length > 0 ? screenFiles : fileStrategy.screen_files,
      widget_files:
        widgetFiles.length > 0 ? widgetFiles : fileStrategy.widget_files,
    };
  }

  /**
   * Determines app complexity based on project identity characteristics
   */
  private static determineComplexity(
    identity: ProjectIdentity,
  ): FlutterAppComplexity {
    const characteristics = identity.characteristics;
    const scope = identity.scope;
    const sophisticationLevel = identity.scale.sophistication_level;

    // Check for enterprise indicators
    if (
      sophisticationLevel === "Enterprise" ||
      characteristics.some(
        (c) => c.includes("enterprise") || c.includes("business"),
      )
    ) {
      return "enterprise";
    }

    // Check for complex app indicators
    if (
      characteristics.some(
        (c) =>
          c.includes("navigation") ||
          c.includes("multi-screen") ||
          c.includes("workflow") ||
          c.includes("dashboard") ||
          c.includes("management"),
      ) ||
      scope.included.length > 5
    ) {
      return "complex";
    }

    // Check for moderate complexity
    if (
      characteristics.some(
        (c) =>
          c.includes("form") ||
          c.includes("list") ||
          c.includes("detail") ||
          c.includes("search") ||
          c.includes("filter"),
      ) ||
      scope.included.length > 2
    ) {
      return "moderate";
    }

    return "simple";
  }

  /**
   * Determines app category from project identity
   */
  private static determineAppCategory(identity: ProjectIdentity): string {
    const domain = identity.core_definition.domain.toLowerCase();
    const type = identity.core_definition.type.toLowerCase();

    if (domain.includes("ecommerce") || domain.includes("shopping"))
      return "ecommerce";
    if (domain.includes("social") || domain.includes("chat")) return "social";
    if (domain.includes("education") || domain.includes("learning"))
      return "educational";
    if (domain.includes("health") || domain.includes("fitness"))
      return "health";
    if (domain.includes("finance") || domain.includes("banking"))
      return "finance";
    if (domain.includes("productivity") || domain.includes("tool"))
      return "productivity";
    if (domain.includes("entertainment") || domain.includes("game"))
      return "entertainment";

    return "utility";
  }

  /**
   * Analyzes navigation requirements from project characteristics
   */
  private static analyzeNavigationNeeds(
    identity: ProjectIdentity,
  ): FlutterNavigationPattern {
    const characteristics = identity.characteristics;

    if (
      characteristics.some(
        (c) => c.includes("tab") || c.includes("bottom navigation"),
      )
    ) {
      return "tab_navigation";
    }
    if (
      characteristics.some((c) => c.includes("drawer") || c.includes("sidebar"))
    ) {
      return "drawer_navigation";
    }
    if (
      characteristics.some(
        (c) => c.includes("nested") || c.includes("deep navigation"),
      )
    ) {
      return "nested_navigation";
    }
    if (
      characteristics.some(
        (c) => c.includes("custom route") || c.includes("complex navigation"),
      )
    ) {
      return "custom_routing";
    }
    if (
      characteristics.some(
        (c) => c.includes("multi-screen") || c.includes("navigation"),
      )
    ) {
      return "tab_navigation"; // Default for multi-screen apps
    }

    return "single_screen";
  }

  /**
   * Analyzes state management requirements
   */
  private static analyzeStateRequirements(
    identity: ProjectIdentity,
  ): FlutterStatePattern {
    const characteristics = identity.characteristics;
    const sophisticationLevel = identity.scale.sophistication_level;

    // Enterprise apps need robust state management
    if (sophisticationLevel === "Enterprise") {
      return "bloc";
    }

    // Complex state requirements
    if (
      characteristics.some(
        (c) =>
          c.includes("complex state") ||
          c.includes("shared data") ||
          c.includes("real-time") ||
          c.includes("synchronization"),
      )
    ) {
      return "provider";
    }

    // Moderate state requirements
    if (
      characteristics.some(
        (c) =>
          c.includes("form") ||
          c.includes("list") ||
          c.includes("filter") ||
          c.includes("search"),
      )
    ) {
      return "provider";
    }

    return "setState";
  }

  /**
   * Creates architecture plan for simple Flutter apps
   * NOTE: Even simple apps get professional structure with proper separation
   */
  private static createSimpleAppPlan(
    identity: ProjectIdentity,
    category: string,
    navigation: FlutterNavigationPattern,
    state: FlutterStatePattern,
  ): ArchitecturePlan {
    return {
      plan_id: uuidv4(),
      project_identity_id: identity.identity_id,
      conceptual_category: category as
        | "utility"
        | "productivity"
        | "entertainment"
        | "ecommerce"
        | "social"
        | "educational"
        | "health"
        | "finance"
        | "custom",
      complexity_level: "simple",
      structural_philosophy: "multi_screen", // Always multi_screen for proper structure

      execution_model: {
        entry_point: "main()",
        app_lifecycle: state === "setState" ? "stateless" : "stateful",
        navigation_pattern: navigation,
        screen_transitions: "material",
      },

      // PROFESSIONAL concern separation - same for ALL complexity levels
      concern_separation: PROFESSIONAL_CONCERN_SEPARATION,

      state_management: {
        primary_pattern: state,
        state_scope: "local_state",
        data_flow: "top_down",
        persistence: "none",
      },

      // File strategy - LLM decides actual file count based on requirements
      file_strategy: {
        initial_file_count: MIN_FILE_COUNT,
        project_structure: "layer_first", // Always organized by layer
        screen_files: [...PROFESSIONAL_SCREEN_FILES],
        widget_files: [], // Folder exists, populated as needed
        model_files: [], // Folder exists, populated as needed
        service_files: [], // Folder exists, populated as needed
        decomposition_strategy: "by_type",
        split_triggers: {
          lines_per_file: 200,
          widgets_per_file: 3,
          screens_per_feature: 1,
          complexity_threshold: "low",
        },
      },

      ui_architecture: {
        widget_composition: "compositional", // Upgraded from monolithic
        reusability_level: "basic",
        styling_approach: "theme_based",
        responsive_strategy: "adaptive",
      },

      navigation_architecture: {
        routing_approach: "named_routes",
        navigation_stack: this.mapNavigationToStack(navigation) as
          | "single_stack"
          | "nested_navigation"
          | "tab_based"
          | "drawer_based"
          | "bottom_navigation",
        deep_linking: false,
        route_guards: false,
        transition_animations: false,
      },

      naming_conventions: {
        files: "snake_case",
        classes: "PascalCase",
        widgets: "PascalCase",
        variables: "camelCase",
        constants: "kCamelCase",
        private_members: "_underscore",
        folders: "snake_case",
      },

      performance_strategy: {
        build_optimization: "const_constructors",
        state_optimization: "none",
        memory_management: "default",
        rendering_optimization: "none",
      },

      extensibility_model: "modular_growth",
      maintenance_strategy: "minimal",

      platform_constraints: {
        target_platform: "android",
        ui_only: true,
        no_backend: true,
        no_networking: true,
        no_databases: true,
      },

      created_at: new Date(),
    };
  }

  /**
   * Creates architecture plan for moderate complexity Flutter apps
   * NOTE: Uses professional structure with expanded file counts
   */
  private static createModerateAppPlan(
    identity: ProjectIdentity,
    category: string,
    navigation: FlutterNavigationPattern,
    state: FlutterStatePattern,
  ): ArchitecturePlan {
    return {
      plan_id: uuidv4(),
      project_identity_id: identity.identity_id,
      conceptual_category: category as
        | "utility"
        | "productivity"
        | "entertainment"
        | "ecommerce"
        | "social"
        | "educational"
        | "health"
        | "finance"
        | "custom",
      complexity_level: "moderate",
      structural_philosophy: this.mapNavigationToStructure(navigation) as
        | "single_screen"
        | "multi_screen"
        | "tabbed_interface"
        | "navigation_heavy"
        | "form_based"
        | "content_driven",

      execution_model: {
        entry_point: "main()",
        app_lifecycle: "mixed",
        navigation_pattern: navigation,
        screen_transitions: "material",
      },

      // PROFESSIONAL concern separation - same for ALL complexity levels
      concern_separation: PROFESSIONAL_CONCERN_SEPARATION,

      state_management: {
        primary_pattern: state === "setState" ? "provider" : state,
        state_scope: "screen_state",
        data_flow: state === "bloc" ? "event_driven" : "reactive",
        persistence: "shared_preferences",
      },

      // PROFESSIONAL file strategy - expanded for moderate complexity
      file_strategy: {
        initial_file_count: Math.max(
          this.calculateModerateFileCount(navigation, state),
          MIN_FILE_COUNT,
        ),
        project_structure: "layer_first",
        screen_files: [
          ...PROFESSIONAL_SCREEN_FILES,
          ...this.generateAdditionalScreens(navigation, "moderate"),
        ],
        widget_files: ["lib/widgets/common_widgets.dart"],
        model_files: ["lib/models/app_models.dart"],
        service_files: ["lib/services/app_service.dart"],
        decomposition_strategy: "by_feature",
        split_triggers: {
          lines_per_file: 300,
          widgets_per_file: 5,
          screens_per_feature: 3,
          complexity_threshold: "medium",
        },
      },

      ui_architecture: {
        widget_composition: "compositional",
        reusability_level: "parametric",
        styling_approach: "theme_based",
        responsive_strategy: "responsive",
      },

      navigation_architecture: {
        routing_approach: "generated_routes",
        navigation_stack: this.mapNavigationToStack(navigation) as
          | "single_stack"
          | "nested_navigation"
          | "tab_based"
          | "drawer_based"
          | "bottom_navigation",
        deep_linking: true,
        route_guards: false,
        transition_animations: true,
      },

      naming_conventions: {
        files: "snake_case",
        classes: "PascalCase",
        widgets: "PascalCase",
        variables: "camelCase",
        constants: "kCamelCase",
        private_members: "_underscore",
        folders: "snake_case",
      },

      performance_strategy: {
        build_optimization: "build_splitting",
        state_optimization: "selective_rebuilds",
        memory_management: "dispose_controllers",
        rendering_optimization: "repaint_boundaries",
      },

      extensibility_model: "feature_addition",
      maintenance_strategy: "structured",

      platform_constraints: {
        target_platform: "android",
        ui_only: true,
        no_backend: true,
        no_networking: true,
        no_databases: true,
      },

      created_at: new Date(),
    };
  }

  /**
   * Creates architecture plan for complex Flutter apps
   * NOTE: Uses professional structure with full feature expansion
   */
  private static createComplexAppPlan(
    identity: ProjectIdentity,
    category: string,
    navigation: FlutterNavigationPattern,
    state: FlutterStatePattern,
  ): ArchitecturePlan {
    return {
      plan_id: uuidv4(),
      project_identity_id: identity.identity_id,
      conceptual_category: category as
        | "utility"
        | "productivity"
        | "entertainment"
        | "ecommerce"
        | "social"
        | "educational"
        | "health"
        | "finance"
        | "custom",
      complexity_level: "complex",
      structural_philosophy: "navigation_heavy",

      execution_model: {
        entry_point: "main()",
        app_lifecycle: "stateful",
        navigation_pattern: navigation,
        screen_transitions: "custom",
      },

      // PROFESSIONAL concern separation - elevated for complex apps
      concern_separation: {
        screen_organization: "feature_folders",
        widget_separation: "component_library",
        model_layer: "feature_models",
        service_layer: "repository_pattern",
      },

      state_management: {
        primary_pattern: state === "setState" ? "riverpod" : state,
        state_scope: "app_state",
        data_flow: "event_driven",
        persistence: "hive",
      },

      // PROFESSIONAL file strategy - expanded for complex apps
      file_strategy: {
        initial_file_count: Math.max(
          this.calculateComplexFileCount(navigation, state),
          MIN_FILE_COUNT,
        ),
        project_structure: "layer_first",
        screen_files: [
          ...PROFESSIONAL_SCREEN_FILES,
          ...this.generateAdditionalScreens(navigation, "complex"),
        ],
        widget_files: this.generateWidgetFiles("complex"),
        model_files: this.generateModelFiles("complex"),
        service_files: this.generateServiceFiles("complex"),
        decomposition_strategy: "by_domain",
        split_triggers: {
          lines_per_file: 250,
          widgets_per_file: 3,
          screens_per_feature: 5,
          complexity_threshold: "high",
        },
      },

      ui_architecture: {
        widget_composition: "atomic",
        reusability_level: "configurable",
        styling_approach: "design_system",
        responsive_strategy: "universal",
      },

      navigation_architecture: {
        routing_approach: "go_router",
        navigation_stack: "nested_navigation",
        deep_linking: true,
        route_guards: true,
        transition_animations: true,
      },

      naming_conventions: {
        files: "snake_case",
        classes: "PascalCase",
        widgets: "PascalCase",
        variables: "camelCase",
        constants: "kCamelCase",
        private_members: "_underscore",
        folders: "snake_case",
      },

      performance_strategy: {
        build_optimization: "memo_widgets",
        state_optimization: "immutable_state",
        memory_management: "object_pooling",
        rendering_optimization: "lazy_loading",
      },

      extensibility_model: "architectural_evolution",
      maintenance_strategy: "comprehensive",

      platform_constraints: {
        target_platform: "android",
        ui_only: true,
        no_backend: true,
        no_networking: true,
        no_databases: true,
      },

      created_at: new Date(),
    };
  }

  /**
   * Creates architecture plan for enterprise Flutter apps
   * NOTE: Uses professional structure with enterprise-grade patterns
   */
  private static createEnterpriseAppPlan(
    identity: ProjectIdentity,
    category: string,
    navigation: FlutterNavigationPattern,
    state: FlutterStatePattern,
  ): ArchitecturePlan {
    return {
      plan_id: uuidv4(),
      project_identity_id: identity.identity_id,
      conceptual_category: category as
        | "utility"
        | "productivity"
        | "entertainment"
        | "ecommerce"
        | "social"
        | "educational"
        | "health"
        | "finance"
        | "custom",
      complexity_level: "enterprise",
      structural_philosophy: "navigation_heavy",

      execution_model: {
        entry_point: "main()",
        app_lifecycle: "stateful",
        navigation_pattern:
          navigation === "single_screen" ? "nested_navigation" : navigation,
        screen_transitions: "custom",
      },

      // Enterprise-grade concern separation
      concern_separation: {
        screen_organization: "layered_architecture",
        widget_separation: "atomic_design",
        model_layer: "domain_models",
        service_layer: "repository_pattern",
      },

      state_management: {
        primary_pattern: "bloc",
        state_scope: "app_state",
        data_flow: "event_driven",
        persistence: "secure_storage",
      },

      // PROFESSIONAL file strategy - enterprise scale
      file_strategy: {
        initial_file_count: Math.max(
          this.calculateEnterpriseFileCount(navigation),
          MIN_FILE_COUNT,
        ),
        project_structure: "modular",
        screen_files: [
          ...PROFESSIONAL_SCREEN_FILES,
          ...this.generateAdditionalScreens(navigation, "enterprise"),
        ],
        widget_files: this.generateWidgetFiles("enterprise"),
        model_files: this.generateModelFiles("enterprise"),
        service_files: this.generateServiceFiles("enterprise"),
        decomposition_strategy: "by_domain",
        split_triggers: {
          lines_per_file: 200,
          widgets_per_file: 2,
          screens_per_feature: 3,
          complexity_threshold: "high",
        },
      },

      ui_architecture: {
        widget_composition: "atomic",
        reusability_level: "configurable",
        styling_approach: "design_system",
        responsive_strategy: "universal",
      },

      navigation_architecture: {
        routing_approach: "auto_route",
        navigation_stack: "nested_navigation",
        deep_linking: true,
        route_guards: true,
        transition_animations: true,
      },

      naming_conventions: {
        files: "snake_case",
        classes: "PascalCase",
        widgets: "PascalCase",
        variables: "camelCase",
        constants: "kCamelCase",
        private_members: "_underscore",
        folders: "snake_case",
      },

      performance_strategy: {
        build_optimization: "memo_widgets",
        state_optimization: "immutable_state",
        memory_management: "object_pooling",
        rendering_optimization: "viewport_optimization",
      },

      extensibility_model: "architectural_evolution",
      maintenance_strategy: "enterprise",

      platform_constraints: {
        target_platform: "android",
        ui_only: true,
        no_backend: true,
        no_networking: true,
        no_databases: true,
      },

      created_at: new Date(),
    };
  }

  // Helper methods for architecture planning

  private static mapNavigationToStructure(
    navigation: FlutterNavigationPattern,
  ): string {
    switch (navigation) {
      case "single_screen":
        return "single_screen";
      case "tab_navigation":
        return "tabbed_interface";
      case "drawer_navigation":
        return "navigation_heavy";
      case "nested_navigation":
        return "navigation_heavy";
      case "custom_routing":
        return "navigation_heavy";
      default:
        return "multi_screen";
    }
  }

  private static mapNavigationToStack(
    navigation: FlutterNavigationPattern,
  ): string {
    switch (navigation) {
      case "single_screen":
        return "single_stack";
      case "tab_navigation":
        return "tab_based";
      case "drawer_navigation":
        return "drawer_based";
      case "nested_navigation":
        return "nested_navigation";
      case "custom_routing":
        return "nested_navigation";
      default:
        return "single_stack";
    }
  }

  private static calculateModerateFileCount(
    navigation: FlutterNavigationPattern,
    state: FlutterStatePattern,
  ): number {
    let baseCount = 3; // main.dart, pubspec.yaml, basic structure

    // Add files based on navigation complexity
    if (navigation !== "single_screen") baseCount += 3; // Multiple screens

    // Add files based on state management
    if (state !== "setState") baseCount += 2; // State management files

    return Math.min(baseCount + 2, 12); // Cap at reasonable number
  }

  private static calculateComplexFileCount(
    navigation: FlutterNavigationPattern,
    state: FlutterStatePattern,
  ): number {
    let baseCount = 8; // More comprehensive structure

    // Navigation complexity
    if (navigation === "nested_navigation" || navigation === "custom_routing")
      baseCount += 5;
    else if (navigation !== "single_screen") baseCount += 3;

    // State management complexity
    if (state === "riverpod") baseCount += 4;
    else if (state !== "setState") baseCount += 2;

    return Math.min(baseCount + 3, 20);
  }

  private static calculateEnterpriseFileCount(
    navigation: FlutterNavigationPattern,
  ): number {
    let baseCount = 15; // Enterprise structure with layers

    // Always complex navigation in enterprise
    if (navigation === "single_screen")
      baseCount += 5; // Force multi-screen
    else baseCount += 8;

    return Math.min(baseCount + 5, 30);
  }

  /**
   * Generates additional screen files beyond the base professional structure
   */
  private static generateAdditionalScreens(
    navigation: FlutterNavigationPattern,
    complexity: string,
  ): string[] {
    const screens: string[] = [];

    if (navigation === "tab_navigation") {
      screens.push(
        "lib/screens/profile_screen.dart",
        "lib/screens/settings_screen.dart",
      );
    }

    if (complexity === "complex" || complexity === "enterprise") {
      screens.push(
        "lib/screens/detail_screen.dart",
        "lib/screens/search_screen.dart",
      );
    }

    return screens;
  }

  // Legacy method - kept for backwards compatibility
  private static generateScreenFiles(
    navigation: FlutterNavigationPattern,
    complexity: string,
  ): string[] {
    return [
      ...PROFESSIONAL_SCREEN_FILES,
      ...this.generateAdditionalScreens(navigation, complexity),
    ];
  }

  private static generateWidgetFiles(complexity: string): string[] {
    if (complexity === "simple") return [];

    const widgets = [
      "lib/widgets/common_button.dart",
      "lib/widgets/custom_card.dart",
    ];

    if (complexity === "complex" || complexity === "enterprise") {
      widgets.push(
        "lib/widgets/form_components.dart",
        "lib/widgets/navigation_components.dart",
      );
    }

    return widgets;
  }

  private static generateModelFiles(complexity: string): string[] {
    if (complexity === "simple") return [];

    const models = ["lib/models/user_model.dart"];

    if (complexity === "complex" || complexity === "enterprise") {
      models.push(
        "lib/models/app_state_model.dart",
        "lib/models/navigation_model.dart",
      );
    }

    return models;
  }

  private static generateServiceFiles(complexity: string): string[] {
    if (complexity === "simple") return [];

    const services = ["lib/services/local_storage_service.dart"];

    if (complexity === "complex" || complexity === "enterprise") {
      services.push(
        "lib/services/navigation_service.dart",
        "lib/services/validation_service.dart",
      );
    }

    return services;
  }
}
