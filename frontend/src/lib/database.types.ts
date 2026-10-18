export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: string
          created_at: string
          currency: string
          id: string
          is_archived: boolean
          name: string
          opening_balance: number
          user_id: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          currency?: string
          id: string
          is_archived?: boolean
          name: string
          opening_balance?: number
          user_id: string
        }
        Update: {
          account_type?: string
          created_at?: string
          currency?: string
          id?: string
          is_archived?: boolean
          name?: string
          opening_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string
          budget_id: string | null
          created_at: string
          dedupe_key: string | null
          id: string
          is_read: boolean
          message: string
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          budget_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          id: string
          is_read?: boolean
          message: string
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          budget_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          account_id: string | null
          category_id: string | null
          created_at: string
          due_date: string
          expected_amount: number
          id: string
          name: string
          recurrence: string
          status: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          category_id?: string | null
          created_at?: string
          due_date: string
          expected_amount: number
          id: string
          name: string
          recurrence?: string
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          category_id?: string | null
          created_at?: string
          due_date?: string
          expected_amount?: number
          id?: string
          name?: string
          recurrence?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          alert_threshold_pct: number
          category_id: string | null
          created_at: string
          id: string
          limit_amount: number
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold_pct?: number
          category_id?: string | null
          created_at?: string
          id: string
          limit_amount: number
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold_pct?: number
          category_id?: string | null
          created_at?: string
          id?: string
          limit_amount?: number
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          category_type: string
          color: string
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          user_id: string | null
        }
        Insert: {
          category_type: string
          color?: string
          created_at?: string
          icon?: string | null
          id: string
          is_system?: boolean
          name: string
          user_id?: string | null
        }
        Update: {
          category_type?: string
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      category_predictions: {
        Row: {
          accepted: boolean | null
          confidence: number
          created_at: string
          id: string
          model_version: string
          suggested_category_id: string | null
          transaction_id: string
        }
        Insert: {
          accepted?: boolean | null
          confidence?: number
          created_at?: string
          id: string
          model_version?: string
          suggested_category_id?: string | null
          transaction_id: string
        }
        Update: {
          accepted?: boolean | null
          confidence?: number
          created_at?: string
          id?: string
          model_version?: string
          suggested_category_id?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_predictions_suggested_category_id_fkey"
            columns: ["suggested_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_predictions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          category_id: string | null
          created_at: string
          forecast_type: string
          id: string
          lower_bound: number | null
          method: string
          predicted_amount: number
          target_period: string
          training_window_end: string | null
          training_window_start: string | null
          upper_bound: number | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          forecast_type?: string
          id: string
          lower_bound?: number | null
          method: string
          predicted_amount: number
          target_period: string
          training_window_end?: string | null
          training_window_start?: string | null
          upper_bound?: number | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          forecast_type?: string
          id?: string
          lower_bound?: number | null
          method?: string
          predicted_amount?: number
          target_period?: string
          training_window_end?: string | null
          training_window_start?: string | null
          upper_bound?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecasts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          external_hash: string | null
          id: string
          merchant: string | null
          note: string | null
          source: string
          transaction_date: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string
          external_hash?: string | null
          id: string
          merchant?: string | null
          note?: string | null
          source?: string
          transaction_date: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          external_hash?: string | null
          id?: string
          merchant?: string | null
          note?: string | null
          source?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          default_currency: string
          display_name: string
          email: string
          id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_currency?: string
          display_name: string
          email: string
          id: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_currency?: string
          display_name?: string
          email?: string
          id?: string
          password_hash?: string
          updated_at?: string
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
