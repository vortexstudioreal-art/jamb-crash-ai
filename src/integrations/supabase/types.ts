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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          code: string
          created_at: string
          creator_email: string
          discount_amount: number
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          creator_email: string
          discount_amount?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          creator_email?: string
          discount_amount?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          amount_paid: number
          coupon_id: string
          created_at: string
          creator_earning: number
          discount_applied: number
          id: string
          is_paid_out: boolean
          paid_out_at: string | null
          payment_id: string | null
          used_by_email: string
        }
        Insert: {
          amount_paid: number
          coupon_id: string
          created_at?: string
          creator_earning?: number
          discount_applied: number
          id?: string
          is_paid_out?: boolean
          paid_out_at?: string | null
          payment_id?: string | null
          used_by_email: string
        }
        Update: {
          amount_paid?: number
          coupon_id?: string
          created_at?: string
          creator_earning?: number
          discount_applied?: number
          id?: string
          is_paid_out?: boolean
          paid_out_at?: string | null
          payment_id?: string | null
          used_by_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_usage: {
        Row: {
          device_fingerprint: string | null
          email: string | null
          id: string
          used_at: string | null
        }
        Insert: {
          device_fingerprint?: string | null
          email?: string | null
          id?: string
          used_at?: string | null
        }
        Update: {
          device_fingerprint?: string | null
          email?: string | null
          id?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feature_status: {
        Row: {
          feature_name: string
          id: string
          is_working: boolean | null
          last_checked: string | null
          notes: string | null
        }
        Insert: {
          feature_name: string
          id?: string
          is_working?: boolean | null
          last_checked?: string | null
          notes?: string | null
        }
        Update: {
          feature_name?: string
          id?: string
          is_working?: boolean | null
          last_checked?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back: string
          created_at: string | null
          difficulty: string | null
          email: string
          front: string
          id: string
          last_reviewed_at: string | null
          mastery_level: string | null
          next_review_at: string | null
          source_id: string | null
          source_type: string | null
          subject: string
          times_correct: number | null
          times_reviewed: number | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          back: string
          created_at?: string | null
          difficulty?: string | null
          email: string
          front: string
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: string | null
          next_review_at?: string | null
          source_id?: string | null
          source_type?: string | null
          subject: string
          times_correct?: number | null
          times_reviewed?: number | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          back?: string
          created_at?: string | null
          difficulty?: string | null
          email?: string
          front?: string
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: string | null
          next_review_at?: string | null
          source_id?: string | null
          source_type?: string | null
          subject?: string
          times_correct?: number | null
          times_reviewed?: number | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jamb_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: Database["public"]["Enums"]["jamb_subject"]
          year: number | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: Database["public"]["Enums"]["jamb_subject"]
          year?: number | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          subject?: Database["public"]["Enums"]["jamb_subject"]
          year?: number | null
        }
        Relationships: []
      }
      jamb_syllabus: {
        Row: {
          created_at: string | null
          difficulty_level: string | null
          estimated_reading_time: number | null
          id: string
          objectives: string[] | null
          order_index: number | null
          recommended_content: string | null
          subject: string
          subtopic: string | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty_level?: string | null
          estimated_reading_time?: number | null
          id?: string
          objectives?: string[] | null
          order_index?: number | null
          recommended_content?: string | null
          subject: string
          subtopic?: string | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty_level?: string | null
          estimated_reading_time?: number | null
          id?: string
          objectives?: string[] | null
          order_index?: number | null
          recommended_content?: string | null
          subject?: string
          subtopic?: string | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          access_expires_at: string | null
          amount: number
          created_at: string
          currency: string
          email: string
          id: string
          package: string
          paystack_reference: string | null
          paystack_transaction_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          amount: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          package: string
          paystack_reference?: string | null
          paystack_transaction_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          amount?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          package?: string
          paystack_reference?: string | null
          paystack_transaction_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          correct_answers: number
          created_at: string | null
          email: string
          id: string
          questions_data: Json | null
          quiz_type: string
          subjects: Database["public"]["Enums"]["jamb_subject"][]
          time_taken_seconds: number | null
          total_questions: number
        }
        Insert: {
          correct_answers: number
          created_at?: string | null
          email: string
          id?: string
          questions_data?: Json | null
          quiz_type?: string
          subjects: Database["public"]["Enums"]["jamb_subject"][]
          time_taken_seconds?: number | null
          total_questions: number
        }
        Update: {
          correct_answers?: number
          created_at?: string | null
          email?: string
          id?: string
          questions_data?: Json | null
          quiz_type?: string
          subjects?: Database["public"]["Enums"]["jamb_subject"][]
          time_taken_seconds?: number | null
          total_questions?: number
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_read_at: string | null
          mastery_level: string | null
          progress_percent: number | null
          subject: string
          syllabus_id: string | null
          times_reviewed: number | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_read_at?: string | null
          mastery_level?: string | null
          progress_percent?: number | null
          subject: string
          syllabus_id?: string | null
          times_reviewed?: number | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_read_at?: string | null
          mastery_level?: string | null
          progress_percent?: number | null
          subject?: string
          syllabus_id?: string | null
          times_reviewed?: number | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_syllabus_id_fkey"
            columns: ["syllabus_id"]
            isOneToOne: false
            referencedRelation: "jamb_syllabus"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          created_at: string | null
          email: string
          ended_at: string | null
          id: string
          is_completed: boolean | null
          started_at: string | null
          subject: string
          syllabus_id: string | null
          time_spent_seconds: number
          topic: string
        }
        Insert: {
          created_at?: string | null
          email: string
          ended_at?: string | null
          id?: string
          is_completed?: boolean | null
          started_at?: string | null
          subject: string
          syllabus_id?: string | null
          time_spent_seconds?: number
          topic: string
        }
        Update: {
          created_at?: string | null
          email?: string
          ended_at?: string | null
          id?: string
          is_completed?: boolean | null
          started_at?: string | null
          subject?: string
          syllabus_id?: string | null
          time_spent_seconds?: number
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_syllabus_id_fkey"
            columns: ["syllabus_id"]
            isOneToOne: false
            referencedRelation: "jamb_syllabus"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          id: string
          is_used: boolean | null
          referral_code: string
          referred_email: string | null
          referrer_email: string
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_used?: boolean | null
          referral_code: string
          referred_email?: string | null
          referrer_email: string
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_used?: boolean | null
          referral_code?: string
          referred_email?: string | null
          referrer_email?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string | null
          email: string
          id: string
          plan_completed: boolean | null
          predicted_score_max: number | null
          predicted_score_min: number | null
          questions_completed: number | null
          study_days_completed: number | null
          target_score: number | null
          updated_at: string | null
          weak_subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          plan_completed?: boolean | null
          predicted_score_max?: number | null
          predicted_score_min?: number | null
          questions_completed?: number | null
          study_days_completed?: number | null
          target_score?: number | null
          updated_at?: string | null
          weak_subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          plan_completed?: boolean | null
          predicted_score_max?: number | null
          predicted_score_min?: number | null
          questions_completed?: number | null
          study_days_completed?: number | null
          target_score?: number | null
          updated_at?: string | null
          weak_subject?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_study_preferences: {
        Row: {
          created_at: string | null
          email: string
          exam_date: string | null
          hours_per_session: number | null
          id: string
          preferred_subjects: string[] | null
          study_days: string[] | null
          target_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          exam_date?: string | null
          hours_per_session?: number | null
          id?: string
          preferred_subjects?: string[] | null
          study_days?: string[] | null
          target_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          exam_date?: string | null
          hours_per_session?: number | null
          id?: string
          preferred_subjects?: string[] | null
          study_days?: string[] | null
          target_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subjects: {
        Row: {
          created_at: string | null
          email: string
          id: string
          subjects: Database["public"]["Enums"]["jamb_subject"][]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          subjects: Database["public"]["Enums"]["jamb_subject"][]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          subjects?: Database["public"]["Enums"]["jamb_subject"][]
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_reminders: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_access: {
        Args: { user_email: string }
        Returns: {
          admin_role: string
          expires_at: string
          has_access: boolean
          is_admin: boolean
          package: string
        }[]
      }
      generate_referral_code: { Args: { user_email: string }; Returns: string }
      get_auth_email: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_owner: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      validate_coupon: {
        Args: { coupon_code: string }
        Returns: {
          coupon_id: string
          creator: string
          discount: number
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "collaborator"
      jamb_subject:
        | "english"
        | "mathematics"
        | "physics"
        | "chemistry"
        | "biology"
        | "literature"
        | "government"
        | "economics"
        | "crs"
        | "irs"
        | "geography"
        | "accounting"
        | "commerce"
        | "agricultural_science"
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
      app_role: ["owner", "admin", "collaborator"],
      jamb_subject: [
        "english",
        "mathematics",
        "physics",
        "chemistry",
        "biology",
        "literature",
        "government",
        "economics",
        "crs",
        "irs",
        "geography",
        "accounting",
        "commerce",
        "agricultural_science",
      ],
    },
  },
} as const
