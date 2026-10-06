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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string
          created_at: string
          id: string
          readiness_status: string
          service_id: string | null
          starts_at: string
          status: string
          studio_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          readiness_status?: string
          service_id?: string | null
          starts_at: string
          status?: string
          studio_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          readiness_status?: string
          service_id?: string | null
          starts_at?: string
          status?: string
          studio_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_same_studio_fk"
            columns: ["client_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_same_studio_fk"
            columns: ["service_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "appointments_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: number
          metadata: Json
          studio_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: never
          metadata?: Json
          studio_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: never
          metadata?: Json
          studio_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_pack_modules: {
        Row: {
          beauty_pack_id: string
          config: Json
          created_at: string
          id: string
          module_type: string
          sort_order: number
          studio_id: string
        }
        Insert: {
          beauty_pack_id: string
          config?: Json
          created_at?: string
          id?: string
          module_type: string
          sort_order?: number
          studio_id: string
        }
        Update: {
          beauty_pack_id?: string
          config?: Json
          created_at?: string
          id?: string
          module_type?: string
          sort_order?: number
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beauty_pack_modules_beauty_pack_id_fkey"
            columns: ["beauty_pack_id"]
            isOneToOne: false
            referencedRelation: "beauty_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beauty_pack_modules_pack_same_studio_fk"
            columns: ["beauty_pack_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "beauty_packs"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "beauty_pack_modules_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_packs: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          service_category: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          service_category: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          service_category?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beauty_packs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      client_experience_responses: {
        Row: {
          client_experience_id: string
          created_at: string
          id: string
          module_type: string
          payload: Json
          studio_id: string
          updated_at: string
        }
        Insert: {
          client_experience_id: string
          created_at?: string
          id?: string
          module_type: string
          payload?: Json
          studio_id: string
          updated_at?: string
        }
        Update: {
          client_experience_id?: string
          created_at?: string
          id?: string
          module_type?: string
          payload?: Json
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_experience_responses_client_experience_id_fkey"
            columns: ["client_experience_id"]
            isOneToOne: false
            referencedRelation: "client_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_experience_responses_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_experience_same_studio_fk"
            columns: ["client_experience_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "client_experiences"
            referencedColumns: ["id", "studio_id"]
          },
        ]
      }
      client_experiences: {
        Row: {
          appointment_id: string | null
          beauty_pack_id: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          current_step: number
          experience_modules: Json
          id: string
          link_created_at: string | null
          sent_at: string | null
          status: string
          studio_id: string
          token_expires_at: string | null
          token_hash: string | null
          token_revoked_at: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          beauty_pack_id?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          experience_modules?: Json
          id?: string
          link_created_at?: string | null
          sent_at?: string | null
          status?: string
          studio_id: string
          token_expires_at?: string | null
          token_hash?: string | null
          token_revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          beauty_pack_id?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          experience_modules?: Json
          id?: string
          link_created_at?: string | null
          sent_at?: string | null
          status?: string
          studio_id?: string
          token_expires_at?: string | null
          token_hash?: string | null
          token_revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_experiences_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_experiences_appointment_same_studio_fk"
            columns: ["appointment_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "client_experiences_beauty_pack_id_fkey"
            columns: ["beauty_pack_id"]
            isOneToOne: false
            referencedRelation: "beauty_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_experiences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_experiences_client_same_studio_fk"
            columns: ["client_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "client_experiences_pack_same_studio_fk"
            columns: ["beauty_pack_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "beauty_packs"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "client_experiences_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          studio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          studio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      file_assets: {
        Row: {
          bucket: string
          client_experience_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: string | null
          mime_type: string | null
          object_path: string
          size_bytes: number | null
          studio_id: string
          visit_memory_id: string | null
        }
        Insert: {
          bucket: string
          client_experience_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string | null
          mime_type?: string | null
          object_path: string
          size_bytes?: number | null
          studio_id: string
          visit_memory_id?: string | null
        }
        Update: {
          bucket?: string
          client_experience_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string | null
          mime_type?: string | null
          object_path?: string
          size_bytes?: number | null
          studio_id?: string
          visit_memory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_assets_client_experience_id_fkey"
            columns: ["client_experience_id"]
            isOneToOne: false
            referencedRelation: "client_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_assets_client_same_studio_fk"
            columns: ["client_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "file_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_assets_experience_same_studio_fk"
            columns: ["client_experience_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "client_experiences"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "file_assets_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_assets_visit_memory_id_fkey"
            columns: ["visit_memory_id"]
            isOneToOne: false
            referencedRelation: "visit_memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_assets_visit_same_studio_fk"
            columns: ["visit_memory_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "visit_memories"
            referencedColumns: ["id", "studio_id"]
          },
        ]
      }
      legal_acceptances: {
        Row: {
          accepted_at: string
          document_type: string
          document_version: string
          id: string
          studio_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          document_type: string
          document_version: string
          id?: string
          studio_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          document_type?: string
          document_version?: string
          id?: string
          studio_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_acceptances_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_acceptances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          request_type: string
          status: string
          studio_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          request_type: string
          status?: string
          studio_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          request_type?: string
          status?: string
          studio_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_requests_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          name: string
          sort_order: number
          studio_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name: string
          sort_order?: number
          studio_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name?: string
          sort_order?: number
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_members: {
        Row: {
          created_at: string
          role: string
          studio_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          studio_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          studio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_members_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_settings: {
        Row: {
          availability: Json
          created_at: string
          experience_modules: Json
          primary_colour: string
          studio_id: string
          theme_config: Json
          theme_name: string | null
          updated_at: string
        }
        Insert: {
          availability?: Json
          created_at?: string
          experience_modules?: Json
          primary_colour?: string
          studio_id: string
          theme_config?: Json
          theme_name?: string | null
          updated_at?: string
        }
        Update: {
          availability?: Json
          created_at?: string
          experience_modules?: Json
          primary_colour?: string
          studio_id?: string
          theme_config?: Json
          theme_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_settings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: true
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studios_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          price_id: string | null
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          price_id?: string | null
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          price_id?: string | null
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: true
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_memories: {
        Row: {
          appointment_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          preferences: Json
          studio_id: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          preferences?: Json
          studio_id: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          preferences?: Json
          studio_id?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_memories_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_memories_appointment_same_studio_fk"
            columns: ["appointment_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "visit_memories_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_memories_client_same_studio_fk"
            columns: ["client_id", "studio_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "studio_id"]
          },
          {
            foreignKeyName: "visit_memories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_memories_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_studio: {
        Args: {
          p_custom_primary: string
          p_experience_modules: Json
          p_name: string
          p_primary_colour: string
          p_services: Json
          p_theme: string
          p_timezone: string
        }
        Returns: {
          already_exists: boolean
          studio_id: string
        }[]
      }
      is_studio_member: { Args: { target_studio_id: string }; Returns: boolean }
      is_studio_owner: { Args: { target_studio_id: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
