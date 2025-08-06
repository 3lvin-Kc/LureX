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
      adaptive_learning_data: {
        Row: {
          created_at: string
          engagement_patterns: Json | null
          id: string
          knowledge_gaps: Json | null
          last_assessment_date: string | null
          learning_style: string | null
          learning_velocity: number | null
          next_recommended_training: string | null
          recommended_path: Json | null
          risk_profile: string | null
          strength_areas: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement_patterns?: Json | null
          id?: string
          knowledge_gaps?: Json | null
          last_assessment_date?: string | null
          learning_style?: string | null
          learning_velocity?: number | null
          next_recommended_training?: string | null
          recommended_path?: Json | null
          risk_profile?: string | null
          strength_areas?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          engagement_patterns?: Json | null
          id?: string
          knowledge_gaps?: Json | null
          last_assessment_date?: string | null
          learning_style?: string | null
          learning_velocity?: number | null
          next_recommended_training?: string | null
          recommended_path?: Json | null
          risk_profile?: string | null
          strength_areas?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      just_in_time_interventions: {
        Row: {
          completed_at: string | null
          created_at: string
          delivered_at: string | null
          expires_at: string | null
          id: string
          intervention_data: Json | null
          intervention_type: string
          priority_level: string
          status: string
          trigger_campaign_id: string | null
          trigger_event: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          expires_at?: string | null
          id?: string
          intervention_data?: Json | null
          intervention_type: string
          priority_level?: string
          status?: string
          trigger_campaign_id?: string | null
          trigger_event: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          expires_at?: string | null
          id?: string
          intervention_data?: Json | null
          intervention_type?: string
          priority_level?: string
          status?: string
          trigger_campaign_id?: string | null
          trigger_event?: string
          updated_at?: string
          user_id?: string
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
      social_media_campaigns: {
        Row: {
          campaign_id: string | null
          campaign_type: string
          created_at: string
          engagement_settings: Json
          id: string
          platform_id: string | null
          schedule_time: string | null
          status: string
          target_profiles: Json
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          campaign_type: string
          created_at?: string
          engagement_settings?: Json
          id?: string
          platform_id?: string | null
          schedule_time?: string | null
          status?: string
          target_profiles?: Json
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          campaign_type?: string
          created_at?: string
          engagement_settings?: Json
          id?: string
          platform_id?: string | null
          schedule_time?: string | null
          status?: string
          target_profiles?: Json
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_campaigns_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_media_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_metrics: {
        Row: {
          action_timestamp: string
          action_type: string
          additional_data: Json | null
          campaign_id: string | null
          id: string
          ip_address: string | null
          platform_name: string
          target_profile_id: string
          user_agent: string | null
        }
        Insert: {
          action_timestamp?: string
          action_type: string
          additional_data?: Json | null
          campaign_id?: string | null
          id?: string
          ip_address?: string | null
          platform_name: string
          target_profile_id: string
          user_agent?: string | null
        }
        Update: {
          action_timestamp?: string
          action_type?: string
          additional_data?: Json | null
          campaign_id?: string | null
          id?: string
          ip_address?: string | null
          platform_name?: string
          target_profile_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "social_media_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_platforms: {
        Row: {
          access_token_expires_at: string | null
          created_at: string
          id: string
          is_active: boolean
          oauth_token: string | null
          oauth_token_secret: string | null
          platform_name: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_expires_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          oauth_token?: string | null
          oauth_token_secret?: string | null
          platform_name: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_expires_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          oauth_token?: string | null
          oauth_token_secret?: string | null
          platform_name?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_media_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          industry_type: string | null
          is_public: boolean | null
          media_attachments: Json | null
          personalization_variables: Json | null
          platform_name: string
          sophistication_level: string | null
          success_rate: number | null
          template_name: string
          template_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          industry_type?: string | null
          is_public?: boolean | null
          media_attachments?: Json | null
          personalization_variables?: Json | null
          platform_name: string
          sophistication_level?: string | null
          success_rate?: number | null
          template_name: string
          template_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          industry_type?: string | null
          is_public?: boolean | null
          media_attachments?: Json | null
          personalization_variables?: Json | null
          platform_name?: string
          sophistication_level?: string | null
          success_rate?: number | null
          template_name?: string
          template_type?: string
          updated_at?: string
          user_id?: string
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
      training_assessments: {
        Row: {
          assessment_type: string
          created_at: string
          feedback: Json | null
          id: string
          max_score: number
          module_id: string | null
          pass_threshold: number
          passed: boolean | null
          questions: Json
          score: number | null
          time_taken: number | null
          updated_at: string
          user_id: string
          user_responses: Json | null
        }
        Insert: {
          assessment_type: string
          created_at?: string
          feedback?: Json | null
          id?: string
          max_score: number
          module_id?: string | null
          pass_threshold?: number
          passed?: boolean | null
          questions?: Json
          score?: number | null
          time_taken?: number | null
          updated_at?: string
          user_id: string
          user_responses?: Json | null
        }
        Update: {
          assessment_type?: string
          created_at?: string
          feedback?: Json | null
          id?: string
          max_score?: number
          module_id?: string | null
          pass_threshold?: number
          passed?: boolean | null
          questions?: Json
          score?: number | null
          time_taken?: number | null
          updated_at?: string
          user_id?: string
          user_responses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "training_assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string
          content_data: Json | null
          content_url: string | null
          created_at: string
          difficulty_level: string
          effectiveness_score: number | null
          estimated_duration: number
          id: string
          industry_type: string | null
          is_mandatory: boolean | null
          is_public: boolean | null
          learning_objectives: Json | null
          module_name: string
          module_type: string
          prerequisites: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          content_data?: Json | null
          content_url?: string | null
          created_at?: string
          difficulty_level?: string
          effectiveness_score?: number | null
          estimated_duration: number
          id?: string
          industry_type?: string | null
          is_mandatory?: boolean | null
          is_public?: boolean | null
          learning_objectives?: Json | null
          module_name: string
          module_type: string
          prerequisites?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          content_data?: Json | null
          content_url?: string | null
          created_at?: string
          difficulty_level?: string
          effectiveness_score?: number | null
          estimated_duration?: number
          id?: string
          industry_type?: string | null
          is_mandatory?: boolean | null
          is_public?: boolean | null
          learning_objectives?: Json | null
          module_name?: string
          module_type?: string
          prerequisites?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_training_progress: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string
          id: string
          last_accessed_at: string | null
          module_id: string | null
          progress_percentage: number | null
          score: number | null
          started_at: string | null
          status: string
          strength_areas: Json | null
          time_spent: number | null
          updated_at: string
          user_id: string
          weakness_areas: Json | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          module_id?: string | null
          progress_percentage?: number | null
          score?: number | null
          started_at?: string | null
          status?: string
          strength_areas?: Json | null
          time_spent?: number | null
          updated_at?: string
          user_id: string
          weakness_areas?: Json | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          module_id?: string | null
          progress_percentage?: number | null
          score?: number | null
          started_at?: string | null
          status?: string
          strength_areas?: Json | null
          time_spent?: number | null
          updated_at?: string
          user_id?: string
          weakness_areas?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
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
