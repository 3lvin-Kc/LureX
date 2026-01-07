/**
 * Feature Extractor Service
 *
 * Analyzes project identity to extract features and prescribe screen requirements.
 * This is the "brain" that determines what screens an app needs before the LLM
 * generates code.
 *
 * PRINCIPLE: Architecture engine is the brain, LLM is the hands.
 *
 * SCOPED PLATFORM: This extractor only supports predefined app categories.
 * Unsupported prompts are rejected with clear error messages.
 *
 * The feature extractor:
 * 1. Reads the project identity (purpose, scope, characteristics)
 * 2. Validates the prompt matches a supported category
 * 3. Identifies distinct features/capabilities the app needs
 * 4. Maps features to screen requirements
 * 5. Suggests widget extractions for reuse
 * 6. Outputs a prescription that guides LLM generation
 */

import { ProjectIdentity } from "../project-identity/model";
import {
  FeatureAnalysis,
  IdentifiedFeature,
  FeatureType,
  ScreenRequirements,
  SuggestedScreen,
  WidgetCandidate,
} from "./model";

// ============================================================================
// Supported Categories Error
// ============================================================================

export class UnsupportedCategoryError extends Error {
  public readonly supportedCategories: string[];
  public readonly userPrompt: string;

  constructor(userPrompt: string, supportedCategories: string[]) {
    super(
      `Unsupported app type. Your prompt "${userPrompt.substring(0, 50)}${userPrompt.length > 50 ? "..." : ""}" does not match any supported category. Please create one of the following app types: ${supportedCategories.join(", ")}.`,
    );
    this.name = "UnsupportedCategoryError";
    this.supportedCategories = supportedCategories;
    this.userPrompt = userPrompt;
  }
}

// ============================================================================
// Supported App Categories (for user-facing messages)
// ============================================================================

export const SUPPORTED_CATEGORIES = [
  "Counter/Clicker App",
  "Todo/Task Manager",
  "Recipe/Cookbook App",
  "E-commerce/Shopping App",
  "Notes/Journal App",
  "Weather App",
  "Fitness/Workout App",
  "Social Media/Feed App",
  "Dating/Matching App",
  "Music/Audio Player App",
  "Education/Learning App",
  "Bottom Navigation App (generic tabbed app)",
] as const;

// ============================================================================
// Feature Detection Patterns
// ============================================================================

/**
 * Patterns that suggest specific feature types when found in the purpose/description
 */
const FEATURE_PATTERNS: Array<{
  patterns: RegExp[];
  type: FeatureType;
  nameTemplate: string;
  descriptionTemplate: string;
  primary: boolean;
}> = [
  // List/Browse patterns
  {
    patterns: [
      /browse\s+(\w+)/i,
      /list\s+(?:of\s+)?(\w+)/i,
      /view\s+(?:all\s+)?(\w+)/i,
      /(\w+)\s+catalog/i,
      /(\w+)\s+gallery/i,
      /explore\s+(\w+)/i,
    ],
    type: "list_view",
    nameTemplate: "browse_{0}",
    descriptionTemplate: "Browse and view list of {0}",
    primary: true,
  },
  // Detail view patterns
  {
    patterns: [
      /(\w+)\s+details?/i,
      /view\s+(\w+)/i,
      /(\w+)\s+page/i,
      /individual\s+(\w+)/i,
      /single\s+(\w+)/i,
    ],
    type: "detail_view",
    nameTemplate: "view_{0}_detail",
    descriptionTemplate: "View details of a single {0}",
    primary: true,
  },
  // CRUD/Management patterns
  {
    patterns: [
      /manage\s+(\w+)/i,
      /(\w+)\s+manager/i,
      /add\s+(?:and\s+)?(?:remove\s+)?(\w+)/i,
      /create\s+(\w+)/i,
      /edit\s+(\w+)/i,
      /(\w+)\s+tracker/i,
      /track\s+(\w+)/i,
      /todo/i,
      /task\s*list/i,
      /shopping\s*list/i,
    ],
    type: "crud_list",
    nameTemplate: "manage_{0}",
    descriptionTemplate: "Create, view, edit, and delete {0}",
    primary: true,
  },
  // Form/Input patterns
  {
    patterns: [
      /add\s+new\s+(\w+)/i,
      /create\s+(\w+)/i,
      /(\w+)\s+form/i,
      /input\s+(\w+)/i,
      /enter\s+(\w+)/i,
      /submit\s+(\w+)/i,
    ],
    type: "form_input",
    nameTemplate: "add_{0}",
    descriptionTemplate: "Form to add/create new {0}",
    primary: false,
  },
  // Dashboard patterns
  {
    patterns: [
      /dashboard/i,
      /overview/i,
      /summary/i,
      /stats/i,
      /analytics/i,
      /home\s*page/i,
    ],
    type: "dashboard",
    nameTemplate: "dashboard",
    descriptionTemplate: "Overview dashboard showing key information",
    primary: true,
  },
  // Settings patterns
  {
    patterns: [
      /settings?/i,
      /preferences?/i,
      /config(?:uration)?/i,
      /options?/i,
      /customize/i,
    ],
    type: "settings",
    nameTemplate: "settings",
    descriptionTemplate: "App settings and preferences",
    primary: false,
  },
  // Profile patterns
  {
    patterns: [/profile/i, /account/i, /user\s*info/i, /my\s+(\w+)/i],
    type: "profile",
    nameTemplate: "profile",
    descriptionTemplate: "User profile and account information",
    primary: false,
  },
  // Collection/Favorites patterns
  {
    patterns: [
      /favorites?/i,
      /saved/i,
      /bookmarks?/i,
      /liked/i,
      /collection/i,
      /wishlist/i,
    ],
    type: "collection",
    nameTemplate: "favorites",
    descriptionTemplate: "Saved/favorited items collection",
    primary: true,
  },
  // Search patterns
  {
    patterns: [/search/i, /find\s+(\w+)/i, /look\s*up/i, /filter/i, /query/i],
    type: "search",
    nameTemplate: "search",
    descriptionTemplate: "Search and filter functionality",
    primary: true, // Changed to primary for better screen coverage
  },
  // Calendar/Date patterns
  {
    patterns: [
      /calendar/i,
      /schedule/i,
      /events?/i,
      /appointments?/i,
      /dates?/i,
      /planner/i,
    ],
    type: "calendar",
    nameTemplate: "calendar",
    descriptionTemplate: "Calendar and date-based views",
    primary: true,
  },
  // Media patterns
  {
    patterns: [
      /photos?/i,
      /images?/i,
      /gallery/i,
      /videos?/i,
      /media/i,
      /pictures?/i,
    ],
    type: "media_viewer",
    nameTemplate: "gallery",
    descriptionTemplate: "Media gallery and viewer",
    primary: true,
  },
  // Chat/Messaging patterns
  {
    patterns: [/chat/i, /messag(?:e|ing)/i, /conversation/i, /inbox/i, /dm/i],
    type: "chat",
    nameTemplate: "chat",
    descriptionTemplate: "Chat and messaging interface",
    primary: true,
  },
];

/**
 * Common app archetypes with predefined feature sets
 */
const APP_ARCHETYPES: Array<{
  name: string; // Human-readable name for error messages
  patterns: RegExp[];
  features: Array<{
    name: string;
    type: FeatureType;
    description: string;
    primary: boolean;
    suggestedScreen: string;
  }>;
  suggestedWidgets: Array<{
    name: string;
    reason: string;
    usedIn: string[];
  }>;
  minScreens: number;
  recommendedScreens: number;
}> = [
  // Counter/Simple utility
  {
    name: "Counter/Clicker App",
    patterns: [/counter/i, /clicker/i, /tally/i, /increment/i],
    features: [
      {
        name: "counter",
        type: "custom",
        description: "Counter with increment/decrement",
        primary: true,
        suggestedScreen: "home_screen",
      },
    ],
    suggestedWidgets: [],
    minScreens: 1,
    recommendedScreens: 1,
  },
  // Todo/Task app
  {
    name: "Todo/Task Manager",
    patterns: [/todo/i, /task\s*(list|manager|app)?/i, /checklist/i],
    features: [
      {
        name: "task_list",
        type: "crud_list",
        description: "View and manage tasks",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "add_task",
        type: "form_input",
        description: "Add new tasks",
        primary: true,
        suggestedScreen: "add_task_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "task_tile",
        reason: "Reusable task item with checkbox and delete action",
        usedIn: ["home_screen"],
      },
    ],
    minScreens: 2,
    recommendedScreens: 2,
  },
  // Recipe app
  {
    name: "Recipe/Cookbook App",
    patterns: [/recipe/i, /cookbook/i, /cooking/i, /meal/i, /food\s*app/i],
    features: [
      {
        name: "browse_recipes",
        type: "list_view",
        description: "Browse recipe collection",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "recipe_detail",
        type: "detail_view",
        description: "View full recipe details",
        primary: true,
        suggestedScreen: "recipe_detail_screen",
      },
      {
        name: "favorites",
        type: "collection",
        description: "Saved favorite recipes",
        primary: true,
        suggestedScreen: "favorites_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "recipe_card",
        reason: "Displays recipe thumbnail, title, and rating in list views",
        usedIn: ["home_screen", "favorites_screen"],
      },
    ],
    minScreens: 3,
    recommendedScreens: 3,
  },
  // E-commerce/Shopping
  {
    name: "E-commerce/Shopping App",
    patterns: [
      /shop(?:ping)?/i,
      /store/i,
      /e-?commerce/i,
      /product/i,
      /catalog/i,
      /cart/i,
      /marketplace/i,
    ],
    features: [
      {
        name: "browse_products",
        type: "list_view",
        description: "Browse product catalog",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "product_detail",
        type: "detail_view",
        description: "View product details",
        primary: true,
        suggestedScreen: "product_detail_screen",
      },
      {
        name: "shopping_cart",
        type: "crud_list",
        description: "Manage shopping cart",
        primary: true,
        suggestedScreen: "cart_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "product_card",
        reason: "Displays product image, name, price in grid/list views",
        usedIn: ["home_screen"],
      },
      {
        name: "cart_item",
        reason: "Cart item with quantity controls and remove button",
        usedIn: ["cart_screen"],
      },
    ],
    minScreens: 3,
    recommendedScreens: 3,
  },
  // Notes app
  {
    name: "Notes/Journal App",
    patterns: [/notes?/i, /notebook/i, /memo/i, /journal/i, /diary/i],
    features: [
      {
        name: "notes_list",
        type: "crud_list",
        description: "View all notes",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "note_editor",
        type: "form_input",
        description: "Create and edit notes",
        primary: true,
        suggestedScreen: "note_editor_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "note_card",
        reason: "Displays note preview with title and snippet",
        usedIn: ["home_screen"],
      },
    ],
    minScreens: 2,
    recommendedScreens: 2,
  },
  // Weather app
  {
    name: "Weather App",
    patterns: [/weather/i, /forecast/i, /climate/i, /temperature/i],
    features: [
      {
        name: "current_weather",
        type: "dashboard",
        description: "Current weather display",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "forecast",
        type: "list_view",
        description: "Weather forecast",
        primary: true,
        suggestedScreen: "forecast_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "weather_card",
        reason: "Displays weather for a single day with icon and temps",
        usedIn: ["home_screen", "forecast_screen"],
      },
    ],
    minScreens: 2,
    recommendedScreens: 2,
  },
  // Fitness/Health
  {
    name: "Fitness/Workout App",
    patterns: [
      /fitness/i,
      /workout/i,
      /exercise/i,
      /health/i,
      /gym/i,
      /training/i,
      /yoga/i,
    ],
    features: [
      {
        name: "workout_list",
        type: "list_view",
        description: "Browse workouts",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "workout_detail",
        type: "detail_view",
        description: "Workout details and exercises",
        primary: true,
        suggestedScreen: "workout_detail_screen",
      },
      {
        name: "progress",
        type: "dashboard",
        description: "Track progress and stats",
        primary: true,
        suggestedScreen: "progress_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "workout_card",
        reason: "Displays workout name, duration, and difficulty",
        usedIn: ["home_screen"],
      },
      {
        name: "exercise_tile",
        reason: "Shows individual exercise with sets/reps",
        usedIn: ["workout_detail_screen"],
      },
    ],
    minScreens: 3,
    recommendedScreens: 3,
  },
  // Social/Profile
  {
    name: "Social Media/Feed App",
    patterns: [
      /social/i,
      /community/i,
      /feed/i,
      /posts?/i,
      /timeline/i,
      /twitter/i,
      /instagram/i,
    ],
    features: [
      {
        name: "feed",
        type: "list_view",
        description: "Social feed/timeline",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "post_detail",
        type: "detail_view",
        description: "View post details",
        primary: true,
        suggestedScreen: "post_detail_screen",
      },
      {
        name: "profile",
        type: "profile",
        description: "User profile",
        primary: true,
        suggestedScreen: "profile_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "post_card",
        reason: "Displays post with author, content, likes, comments",
        usedIn: ["home_screen", "profile_screen"],
      },
      {
        name: "user_avatar",
        reason: "Circular user avatar with optional status indicator",
        usedIn: ["home_screen", "post_detail_screen", "profile_screen"],
      },
    ],
    minScreens: 3,
    recommendedScreens: 3,
  },
  // Dating/Matching app
  {
    name: "Dating/Matching App",
    patterns: [
      /dating/i,
      /match(?:ing)?/i,
      /tinder/i,
      /swipe/i,
      /bumble/i,
      /meet\s*people/i,
      /romance/i,
      /relationship/i,
    ],
    features: [
      {
        name: "discover",
        type: "list_view",
        description: "Discover and browse potential matches",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "search",
        type: "search",
        description: "Search for users with filters",
        primary: true,
        suggestedScreen: "search_screen",
      },
      {
        name: "matches",
        type: "collection",
        description: "View matched profiles",
        primary: true,
        suggestedScreen: "matches_screen",
      },
      {
        name: "profile",
        type: "profile",
        description: "User profile management",
        primary: true,
        suggestedScreen: "profile_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "user_card",
        reason: "Large swipeable card showing user photo, name, age, bio",
        usedIn: ["home_screen"],
      },
      {
        name: "match_tile",
        reason: "Compact match item with avatar and last message preview",
        usedIn: ["matches_screen"],
      },
    ],
    minScreens: 4,
    recommendedScreens: 4,
  },
  // Music/Audio app
  {
    name: "Music/Audio Player App",
    patterns: [
      /music/i,
      /audio/i,
      /player/i,
      /playlist/i,
      /spotify/i,
      /podcast/i,
      /radio/i,
      /streaming/i,
      /songs?/i,
      /album/i,
    ],
    features: [
      {
        name: "library",
        type: "list_view",
        description: "Browse music library",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "now_playing",
        type: "detail_view",
        description: "Now playing screen with controls",
        primary: true,
        suggestedScreen: "player_screen",
      },
      {
        name: "playlists",
        type: "collection",
        description: "User playlists",
        primary: true,
        suggestedScreen: "playlists_screen",
      },
      {
        name: "search",
        type: "search",
        description: "Search for songs, artists, albums",
        primary: true,
        suggestedScreen: "search_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "song_tile",
        reason: "Song item with album art, title, artist, and play button",
        usedIn: ["home_screen", "playlists_screen", "search_screen"],
      },
      {
        name: "mini_player",
        reason: "Mini player bar shown at bottom of screens",
        usedIn: ["home_screen", "playlists_screen", "search_screen"],
      },
      {
        name: "playlist_card",
        reason: "Playlist cover art with name and song count",
        usedIn: ["playlists_screen"],
      },
    ],
    minScreens: 4,
    recommendedScreens: 4,
  },
  // Education/Learning app
  {
    name: "Education/Learning App",
    patterns: [
      /education/i,
      /learning/i,
      /course/i,
      /lesson/i,
      /tutorial/i,
      /quiz/i,
      /study/i,
      /school/i,
      /training/i,
      /e-?learning/i,
      /academy/i,
    ],
    features: [
      {
        name: "courses",
        type: "list_view",
        description: "Browse available courses",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "course_detail",
        type: "detail_view",
        description: "Course content and lessons",
        primary: true,
        suggestedScreen: "course_detail_screen",
      },
      {
        name: "lesson",
        type: "detail_view",
        description: "Individual lesson view",
        primary: true,
        suggestedScreen: "lesson_screen",
      },
      {
        name: "progress",
        type: "dashboard",
        description: "Learning progress and achievements",
        primary: true,
        suggestedScreen: "progress_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "course_card",
        reason: "Course thumbnail, title, progress bar, and rating",
        usedIn: ["home_screen"],
      },
      {
        name: "lesson_tile",
        reason: "Lesson item with completion status and duration",
        usedIn: ["course_detail_screen"],
      },
      {
        name: "progress_indicator",
        reason: "Circular or linear progress indicator",
        usedIn: ["home_screen", "course_detail_screen", "progress_screen"],
      },
    ],
    minScreens: 4,
    recommendedScreens: 4,
  },
  // Bottom Navigation App (generic tabbed app)
  {
    name: "Bottom Navigation App",
    patterns: [
      /bottom\s*nav(?:igation)?/i,
      /tab\s*bar/i,
      /tabbed/i,
      /multi.?tab/i,
      /navigation\s*bar/i,
    ],
    features: [
      {
        name: "home",
        type: "dashboard",
        description: "Main home tab",
        primary: true,
        suggestedScreen: "home_screen",
      },
      {
        name: "search",
        type: "search",
        description: "Search tab",
        primary: true,
        suggestedScreen: "search_screen",
      },
      {
        name: "profile",
        type: "profile",
        description: "Profile tab",
        primary: true,
        suggestedScreen: "profile_screen",
      },
    ],
    suggestedWidgets: [
      {
        name: "bottom_navigation",
        reason: "Bottom navigation bar with tab icons",
        usedIn: ["home_screen", "search_screen", "profile_screen"],
      },
    ],
    minScreens: 3,
    recommendedScreens: 3,
  },
];

/**
 * Widget patterns that suggest extraction opportunities
 */
const WIDGET_PATTERNS: Array<{
  featureTypes: FeatureType[];
  widget: {
    nameTemplate: string;
    reason: string;
  };
}> = [
  {
    featureTypes: ["list_view", "collection"],
    widget: {
      nameTemplate: "{item}_card",
      reason: "Card widget appears in both list view and collection",
    },
  },
  {
    featureTypes: ["crud_list"],
    widget: {
      nameTemplate: "{item}_list_tile",
      reason: "List tile with actions used throughout the list",
    },
  },
  {
    featureTypes: ["form_input"],
    widget: {
      nameTemplate: "form_field",
      reason: "Reusable form field styling",
    },
  },
];

// ============================================================================
// Feature Extractor Class
// ============================================================================

export class FeatureExtractor {
  /**
   * Main entry point: analyze identity and extract features
   * Throws UnsupportedCategoryError if the prompt doesn't match any supported category
   */
  analyzeIdentity(identity: ProjectIdentity): FeatureAnalysis {
    const purpose = identity.core_definition.purpose.toLowerCase();
    const domain = identity.core_definition.domain.toLowerCase();
    const fullText = `${purpose} ${domain} ${identity.characteristics.join(" ")}`;

    // Step 1: Try to match a known archetype
    const archetypeMatch = this.matchArchetype(fullText);

    if (archetypeMatch) {
      return this.buildFromArchetype(archetypeMatch, identity);
    }

    // Step 2: If no archetype matches, reject with clear error
    // The scoped platform does not support arbitrary prompts
    throw new UnsupportedCategoryError(
      identity.core_definition.purpose,
      SUPPORTED_CATEGORIES as unknown as string[],
    );
  }

  /**
   * Validates if a prompt matches any supported category without extracting features
   * Returns the matched category name or null
   */
  validatePrompt(prompt: string): {
    valid: boolean;
    category: string | null;
    error?: string;
  } {
    const lowerPrompt = prompt.toLowerCase();

    for (const archetype of APP_ARCHETYPES) {
      for (const pattern of archetype.patterns) {
        if (pattern.test(lowerPrompt)) {
          return { valid: true, category: archetype.name };
        }
      }
    }

    return {
      valid: false,
      category: null,
      error: `Unsupported app type. Please create one of the following: ${SUPPORTED_CATEGORIES.join(", ")}.`,
    };
  }

  /**
   * Try to match the app description to a known archetype
   */
  private matchArchetype(text: string): (typeof APP_ARCHETYPES)[number] | null {
    for (const archetype of APP_ARCHETYPES) {
      for (const pattern of archetype.patterns) {
        if (pattern.test(text)) {
          return archetype;
        }
      }
    }
    return null;
  }

  /**
   * Build feature analysis from a matched archetype
   */
  private buildFromArchetype(
    archetype: (typeof APP_ARCHETYPES)[number],
    identity: ProjectIdentity,
  ): FeatureAnalysis {
    const features: IdentifiedFeature[] = archetype.features.map((f) => ({
      name: f.name,
      type: f.type,
      description: f.description,
      primary: f.primary,
      suggested_screen: f.suggestedScreen,
    }));

    // Check for additional features mentioned that aren't in archetype
    const purpose = identity.core_definition.purpose.toLowerCase();
    const additionalFeatures = this.extractAdditionalFeatures(
      purpose,
      features,
    );
    features.push(...additionalFeatures);

    const suggestedScreens = this.buildSuggestedScreens(features);

    // Use archetype's defined screen counts
    const minScreens = archetype.minScreens;
    const recommendedScreens = Math.max(
      archetype.recommendedScreens,
      suggestedScreens.length,
    );

    // Build widget candidates from archetype's suggested widgets
    const widgetCandidates: WidgetCandidate[] = archetype.suggestedWidgets.map(
      (w) => ({
        name: w.name,
        file_name: `${w.name}.dart`,
        reason: w.reason,
        used_in: w.usedIn,
      }),
    );

    // Add any additional widget candidates from feature analysis
    const additionalWidgets = this.identifyWidgetCandidates(features);
    for (const widget of additionalWidgets) {
      if (!widgetCandidates.some((w) => w.name === widget.name)) {
        widgetCandidates.push(widget);
      }
    }

    return {
      identified_features: features,
      screen_requirements: {
        minimum: minScreens,
        recommended: recommendedScreens,
        maximum: recommendedScreens + 2,
        suggested_screens: suggestedScreens,
      },
      widget_candidates: widgetCandidates,
      analysis_notes: `Matched archetype "${archetype.name}" with ${features.length} features. Required widgets: ${widgetCandidates.length}.`,
    };
  }

  /**
   * Look for additional features not covered by the archetype
   */
  private extractAdditionalFeatures(
    text: string,
    existingFeatures: IdentifiedFeature[],
  ): IdentifiedFeature[] {
    const additional: IdentifiedFeature[] = [];
    const existingTypes = new Set(existingFeatures.map((f) => f.type));
    const existingNames = new Set(existingFeatures.map((f) => f.name));

    // Check for settings if not present
    if (
      !existingTypes.has("settings") &&
      /setting|preference|config/i.test(text)
    ) {
      additional.push({
        name: "settings",
        type: "settings",
        description: "App settings and preferences",
        primary: false,
        suggested_screen: "settings_screen",
      });
    }

    // Check for favorites/collection if not present
    if (
      !existingTypes.has("collection") &&
      /favorite|saved|bookmark|liked/i.test(text)
    ) {
      additional.push({
        name: "favorites",
        type: "collection",
        description: "Saved/favorited items",
        primary: true,
        suggested_screen: "favorites_screen",
      });
    }

    // Check for search if not present
    if (!existingTypes.has("search") && /search|find|filter/i.test(text)) {
      additional.push({
        name: "search",
        type: "search",
        description: "Search functionality",
        primary: true,
        suggested_screen: "search_screen",
      });
    }

    // Check for profile if not present
    if (!existingTypes.has("profile") && /profile|account|user/i.test(text)) {
      additional.push({
        name: "profile",
        type: "profile",
        description: "User profile",
        primary: false,
        suggested_screen: "profile_screen",
      });
    }

    // Filter out any that already exist by name
    return additional.filter((f) => !existingNames.has(f.name));
  }

  /**
   * Build suggested screen list from features
   */
  private buildSuggestedScreens(
    features: IdentifiedFeature[],
  ): SuggestedScreen[] {
    const screens: SuggestedScreen[] = [];
    const screenMap = new Map<string, SuggestedScreen>();

    // Group features by their suggested screen
    for (const feature of features) {
      const screenName =
        feature.suggested_screen ||
        this.featureToScreenName(feature.name, feature.type);
      const fileName = `${screenName}.dart`;

      if (screenMap.has(screenName)) {
        // Add feature to existing screen
        const existing = screenMap.get(screenName)!;
        existing.covers_features.push(feature.name);
        if (
          feature.description &&
          !existing.description.includes(feature.description)
        ) {
          existing.description += `, ${feature.description.toLowerCase()}`;
        }
      } else {
        // Create new screen
        const isHome =
          screenName === "home_screen" ||
          (feature.primary && screens.length === 0);

        screenMap.set(screenName, {
          name: screenName,
          file_name: fileName,
          covers_features: [feature.name],
          description: feature.description,
          is_home: isHome,
        });
      }
    }

    // Ensure there's a home screen
    const hasHome = Array.from(screenMap.values()).some((s) => s.is_home);
    if (!hasHome && screenMap.size > 0) {
      const firstScreen = screenMap.values().next().value;
      if (firstScreen) {
        firstScreen.is_home = true;
      }
    }

    // Sort with home screen first
    return Array.from(screenMap.values()).sort((a, b) => {
      if (a.is_home) return -1;
      if (b.is_home) return 1;
      return 0;
    });
  }

  /**
   * Identify widgets that should be extracted for reuse
   */
  private identifyWidgetCandidates(
    features: IdentifiedFeature[],
  ): WidgetCandidate[] {
    const candidates: WidgetCandidate[] = [];
    const featureTypes = features.map((f) => f.type);

    // Check each widget pattern
    for (const widgetPattern of WIDGET_PATTERNS) {
      const matchingFeatures = features.filter((f) =>
        widgetPattern.featureTypes.includes(f.type),
      );

      // Only suggest widget if it would be used in multiple places
      if (matchingFeatures.length >= 2) {
        const itemName = this.extractItemName(matchingFeatures[0].name);
        const widgetName = widgetPattern.widget.nameTemplate.replace(
          "{item}",
          itemName,
        );

        candidates.push({
          name: widgetName,
          file_name: `${widgetName}.dart`,
          reason: widgetPattern.widget.reason,
          used_in: matchingFeatures.map(
            (f) =>
              f.suggested_screen || this.featureToScreenName(f.name, f.type),
          ),
        });
      }
    }

    // Check for list_view + detail_view combo (common card pattern)
    const hasListView = featureTypes.includes("list_view");
    const hasDetailView = featureTypes.includes("detail_view");
    if (hasListView && hasDetailView) {
      const listFeature = features.find((f) => f.type === "list_view");
      const itemName = listFeature
        ? this.extractItemName(listFeature.name)
        : "item";

      if (!candidates.some((c) => c.name.includes("card"))) {
        candidates.push({
          name: `${itemName}_card`,
          file_name: `${itemName}_card.dart`,
          reason: "Card widget used in list and can be reused in detail view",
          used_in: features
            .filter((f) => f.type === "list_view" || f.type === "detail_view")
            .map(
              (f) =>
                f.suggested_screen || this.featureToScreenName(f.name, f.type),
            ),
        });
      }
    }

    return candidates;
  }

  /**
   * Convert feature name to screen name
   */
  private featureToScreenName(name: string, type: FeatureType): string {
    // Special cases
    if (name === "home" || name === "dashboard") {
      return "home_screen";
    }

    // Remove common prefixes
    let screenName = name
      .replace(/^(browse_|view_|manage_|add_)/, "")
      .replace(/_detail$/, "");

    // Add _screen suffix if not present
    if (!screenName.endsWith("_screen")) {
      screenName += "_screen";
    }

    return screenName;
  }

  /**
   * Extract the main item/entity name from a feature name
   */
  private extractItemName(featureName: string): string {
    return featureName
      .replace(/^(browse_|view_|manage_|add_|create_|edit_)/, "")
      .replace(/(_list|_detail|_form|s$)/, "");
  }

  /**
   * Simple singularization (handles common cases)
   */
  private singularize(word: string): string {
    if (!word) return word;

    // Common irregular plurals
    const irregulars: Record<string, string> = {
      recipes: "recipe",
      categories: "category",
      entries: "entry",
      activities: "activity",
    };

    const lower = word.toLowerCase();
    if (irregulars[lower]) {
      return irregulars[lower];
    }

    // Common patterns
    if (lower.endsWith("ies")) {
      return lower.slice(0, -3) + "y";
    }
    if (lower.endsWith("es") && lower.length > 3) {
      return lower.slice(0, -2);
    }
    if (lower.endsWith("s") && !lower.endsWith("ss")) {
      return lower.slice(0, -1);
    }

    return word;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultExtractor: FeatureExtractor | null = null;

export function getFeatureExtractor(): FeatureExtractor {
  if (!defaultExtractor) {
    defaultExtractor = new FeatureExtractor();
  }
  return defaultExtractor;
}

export function createFeatureExtractor(): FeatureExtractor {
  return new FeatureExtractor();
}

/**
 * Validates a user prompt against supported categories
 * Returns validation result with category name or error message
 */
export function validatePromptCategory(prompt: string): {
  valid: boolean;
  category: string | null;
  error?: string;
  supportedCategories: readonly string[];
} {
  const extractor = getFeatureExtractor();
  const result = extractor.validatePrompt(prompt);
  return {
    ...result,
    supportedCategories: SUPPORTED_CATEGORIES,
  };
}
