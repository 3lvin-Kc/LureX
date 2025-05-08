export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campaign_variants: {
        Row: {
          campaign_id: string
          created_at: string
          distribution_percentage: number
          id: string
          template_id: string
          variant_name: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          distribution_percentage?: number
          id?: string
          template_id: string
          variant_name: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          distribution_percentage?: number
          id?: string
          template_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_variants_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          id: string
          name: string
          provider_id: string | null
          schedule_time: string | null
          start_time: string | null
          status: string
          target_list_id: string | null
          template_id: string | null
          template_version: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          name: string
          provider_id?: string | null
          schedule_time?: string | null
          start_time?: string | null
          status?: string
          target_list_id?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          name?: string
          provider_id?: string | null
          schedule_time?: string | null
          start_time?: string | null
          status?: string
          target_list_id?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "email_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_target_list_id_fkey"
            columns: ["target_list_id"]
            isOneToOne: false
            referencedRelation: "target_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_providers: {
        Row: {
          api_key: string | null
          created_at: string
          from_email: string
          from_name: string | null
          host: string | null
          id: string
          is_default: boolean
          name: string
          password: string | null
          port: number | null
          provider_type: string
          sendgrid_template_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          from_email: string
          from_name?: string | null
          host?: string | null
          id?: string
          is_default?: boolean
          name: string
          password?: string | null
          port?: number | null
          provider_type: string
          sendgrid_template_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          from_email?: string
          from_name?: string | null
          host?: string | null
          id?: string
          is_default?: boolean
          name?: string
          password?: string | null
          port?: number | null
          provider_type?: string
          sendgrid_template_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          campaign_id: string
          created_at: string
          error_message: string | null
          id: string
          provider_id: string
          scheduled_time: string
          sent_time: string | null
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          provider_id: string
          scheduled_time: string
          sent_time?: string | null
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          provider_id?: string
          scheduled_time?: string
          sent_time?: string | null
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "email_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
      }
      email_template_versions: {
        Row: {
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          subject: string
          template_id: string
          text_content: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          subject: string
          template_id: string
          text_content?: string | null
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          subject?: string
          template_id?: string
          text_content?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          is_active: boolean
          name: string
          subject: string
          text_content: string | null
          updated_at: string
          version: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          clicked_count: number
          created_at: string
          email: string
          id: string
          metadata: Json | null
          opened_at: string | null
          opened_count: number
          sent_at: string | null
          status: string
          target_id: string
          tracking_id: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          clicked_count?: number
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          opened_count?: number
          sent_at?: string | null
          status?: string
          target_id: string
          tracking_id: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          clicked_count?: number
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          opened_count?: number
          sent_at?: string | null
          status?: string
          target_id?: string
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tracking_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
      }
      phishing_forms: {
        Row: {
          created_at: string
          form_data: Json | null
          id: string
          page_id: string
          submission_count: number
        }
        Insert: {
          created_at?: string
          form_data?: Json | null
          id?: string
          page_id: string
          submission_count?: number
        }
        Update: {
          created_at?: string
          form_data?: Json | null
          id?: string
          page_id?: string
          submission_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "phishing_forms_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "phishing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      phishing_pages: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          css_content: string | null
          html_content: string
          id: string
          is_custom: boolean
          js_content: string | null
          name: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          css_content?: string | null
          html_content: string
          id?: string
          is_custom?: boolean
          js_content?: string | null
          name: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          css_content?: string | null
          html_content?: string
          id?: string
          is_custom?: boolean
          js_content?: string | null
          name?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      security_anomalies: {
        Row: {
          detected_at: string
          event_data: Json
          id: string
          ip_address: string | null
          location: string | null
          reasons: string[]
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          detected_at?: string
          event_data: Json
          id?: string
          ip_address?: string | null
          location?: string | null
          reasons: string[]
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          detected_at?: string
          event_data?: Json
          id?: string
          ip_address?: string | null
          location?: string | null
          reasons?: string[]
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_level: string
          event_type: string
          id: string
          ip_address: string | null
          is_anomalous: boolean
          location: string | null
          message: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_level: string
          event_type: string
          id?: string
          ip_address?: string | null
          is_anomalous?: boolean
          location?: string | null
          message: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_level?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          is_anomalous?: boolean
          location?: string | null
          message?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      target_lists: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      targets: {
        Row: {
          created_at: string
          custom_fields: Json | null
          department: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          list_id: string
          position: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id: string
          position?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id?: string
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "targets_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "target_lists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
