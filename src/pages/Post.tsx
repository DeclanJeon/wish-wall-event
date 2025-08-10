import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Heart, ArrowUpDown, TrendingUp, Clock, History } from "lucide-react";
import { getPost, hasLiked, likePost } from "@/lib/supabaseStore";
import CommentSection from "@/components/CommentSection";
import type { EventPost } from "@/lib/eventTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<EventPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoticeModal, setShowNoticeModal] = useState(true);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [commentSortOrder, setCommentSortOrder] = useState<"latest" | "oldest" | "popular">("latest");

  useEffect(() => {
    // 오늘 하루 다시 보지 않음 체크
    const today = new Date().toDateString();
    const hideUntil = localStorage.getItem("post_notice_hide_until");
    if (hideUntil === today) {
      setShowNoticeModal(false);
    }
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const found = await getPost(id);
      setPost(found);
      setIsLoading(false);
    };
    loadPost();
  }, [id]);

  const pageTitle = useMemo(() => (post ? `${post.name || "익명"}의 메시지 | 이벤트` : "게시글 | 이벤트"), [post]);

  const getSortLabel = () => {
    switch (commentSortOrder) {
      case 'latest':
        return '최신순';
      case 'oldest':
        return '과거순';
      case 'popular':
        return '인기순';
      default:
        return '최신순';
    }
  };

  const getSortIcon = () => {
    switch (commentSortOrder) {
      case 'latest':
        return <Clock className="h-4 w-4" />;
      case 'oldest':
        return <History className="h-4 w-4" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p>게시글을 찾을 수 없어요.</p>
        <Link to="/event" className="underline text-muted-foreground mt-4 inline-block">이벤트로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`메시지: ${post.message.slice(0, 80)}...`} />
        <link rel="canonical" href={`/post/${post.id}`} />
      </Helmet>

      <main className="container mx-auto px-6 py-10 max-w-3xl">
        <Link to="/event" className="text-sm underline text-muted-foreground">← 이벤트로 돌아가기</Link>

        <article className="mt-6 border rounded-lg p-6 bg-card/60">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{post.name || "익명"}</h1>
              <p className="text-sm text-muted-foreground mt-1">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  try {
                    const newCount = await likePost(post.id);
                    setPost({ ...post, likesCount: newCount });
                  } catch (error) {
                    console.error("Like error:", error);
                  }
                }}
                disabled={hasLiked(post.id)}
                variant="secondary"
              >
                <Heart className={hasLiked(post.id) ? "fill-primary text-primary" : ""} /> {post.likesCount || 0}
              </Button>
            </div>
          </header>

          <div className="mt-4 leading-7" dangerouslySetInnerHTML={{ __html: post.message }} />
        </article>

        <CommentSection postId={post.id} sortOrder={commentSortOrder} />
      </main>
    </div>
  );
};

export default PostPage;