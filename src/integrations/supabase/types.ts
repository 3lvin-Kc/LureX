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
      attachments: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_variants: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          distribution_percentage: number | null
          id: string
          template_id: string | null
          template_version: number | null
          variant_name: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          distribution_percentage?: number | null
          id?: string
          template_id?: string | null
          template_version?: number | null
          variant_name: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          distribution_percentage?: number | null
          id?: string
          template_id?: string | null
          template_version?: number | null
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
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          name: string
          provider_id: string | null
          schedule_time: string | null
          start_time: string | null
          status: string | null
          target_list_id: string | null
          template_id: string | null
          template_version: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          name: string
          provider_id?: string | null
          schedule_time?: string | null
          start_time?: string | null
          status?: string | null
          target_list_id?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          name?: string
          provider_id?: string | null
          schedule_time?: string | null
          start_time?: string | null
          status?: string | null
          target_list_id?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string | null
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
          created_at: string | null
          from_email: string
          from_name: string | null
          host: string
          id: string
          is_default: boolean | null
          name: string
          password: string
          port: number
          provider_type: string
          sendgrid_template_id: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name?: string | null
          host: string
          id?: string
          is_default?: boolean | null
          name: string
          password: string
          port: number
          provider_type?: string
          sendgrid_template_id?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          host?: string
          id?: string
          is_default?: boolean | null
          name?: string
          password?: string
          port?: number
          provider_type?: string
          sendgrid_template_id?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          provider_id: string | null
          retry_count: number | null
          scheduled_time: string | null
          sent_time: string | null
          status: string | null
          target_id: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          provider_id?: string | null
          retry_count?: number | null
          scheduled_time?: string | null
          sent_time?: string | null
          status?: string | null
          target_id?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          provider_id?: string | null
          retry_count?: number | null
          scheduled_time?: string | null
          sent_time?: string | null
          status?: string | null
          target_id?: string | null
          updated_at?: string | null
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
          created_at: string | null
          created_by: string | null
          html_content: string
          id: string
          subject: string
          template_id: string | null
          text_content: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          html_content: string
          id?: string
          subject: string
          template_id?: string | null
          text_content?: string | null
          version: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          html_content?: string
          id?: string
          subject?: string
          template_id?: string | null
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
          created_at: string | null
          description: string | null
          html_content: string
          id: string
          name: string
          subject: string
          text_content: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          clicked_count: number | null
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          opened_at: string | null
          opened_count: number | null
          sent_at: string | null
          status: string | null
          target_id: string | null
          tracking_id: string
          variant_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          clicked_count?: number | null
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          opened_count?: number | null
          sent_at?: string | null
          status?: string | null
          target_id?: string | null
          tracking_id: string
          variant_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          clicked_count?: number | null
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          opened_count?: number | null
          sent_at?: string | null
          status?: string | null
          target_id?: string | null
          tracking_id?: string
          variant_id?: string | null
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
          {
            foreignKeyName: "email_tracking_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "campaign_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      phishing_pages: {
        Row: {
          category: string | null
          created_at: string
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
          detected_at: string | null
          event_data: Json
          id: string
          ip_address: string | null
          location: string | null
          reasons: string[]
          review_notes: string | null
          reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          detected_at?: string | null
          event_data: Json
          id?: string
          ip_address?: string | null
          location?: string | null
          reasons: string[]
          review_notes?: string | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          detected_at?: string | null
          event_data?: Json
          id?: string
          ip_address?: string | null
          location?: string | null
          reasons?: string[]
          review_notes?: string | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_level: string
          event_type: string
          id: string
          ip_address: string | null
          is_anomalous: boolean | null
          location: string | null
          message: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_level: string
          event_type: string
          id?: string
          ip_address?: string | null
          is_anomalous?: boolean | null
          location?: string | null
          message: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_level?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          is_anomalous?: boolean | null
          location?: string | null
          message?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      target_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      targets: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          department: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          list_id: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id?: string | null
          position?: string | null
          updated_at?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
