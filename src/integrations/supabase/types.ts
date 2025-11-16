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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          business_description: string | null
          business_name: string
          business_tone: string | null
          business_type: string
          created_at: string
          id: string
          special_instructions: string | null
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_description?: string | null
          business_name: string
          business_tone?: string | null
          business_type: string
          created_at?: string
          id?: string
          special_instructions?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_description?: string | null
          business_name?: string
          business_tone?: string | null
          business_type?: string
          created_at?: string
          id?: string
          special_instructions?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          conversation_data: Json | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_data?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_data?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          name: string | null
          phone: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          phone: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          phone?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          note_text: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          note_text: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          note_text?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_notes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_announcements: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          message: string
          read_by: string[] | null
          target_roles: Database["public"]["Enums"]["user_role"][]
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          read_by?: string[] | null
          target_roles?: Database["public"]["Enums"]["user_role"][]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          read_by?: string[] | null
          target_roles?: Database["public"]["Enums"]["user_role"][]
          title?: string
        }
        Relationships: []
      }
      jobs_outbox: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          idempotency_key: string | null
          job_type: string
          last_error: string | null
          organization_id: string | null
          payload: Json
          review_id: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          idempotency_key?: string | null
          job_type: string
          last_error?: string | null
          organization_id?: string | null
          payload: Json
          review_id?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          idempotency_key?: string | null
          job_type?: string
          last_error?: string | null
          organization_id?: string | null
          payload?: Json
          review_id?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_outbox_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_outbox_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          created_at: string
          direction: string
          id: string
          media_url: string | null
          message_type: string
          metadata: Json | null
          sender: string
          status: string | null
          text: string | null
          thread_id: string
          timestamp: string | null
          type: string
          wa_message_id: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          direction: string
          id?: string
          media_url?: string | null
          message_type?: string
          metadata?: Json | null
          sender?: string
          status?: string | null
          text?: string | null
          thread_id: string
          timestamp?: string | null
          type: string
          wa_message_id?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          direction?: string
          id?: string
          media_url?: string | null
          message_type?: string
          metadata?: Json | null
          sender?: string
          status?: string | null
          text?: string | null
          thread_id?: string
          timestamp?: string | null
          type?: string
          wa_message_id?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          body: string
          contact_id: string
          created_at: string
          id: string
        }
        Insert: {
          body: string
          contact_id: string
          created_at?: string
          id?: string
        }
        Update: {
          body?: string
          contact_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      phone_calls: {
        Row: {
          call_type: string
          contact_id: string | null
          created_at: string
          customer_name: string | null
          duration: number | null
          ended_at: string | null
          id: string
          manager_notes: string | null
          notes: string | null
          phone_number: string
          scheduled_at: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          call_type?: string
          contact_id?: string | null
          created_at?: string
          customer_name?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          manager_notes?: string | null
          notes?: string | null
          phone_number: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          call_type?: string
          contact_id?: string | null
          created_at?: string
          customer_name?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          manager_notes?: string | null
          notes?: string | null
          phone_number?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          access_token: string | null
          business_about: string | null
          business_address: string | null
          business_category: string | null
          business_description: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          connected_at: string
          created_at: string
          display_name: string | null
          display_order: number | null
          external_business_id: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          organization_id: string | null
          platform: string
          refresh_token: string | null
          scopes: string[] | null
          settings: Json | null
          status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          business_about?: string | null
          business_address?: string | null
          business_category?: string | null
          business_description?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          connected_at?: string
          created_at?: string
          display_name?: string | null
          display_order?: number | null
          external_business_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string | null
          platform: string
          refresh_token?: string | null
          scopes?: string[] | null
          settings?: Json | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          business_about?: string | null
          business_address?: string | null
          business_category?: string | null
          business_description?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          connected_at?: string
          created_at?: string
          display_name?: string | null
          display_order?: number | null
          external_business_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string | null
          platform?: string
          refresh_token?: string | null
          scopes?: string[] | null
          settings?: Json | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_tokens: {
        Row: {
          access_token: string
          business_id: string | null
          created_at: string
          expires_at: string
          id: string
          platform: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          business_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          platform: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          business_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          platform?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_level: string | null
          created_at: string
          full_name: string | null
          id: string
          language_preference: string
          manager_notes: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          whatsapp_access_token: string | null
          whatsapp_business_id: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          admin_level?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          language_preference?: string
          manager_notes?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp_access_token?: string | null
          whatsapp_business_id?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          admin_level?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          language_preference?: string
          manager_notes?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp_access_token?: string | null
          whatsapp_business_id?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          ai_generated_at: string | null
          ai_instructions: string | null
          ai_model: string | null
          ai_response: string | null
          ai_suggested_reply: string | null
          approved_at: string | null
          approved_by: string | null
          approved_reply: string | null
          attention_priority: string | null
          attention_reason: string | null
          author_id: string | null
          author_name: string
          business_id: string | null
          business_name: string | null
          connection_id: string | null
          content: string
          created_at: string
          customer_email: string | null
          external_review_id: string
          id: string
          last_send_at: string | null
          last_send_error: string | null
          last_send_status: string | null
          manual_response: string | null
          organization_id: string | null
          platform: string
          rating: number
          requires_manual_attention: boolean | null
          response_status: string
          review_date: string
          review_url: string | null
          send_attempts: number | null
          sentiment: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated_at?: string | null
          ai_instructions?: string | null
          ai_model?: string | null
          ai_response?: string | null
          ai_suggested_reply?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_reply?: string | null
          attention_priority?: string | null
          attention_reason?: string | null
          author_id?: string | null
          author_name: string
          business_id?: string | null
          business_name?: string | null
          connection_id?: string | null
          content: string
          created_at?: string
          customer_email?: string | null
          external_review_id: string
          id?: string
          last_send_at?: string | null
          last_send_error?: string | null
          last_send_status?: string | null
          manual_response?: string | null
          organization_id?: string | null
          platform: string
          rating: number
          requires_manual_attention?: boolean | null
          response_status?: string
          review_date?: string
          review_url?: string | null
          send_attempts?: number | null
          sentiment: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated_at?: string | null
          ai_instructions?: string | null
          ai_model?: string | null
          ai_response?: string | null
          ai_suggested_reply?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_reply?: string | null
          attention_priority?: string | null
          attention_reason?: string | null
          author_id?: string | null
          author_name?: string
          business_id?: string | null
          business_name?: string | null
          connection_id?: string | null
          content?: string
          created_at?: string
          customer_email?: string | null
          external_review_id?: string
          id?: string
          last_send_at?: string | null
          last_send_error?: string | null
          last_send_status?: string | null
          manual_response?: string | null
          organization_id?: string | null
          platform?: string
          rating?: number
          requires_manual_attention?: boolean | null
          response_status?: string
          review_date?: string
          review_url?: string | null
          send_attempts?: number | null
          sentiment?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_conversation_examples: {
        Row: {
          category: string
          created_at: string
          id: string
          key_points: string[] | null
          techniques_used: string[] | null
          title: string
          transcript: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          key_points?: string[] | null
          techniques_used?: string[] | null
          title: string
          transcript: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key_points?: string[] | null
          techniques_used?: string[] | null
          title?: string
          transcript?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          contact_id: string
          created_at: string
          due_at: string | null
          id: string
          source_message_id: string | null
          status: string
          title: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          due_at?: string | null
          id?: string
          source_message_id?: string | null
          status?: string
          title: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          due_at?: string | null
          id?: string
          source_message_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_source_message_id_fkey"
            columns: ["source_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          priority: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          channel: string
          contact_id: string
          created_at: string
          id: string
          manager_notes: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string
          contact_id: string
          created_at?: string
          id?: string
          manager_notes?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          contact_id?: string
          created_at?: string
          id?: string
          manager_notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          lang: string | null
          message_id: string
          text: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          lang?: string | null
          message_id: string
          text: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          lang?: string | null
          message_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          conversations_today: number | null
          last_updated: string | null
          messages_today: number | null
          total_contacts: number | null
          total_conversations: number | null
          total_messages: number | null
          user_id: string
        }
        Insert: {
          conversations_today?: number | null
          last_updated?: string | null
          messages_today?: number | null
          total_contacts?: number | null
          total_conversations?: number | null
          total_messages?: number | null
          user_id: string
        }
        Update: {
          conversations_today?: number | null
          last_updated?: string | null
          messages_today?: number | null
          total_contacts?: number | null
          total_conversations?: number | null
          total_messages?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_token: { Args: { encrypted_token: string }; Returns: string }
      encrypt_token: { Args: { token_value: string }; Returns: string }
      get_employee_performance: {
        Args: never
        Returns: {
          conversations_this_week: number
          conversations_today: number
          employee_id: string
          employee_name: string
          employee_role: string
          employee_since: string
          messages_today: number
          response_rate: number
          total_contacts: number
          total_conversations: number
          total_messages: number
        }[]
      }
      get_user_connections: {
        Args: never
        Returns: {
          access_token: string
          business_id: string
          business_name: string
          connected_at: string
          created_at: string
          expires_at: string
          id: string
          last_sync: string
          platform: string
          refresh_token: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_tokens: {
        Args: never
        Returns: {
          access_token: string
          business_id: string
          created_at: string
          expires_at: string
          id: string
          platform: string
          refresh_token: string
          updated_at: string
          user_id: string
        }[]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["user_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_user_analytics: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "manager" | "agent"
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
      user_role: ["admin", "manager", "agent"],
    },
  },
} as const
