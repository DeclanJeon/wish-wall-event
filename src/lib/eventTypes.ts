export type SortMode = "latest" | "popular";

export interface EventPost {
  id: string;
  name?: string;
  contact: string; // email or phone
  message: string;
  createdAt: number; // epoch ms
  likesCount: number;
}

export interface EventComment {
  id: string;
  postId: string;
  author?: string;
  message: string;
  createdAt: number;
}
