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
      brands: {
        Row: {
          accent_color: string | null
          created_at: string | null
          description: string | null
          font_body: string | null
          font_display: string | null
          id: string
          instagram_handle: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          tone_of_voice: string | null
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          description?: string | null
          font_body?: string | null
          font_display?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          tone_of_voice?: string | null
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          description?: string | null
          font_body?: string | null
          font_display?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          tone_of_voice?: string | null
          website?: string | null
        }
        Relationships: []
      }
      carousels: {
        Row: {
          created_at: string | null
          id: string
          scheduled_date: string | null
          slides: Json
          status: string | null
          style: string
          topic: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          scheduled_date?: string | null
          slides?: Json
          status?: string | null
          style: string
          topic: string
        }
        Update: {
          created_at?: string | null
          id?: string
          scheduled_date?: string | null
          slides?: Json
          status?: string | null
          style?: string
          topic?: string
        }
        Relationships: []
      }
      instagram_accounts: {
        Row: {
          access_token: string
          brand_id: string | null
          connected_at: string | null
          id: string
          ig_user_id: string
          page_id: string
          profile_picture_url: string | null
          username: string
        }
        Insert: {
          access_token: string
          brand_id?: string | null
          connected_at?: string | null
          id?: string
          ig_user_id: string
          page_id: string
          profile_picture_url?: string | null
          username: string
        }
        Update: {
          access_token?: string
          brand_id?: string | null
          connected_at?: string | null
          id?: string
          ig_user_id?: string
          page_id?: string
          profile_picture_url?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_accounts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      video_clips: {
        Row: {
          created_at: string | null
          crop_position: string
          end_time: number
          format: string
          id: string
          output_url: string | null
          quality: string
          start_time: number
          status: string
          text_overlay: Json | null
          thumbnail_url: string | null
          video_title: string | null
          youtube_url: string
        }
        Insert: {
          created_at?: string | null
          crop_position?: string
          end_time?: number
          format?: string
          id?: string
          output_url?: string | null
          quality?: string
          start_time?: number
          status?: string
          text_overlay?: Json | null
          thumbnail_url?: string | null
          video_title?: string | null
          youtube_url: string
        }
        Update: {
          created_at?: string | null
          crop_position?: string
          end_time?: number
          format?: string
          id?: string
          output_url?: string | null
          quality?: string
          start_time?: number
          status?: string
          text_overlay?: Json | null
          thumbnail_url?: string | null
          video_title?: string | null
          youtube_url?: string
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
