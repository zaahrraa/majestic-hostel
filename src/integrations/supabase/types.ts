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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          id: string
          student_id: string
          timestamp: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          timestamp?: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_records: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          rate: number | null
          status: string
          student_id: string
          type: string
          units: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          rate?: number | null
          status?: string
          student_id: string
          type: string
          units?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          rate?: number | null
          status?: string
          student_id?: string
          type?: string
          units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cnic: string | null
          created_at: string
          email: string
          full_name: string
          guardian: string | null
          guardian_phone: string | null
          id: string
          move_in_date: string | null
          notes: string | null
          phone: string
          room_type: string
          status: string
          university: string
          updated_at: string
        }
        Insert: {
          cnic?: string | null
          created_at?: string
          email: string
          full_name: string
          guardian?: string | null
          guardian_phone?: string | null
          id?: string
          move_in_date?: string | null
          notes?: string | null
          phone: string
          room_type: string
          status?: string
          university: string
          updated_at?: string
        }
        Update: {
          cnic?: string | null
          created_at?: string
          email?: string
          full_name?: string
          guardian?: string | null
          guardian_phone?: string | null
          id?: string
          move_in_date?: string | null
          notes?: string | null
          phone?: string
          room_type?: string
          status?: string
          university?: string
          updated_at?: string
        }
        Relationships: []
      }
      clearance_requests: {
        Row: {
          approved_at: string | null
          created_at: string
          id: string
          reason: string
          status: string
          student_id: string
          updated_at: string
          warden_notes: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          id?: string
          reason: string
          status?: string
          student_id: string
          updated_at?: string
          warden_notes?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          id?: string
          reason?: string
          status?: string
          student_id?: string
          updated_at?: string
          warden_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clearance_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          alt: string
          category: string
          created_at: string
          id: string
          sort_order: number
          src: string
        }
        Insert: {
          alt: string
          category?: string
          created_at?: string
          id?: string
          sort_order?: number
          src: string
        }
        Update: {
          alt?: string
          category?: string
          created_at?: string
          id?: string
          sort_order?: number
          src?: string
        }
        Relationships: []
      }
      hostel_rules: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          created_at: string
          destination: string
          guardian_name: string
          guardian_phone: string
          id: string
          leaving_at: string
          returning_at: string
          status: string
          student_id: string
          updated_at: string
          warden_notes: string | null
        }
        Insert: {
          created_at?: string
          destination: string
          guardian_name: string
          guardian_phone: string
          id?: string
          leaving_at: string
          returning_at: string
          status?: string
          student_id: string
          updated_at?: string
          warden_notes?: string | null
        }
        Update: {
          created_at?: string
          destination?: string
          guardian_name?: string
          guardian_phone?: string
          id?: string
          leaving_at?: string
          returning_at?: string
          status?: string
          student_id?: string
          updated_at?: string
          warden_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          content: string
          created_at: string
          id: string
          important: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          important?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          important?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_vouchers: {
        Row: {
          billing_record_id: string | null
          created_at: string
          id: string
          notes: string | null
          status: string
          student_id: string
          updated_at: string
          voucher_url: string
        }
        Insert: {
          billing_record_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id: string
          updated_at?: string
          voucher_url: string
        }
        Update: {
          billing_record_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          updated_at?: string
          voucher_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_vouchers_billing_record_id_fkey"
            columns: ["billing_record_id"]
            isOneToOne: false
            referencedRelation: "billing_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string | null
          id: string
          paid_at: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          booking_status: string
          cnic: string | null
          created_at: string
          email: string
          fee_status: string
          full_name: string
          guardian: string | null
          guardian_phone: string | null
          id: string
          inventory_verified: boolean
          join_date: string | null
          phone: string | null
          role: string
          room_number: string | null
          university: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_status?: string
          cnic?: string | null
          created_at?: string
          email: string
          fee_status?: string
          full_name: string
          guardian?: string | null
          guardian_phone?: string | null
          id?: string
          inventory_verified?: boolean
          join_date?: string | null
          phone?: string | null
          role?: string
          room_number?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_status?: string
          cnic?: string | null
          created_at?: string
          email?: string
          fee_status?: string
          full_name?: string
          guardian?: string | null
          guardian_phone?: string | null
          id?: string
          inventory_verified?: boolean
          join_date?: string | null
          phone?: string | null
          role?: string
          room_number?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_listings: {
        Row: {
          availability_status: string
          badge: string | null
          badge_color: string | null
          capacity: number
          created_at: string
          description: string
          features: string[] | null
          id: string
          image_url: string | null
          room_type: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          availability_status?: string
          badge?: string | null
          badge_color?: string | null
          capacity?: number
          created_at?: string
          description: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          room_type: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          availability_status?: string
          badge?: string | null
          badge_color?: string | null
          capacity?: number
          created_at?: string
          description?: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          room_type?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          timing: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role: string
          timing: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          timing?: string
          updated_at?: string
        }
        Relationships: []
      }
      visitor_requests: {
        Row: {
          created_at: string
          id: string
          relation: string
          status: string
          student_id: string
          updated_at: string
          visit_date: string
          visitor_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          relation: string
          status?: string
          student_id: string
          updated_at?: string
          visit_date: string
          visitor_name: string
        }
        Update: {
          created_at?: string
          id?: string
          relation?: string
          status?: string
          student_id?: string
          updated_at?: string
          visit_date?: string
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
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
      get_user_role: { Args: { uid: string }; Returns: string }
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
