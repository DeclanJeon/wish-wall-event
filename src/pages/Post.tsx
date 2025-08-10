import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { getPost, hasLiked, likePost } from "@/lib/supabaseStore";
import CommentSection from "@/components/CommentSection";
import type { EventPost } from "@/lib/eventTypes";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<EventPost | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(true);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      const found = await getPost(id);
      setPost(found);
    };
    loadPost();
  }, [id]);

  const pageTitle = useMemo(() => (post ? `${post.name || "익명"}의 메시지 | 이벤트` : "게시글 | 이벤트"), [post]);

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
          </header>

          <div className="mt-4 leading-7" dangerouslySetInnerHTML={{ __html: post.message }} />
        </article>

        <CommentSection postId={post.id} />
      </main>
    </div>
  );
};

export default PostPage;
