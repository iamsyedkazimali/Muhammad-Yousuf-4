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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_section: {
        Row: {
          body: string
          heading: string
          highlights: Json | null
          id: number
          image_url: string | null
          portfolio_id: string
          updated_at: string
        }
        Insert: {
          body: string
          heading: string
          highlights?: Json | null
          id?: number
          image_url?: string | null
          portfolio_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          heading?: string
          highlights?: Json | null
          id?: number
          image_url?: string | null
          portfolio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "about_section_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          portfolio_id: string
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id: string
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id?: string
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json
          new_value: Json | null
          old_value: Json | null
          portfolio_id: string | null
          portfolio_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          portfolio_id?: string | null
          portfolio_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          portfolio_id?: string | null
          portfolio_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string | null
          created_at: string
          ends_at: string | null
          id: string
          is_published: boolean | null
          link_url: string | null
          portfolio_id: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_published?: boolean | null
          link_url?: string | null
          portfolio_id: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_published?: boolean | null
          link_url?: string | null
          portfolio_id?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          portfolio_id: string | null
          status: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          portfolio_id?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          portfolio_id?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_info: {
        Row: {
          address: string | null
          email: string | null
          hours: string | null
          id: number
          phone: string | null
          portfolio_id: string
          timezone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          email?: string | null
          hours?: string | null
          id?: number
          phone?: string | null
          portfolio_id: string
          timezone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          email?: string | null
          hours?: string | null
          id?: number
          phone?: string | null
          portfolio_id?: string
          timezone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_info_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          portfolio_id: string
          reply_to: string | null
          sender_email: string | null
          sender_name: string | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_secure: boolean
          smtp_user: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          portfolio_id: string
          reply_to?: string | null
          sender_email?: string | null
          sender_name?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean
          smtp_user?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          portfolio_id?: string
          reply_to?: string | null
          sender_email?: string | null
          sender_name?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean
          smtp_user?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_settings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_requests: {
        Row: {
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          level: string | null
          message: string | null
          phone: string | null
          portfolio_id: string
          request_type: string
          source_page: string | null
          status: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          level?: string | null
          message?: string | null
          phone?: string | null
          portfolio_id: string
          request_type?: string
          source_page?: string | null
          status?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          level?: string | null
          message?: string | null
          phone?: string | null
          portfolio_id?: string
          request_type?: string
          source_page?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_requests_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_countdowns: {
        Row: {
          created_at: string
          description: string | null
          exam_date: string
          exam_name: string
          id: string
          is_published: boolean
          order_index: number | null
          portfolio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exam_date: string
          exam_name: string
          id?: string
          is_published?: boolean
          order_index?: number | null
          portfolio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exam_date?: string
          exam_name?: string
          id?: string
          is_published?: boolean
          order_index?: number | null
          portfolio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_countdowns_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          description: string | null
          end_year: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          organization: string | null
          portfolio_id: string
          role: string
          start_year: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_year?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          organization?: string | null
          portfolio_id: string
          role: string
          start_year?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_year?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          organization?: string | null
          portfolio_id?: string
          role?: string
          start_year?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_published: boolean | null
          order_index: number | null
          portfolio_id: string
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_courses: {
        Row: {
          created_at: string
          duration: string | null
          features: Json | null
          id: string
          image_url: string | null
          is_published: boolean | null
          level: string | null
          order_index: number | null
          portfolio_id: string
          price: string | null
          schedule: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          level?: string | null
          order_index?: number | null
          portfolio_id: string
          price?: string | null
          schedule?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          level?: string | null
          order_index?: number | null
          portfolio_id?: string
          price?: string | null
          schedule?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_courses_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          is_published: boolean | null
          order_index: number | null
          portfolio_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_section: {
        Row: {
          background_url: string | null
          cta_primary_label: string | null
          cta_primary_url: string | null
          cta_secondary_label: string | null
          cta_secondary_url: string | null
          headline: string
          id: number
          portfolio_id: string
          subheadline: string | null
          updated_at: string
        }
        Insert: {
          background_url?: string | null
          cta_primary_label?: string | null
          cta_primary_url?: string | null
          cta_secondary_label?: string | null
          cta_secondary_url?: string | null
          headline: string
          id?: number
          portfolio_id: string
          subheadline?: string | null
          updated_at?: string
        }
        Update: {
          background_url?: string | null
          cta_primary_label?: string | null
          cta_primary_url?: string | null
          cta_secondary_label?: string | null
          cta_secondary_url?: string | null
          headline?: string
          id?: number
          portfolio_id?: string
          subheadline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_section_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          folder: string
          height: number | null
          id: string
          kind: string
          mime_type: string | null
          portfolio_id: string
          public_url: string
          size_bytes: number
          storage_path: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          folder?: string
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          portfolio_id: string
          public_url: string
          size_bytes?: number
          storage_path: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          folder?: string
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          portfolio_id?: string
          public_url?: string
          size_bytes?: number
          storage_path?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          metadata: Json
          portfolio_id: string | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json
          portfolio_id?: string | null
          severity?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json
          portfolio_id?: string | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_notifications_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_notifications: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          delay_seconds: number
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_published: boolean | null
          message: string | null
          order_index: number | null
          portfolio_id: string
          priority: number
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          delay_seconds?: number
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_published?: boolean | null
          message?: string | null
          order_index?: number | null
          portfolio_id: string
          priority?: number
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          delay_seconds?: number
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_published?: boolean | null
          message?: string | null
          order_index?: number | null
          portfolio_id?: string
          priority?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "popup_notifications_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_admins: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          must_reset_password: boolean
          portfolio_id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          must_reset_password?: boolean
          portfolio_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          must_reset_password?: boolean
          portfolio_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_admins_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_backups: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string
          payload: Json
          portfolio_id: string
          row_count: number
          size_bytes: number
          table_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          payload: Json
          portfolio_id: string
          row_count?: number
          size_bytes?: number
          table_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          payload?: Json
          portfolio_id?: string
          row_count?: number
          size_bytes?: number
          table_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_backups_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_domains: {
        Row: {
          connected_at: string | null
          created_at: string
          domain: string
          id: string
          is_primary: boolean
          kind: string
          notes: string | null
          portfolio_id: string
          ssl_status: string
          status: string
          updated_at: string
          verification_status: string
          verification_token: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          domain: string
          id?: string
          is_primary?: boolean
          kind?: string
          notes?: string | null
          portfolio_id: string
          ssl_status?: string
          status?: string
          updated_at?: string
          verification_status?: string
          verification_token?: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          domain?: string
          id?: string
          is_primary?: boolean
          kind?: string
          notes?: string | null
          portfolio_id?: string
          ssl_status?: string
          status?: string
          updated_at?: string
          verification_status?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_domains_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          favicon: string | null
          id: string
          lifecycle: string
          logo: string | null
          name: string
          slug: string
          status: string
          theme_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          favicon?: string | null
          id?: string
          lifecycle?: string
          logo?: string | null
          name: string
          slug: string
          status?: string
          theme_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          favicon?: string | null
          id?: string
          lifecycle?: string
          logo?: string | null
          name?: string
          slug?: string
          status?: string
          theme_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          email: string | null
          full_name: string
          id: number
          location: string | null
          phone: string | null
          portfolio_id: string
          tagline: string | null
          title: string | null
          updated_at: string
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          email?: string | null
          full_name: string
          id?: number
          location?: string | null
          phone?: string | null
          portfolio_id: string
          tagline?: string | null
          title?: string | null
          updated_at?: string
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          email?: string | null
          full_name?: string
          id?: number
          location?: string | null
          phone?: string | null
          portfolio_id?: string
          tagline?: string | null
          title?: string | null
          updated_at?: string
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      qualifications: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          id: string
          institution: string | null
          is_published: boolean | null
          order_index: number | null
          portfolio_id: string
          updated_at: string
          year: string | null
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string | null
          id?: string
          institution?: string | null
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          id?: string
          institution?: string | null
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualifications_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          analytics_id: string | null
          brand_accent: string | null
          brand_primary: string | null
          canonical_url: string | null
          favicon_url: string | null
          footer_text: string | null
          id: number
          logo_url: string | null
          maintenance_mode: boolean | null
          og_image_url: string | null
          portfolio_id: string
          robots_directive: string
          seo_keywords: string | null
          site_description: string | null
          site_title: string
          structured_data: Json | null
          theme_mode: string | null
          twitter_handle: string | null
          updated_at: string
        }
        Insert: {
          analytics_id?: string | null
          brand_accent?: string | null
          brand_primary?: string | null
          canonical_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: number
          logo_url?: string | null
          maintenance_mode?: boolean | null
          og_image_url?: string | null
          portfolio_id: string
          robots_directive?: string
          seo_keywords?: string | null
          site_description?: string | null
          site_title?: string
          structured_data?: Json | null
          theme_mode?: string | null
          twitter_handle?: string | null
          updated_at?: string
        }
        Update: {
          analytics_id?: string | null
          brand_accent?: string | null
          brand_primary?: string | null
          canonical_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: number
          logo_url?: string | null
          maintenance_mode?: boolean | null
          og_image_url?: string | null
          portfolio_id?: string
          robots_directive?: string
          seo_keywords?: string | null
          site_description?: string | null
          site_title?: string
          structured_data?: Json | null
          theme_mode?: string | null
          twitter_handle?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          platform: string
          portfolio_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          platform: string
          portfolio_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          platform?: string
          portfolio_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      student_results: {
        Row: {
          created_at: string
          exam: string | null
          grade: string | null
          id: string
          is_published: boolean | null
          note: string | null
          order_index: number | null
          photo_url: string | null
          portfolio_id: string
          student_name: string
          updated_at: string
          year: string | null
        }
        Insert: {
          created_at?: string
          exam?: string | null
          grade?: string | null
          id?: string
          is_published?: boolean | null
          note?: string | null
          order_index?: number | null
          photo_url?: string | null
          portfolio_id: string
          student_name: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          created_at?: string
          exam?: string | null
          grade?: string | null
          id?: string
          is_published?: boolean | null
          note?: string | null
          order_index?: number | null
          photo_url?: string | null
          portfolio_id?: string
          student_name?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_results_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          level: string | null
          name: string
          order_index: number | null
          portfolio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          level?: string | null
          name: string
          order_index?: number | null
          portfolio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          level?: string | null
          name?: string
          order_index?: number | null
          portfolio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          app_url: string | null
          company_name: string | null
          created_at: string
          default_theme: string
          favicon_url: string | null
          id: number
          language: string
          logo_url: string | null
          maintenance_mode: boolean
          support_email: string | null
          system_name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          app_url?: string | null
          company_name?: string | null
          created_at?: string
          default_theme?: string
          favicon_url?: string | null
          id?: number
          language?: string
          logo_url?: string | null
          maintenance_mode?: boolean
          support_email?: string | null
          system_name?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          app_url?: string | null
          company_name?: string | null
          created_at?: string
          default_theme?: string
          favicon_url?: string | null
          id?: number
          language?: string
          logo_url?: string | null
          maintenance_mode?: boolean
          support_email?: string | null
          system_name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      teaching_services: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_published: boolean
          order_index: number | null
          platform: string | null
          portfolio_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          order_index?: number | null
          platform?: string | null
          portfolio_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          order_index?: number | null
          platform?: string | null
          portfolio_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_services_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          order_index: number | null
          portfolio_id: string
          quote: string
          rating: number | null
          student_name: string
          student_title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id: string
          quote: string
          rating?: number | null
          student_name: string
          student_title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          order_index?: number | null
          portfolio_id?: string
          quote?: string
          rating?: number | null
          student_name?: string
          student_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      assign_portfolio_admin: {
        Args: {
          _email: string
          _full_name?: string
          _must_reset?: boolean
          _portfolio_id: string
          _user_id: string
        }
        Returns: string
      }
      clear_password_reset_flag: { Args: never; Returns: undefined }
      clone_portfolio: {
        Args: {
          _copy_data?: boolean
          _description?: string
          _favicon?: string
          _logo?: string
          _name: string
          _slug: string
          _source_id: string
          _status?: string
          _theme?: string
        }
        Returns: string
      }
      flag_password_reset: { Args: { _admin_id: string }; Returns: undefined }
      has_portfolio_access: {
        Args: { _portfolio_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id?: string }; Returns: boolean }
      record_admin_login: { Args: never; Returns: undefined }
      user_portfolio_id: { Args: { _user_id?: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "editor" | "super_admin"
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
      app_role: ["admin", "editor", "super_admin"],
    },
  },
} as const
