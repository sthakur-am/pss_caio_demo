export interface Database {
  public: {
    Tables: {
      site_configs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          client_name: string;
          client_logo: string;
          company_logo: string;
          company_name: string;
          created_at: string;
          openai_api_key: string | null;
          background_color: string | null;
          title_color: string | null;
          transcript_color: string | null;
          transcript_font_size: string | null;
          word_cloud_background_color: string | null;
          word_cloud_text_color: string | null;
          word_cloud_position: { top?: string; right?: string; bottom?: string; left?: string } | null;
          word_cloud_size: { width: number; height: number } | null;
          shortened_url: string | null;
          nav_bar_color: string | null;
          survey_config: {
            questions: Array<{
              id: string;
              type: 'multiple_choice' | 'short_answer' | 'rating_scale';
              text: string;
              options?: string[];
              required: boolean;
            }>;
            openaiPrompt: string;
            qrCodeSize: number;
            qrCodeColor: string;
            qrCodeLogo?: string;
          } | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          client_name: string;
          client_logo: string;
          company_logo: string;
          company_name: string;
          created_at?: string;
          openai_api_key?: string | null;
          background_color?: string | null;
          title_color?: string | null;
          transcript_color?: string | null;
          transcript_font_size?: string | null;
          word_cloud_background_color?: string | null;
          word_cloud_text_color?: string | null;
          word_cloud_position?: { top?: string; right?: string; bottom?: string; left?: string } | null;
          word_cloud_size?: { width: number; height: number } | null;
          shortened_url?: string | null;
          nav_bar_color?: string | null;
          survey_config?: {
            questions: Array<{
              id: string;
              type: 'multiple_choice' | 'short_answer' | 'rating_scale';
              text: string;
              options?: string[];
              required: boolean;
            }>;
            openaiPrompt: string;
            qrCodeSize: number;
            qrCodeColor: string;
            qrCodeLogo?: string;
          } | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          client_name?: string;
          client_logo?: string;
          company_logo?: string;
          company_name?: string;
          created_at?: string;
          openai_api_key?: string | null;
          background_color?: string | null;
          title_color?: string | null;
          transcript_color?: string | null;
          transcript_font_size?: string | null;
          word_cloud_background_color?: string | null;
          word_cloud_text_color?: string | null;
          word_cloud_position?: { top?: string; right?: string; bottom?: string; left?: string } | null;
          word_cloud_size?: { width: number; height: number } | null;
          shortened_url?: string | null;
          nav_bar_color?: string | null;
          survey_config?: {
            questions: Array<{
              id: string;
              type: 'multiple_choice' | 'short_answer' | 'rating_scale';
              text: string;
              options?: string[];
              required: boolean;
            }>;
            openaiPrompt: string;
            qrCodeSize: number;
            qrCodeColor: string;
            qrCodeLogo?: string;
          } | null;
        };
      };
      survey_responses: {
        Row: {
          id: string;
          question_id: string;
          answer: string;
          session_id: string;
          timestamp: string;
          created_at: string;
          site_name: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          answer: string;
          session_id: string;
          timestamp: string;
          created_at?: string;
          site_name: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          answer?: string;
          session_id?: string;
          timestamp?: string;
          created_at?: string;
          site_name?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}