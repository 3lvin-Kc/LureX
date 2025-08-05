export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      benchmark_data: {
        Row: {
          company_size: string
          id: string
          industry: string
          metric_name: string
          metric_value: number
          period_quarter: number | null
          period_year: number
          updated_at: string
        }
        Insert: {
          company_size: string
          id?: string
          industry: string
          metric_name: string
          metric_value: number
          period_quarter?: number | null
          period_year: number
          updated_at?: string
        }
        Update: {
          company_size?: string
          id?: string
          industry?: string
          metric_name?: string
          metric_value?: number
          period_quarter?: number | null
          period_year?: number
          updated_at?: string
        }
        Relationships: []
      }
      campaign_metrics: {
        Row: {
          additional_data: Json | null
          campaign_id: string
          clicked_at: string | null
          data_submitted_at: string | null
          delivered_at: string | null
          id: string
          ip_address: string | null
          opened_at: string | null
          reported_at: string | null
          sent_at: string | null
          target_email: string
          user_agent: string | null
        }
        Insert: {
          additional_data?: Json | null
          campaign_id: string
          clicked_at?: string | null
          data_submitted_at?: string | null
          delivered_at?: string | null
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          reported_at?: string | null
          sent_at?: string | null
          target_email: string
          user_agent?: string | null
        }
        Update: {
          additional_data?: Json | null
          campaign_id?: string
          clicked_at?: string | null
          data_submitted_at?: string | null
          delivered_at?: string | null
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          reported_at?: string | null
          sent_at?: string | null
          target_email?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          domain_id: string | null
          id: string
          name: string
          phishing_page_id: string | null
          schedule_time: string | null
          status: string | null
          target_list_id: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain_id?: string | null
          id?: string
          name: string
          phishing_page_id?: string | null
          schedule_time?: string | null
          status?: string | null
          target_list_id?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain_id?: string | null
          id?: string
          name?: string
          phishing_page_id?: string | null
          schedule_time?: string | null
          status?: string | null
          target_list_id?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_phishing_page_id_fkey"
            columns: ["phishing_page_id"]
            isOneToOne: false
            referencedRelation: "phishing_pages"
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
      compliance_reports: {
        Row: {
          configuration: Json
          created_at: string
          framework_type: string
          id: string
          is_automated: boolean
          last_generated_at: string | null
          next_due_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          framework_type: string
          id?: string
          is_automated?: boolean
          last_generated_at?: string | null
          next_due_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          framework_type?: string
          id?: string
          is_automated?: boolean
          last_generated_at?: string | null
          next_due_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      context_events: {
        Row: {
          created_at: string | null
          event_data: Json
          event_date: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          is_active: boolean | null
          relevance_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json
          event_date: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          is_active?: boolean | null
          relevance_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_date?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          relevance_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_domains: {
        Row: {
          created_at: string
          dns_records: Json
          domain: string
          id: string
          ssl_enabled: boolean
          updated_at: string
          user_id: string
          verification_token: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          dns_records?: Json
          domain: string
          id?: string
          ssl_enabled?: boolean
          updated_at?: string
          user_id: string
          verification_token: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          dns_records?: Json
          domain?: string
          id?: string
          ssl_enabled?: boolean
          updated_at?: string
          user_id?: string
          verification_token?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          context_aware: boolean | null
          created_at: string | null
          description: string | null
          dynamic_content: boolean | null
          html_content: string
          id: string
          industry_type: string | null
          name: string
          personalization_variables: Json | null
          subject: string
          text_content: string | null
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          category?: string | null
          context_aware?: boolean | null
          created_at?: string | null
          description?: string | null
          dynamic_content?: boolean | null
          html_content: string
          id?: string
          industry_type?: string | null
          name: string
          personalization_variables?: Json | null
          subject: string
          text_content?: string | null
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          category?: string | null
          context_aware?: boolean | null
          created_at?: string | null
          description?: string | null
          dynamic_content?: boolean | null
          html_content?: string
          id?: string
          industry_type?: string | null
          name?: string
          personalization_variables?: Json | null
          subject?: string
          text_content?: string | null
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      executive_dashboards: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
          widgets: Json
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
          widgets?: Json
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
          widgets?: Json
        }
        Relationships: []
      }
      industry_templates: {
        Row: {
          created_at: string | null
          id: string
          industry_type: string
          sophistication_level: string | null
          template_data: Json
          template_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry_type: string
          sophistication_level?: string | null
          template_data: Json
          template_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry_type?: string
          sophistication_level?: string | null
          template_data?: Json
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      phishing_pages: {
        Row: {
          category: string | null
          created_at: string | null
          css_content: string | null
          html_content: string
          id: string
          is_custom: boolean | null
          js_content: string | null
          name: string
          source_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          css_content?: string | null
          html_content: string
          id?: string
          is_custom?: boolean | null
          js_content?: string | null
          name: string
          source_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          css_content?: string | null
          html_content?: string
          id?: string
          is_custom?: boolean | null
          js_content?: string | null
          name?: string
          source_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          configuration: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          report_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roi_metrics: {
        Row: {
          campaign_id: string | null
          cost_per_training_hour: number | null
          created_at: string
          id: string
          incident_cost_average: number | null
          incident_prevention_count: number | null
          period_end: string
          period_start: string
          total_roi: number | null
          training_hours_saved: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          cost_per_training_hour?: number | null
          created_at?: string
          id?: string
          incident_cost_average?: number | null
          incident_prevention_count?: number | null
          period_end: string
          period_start: string
          total_roi?: number | null
          training_hours_saved?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          cost_per_training_hour?: number | null
          created_at?: string
          id?: string
          incident_cost_average?: number | null
          incident_prevention_count?: number | null
          period_end?: string
          period_start?: string
          total_roi?: number | null
          training_hours_saved?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string
          delivery_format: string
          description: string | null
          id: string
          is_active: boolean
          last_sent_at: string | null
          name: string
          next_send_at: string | null
          recipients: Json
          report_template_id: string | null
          schedule_cron: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_format?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name: string
          next_send_at?: string | null
          recipients?: Json
          report_template_id?: string | null
          schedule_cron: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_format?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name?: string
          next_send_at?: string | null
          recipients?: Json
          report_template_id?: string | null
          schedule_cron?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_scheduled_reports_report_template"
            columns: ["report_template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      target_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          target_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          target_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          target_count?: number | null
          updated_at?: string | null
          user_id?: string
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
          list_id: string
          phone: string | null
          position: string | null
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id: string
          phone?: string | null
          position?: string | null
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id?: string
          phone?: string | null
          position?: string | null
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
      template_variables: {
        Row: {
          created_at: string | null
          data_mapping: Json
          data_source: string
          description: string | null
          id: string
          industry_specific: boolean | null
          name: string
          updated_at: string | null
          user_id: string
          variable_key: string
        }
        Insert: {
          created_at?: string | null
          data_mapping?: Json
          data_source: string
          description?: string | null
          id?: string
          industry_specific?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
          variable_key: string
        }
        Update: {
          created_at?: string | null
          data_mapping?: Json
          data_source?: string
          description?: string | null
          id?: string
          industry_specific?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
          variable_key?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
