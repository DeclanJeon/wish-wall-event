export type SortMode = "latest" | "popular";

export interface EventPost {
  id: string;
  name?: string;
  contact: string; // email or phone
  message: string;
  createdAt: number; // epoch ms
  likesCount: number;
  cardStyle?: string;
  cardColor?: string;
}

export interface EventComment {
  id: string;
  postId: string;
  author?: string;
  message: string;
  createdAt: number;
  parentId?: string;
}
