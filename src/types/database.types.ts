export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Database = {
  public: {
    Tables: {
      photos: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          cloudinary_url: string;
          cloudinary_public_id: string;
          width: number;
          height: number;
          camera_make: string | null;
          camera_model: string | null;
          focal_length: string | null;
          aperture: string | null;
          shutter_speed: string | null;
          iso: number | null;
          artist: string | null;
          taken_at: string | null;
          downloads: number;
          shares: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          cloudinary_url: string;
          cloudinary_public_id: string;
          width: number;
          height: number;
          camera_make?: string | null;
          camera_model?: string | null;
          focal_length?: string | null;
          aperture?: string | null;
          shutter_speed?: string | null;
          iso?: number | null;
          artist?: string | null;
          taken_at?: string | null;
          downloads?: number;
          shares?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          cloudinary_url?: string;
          cloudinary_public_id?: string;
          width?: number;
          height?: number;
          camera_make?: string | null;
          camera_model?: string | null;
          focal_length?: string | null;
          aperture?: string | null;
          shutter_speed?: string | null;
          iso?: number | null;
          artist?: string | null;
          taken_at?: string | null;
          downloads?: number;
          shares?: number;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          cover_photo_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Relationships: [];
      };
      rule_collections: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          cover_photo_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Relationships: [];
      };
      calendar_collections: {
        Row: {
          id: number;
          title: string;
          description: string | null;
          cover_photo_id: string | null;
        };
        Insert: {
          id: number;
          title: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Relationships: [];
      };
      photo_collections: {
        Row: {
          photo_id: string;
          collection_id: string;
        };
        Insert: {
          photo_id: string;
          collection_id: string;
        };
        Update: {
          photo_id?: string;
          collection_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photo_collections_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photo_collections_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      photo_rule_collections: {
        Row: {
          photo_id: string;
          rule_id: string;
        };
        Insert: {
          photo_id: string;
          rule_id: string;
        };
        Update: {
          photo_id?: string;
          rule_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photo_rule_collections_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photo_rule_collections_rule_id_fkey";
            columns: ["rule_id"];
            isOneToOne: false;
            referencedRelation: "rule_collections";
            referencedColumns: ["id"];
          },
        ];
      };
      photo_calendar_collections: {
        Row: {
          photo_id: string;
          calendar_id: number;
        };
        Insert: {
          photo_id: string;
          calendar_id: number;
        };
        Update: {
          photo_id?: string;
          calendar_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "photo_calendar_collections_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photo_calendar_collections_calendar_id_fkey";
            columns: ["calendar_id"];
            isOneToOne: false;
            referencedRelation: "calendar_collections";
            referencedColumns: ["id"];
          },
        ];
      };
      series: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          cover_photo_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Relationships: [];
      };
      series_photos: {
        Row: {
          series_id: string;
          photo_id: string;
          position: number;
        };
        Insert: {
          series_id: string;
          photo_id: string;
          position?: number;
        };
        Update: {
          series_id?: string;
          photo_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "series_photos_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "series_photos_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_downloads: {
        Args: { row_id: string };
        Returns: number;
      };
      increment_shares: {
        Args: { row_id: string };
        Returns: number;
      };
      replace_series_photos: {
        Args: {
          p_series_id: string;
          p_photo_ids: string[];
          p_positions: number[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
