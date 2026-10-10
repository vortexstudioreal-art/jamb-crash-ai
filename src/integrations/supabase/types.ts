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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ad_analytics: {
        Row: {
          ad_source: string
          created_at: string
          duration_watched: number | null
          email: string
          event_type: string
          feature_type: string
          id: string
          metadata: Json | null
          platform: string | null
        }
        Insert: {
          ad_source?: string
          created_at?: string
          duration_watched?: number | null
          email: string
          event_type: string
          feature_type: string
          id?: string
          metadata?: Json | null
          platform?: string | null
        }
        Update: {
          ad_source?: string
          created_at?: string
          duration_watched?: number | null
          email?: string
          event_type?: string
          feature_type?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
        }
        Relationships: []
      }
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
      airtime_rewards: {
        Row: {
          amount: number
          claimed_at: string | null
          created_at: string
          email: string
          id: string
          network: string | null
          notes: string | null
          phone: string | null
          referral_id: string | null
          sent_at: string | null
          source: string
          status: string
        }
        Insert: {
          amount?: number
          claimed_at?: string | null
          created_at?: string
          email: string
          id?: string
          network?: string | null
          notes?: string | null
          phone?: string | null
          referral_id?: string | null
          sent_at?: string | null
          source?: string
          status?: string
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          network?: string | null
          notes?: string | null
          phone?: string | null
          referral_id?: string | null
          sent_at?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      b2b_activation_pins: {
        Row: {
          access_expires_at: string | null
          buyer_id: string
          created_at: string
          expires_at: string | null
          id: string
          order_id: string
          pin_code: string
          plan_type: string
          redeemed_at: string | null
          redeemed_by_email: string | null
          status: Database["public"]["Enums"]["pin_status"]
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          buyer_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id: string
          pin_code: string
          plan_type: string
          redeemed_at?: string | null
          redeemed_by_email?: string | null
          status?: Database["public"]["Enums"]["pin_status"]
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          buyer_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string
          pin_code?: string
          plan_type?: string
          redeemed_at?: string | null
          redeemed_by_email?: string | null
          status?: Database["public"]["Enums"]["pin_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_activation_pins_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "b2b_buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_activation_pins_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "b2b_bulk_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_bulk_orders: {
        Row: {
          buyer_id: string
          created_at: string
          discount_percent: number
          id: string
          notes: string | null
          paystack_reference: string | null
          plan_type: string
          quantity: number
          status: Database["public"]["Enums"]["bulk_order_status"]
          total_amount: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          discount_percent?: number
          id?: string
          notes?: string | null
          paystack_reference?: string | null
          plan_type: string
          quantity: number
          status?: Database["public"]["Enums"]["bulk_order_status"]
          total_amount: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          discount_percent?: number
          id?: string
          notes?: string | null
          paystack_reference?: string | null
          plan_type?: string
          quantity?: number
          status?: Database["public"]["Enums"]["bulk_order_status"]
          total_amount?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_bulk_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "b2b_buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_buyers: {
        Row: {
          auth_user_id: string
          buyer_type: Database["public"]["Enums"]["b2b_buyer_type"]
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          organization: string | null
          phone: string | null
          total_purchased: number
          total_redeemed: number
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          buyer_type?: Database["public"]["Enums"]["b2b_buyer_type"]
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          organization?: string | null
          phone?: string | null
          total_purchased?: number
          total_redeemed?: number
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          buyer_type?: Database["public"]["Enums"]["b2b_buyer_type"]
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          organization?: string | null
          phone?: string | null
          total_purchased?: number
          total_redeemed?: number
          updated_at?: string
        }
        Relationships: []
      }
      b2b_pin_bulk_prices: {
        Row: {
          created_at: string
          discount_percent: number
          id: string
          is_active: boolean
          min_quantity: number
          plan_type: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          min_quantity: number
          plan_type: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          min_quantity?: number
          plan_type?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      b2b_pin_redemption_log: {
        Row: {
          access_expires_at: string | null
          attempted_by_email: string
          created_at: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          pin_code: string
          user_agent: string | null
          was_successful: boolean
        }
        Insert: {
          access_expires_at?: string | null
          attempted_by_email: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          pin_code: string
          user_agent?: string | null
          was_successful: boolean
        }
        Update: {
          access_expires_at?: string | null
          attempted_by_email?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          pin_code?: string
          user_agent?: string | null
          was_successful?: boolean
        }
        Relationships: []
      }
      board_replies: {
        Row: {
          alias: string
          body: string
          created_at: string
          email: string
          id: string
          image_url: string | null
          is_deleted: boolean
          thread_id: string
        }
        Insert: {
          alias: string
          body: string
          created_at?: string
          email: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          thread_id: string
        }
        Update: {
          alias?: string
          body?: string
          created_at?: string
          email?: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "board_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      board_threads: {
        Row: {
          alias: string
          body: string
          created_at: string
          email: string
          id: string
          image_url: string | null
          is_deleted: boolean
          reply_count: number
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          alias: string
          body: string
          created_at?: string
          email: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          reply_count?: number
          subject?: string
          title: string
          updated_at?: string
        }
        Update: {
          alias?: string
          body?: string
          created_at?: string
          email?: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          reply_count?: number
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collaborator_bank_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          code: string
          coupon_type: string | null
          created_at: string
          creator_email: string
          discount_amount: number
          discount_percentage: number | null
          expiry_date: string | null
          id: string
          is_active: boolean
          times_used: number | null
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          code: string
          coupon_type?: string | null
          created_at?: string
          creator_email: string
          discount_amount?: number
          discount_percentage?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          times_used?: number | null
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          code?: string
          coupon_type?: string | null
          created_at?: string
          creator_email?: string
          discount_amount?: number
          discount_percentage?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          times_used?: number | null
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          amount_paid: number
          commission_payable: boolean | null
          commission_percentage: number | null
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
          commission_payable?: boolean | null
          commission_percentage?: number | null
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
          commission_payable?: boolean | null
          commission_percentage?: number | null
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
      feature_usage: {
        Row: {
          bonus_uses: number | null
          created_at: string | null
          email: string
          feature_type: string
          id: string
          updated_at: string | null
          usage_count: number
          usage_date: string
        }
        Insert: {
          bonus_uses?: number | null
          created_at?: string | null
          email: string
          feature_type: string
          id?: string
          updated_at?: string | null
          usage_count?: number
          usage_date?: string
        }
        Update: {
          bonus_uses?: number | null
          created_at?: string | null
          email?: string
          feature_type?: string
          id?: string
          updated_at?: string | null
          usage_count?: number
          usage_date?: string
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
      funnel_events: {
        Row: {
          created_at: string
          email: string
          event: string
          id: string
          meta: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          event: string
          id?: string
          meta?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          event?: string
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      jamb_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          diagram_svg: string | null
          explanation: string | null
          id: string
          image_url: string | null
          is_ai_generated: boolean
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: Database["public"]["Enums"]["jamb_subject"]
          topics: string[] | null
          year: number | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          diagram_svg?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: Database["public"]["Enums"]["jamb_subject"]
          topics?: string[] | null
          year?: number | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          diagram_svg?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          subject?: Database["public"]["Enums"]["jamb_subject"]
          topics?: string[] | null
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
          image_url: string | null
          objectives: string[] | null
          order_index: number | null
          recommended_content: string | null
          reference_materials: Json | null
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
          image_url?: string | null
          objectives?: string[] | null
          order_index?: number | null
          recommended_content?: string | null
          reference_materials?: Json | null
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
          image_url?: string | null
          objectives?: string[] | null
          order_index?: number | null
          recommended_content?: string | null
          reference_materials?: Json | null
          subject?: string
          subtopic?: string | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leaderboard_scores: {
        Row: {
          average_accuracy: number | null
          best_quiz_score: number | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_placeholder: boolean | null
          questions_answered: number
          rank: number | null
          total_score: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_accuracy?: number | null
          best_quiz_score?: number | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_placeholder?: boolean | null
          questions_answered?: number
          rank?: number | null
          total_score?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_accuracy?: number | null
          best_quiz_score?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_placeholder?: boolean | null
          questions_answered?: number
          rank?: number | null
          total_score?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email: string
          id: string
          last_accessed_at: string | null
          lesson_id: string | null
          mastery_level: string | null
          mastery_score: number | null
          practice_attempts: Json | null
          practice_score: number | null
          predictions: Json | null
          sections_viewed: Json | null
          time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          mastery_level?: string | null
          mastery_score?: number | null
          practice_attempts?: Json | null
          practice_score?: number | null
          predictions?: Json | null
          sections_viewed?: Json | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          mastery_level?: string | null
          mastery_score?: number | null
          practice_attempts?: Json | null
          practice_score?: number | null
          predictions?: Json | null
          sections_viewed?: Json | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_sections: Json
          created_at: string | null
          difficulty_level: string | null
          estimated_minutes: number | null
          id: string
          learning_objectives: Json | null
          mastery_criteria: Json | null
          practice_questions: Json | null
          status: string | null
          subject: string
          subtopic: string
          title: string
          topic: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content_sections?: Json
          created_at?: string | null
          difficulty_level?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_objectives?: Json | null
          mastery_criteria?: Json | null
          practice_questions?: Json | null
          status?: string | null
          subject: string
          subtopic: string
          title: string
          topic: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content_sections?: Json
          created_at?: string | null
          difficulty_level?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_objectives?: Json | null
          mastery_criteria?: Json | null
          practice_questions?: Json | null
          status?: string | null
          subject?: string
          subtopic?: string
          title?: string
          topic?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      mock_attempts: {
        Row: {
          created_at: string
          email: string
          english_score: number
          english_total: number
          id: string
          max_score: number
          mock_name: string
          questions_data: Json
          section_scores: Json
          time_taken_seconds: number
          total_score: number
        }
        Insert: {
          created_at?: string
          email: string
          english_score?: number
          english_total?: number
          id?: string
          max_score?: number
          mock_name?: string
          questions_data?: Json
          section_scores?: Json
          time_taken_seconds?: number
          total_score?: number
        }
        Update: {
          created_at?: string
          email?: string
          english_score?: number
          english_total?: number
          id?: string
          max_score?: number
          mock_name?: string
          questions_data?: Json
          section_scores?: Json
          time_taken_seconds?: number
          total_score?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by_email: string | null
          expires_at: string | null
          id: string
          is_global: boolean | null
          link: string | null
          message: string
          target_email: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_email?: string | null
          expires_at?: string | null
          id?: string
          is_global?: boolean | null
          link?: string | null
          message: string
          target_email?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_email?: string | null
          expires_at?: string | null
          id?: string
          is_global?: boolean | null
          link?: string | null
          message?: string
          target_email?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      novel_chapters: {
        Row: {
          chapter_number: number
          content: string
          created_at: string | null
          estimated_reading_time: number | null
          id: string
          likely_questions: Json | null
          novel_id: string
          title: string
          word_count: number | null
        }
        Insert: {
          chapter_number: number
          content: string
          created_at?: string | null
          estimated_reading_time?: number | null
          id?: string
          likely_questions?: Json | null
          novel_id: string
          title: string
          word_count?: number | null
        }
        Update: {
          chapter_number?: number
          content?: string
          created_at?: string | null
          estimated_reading_time?: number | null
          id?: string
          likely_questions?: Json | null
          novel_id?: string
          title?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "novel_chapters_novel_id_fkey"
            columns: ["novel_id"]
            isOneToOne: false
            referencedRelation: "novels"
            referencedColumns: ["id"]
          },
        ]
      }
      novels: {
        Row: {
          author: string
          category: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          download_url: string | null
          full_book_pdf_path: string | null
          full_book_pdf_url: string | null
          id: string
          is_premium: boolean | null
          subject: string | null
          title: string
          total_chapters: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          author: string
          category?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          download_url?: string | null
          full_book_pdf_path?: string | null
          full_book_pdf_url?: string | null
          id?: string
          is_premium?: boolean | null
          subject?: string | null
          title: string
          total_chapters?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          author?: string
          category?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          download_url?: string | null
          full_book_pdf_path?: string | null
          full_book_pdf_url?: string | null
          id?: string
          is_premium?: boolean | null
          subject?: string | null
          title?: string
          total_chapters?: number | null
          updated_at?: string | null
          year?: number | null
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
      payout_requests: {
        Row: {
          account_name: string | null
          account_number: string | null
          amount: number
          bank_name: string | null
          collaborator_email: string
          created_at: string | null
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          amount: number
          bank_name?: string | null
          collaborator_email: string
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          collaborator_email?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
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
          referral_credits: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          referral_credits?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          referral_credits?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          platform: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          platform?: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_reports: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
          question_id: string
          reason: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          question_id: string
          reason: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          question_id?: string
          reason?: string
          status?: string
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
      scholarship_interest: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      study_plan_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          date: string
          day: number
          day_name: string
          duration: string | null
          id: string
          plan_id: string
          priority: string
          quiz_goal: number
          subject: string
          topics: Json
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          date: string
          day: number
          day_name: string
          duration?: string | null
          id?: string
          plan_id: string
          priority?: string
          quiz_goal?: number
          subject: string
          topics?: Json
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          date?: string
          day?: number
          day_name?: string
          duration?: string | null
          id?: string
          plan_id?: string
          priority?: string
          quiz_goal?: number
          subject?: string
          topics?: Json
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          created_at: string
          email: string
          hours_per_day: number
          id: string
          plan_data: Json
          status: string
          target_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hours_per_day?: number
          id?: string
          plan_data?: Json
          status?: string
          target_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hours_per_day?: number
          id?: string
          plan_data?: Json
          status?: string
          target_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      subject_books: {
        Row: {
          author: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          pdf_path: string | null
          pdf_url: string | null
          subject: string
          title: string
          updated_at: string
          uploaded_by: string | null
          year: number | null
        }
        Insert: {
          author?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          pdf_path?: string | null
          pdf_url?: string | null
          subject: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
          year?: number | null
        }
        Update: {
          author?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          pdf_path?: string | null
          pdf_url?: string | null
          subject?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          year?: number | null
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          chapter_id: string
          created_at: string | null
          email: string
          id: string
          note: string | null
          novel_id: string
          scroll_position: number | null
        }
        Insert: {
          chapter_id: string
          created_at?: string | null
          email: string
          id?: string
          note?: string | null
          novel_id: string
          scroll_position?: number | null
        }
        Update: {
          chapter_id?: string
          created_at?: string | null
          email?: string
          id?: string
          note?: string | null
          novel_id?: string
          scroll_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "novel_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_novel_id_fkey"
            columns: ["novel_id"]
            isOneToOne: false
            referencedRelation: "novels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          content: string
          created_at: string
          email: string
          id: string
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          email: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          email?: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          email: string
          id: string
          notification_id: string
          read_at: string | null
        }
        Insert: {
          email: string
          id?: string
          notification_id: string
          read_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          notification_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_novel_progress: {
        Row: {
          created_at: string | null
          current_chapter_id: string | null
          email: string
          id: string
          is_completed: boolean | null
          last_read_at: string | null
          novel_id: string
          progress_percent: number | null
          total_time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_chapter_id?: string | null
          email: string
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          novel_id: string
          progress_percent?: number | null
          total_time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_chapter_id?: string | null
          email?: string
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          novel_id?: string
          progress_percent?: number | null
          total_time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_novel_progress_current_chapter_id_fkey"
            columns: ["current_chapter_id"]
            isOneToOne: false
            referencedRelation: "novel_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_novel_progress_novel_id_fkey"
            columns: ["novel_id"]
            isOneToOne: false
            referencedRelation: "novels"
            referencedColumns: ["id"]
          },
        ]
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
          display_title: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_title?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_title?: string | null
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
          selected_course_id: string | null
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
          selected_course_id?: string | null
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
          selected_course_id?: string | null
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
      user_trials: {
        Row: {
          created_at: string
          email: string
          id: string
          subscription_plan: string | null
          trial_expires_at: string
          trial_started_at: string
          trial_used: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscription_plan?: string | null
          trial_expires_at?: string
          trial_started_at?: string
          trial_used?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscription_plan?: string | null
          trial_expires_at?: string
          trial_started_at?: string
          trial_used?: boolean
          updated_at?: string
          user_id?: string | null
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
      topic_frequency: {
        Row: {
          first_year: number | null
          last_year: number | null
          question_count: number | null
          subject: Database["public"]["Enums"]["jamb_subject"] | null
          topic: string | null
          years_appeared: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_bulk_discount: {
        Args: { p_plan_type: string; p_quantity: number }
        Returns: {
          discount_percent: number
          total_amount: number
          unit_price: number
        }[]
      }
      check_referral_code: {
        Args: { p_code: string }
        Returns: {
          referrer_email: string
          valid: boolean
        }[]
      }
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
      confirm_user_email: { Args: { user_email: string }; Returns: boolean }
      generate_activation_pins: {
        Args: { p_order_id: string }
        Returns: {
          id: string
          pin_code: string
          plan_type: string
        }[]
      }
      generate_referral_code: { Args: { user_email: string }; Returns: string }
      get_admin_b2b_overview: {
        Args: never
        Returns: {
          pins_by_plan: Json
          recent_orders: Json
          total_buyers: number
          total_pins_generated: number
          total_pins_redeemed: number
          total_revenue: number
        }[]
      }
      get_auth_email: { Args: never; Returns: string }
      get_reseller_dashboard_stats: {
        Args: { p_buyer_email: string }
        Returns: {
          active_orders: number
          recent_redemptions: Json
          total_pins_available: number
          total_pins_purchased: number
          total_pins_redeemed: number
          total_spent: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_buyer_purchased: {
        Args: { p_buyer_id: string; p_quantity: number }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: undefined
      }
      increment_feature_usage: {
        Args: { p_amount?: number; p_feature: string; p_is_bonus?: boolean }
        Returns: {
          bonus_uses: number
          usage_count: number
        }[]
      }
      is_admin_or_owner: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      recalculate_leaderboard_ranks: { Args: never; Returns: undefined }
      redeem_activation_pin: {
        Args: {
          p_ip_address?: string
          p_pin_code: string
          p_user_agent?: string
          p_user_email: string
        }
        Returns: {
          access_expires_at: string
          message: string
          plan_type: string
          success: boolean
        }[]
      }
      redeem_referral_code: {
        Args: { p_code: string; p_email: string }
        Returns: boolean
      }
      strip_import_html: { Args: { s: string }; Returns: string }
      validate_coupon: {
        Args: { coupon_code: string }
        Returns: {
          commission_pct: number
          coupon_id: string
          coupon_type_val: string
          creator: string
          discount: number
          discount_pct: number
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "collaborator"
      b2b_buyer_type: "school" | "teacher" | "reseller"
      bulk_order_status:
        | "pending_payment"
        | "paid"
        | "generating"
        | "ready"
        | "partially_redeemed"
        | "completed"
        | "cancelled"
        | "refunded"
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
      pin_status: "available" | "redeemed" | "expired" | "revoked"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["owner", "admin", "collaborator"],
      b2b_buyer_type: ["school", "teacher", "reseller"],
      bulk_order_status: [
        "pending_payment",
        "paid",
        "generating",
        "ready",
        "partially_redeemed",
        "completed",
        "cancelled",
        "refunded",
      ],
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
      pin_status: ["available", "redeemed", "expired", "revoked"],
    },
  },
} as const
