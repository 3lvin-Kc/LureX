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
          created_at: string | null
          data_submitted_at: string | null
          delivered_at: string | null
          file_downloaded_at: string | null
          file_opened_at: string | null
          id: string
          ip_address: string | null
          opened_at: string | null
          reported_at: string | null
          sent_at: string | null
          target_email: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          additional_data?: Json | null
          campaign_id: string
          clicked_at?: string | null
          created_at?: string | null
          data_submitted_at?: string | null
          delivered_at?: string | null
          file_downloaded_at?: string | null
          file_opened_at?: string | null
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          reported_at?: string | null
          sent_at?: string | null
          target_email: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          additional_data?: Json | null
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string | null
          data_submitted_at?: string | null
          delivered_at?: string | null
          file_downloaded_at?: string | null
          file_opened_at?: string | null
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          reported_at?: string | null
          sent_at?: string | null
          target_email?: string
          updated_at?: string | null
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
          campaign_type: string | null
          created_at: string | null
          description: string | null
          domain_id: string | null
          file_name: string | null
          file_type: string | null
          id: string
          name: string
          phishing_page_id: string | null
          qr_code_data: string | null
          qr_code_url: string | null
          qr_tracking_id: string | null
          schedule_time: string | null
          simulation_type: string | null
          status: string | null
          target_list_id: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_type?: string | null
          created_at?: string | null
          description?: string | null
          domain_id?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          name: string
          phishing_page_id?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          qr_tracking_id?: string | null
          schedule_time?: string | null
          simulation_type?: string | null
          status?: string | null
          target_list_id?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_type?: string | null
          created_at?: string | null
          description?: string | null
          domain_id?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          name?: string
          phishing_page_id?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          qr_tracking_id?: string | null
          schedule_time?: string | null
          simulation_type?: string | null
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
          company_brand: string | null
          context_aware: boolean | null
          created_at: string | null
          description: string | null
          dynamic_content: boolean | null
          effectiveness_score: number | null
          html_content: string
          id: string
          industry_type: string | null
          logo_url: string | null
          name: string
          personalization_variables: Json | null
          source_template_id: string | null
          subject: string
          tags: string[] | null
          template_history: Json | null
          template_source: string | null
          template_type: string | null
          text_content: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
          version: number | null
        }
        Insert: {
          category?: string | null
          company_brand?: string | null
          context_aware?: boolean | null
          created_at?: string | null
          description?: string | null
          dynamic_content?: boolean | null
          effectiveness_score?: number | null
          html_content: string
          id?: string
          industry_type?: string | null
          logo_url?: string | null
          name: string
          personalization_variables?: Json | null
          source_template_id?: string | null
          subject: string
          tags?: string[] | null
          template_history?: Json | null
          template_source?: string | null
          template_type?: string | null
          text_content?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
          version?: number | null
        }
        Update: {
          category?: string | null
          company_brand?: string | null
          context_aware?: boolean | null
          created_at?: string | null
          description?: string | null
          dynamic_content?: boolean | null
          effectiveness_score?: number | null
          html_content?: string
          id?: string
          industry_type?: string | null
          logo_url?: string | null
          name?: string
          personalization_variables?: Json | null
          source_template_id?: string | null
          subject?: string
          tags?: string[] | null
          template_history?: Json | null
          template_source?: string | null
          template_type?: string | null
          text_content?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
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
      file_interactions: {
        Row: {
          campaign_id: string
          created_at: string | null
          device_fingerprint: string | null
          file_name: string
          file_type: string
          geolocation: Json | null
          id: string
          interaction_type: string
          ip_address: unknown | null
          target_email: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          device_fingerprint?: string | null
          file_name: string
          file_type: string
          geolocation?: Json | null
          id?: string
          interaction_type: string
          ip_address?: unknown | null
          target_email: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          device_fingerprint?: string | null
          file_name?: string
          file_type?: string
          geolocation?: Json | null
          id?: string
          interaction_type?: string
          ip_address?: unknown | null
          target_email?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_interactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      learning_modules: {
        Row: {
          content_data: Json
          created_at: string
          difficulty_level: string
          effectiveness_score: number | null
          estimated_duration: number | null
          id: string
          interactive_elements: Json | null
          is_active: boolean | null
          module_name: string
          module_type: string
          quiz_questions: Json | null
          updated_at: string
        }
        Insert: {
          content_data?: Json
          created_at?: string
          difficulty_level?: string
          effectiveness_score?: number | null
          estimated_duration?: number | null
          id?: string
          interactive_elements?: Json | null
          is_active?: boolean | null
          module_name: string
          module_type: string
          quiz_questions?: Json | null
          updated_at?: string
        }
        Update: {
          content_data?: Json
          created_at?: string
          difficulty_level?: string
          effectiveness_score?: number | null
          estimated_duration?: number | null
          id?: string
          interactive_elements?: Json | null
          is_active?: boolean | null
          module_name?: string
          module_type?: string
          quiz_questions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      phishing_education_sessions: {
        Row: {
          campaign_id: string
          clicked_indicators: Json | null
          created_at: string
          education_completed: boolean | null
          education_completed_at: string | null
          education_started_at: string | null
          engagement_metrics: Json | null
          id: string
          interaction_patterns: Json | null
          learning_score: number | null
          missed_red_flags: Json | null
          phishing_template_type: string | null
          session_token: string
          target_email: string
          time_to_click: number | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicked_indicators?: Json | null
          created_at?: string
          education_completed?: boolean | null
          education_completed_at?: string | null
          education_started_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          interaction_patterns?: Json | null
          learning_score?: number | null
          missed_red_flags?: Json | null
          phishing_template_type?: string | null
          session_token: string
          target_email: string
          time_to_click?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicked_indicators?: Json | null
          created_at?: string
          education_completed?: boolean | null
          education_completed_at?: string | null
          education_started_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          interaction_patterns?: Json | null
          learning_score?: number | null
          missed_red_flags?: Json | null
          phishing_template_type?: string | null
          session_token?: string
          target_email?: string
          time_to_click?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      phishing_pages: {
        Row: {
          assets_extracted: number | null
          category: string | null
          created_at: string | null
          css_content: string | null
          extraction_time: number | null
          html_content: string
          id: string
          is_custom: boolean | null
          js_content: string | null
          name: string
          optimized_size: number | null
          original_size: number | null
          performance_metrics: Json | null
          quality_score: number | null
          responsive_breakpoints: Json | null
          source_url: string | null
          total_assets: number | null
          updated_at: string | null
          user_id: string
          visual_similarity: number | null
        }
        Insert: {
          assets_extracted?: number | null
          category?: string | null
          created_at?: string | null
          css_content?: string | null
          extraction_time?: number | null
          html_content: string
          id?: string
          is_custom?: boolean | null
          js_content?: string | null
          name: string
          optimized_size?: number | null
          original_size?: number | null
          performance_metrics?: Json | null
          quality_score?: number | null
          responsive_breakpoints?: Json | null
          source_url?: string | null
          total_assets?: number | null
          updated_at?: string | null
          user_id: string
          visual_similarity?: number | null
        }
        Update: {
          assets_extracted?: number | null
          category?: string | null
          created_at?: string | null
          css_content?: string | null
          extraction_time?: number | null
          html_content?: string
          id?: string
          is_custom?: boolean | null
          js_content?: string | null
          name?: string
          optimized_size?: number | null
          original_size?: number | null
          performance_metrics?: Json | null
          quality_score?: number | null
          responsive_breakpoints?: Json | null
          source_url?: string | null
          total_assets?: number | null
          updated_at?: string | null
          user_id?: string
          visual_similarity?: number | null
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
      security_achievements: {
        Row: {
          achievement_type: string
          badge_icon: string | null
          created_at: string
          criteria: Json
          description: string
          id: string
          is_active: boolean | null
          points: number | null
          title: string
        }
        Insert: {
          achievement_type: string
          badge_icon?: string | null
          created_at?: string
          criteria?: Json
          description: string
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
        }
        Update: {
          achievement_type?: string
          badge_icon?: string | null
          created_at?: string
          criteria?: Json
          description?: string
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
        }
        Relationships: []
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
      template_analytics: {
        Row: {
          campaign_id: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string
          template_id: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string
          template_id: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          education_session_id: string
          id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          education_session_id: string
          id?: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          education_session_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "security_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_education_session_id_fkey"
            columns: ["education_session_id"]
            isOneToOne: false
            referencedRelation: "phishing_education_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          education_session_id: string
          id: string
          interactions: Json | null
          module_id: string
          quiz_responses: Json | null
          score: number | null
          started_at: string | null
          time_spent: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          education_session_id: string
          id?: string
          interactions?: Json | null
          module_id: string
          quiz_responses?: Json | null
          score?: number | null
          started_at?: string | null
          time_spent?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          education_session_id?: string
          id?: string
          interactions?: Json | null
          module_id?: string
          quiz_responses?: Json | null
          score?: number | null
          started_at?: string | null
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_sessions_education_session_id_fkey"
            columns: ["education_session_id"]
            isOneToOne: false
            referencedRelation: "phishing_education_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_file_interaction_stats: {
        Args: { campaign_uuid: string }
        Returns: {
          file_download_rate: number
          file_open_rate: number
          total_file_downloads: number
          total_file_opens: number
          unique_file_downloaders: number
          unique_file_openers: number
        }[]
      }
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
