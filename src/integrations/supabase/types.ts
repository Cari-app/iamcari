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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          activity_level: string
          age: number
          bmr: number | null
          created_at: string
          gender: string
          goal_speed: string | null
          goal_type: string
          height_cm: number
          id: string
          target_weight_kg: number | null
          tdee: number | null
          updated_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          activity_level: string
          age: number
          bmr?: number | null
          created_at?: string
          gender: string
          goal_speed?: string | null
          goal_type: string
          height_cm: number
          id?: string
          target_weight_kg?: number | null
          tdee?: number | null
          updated_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          activity_level?: string
          age?: number
          bmr?: number | null
          created_at?: string
          gender?: string
          goal_speed?: string | null
          goal_type?: string
          height_cm?: number
          id?: string
          target_weight_kg?: number | null
          tdee?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number
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
          benefits: Json | null
          color_theme: string
          created_at: string
          full_description: string
          icon: string
          id: string
          name: string
          restrictions: Json | null
          short_description: string
        }
        Insert: {
          benefits?: Json | null
          color_theme?: string
          created_at?: string
          full_description: string
          icon?: string
          id?: string
          name: string
          restrictions?: Json | null
          short_description: string
        }
        Update: {
          benefits?: Json | null
          color_theme?: string
          created_at?: string
          full_description?: string
          icon?: string
          id?: string
          name?: string
          restrictions?: Json | null
          short_description?: string
        }
        Relationships: []
      }
      fasting_assessments: {
        Row: {
          answers: Json
          created_at: string
          id: string
          readiness_score: number | null
          suggested_protocol: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          readiness_score?: number | null
          suggested_protocol?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          readiness_score?: number | null
          suggested_protocol?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fasting_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fasting_logs: {
        Row: {
          completed: boolean | null
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          protocol: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          protocol: string
          started_at: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          protocol?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fasting_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          start_time: string
          status: string
          target_hours: number
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          start_time: string
          status?: string
          target_hours?: number
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          status?: string
          target_hours?: number
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
      meal_logs: {
        Row: {
          analysis_result: Json | null
          analysis_status: string | null
          calories: number | null
          carbs: number | null
          created_at: string
          description: string | null
          fat: number | null
          fiber: number | null
          id: string
          image_url: string | null
          logged_at: string
          meal_type: string
          protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          analysis_status?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string
          description?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          image_url?: string | null
          logged_at?: string
          meal_type: string
          protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          analysis_status?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string
          description?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          image_url?: string | null
          logged_at?: string
          meal_type?: string
          protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          id: string
          logged_at: string
          mood: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          id?: string
          logged_at?: string
          mood: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          id?: string
          logged_at?: string
          mood?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_assessments: {
        Row: {
          answers: Json
          created_at: string
          id: string
          suggested_diet: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          suggested_diet?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
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
          onboarding_completed: boolean
          tier: string
          token_balance: number
          updated_at: string
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
          onboarding_completed?: boolean
          tier?: string
          token_balance?: number
          updated_at?: string
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
          onboarding_completed?: boolean
          tier?: string
          token_balance?: number
          updated_at?: string
          weight?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_key: string
          id: string
          tier: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          id?: string
          tier?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          id?: string
          tier?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
