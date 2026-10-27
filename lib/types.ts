import type { ReviewSource } from "@/lib/constants";

export type Review = {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  liked: string | null;
  to_change: string | null;
  tags: string[];
  photo_paths: string[];
  source: ReviewSource;
  is_read: boolean;
};

export type ReviewPhoto = { path: string; url: string };

export type ReviewWithPhotos = Review & { photos: ReviewPhoto[] };

export type ReviewStats = {
  total: number;
  this_month: number;
  unread: number;
  with_changes: number;
  change_tags: { tag: string; count: number }[];
};
