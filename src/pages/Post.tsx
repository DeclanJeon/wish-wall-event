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
  const [isLoading, setIsLoading] = useState(true);
  const [showNoticeModal, setShowNoticeModal] = useState(true);
  const [dontShowToday, setDontShowToday] = useState(false);

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

      {/* 공지사항 모달 */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNoticeModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-lg p-6 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-bold mb-4">댓글 작성 안내</h2>
              <div className="text-left space-y-3 mb-6 text-sm text-muted-foreground">
                <p>• 따뜻한 마음을 담은 댓글을 남겨주세요</p>
                <p>• 부적절한 내용은 삭제될 수 있습니다</p>
                <p>• 댓글에도 좋아요를 누를 수 있어요</p>
                <p>• 대댓글은 최대 3단계까지 가능합니다</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dontShowToday"
                    checked={dontShowToday}
                    onChange={(e) => setDontShowToday(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="dontShowToday" className="text-sm">
                    오늘 하루 다시 보지 않음
                  </label>
                </div>
                <Button 
                  onClick={() => {
                    if (dontShowToday) {
                      const today = new Date().toDateString();
                      localStorage.setItem("post_notice_hide_until", today);
                    }
                    setShowNoticeModal(false);
                  }}
                  className="w-full"
                >
                  확인했습니다
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;
