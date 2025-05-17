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
      focus_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration: number
          end_time: string | null
          id: string
          interrupted: boolean
          interruption_reason:
            | Database["public"]["Enums"]["interruption_reason"]
            | null
          start_time: string
          type: Database["public"]["Enums"]["session_type"]
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration?: number
          end_time?: string | null
          id?: string
          interrupted?: boolean
          interruption_reason?:
            | Database["public"]["Enums"]["interruption_reason"]
            | null
          start_time?: string
          type: Database["public"]["Enums"]["session_type"]
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration?: number
          end_time?: string | null
          id?: string
          interrupted?: boolean
          interruption_reason?:
            | Database["public"]["Enums"]["interruption_reason"]
            | null
          start_time?: string
          type?: Database["public"]["Enums"]["session_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_start_next_session: boolean
          blocked_websites: string[]
          break_duration: number
          created_at: string
          long_break_duration: number
          long_break_interval: number
          sound_enabled: boolean
          sound_volume: number
          updated_at: string
          user_id: string
          work_duration: number
        }
        Insert: {
          auto_start_next_session?: boolean
          blocked_websites?: string[]
          break_duration?: number
          created_at?: string
          long_break_duration?: number
          long_break_interval?: number
          sound_enabled?: boolean
          sound_volume?: number
          updated_at?: string
          user_id: string
          work_duration?: number
        }
        Update: {
          auto_start_next_session?: boolean
          blocked_websites?: string[]
          break_duration?: number
          created_at?: string
          long_break_duration?: number
          long_break_interval?: number
          sound_enabled?: boolean
          sound_volume?: number
          updated_at?: string
          user_id?: string
          work_duration?: number
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
      interruption_reason: "distraction" | "emergency" | "technical" | "other"
      session_type: "work" | "break" | "longBreak"
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
    Enums: {
      interruption_reason: ["distraction", "emergency", "technical", "other"],
      session_type: ["work", "break", "longBreak"],
    },
  },
} as const
