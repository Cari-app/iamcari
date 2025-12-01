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
          code: string
          description: string | null
          icon: string | null
          id: number
          name: string
          xp_reward: number | null
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          id?: number
          name: string
          xp_reward?: number | null
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          activity_level: string | null
          age: number | null
          bmr: number | null
          created_at: string
          daily_calories_target: number | null
          gender: string | null
          goal_speed: string | null
          goal_type: string | null
          height_cm: number | null
          id: string
          protein_target_g: number | null
          target_weight_kg: number | null
          tdee: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          bmr?: number | null
          created_at?: string
          daily_calories_target?: number | null
          gender?: string | null
          goal_speed?: string | null
          goal_type?: string | null
          height_cm?: number | null
          id?: string
          protein_target_g?: number | null
          target_weight_kg?: number | null
          tdee?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          bmr?: number | null
          created_at?: string
          daily_calories_target?: number | null
          gender?: string | null
          goal_speed?: string | null
          goal_type?: string | null
          height_cm?: number | null
          id?: string
          protein_target_g?: number | null
          target_weight_kg?: number | null
          tdee?: number | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_types: {
        Row: {
          color_theme: string | null
          full_description: string | null
          icon: string | null
          id: string
          ideal_for: string | null
          name: string
          short_description: string | null
        }
        Insert: {
          color_theme?: string | null
          full_description?: string | null
          icon?: string | null
          id: string
          ideal_for?: string | null
          name: string
          short_description?: string | null
        }
        Update: {
          color_theme?: string | null
          full_description?: string | null
          icon?: string | null
          id?: string
          ideal_for?: string | null
          name?: string
          short_description?: string | null
        }
        Relationships: []
      }
      fasting_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          potential_xp: number | null
          protocol_type: string | null
          start_time: string
          status: string | null
          target_hours: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          potential_xp?: number | null
          protocol_type?: string | null
          start_time: string
          status?: string | null
          target_hours?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          potential_xp?: number | null
          protocol_type?: string | null
          start_time?: string
          status?: string | null
          target_hours?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fasting_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          caption: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          likes_count: number | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          likes_count?: number | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          likes_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          ai_analysis: Json | null
          calories: number | null
          created_at: string
          description: string | null
          entry_type: string | null
          food_name: string | null
          hunger_level: number | null
          id: string
          image_url: string | null
          is_emotional: boolean | null
          macros: Json | null
          metric_value: number | null
          mood_tag: string | null
          status: Database["public"]["Enums"]["meal_status"]
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          calories?: number | null
          created_at?: string
          description?: string | null
          entry_type?: string | null
          food_name?: string | null
          hunger_level?: number | null
          id?: string
          image_url?: string | null
          is_emotional?: boolean | null
          macros?: Json | null
          metric_value?: number | null
          mood_tag?: string | null
          status?: Database["public"]["Enums"]["meal_status"]
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          calories?: number | null
          created_at?: string
          description?: string | null
          entry_type?: string | null
          food_name?: string | null
          hunger_level?: number | null
          id?: string
          image_url?: string | null
          is_emotional?: boolean | null
          macros?: Json | null
          metric_value?: number | null
          mood_tag?: string | null
          status?: Database["public"]["Enums"]["meal_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_assessments: {
        Row: {
          carb_preference: string | null
          cooking_time: string | null
          created_at: string
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
          scores: Json | null
          structure_preference: string | null
          suggested_diet: string | null
          user_id: string
        }
        Insert: {
          carb_preference?: string | null
          cooking_time?: string | null
          created_at?: string
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
          scores?: Json | null
          structure_preference?: string | null
          suggested_diet?: string | null
          user_id: string
        }
        Update: {
          carb_preference?: string | null
          cooking_time?: string | null
          created_at?: string
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
          scores?: Json | null
          structure_preference?: string | null
          suggested_diet?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_diet: string | null
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          created_at: string
          daily_calories_target: number | null
          email: string | null
          fasting_protocol: string | null
          full_name: string | null
          gender: string | null
          height: number | null
          id: string
          nickname: string | null
          onboarding_completed: boolean | null
          tier: string | null
          token_balance: number | null
          weight: number | null
          whatsapp_number: string | null
        }
        Insert: {
          active_diet?: string | null
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          daily_calories_target?: number | null
          email?: string | null
          fasting_protocol?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id: string
          nickname?: string | null
          onboarding_completed?: boolean | null
          tier?: string | null
          token_balance?: number | null
          weight?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          active_diet?: string | null
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          daily_calories_target?: number | null
          email?: string | null
          fasting_protocol?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          nickname?: string | null
          onboarding_completed?: boolean | null
          tier?: string | null
          token_balance?: number | null
          weight?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_code: string | null
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_code?: string | null
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_code?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_code_fkey"
            columns: ["achievement_code"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          current_cycle_xp: number | null
          current_level: number | null
          current_streak: number | null
          game_coins: number | null
          longest_streak: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_cycle_xp?: number | null
          current_level?: number | null
          current_streak?: number | null
          game_coins?: number | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_cycle_xp?: number | null
          current_level?: number | null
          current_streak?: number | null
          game_coins?: number | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      renew_subscription_balance: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      meal_status: "manual" | "pending" | "analyzed" | "error"
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
      meal_status: ["manual", "pending", "analyzed", "error"],
    },
  },
} as const
