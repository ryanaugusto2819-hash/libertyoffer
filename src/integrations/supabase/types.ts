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
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_versions: {
        Row: {
          created_at: string
          created_by: string
          file_id: string
          id: string
          item_id: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string
          file_id: string
          id?: string
          item_id: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string
          file_id?: string
          id?: string
          item_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "creative_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_versions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "demand_items"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_items: {
        Row: {
          assigned_to: string | null
          copy: string
          created_at: string
          demand_id: string
          due_date: string | null
          format: string
          hook: string
          id: string
          instructions: string
          item_number: number
          language: string
          name: string
          reference_url: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          copy?: string
          created_at?: string
          demand_id: string
          due_date?: string | null
          format?: string
          hook?: string
          id?: string
          instructions?: string
          item_number: number
          language?: string
          name: string
          reference_url?: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          copy?: string
          created_at?: string
          demand_id?: string
          due_date?: string | null
          format?: string
          hook?: string
          id?: string
          instructions?: string
          item_number?: number
          language?: string
          name?: string
          reference_url?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_items_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "demands"
            referencedColumns: ["id"]
          },
        ]
      }
      demands: {
        Row: {
          archived: boolean
          briefing: string
          created_at: string
          created_by: string
          due_date: string | null
          id: string
          kind: string
          offer_id: string
          priority: string
          title: string
        }
        Insert: {
          archived?: boolean
          briefing?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          id?: string
          kind: string
          offer_id: string
          priority?: string
          title: string
        }
        Update: {
          archived?: boolean
          briefing?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          id?: string
          kind?: string
          offer_id?: string
          priority?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "demands_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demands_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          demand_id: string | null
          id: string
          item_id: string | null
          mime_type: string
          name: string
          offer_id: string | null
          path: string
          purpose: string
          size_bytes: number
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          demand_id?: string | null
          id?: string
          item_id?: string | null
          mime_type: string
          name: string
          offer_id?: string | null
          path: string
          purpose: string
          size_bytes: number
          uploaded_by?: string
        }
        Update: {
          created_at?: string
          demand_id?: string | null
          id?: string
          item_id?: string | null
          mime_type?: string
          name?: string
          offer_id?: string | null
          path?: string
          purpose?: string
          size_bytes?: number
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "demand_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      item_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          item_id: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          id?: string
          item_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "demand_items"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          archived: boolean
          checkout_url: string
          country: string
          created_at: string
          created_by: string
          currency: string
          description: string
          id: string
          language: string
          name: string
          niche: string
          notes: string
          payment_model: string
          product_name: string
          product_type: string
          responsible_id: string | null
          sale_price: number
          sales_url: string
          start_date: string | null
          status: string
          whatsapp_url: string
        }
        Insert: {
          archived?: boolean
          checkout_url?: string
          country?: string
          created_at?: string
          created_by?: string
          currency?: string
          description?: string
          id?: string
          language?: string
          name: string
          niche?: string
          notes?: string
          payment_model?: string
          product_name?: string
          product_type?: string
          responsible_id?: string | null
          sale_price?: number
          sales_url?: string
          start_date?: string | null
          status?: string
          whatsapp_url?: string
        }
        Update: {
          archived?: boolean
          checkout_url?: string
          country?: string
          created_at?: string
          created_by?: string
          currency?: string
          description?: string
          id?: string
          language?: string
          name?: string
          niche?: string
          notes?: string
          payment_model?: string
          product_name?: string
          product_type?: string
          responsible_id?: string | null
          sale_price?: number
          sales_url?: string
          start_date?: string | null
          status?: string
          whatsapp_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          invited_by: string
          roles: Database["public"]["Enums"]["app_role"][]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          display_name?: string
          email: string
          id?: string
          invited_by: string
          roles: Database["public"]["Enums"]["app_role"][]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          invited_by?: string
          roles?: Database["public"]["Enums"]["app_role"][]
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          role: Database["public"]["Enums"]["app_role"]
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
      accept_team_invitation: { Args: never; Returns: undefined }
      append_creative_version: {
        Args: { target_file: string; target_item: string }
        Returns: string
      }
      can_access_file: {
        Args: { _demand: string; _item: string; _offer: string }
        Returns: boolean
      }
      can_read_demand: { Args: { _id: string }; Returns: boolean }
      create_demand: { Args: { payload: Json }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_member: { Args: never; Returns: boolean }
      set_member_roles: {
        Args: {
          new_roles: Database["public"]["Enums"]["app_role"][]
          target: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "spy" | "traffic"
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
    Enums: {
      app_role: ["admin", "editor", "spy", "traffic"],
    },
  },
} as const
