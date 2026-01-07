import { z } from "zod";

// ============================================================================
// Re-export mandatory structure from single source of truth
// ============================================================================

// Import from the single source of truth for project structure
// See base-structure-template.ts for the canonical definitions
export {
  MANDATORY_FILES,
  ALL_MANDATORY_FILES,
  FOLDER_CONVENTIONS,
  DELIMITERS,
} from "../code-generation/services/base-structure-template";

// ============================================================================
// Feature Analysis Types (for screen prescription)
// ============================================================================

/**
 * Types of UI features that map to screens or major components
 */
export const FeatureTypeEnum = z.enum([
  "list_view", // Browsing/listing items (e.g., recipe list, product catalog)
  "detail_view", // Viewing single item details
  "form_input", // Data entry/creation (e.g., add recipe, create task)
  "crud_list", // List with create/update/delete (e.g., shopping list, todo)
  "dashboard", // Overview/summary screen
  "settings", // Configuration/preferences
  "profile", // User profile/account
  "collection", // Saved/favorited items
  "search", // Search functionality
  "onboarding", // First-time user flow
  "authentication", // Login/signup (UI only, no real auth)
  "media_viewer", // Image/video gallery
  "calendar", // Date-based views
  "chat", // Messaging UI
  "map", // Location-based UI
  "custom", // Doesn't fit standard patterns
]);

export type FeatureType = z.infer<typeof FeatureTypeEnum>;

/**
 * An identified feature extracted from project requirements
 */
export const IdentifiedFeatureSchema = z.object({
  name: z.string(), // e.g., "browse_recipes", "manage_favorites"
  type: FeatureTypeEnum, // What kind of UI pattern this represents
  description: z.string(), // Brief description of what this feature does
  primary: z.boolean(), // Is this a core feature (requires dedicated screen)?
  suggested_screen: z.string().optional(), // e.g., "recipe_list_screen"
});

export type IdentifiedFeature = z.infer<typeof IdentifiedFeatureSchema>;

/**
 * A suggested screen derived from feature analysis
 */
export const SuggestedScreenSchema = z.object({
  name: z.string(), // e.g., "home_screen", "recipe_detail_screen"
  file_name: z.string(), // e.g., "home_screen.dart"
  covers_features: z.array(z.string()), // Which features this screen handles
  description: z.string(), // What this screen does
  is_home: z.boolean(), // Is this the main/home screen?
});

export type SuggestedScreen = z.infer<typeof SuggestedScreenSchema>;

/**
 * A widget that should be extracted for reuse
 */
export const WidgetCandidateSchema = z.object({
  name: z.string(), // e.g., "recipe_card", "action_button"
  file_name: z.string(), // e.g., "recipe_card.dart"
  reason: z.string(), // Why this should be extracted
  used_in: z.array(z.string()), // Which screens use this widget
});

export type WidgetCandidate = z.infer<typeof WidgetCandidateSchema>;

/**
 * Screen requirements derived from feature analysis
 */
export const ScreenRequirementsSchema = z.object({
  minimum: z.number().int().min(1), // Hard floor - error if below
  recommended: z.number().int().min(1), // Target - warning if significantly below
  maximum: z.number().int().min(1), // Soft ceiling - guidance only
  suggested_screens: z.array(SuggestedScreenSchema),
});

export type ScreenRequirements = z.infer<typeof ScreenRequirementsSchema>;

/**
 * Complete feature analysis output from the architecture engine
 */
export const FeatureAnalysisSchema = z.object({
  identified_features: z.array(IdentifiedFeatureSchema),
  screen_requirements: ScreenRequirementsSchema,
  widget_candidates: z.array(WidgetCandidateSchema),
  analysis_notes: z.string().optional(), // Any notes about the analysis
});

export type FeatureAnalysis = z.infer<typeof FeatureAnalysisSchema>;

// ============================================================================
// Flutter UI execution patterns
// ============================================================================

export const ExecutionModelSchema = z.object({
  entry_point: z.string(),
  app_lifecycle: z.enum(["stateful", "stateless", "mixed"]),
  navigation_pattern: z.enum([
    "single_screen",
    "tab_navigation",
    "drawer_navigation",
    "nested_navigation",
    "custom_routing",
  ]),
  screen_transitions: z.enum([
    "material",
    "cupertino",
    "custom",
    "fade",
    "slide",
  ]),
});

// Flutter-specific concern separation
export const ConcernSeparationSchema = z.object({
  screen_organization: z.enum([
    "single_file",
    "screen_per_file",
    "feature_folders",
    "layered_architecture",
  ]),
  widget_separation: z.enum([
    "inline_widgets",
    "separate_widget_files",
    "component_library",
    "atomic_design",
  ]),
  model_layer: z.enum([
    "inline_models",
    "separate_model_files",
    "feature_models",
    "domain_models",
  ]),
  service_layer: z.enum([
    "none",
    "utility_functions",
    "service_classes",
    "repository_pattern",
  ]),
});

// Flutter state management patterns
export const StateManagementSchema = z.object({
  primary_pattern: z.enum([
    "setState",
    "provider",
    "bloc",
    "riverpod",
    "getx",
    "mobx",
    "redux",
  ]),
  state_scope: z.enum([
    "local_state",
    "screen_state",
    "app_state",
    "mixed_state",
  ]),
  data_flow: z.enum(["top_down", "event_driven", "reactive", "hybrid"]),
  persistence: z.enum([
    "none",
    "shared_preferences",
    "hive",
    "sqflite",
    "secure_storage",
  ]),
});

// Flutter project file organization strategy
// UPDATED: Enforces minimum file count of 6 for professional structure
export const FileStrategySchema = z.object({
  initial_file_count: z.number().min(6).max(50), // Minimum 6 for professional structure
  project_structure: z.enum([
    "layer_first", // DEFAULT - organized by layer (screens/, widgets/, models/, services/)
    "feature_first", // Organized by feature (feature_a/, feature_b/)
    "hybrid", // Mix of layer and feature organization
    "modular", // Fully modular with independent modules
  ]),
  screen_files: z.array(z.string()),
  widget_files: z.array(z.string()),
  model_files: z.array(z.string()),
  service_files: z.array(z.string()),
  decomposition_strategy: z.enum([
    "by_feature",
    "by_type",
    "by_complexity",
    "by_domain",
  ]),
  split_triggers: z.object({
    lines_per_file: z.number().min(50).max(500),
    widgets_per_file: z.number().min(1).max(10),
    screens_per_feature: z.number().min(1).max(5),
    complexity_threshold: z.enum(["low", "medium", "high"]),
  }),
});

// Flutter UI component architecture
export const UIArchitectureSchema = z.object({
  widget_composition: z.enum([
    "monolithic",
    "compositional",
    "atomic",
    "compound",
  ]),
  reusability_level: z.enum([
    "none",
    "basic",
    "parametric",
    "themeable",
    "configurable",
  ]),
  styling_approach: z.enum([
    "inline_styles",
    "theme_based",
    "styled_components",
    "design_system",
  ]),
  responsive_strategy: z.enum(["fixed", "adaptive", "responsive", "universal"]),
});

// Navigation and routing architecture
export const NavigationArchitectureSchema = z.object({
  routing_approach: z.enum([
    "named_routes",
    "generated_routes",
    "go_router",
    "auto_route",
    "fluro",
  ]),
  navigation_stack: z.enum([
    "single_stack",
    "nested_navigation",
    "tab_based",
    "drawer_based",
    "bottom_navigation",
  ]),
  deep_linking: z.boolean(),
  route_guards: z.boolean(),
  transition_animations: z.boolean(),
});

// Flutter naming and organization conventions
export const NamingConventionsSchema = z.object({
  files: z.enum(["snake_case", "kebab_case", "camelCase"]),
  classes: z.enum(["PascalCase", "camelCase"]),
  widgets: z.enum(["PascalCase", "camelCase"]),
  variables: z.enum(["camelCase", "snake_case"]),
  constants: z.enum(["UPPER_CASE", "camelCase", "kCamelCase"]),
  private_members: z.enum(["_underscore", "camelCase"]),
  folders: z.enum(["snake_case", "kebab_case", "camelCase"]),
});

// Performance and optimization considerations
export const PerformanceStrategySchema = z.object({
  build_optimization: z.enum([
    "none",
    "const_constructors",
    "build_splitting",
    "memo_widgets",
  ]),
  state_optimization: z.enum([
    "none",
    "selective_rebuilds",
    "state_isolation",
    "immutable_state",
  ]),
  memory_management: z.enum([
    "default",
    "dispose_controllers",
    "weak_references",
    "object_pooling",
  ]),
  rendering_optimization: z.enum([
    "none",
    "repaint_boundaries",
    "viewport_optimization",
    "lazy_loading",
  ]),
});

// Complete Flutter architecture plan schema
export const ArchitecturePlanSchema = z.object({
  plan_id: z.string().uuid(),
  project_identity_id: z.string().uuid(),

  // High-level architectural decisions
  conceptual_category: z.enum([
    "utility",
    "productivity",
    "entertainment",
    "ecommerce",
    "social",
    "educational",
    "health",
    "finance",
    "custom",
  ]),
  complexity_level: z.enum(["simple", "moderate", "complex", "enterprise"]),
  structural_philosophy: z.enum([
    "single_screen",
    "multi_screen",
    "tabbed_interface",
    "navigation_heavy",
    "form_based",
    "content_driven",
  ]),

  // Flutter-specific architecture components
  execution_model: ExecutionModelSchema,
  concern_separation: ConcernSeparationSchema,
  state_management: StateManagementSchema,
  file_strategy: FileStrategySchema,
  ui_architecture: UIArchitectureSchema,
  navigation_architecture: NavigationArchitectureSchema,
  naming_conventions: NamingConventionsSchema,
  performance_strategy: PerformanceStrategySchema,

  // Feature analysis (drives screen/widget generation)
  feature_analysis: FeatureAnalysisSchema.optional(),

  // Extension and evolution policies
  extensibility_model: z.enum([
    "fixed_structure",
    "modular_growth",
    "feature_addition",
    "architectural_evolution",
  ]),
  maintenance_strategy: z.enum([
    "minimal",
    "structured",
    "comprehensive",
    "enterprise",
  ]),

  // Flutter platform constraints (enforced)
  platform_constraints: z.object({
    target_platform: z.literal("android"),
    ui_only: z.literal(true),
    no_backend: z.literal(true),
    no_networking: z.literal(true),
    no_databases: z.literal(true),
  }),

  created_at: z.date(),
});

export type ArchitecturePlan = z.infer<typeof ArchitecturePlanSchema>;

// Helper types for architecture planning
export type FlutterAppComplexity =
  | "simple"
  | "moderate"
  | "complex"
  | "enterprise";
export type FlutterProjectStructure =
  | "flat"
  | "feature_first"
  | "layer_first"
  | "hybrid"
  | "modular";
export type FlutterStatePattern =
  | "setState"
  | "provider"
  | "bloc"
  | "riverpod"
  | "getx"
  | "mobx"
  | "redux";
export type FlutterNavigationPattern =
  | "single_screen"
  | "tab_navigation"
  | "drawer_navigation"
  | "nested_navigation"
  | "custom_routing";
