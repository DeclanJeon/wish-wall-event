import { EventPost, EventComment } from "./eventTypes";

const POSTS_KEY = "event_posts";
const COMMENTS_KEY_PREFIX = "event_comments_"; // + postId
const LIKED_POSTS_KEY = "event_liked_posts"; // per device ids array
const DEVICE_ID_KEY = "event_device_id";

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getPosts(): EventPost[] {
  return readJSON<EventPost[]>(POSTS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

export function addPost(data: Omit<EventPost, "id" | "createdAt" | "likesCount">): EventPost {
  const post: EventPost = {
    id: (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    createdAt: Date.now(),
    likesCount: 0,
    ...data,
  };
  const posts = [post, ...getPosts()];
  writeJSON(POSTS_KEY, posts);
  return post;
}

export function getComments(postId: string): EventComment[] {
  return readJSON<EventComment[]>(COMMENTS_KEY_PREFIX + postId, []).sort((a, b) => a.createdAt - b.createdAt);
}

export function addComment(postId: string, data: Omit<EventComment, "id" | "createdAt" | "postId">): EventComment {
  const comment: EventComment = {
    id: (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    postId,
    createdAt: Date.now(),
    ...data,
  };
  const list = [...getComments(postId), comment];
  writeJSON(COMMENTS_KEY_PREFIX + postId, list);
  return comment;
}

export function hasLiked(postId: string): boolean {
  const liked = readJSON<string[]>(LIKED_POSTS_KEY, []);
  return liked.includes(postId);
}

export function likePost(postId: string): number {
  if (hasLiked(postId)) {
    return getPosts().find(p => p.id === postId)?.likesCount ?? 0;
  }
  const liked = readJSON<string[]>(LIKED_POSTS_KEY, []);
  liked.push(postId);
  writeJSON(LIKED_POSTS_KEY, liked);

  const posts = getPosts();
  const updated = posts.map(p => p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p);
  writeJSON(POSTS_KEY, updated);
  return updated.find(p => p.id === postId)?.likesCount ?? 0;
}
