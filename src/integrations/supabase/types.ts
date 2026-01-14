export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      architecture_plans: {
        Row: {
          complexity_level: Database["public"]["Enums"]["complexity_level"]
          conceptual_category: Database["public"]["Enums"]["conceptual_category"]
          concern_separation: Json
          created_at: string | null
          execution_model: Json
          extensibility_model: Database["public"]["Enums"]["extensibility_model"]
          file_strategy: Json
          maintenance_strategy: Database["public"]["Enums"]["maintenance_strategy"]
          naming_conventions: Json
          navigation_architecture: Json
          performance_strategy: Json
          plan_id: string
          platform_constraints: Json
          project_identity_id: string
          state_management: Json
          structural_philosophy: string
          ui_architecture: Json
        }
        Insert: {
          complexity_level: Database["public"]["Enums"]["complexity_level"]
          conceptual_category: Database["public"]["Enums"]["conceptual_category"]
          concern_separation: Json
          created_at?: string | null
          execution_model: Json
          extensibility_model: Database["public"]["Enums"]["extensibility_model"]
          file_strategy: Json
          maintenance_strategy: Database["public"]["Enums"]["maintenance_strategy"]
          naming_conventions: Json
          navigation_architecture: Json
          performance_strategy: Json
          plan_id: string
          platform_constraints?: Json
          project_identity_id: string
          state_management: Json
          structural_philosophy: string
          ui_architecture: Json
        }
        Update: {
          complexity_level?: Database["public"]["Enums"]["complexity_level"]
          conceptual_category?: Database["public"]["Enums"]["conceptual_category"]
          concern_separation?: Json
          created_at?: string | null
          execution_model?: Json
          extensibility_model?: Database["public"]["Enums"]["extensibility_model"]
          file_strategy?: Json
          maintenance_strategy?: Database["public"]["Enums"]["maintenance_strategy"]
          naming_conventions?: Json
          navigation_architecture?: Json
          performance_strategy?: Json
          plan_id?: string
          platform_constraints?: Json
          project_identity_id?: string
          state_management?: Json
          structural_philosophy?: string
          ui_architecture?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_architecture_plans_project_identity_id"
            columns: ["project_identity_id"]
            isOneToOne: false
            referencedRelation: "project_identities"
            referencedColumns: ["identity_id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          project_state_id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_state_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_state_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_state_id_fkey"
            columns: ["project_state_id"]
            isOneToOne: false
            referencedRelation: "project_states"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_artifacts: {
        Row: {
          architecture_plan_id: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size_bytes: number
          file_type: string
          generation_order: number
          id: string
          identity_id: string
          is_entry_point: boolean
          project_state_id: string
          storage_path: string
        }
        Insert: {
          architecture_plan_id: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number
          file_type: string
          generation_order?: number
          id?: string
          identity_id: string
          is_entry_point?: boolean
          project_state_id: string
          storage_path: string
        }
        Update: {
          architecture_plan_id?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number
          file_type?: string
          generation_order?: number
          id?: string
          identity_id?: string
          is_entry_point?: boolean
          project_state_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_artifacts_architecture_plan_id_fkey"
            columns: ["architecture_plan_id"]
            isOneToOne: false
            referencedRelation: "architecture_plans"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "generated_artifacts_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "project_identities"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "generated_artifacts_project_state_id_fkey"
            columns: ["project_state_id"]
            isOneToOne: false
            referencedRelation: "project_states"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_sessions: {
        Row: {
          architecture_plan_id: string | null
          attempt_number: number
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          error_message: string | null
          files_generated: number | null
          generation_time_ms: number | null
          id: string
          identity_id: string | null
          max_attempts: number
          model_used: string | null
          project_state_id: string
          started_at: string | null
          status: string
          tokens_completion: number | null
          tokens_prompt: number | null
          tokens_total: number | null
          updated_at: string | null
          user_prompt: string
        }
        Insert: {
          architecture_plan_id?: string | null
          attempt_number?: number
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          files_generated?: number | null
          generation_time_ms?: number | null
          id?: string
          identity_id?: string | null
          max_attempts?: number
          model_used?: string | null
          project_state_id: string
          started_at?: string | null
          status: string
          tokens_completion?: number | null
          tokens_prompt?: number | null
          tokens_total?: number | null
          updated_at?: string | null
          user_prompt: string
        }
        Update: {
          architecture_plan_id?: string | null
          attempt_number?: number
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          files_generated?: number | null
          generation_time_ms?: number | null
          id?: string
          identity_id?: string | null
          max_attempts?: number
          model_used?: string | null
          project_state_id?: string
          started_at?: string | null
          status?: string
          tokens_completion?: number | null
          tokens_prompt?: number | null
          tokens_total?: number | null
          updated_at?: string | null
          user_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_sessions_architecture_plan_id_fkey"
            columns: ["architecture_plan_id"]
            isOneToOne: false
            referencedRelation: "architecture_plans"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "generation_sessions_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "project_identities"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "generation_sessions_project_state_id_fkey"
            columns: ["project_state_id"]
            isOneToOne: false
            referencedRelation: "project_states"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_identities: {
        Row: {
          architecture: Json
          characteristics: string[]
          core_definition: Json
          created_at: string | null
          evolution: Json
          identity_id: string
          immutable: boolean
          project_id: string | null
          scale: Json
          scope: Json
          technical_foundation: Json
        }
        Insert: {
          architecture: Json
          characteristics?: string[]
          core_definition: Json
          created_at?: string | null
          evolution: Json
          identity_id: string
          immutable?: boolean
          project_id?: string | null
          scale: Json
          scope: Json
          technical_foundation: Json
        }
        Update: {
          architecture?: Json
          characteristics?: string[]
          core_definition?: Json
          created_at?: string | null
          evolution?: Json
          identity_id?: string
          immutable?: boolean
          project_id?: string | null
          scale?: Json
          scope?: Json
          technical_foundation?: Json
        }
        Relationships: []
      }
      project_states: {
        Row: {
          architecture_decisions_recorded: boolean
          architecture_plan_established: boolean
          artifact_count: number
          created_at: string | null
          has_config: boolean
          id: string
          identity_id: string | null
          mode_locked: Database["public"]["Enums"]["project_mode"]
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          architecture_decisions_recorded?: boolean
          architecture_plan_established?: boolean
          artifact_count?: number
          created_at?: string | null
          has_config?: boolean
          id?: string
          identity_id?: string | null
          mode_locked?: Database["public"]["Enums"]["project_mode"]
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          architecture_decisions_recorded?: boolean
          architecture_plan_established?: boolean
          artifact_count?: number
          created_at?: string | null
          has_config?: boolean
          id?: string
          identity_id?: string | null
          mode_locked?: Database["public"]["Enums"]["project_mode"]
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_states_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_identities"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_states_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "project_identities"
            referencedColumns: ["identity_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      complexity_level: "simple" | "moderate" | "complex" | "enterprise"
      conceptual_category:
        | "utility"
        | "productivity"
        | "entertainment"
        | "ecommerce"
        | "social"
        | "educational"
        | "health"
        | "finance"
        | "custom"
      extensibility_model:
        | "fixed_structure"
        | "modular_growth"
        | "feature_addition"
        | "architectural_evolution"
      maintenance_strategy:
        | "minimal"
        | "structured"
        | "comprehensive"
        | "enterprise"
      project_mode: "ZERO_TO_ONE" | "ONE_TO_N"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      complexity_level: ["simple", "moderate", "complex", "enterprise"],
      conceptual_category: [
        "utility",
        "productivity",
        "entertainment",
        "ecommerce",
        "social",
        "educational",
        "health",
        "finance",
        "custom",
      ],
      extensibility_model: [
        "fixed_structure",
        "modular_growth",
        "feature_addition",
        "architectural_evolution",
      ],
      maintenance_strategy: [
        "minimal",
        "structured",
        "comprehensive",
        "enterprise",
      ],
      project_mode: ["ZERO_TO_ONE", "ONE_TO_N"],
    },
  },
} as const
