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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_key: string
          description: string | null
          icon: string | null
          id: string
          title: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_key: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_key?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          activity_level: string
          age: number
          bmr: number | null
          created_at: string | null
          gender: string
          goal_speed: string | null
          goal_type: string
          height: number
          id: string
          target_calories: number | null
          target_weight: number | null
          tdee: number | null
          user_id: string
          weight: number
        }
        Insert: {
          activity_level: string
          age: number
          bmr?: number | null
          created_at?: string | null
          gender: string
          goal_speed?: string | null
          goal_type: string
          height: number
          id?: string
          target_calories?: number | null
          target_weight?: number | null
          tdee?: number | null
          user_id: string
          weight: number
        }
        Update: {
          activity_level?: string
          age?: number
          bmr?: number | null
          created_at?: string | null
          gender?: string
          goal_speed?: string | null
          goal_type?: string
          height?: number
          id?: string
          target_calories?: number | null
          target_weight?: number | null
          tdee?: number | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      diet_types: {
        Row: {
          color_theme: string
          created_at: string | null
          full_description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          color_theme: string
          created_at?: string | null
          full_description: string
          icon: string
          id: string
          name: string
        }
        Update: {
          color_theme?: string
          created_at?: string | null
          full_description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fasting_sessions: {
        Row: {
          created_at: string | null
          end_time: string | null
          id: string
          protocol_type: string | null
          start_time: string
          target_hours: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          protocol_type?: string | null
          start_time: string
          target_hours: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          protocol_type?: string | null
          start_time?: string
          target_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_emotional: boolean | null
          status: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_emotional?: boolean | null
          status?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_emotional?: boolean | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_assessments: {
        Row: {
          carb_preference: string | null
          cooking_time: string | null
          created_at: string | null
          dietary_restrictions: string | null
          discipline_level: string | null
          eating_habit: string | null
          eating_trigger: string | null
          fasting_history: string | null
          id: string
          main_goal: string | null
          meals_per_day: string | null
          meat_consumption: string | null
          night_hunger: string | null
          structure_preference: string | null
          user_id: string
        }
        Insert: {
          carb_preference?: string | null
          cooking_time?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          discipline_level?: string | null
          eating_habit?: string | null
          eating_trigger?: string | null
          fasting_history?: string | null
          id?: string
          main_goal?: string | null
          meals_per_day?: string | null
          meat_consumption?: string | null
          night_hunger?: string | null
          structure_preference?: string | null
          user_id: string
        }
        Update: {
          carb_preference?: string | null
          cooking_time?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          discipline_level?: string | null
          eating_habit?: string | null
          eating_trigger?: string | null
          fasting_history?: string | null
          id?: string
          main_goal?: string | null
          meals_per_day?: string | null
          meat_consumption?: string | null
          night_hunger?: string | null
          structure_preference?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_diet: string | null
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          created_at: string | null
          daily_calories_target: number | null
          fasting_protocol: string | null
          full_name: string | null
          gender: string | null
          height: number | null
          id: string
          nickname: string | null
          onboarding_completed: boolean | null
          tier: string | null
          token_balance: number | null
          updated_at: string | null
          weight: number | null
          whatsapp_number: string | null
        }
        Insert: {
          active_diet?: string | null
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          daily_calories_target?: number | null
          fasting_protocol?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id: string
          nickname?: string | null
          onboarding_completed?: boolean | null
          tier?: string | null
          token_balance?: number | null
          updated_at?: string | null
          weight?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          active_diet?: string | null
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          daily_calories_target?: number | null
          fasting_protocol?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          nickname?: string | null
          onboarding_completed?: boolean | null
          tier?: string | null
          token_balance?: number | null
          updated_at?: string | null
          weight?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          current_cycle_xp: number | null
          current_level: number | null
          current_streak: number | null
          game_coins: number | null
          id: string
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_cycle_xp?: number | null
          current_level?: number | null
          current_streak?: number | null
          game_coins?: number | null
          id?: string
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_cycle_xp?: number | null
          current_level?: number | null
          current_streak?: number | null
          game_coins?: number | null
          id?: string
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
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
