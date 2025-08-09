import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle } from "lucide-react";
import { addComment, getComments, getPost, hasLiked, likePost } from "@/lib/supabaseStore";
import type { EventPost, EventComment } from "@/lib/eventTypes";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<EventPost | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);

  useEffect(() => {
    const loadPostAndComments = async () => {
      if (!id) return;
      const found = await getPost(id);
      setPost(found);
      if (found) {
        const postComments = await getComments(found.id);
        setComments(postComments);
      }
    };
    loadPostAndComments();
  }, [id]);

  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

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

          <p className="mt-4 leading-7 whitespace-pre-wrap">{post.message}</p>
        </article>

        <section className="mt-10">
          <h2 className="text-lg font-semibold flex items-center gap-2"><MessageCircle className="opacity-70" /> 댓글</h2>

          <form
            className="mt-4 grid gap-3 border rounded-lg p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!message.trim()) return;
              try {
                const c = await addComment(post.id, { author: author || undefined, message: message.trim() });
                setComments((prev) => [...prev, c]);
                setAuthor("");
                setMessage("");
              } catch (error) {
                console.error("Comment error:", error);
              }
            }}
          >
            <div className="grid md:grid-cols-5 gap-3">
              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="author">이름 (선택)</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="익명" />
              </div>
              <div className="md:col-span-3 grid gap-2">
                <Label htmlFor="cmsg">댓글</Label>
                <Textarea id="cmsg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="자유롭게 남겨주세요" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">댓글 남기기</Button>
            </div>
          </form>

          <ul className="mt-6 grid gap-3">
            {comments.length === 0 ? (
              <li className="text-muted-foreground text-center py-10 border rounded-lg">아직 댓글이 없어요. 첫 댓글을 남겨주세요!</li>
            ) : (
              comments.map((c) => (
                <li key={c.id} className="border rounded-lg p-4 bg-card/60">
                  <p className="font-medium">{c.author || "익명"}</p>
                  <p className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</p>
                  <p className="mt-2 whitespace-pre-wrap leading-7">{c.message}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default PostPage;
