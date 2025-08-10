import { supabase } from "@/integrations/supabase/client";
import type { EventPost, EventComment } from "./eventTypes";

// Device ID for tracking likes without authentication
function getDeviceId(): string {
  let id = localStorage.getItem("event_device_id");
  if (!id) {
    id = (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    localStorage.setItem("event_device_id", id);
  }
  return id;
}

// Posts functions
export async function getPosts(): Promise<EventPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data.map(post => ({
    id: post.id,
    name: post.name,
    affiliation: post.affiliation,
    contact: post.email || post.phone || "",
    password: post.password,
    message: post.message,
    createdAt: new Date(post.created_at).getTime(),
    likesCount: post.likes,
    cardStyle: post.card_style,
    cardColor: post.card_color
  }));
}

export async function addPost(data: Omit<EventPost, "id" | "createdAt" | "likesCount">): Promise<EventPost> {
  const isEmail = data.contact && data.contact.includes("@");
  
  const { data: newPost, error } = await supabase
    .from("posts")
    .insert({
      name: data.name || "익명",
      affiliation: data.affiliation,
      email: isEmail ? data.contact : null,
      phone: isEmail ? null : data.contact,
      password: data.password,
      message: data.message,
      card_style: data.cardStyle || 'letter',
      card_color: data.cardColor || 'white'
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding post:", error);
    throw new Error("메시지 추가에 실패했습니다.");
  }

  return {
    id: newPost.id,
    name: newPost.name,
    affiliation: newPost.affiliation,
    contact: newPost.email || newPost.phone || "",
    password: newPost.password,
    message: newPost.message,
    createdAt: new Date(newPost.created_at).getTime(),
    likesCount: newPost.likes,
    cardStyle: newPost.card_style,
    cardColor: newPost.card_color
  };
}

export async function getPost(id: string): Promise<EventPost | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    affiliation: data.affiliation,
    contact: data.email || data.phone || "",
    password: data.password,
    message: data.message,
    createdAt: new Date(data.created_at).getTime(),
    likesCount: data.likes,
    cardStyle: data.card_style,
    cardColor: data.card_color
  };
}

// Comments functions
export async function getComments(postId: string): Promise<EventComment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data.map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    author: comment.author,
    message: comment.message,
    createdAt: new Date(comment.created_at).getTime(),
    parentId: comment.parent_id,
    likesCount: comment.likes || 0
  }));
}

export async function addComment(postId: string, data: Omit<EventComment, "id" | "createdAt" | "postId">): Promise<EventComment> {
  const { data: newComment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author: data.author || "익명",
      message: data.message,
      parent_id: data.parentId || null
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    throw new Error("댓글 추가에 실패했습니다.");
  }

  return {
    id: newComment.id,
    postId: newComment.post_id,
    author: newComment.author,
    message: newComment.message,
    createdAt: new Date(newComment.created_at).getTime(),
    parentId: newComment.parent_id,
    likesCount: newComment.likes || 0
  };
}

// Like functions (using localStorage for device-based tracking)
export function hasLiked(postId: string): boolean {
  const liked = JSON.parse(localStorage.getItem("event_liked_posts") || "[]") as string[];
  return liked.includes(postId);
}

export async function likePost(postId: string): Promise<number> {
  if (hasLiked(postId)) {
    const post = await getPost(postId);
    return post?.likesCount ?? 0;
  }

  // Add to local liked posts
  const liked = JSON.parse(localStorage.getItem("event_liked_posts") || "[]") as string[];
  liked.push(postId);
  localStorage.setItem("event_liked_posts", JSON.stringify(liked));

  // Update likes count in database
  const { data, error } = await supabase.rpc('increment_likes', { post_id: postId });

  if (error) {
    console.error("Error liking post:", error);
    // Remove from local storage if database update failed
    const updated = liked.filter(id => id !== postId);
    localStorage.setItem("event_liked_posts", JSON.stringify(updated));
    throw new Error("좋아요 추가에 실패했습니다.");
  }

  return data;
}

// Comment like functions
export function hasLikedComment(commentId: string): boolean {
  const liked = JSON.parse(localStorage.getItem("event_liked_comments") || "[]") as string[];
  return liked.includes(commentId);
}

export async function likeComment(commentId: string): Promise<number> {
  if (hasLikedComment(commentId)) {
    const comments = await getComments(''); // This would need the postId in real implementation
    const comment = comments.find(c => c.id === commentId);
    return comment?.likesCount ?? 0;
  }

  // Add to local liked comments
  const liked = JSON.parse(localStorage.getItem("event_liked_comments") || "[]") as string[];
  liked.push(commentId);
  localStorage.setItem("event_liked_comments", JSON.stringify(liked));

  // Update likes count in database
  const { data, error } = await supabase.rpc('increment_comment_likes', { comment_id: commentId });

  if (error) {
    console.error("Error liking comment:", error);
    // Remove from local storage if database update failed
    const updated = liked.filter(id => id !== commentId);
    localStorage.setItem("event_liked_comments", JSON.stringify(updated));
    throw new Error("댓글 좋아요 추가에 실패했습니다.");
  }

  return data;
}