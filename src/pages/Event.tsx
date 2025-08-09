import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addPost, getPosts, hasLiked, likePost } from "@/lib/supabaseStore";
import type { EventPost } from "@/lib/eventTypes";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";


const GiftURL = "https://smartstore.naver.com/cleopatrasalt";

const schema = z
  .object({
    name: z.string().max(40).optional(),
    email: z.string().email({ message: "이메일 형식이 올바르지 않아요" }).optional(),
    phone: z
      .string()
      .min(9, { message: "전화번호가 너무 짧아요" })
      .max(20, { message: "전화번호가 너무 길어요" })
      .optional(),
    message: z.string().min(1, { message: "메시지를 입력해주세요" }).max(500),
  })
  .refine((d) => d.email || d.phone, {
    message: "이메일 또는 전화번호 중 하나는 꼭 입력해주세요",
    path: ["email"],
  });

type FormValues = z.infer<typeof schema>;

const SortTabs = ({ mode, onChange }: { mode: "latest" | "popular"; onChange: (m: "latest" | "popular") => void }) => (
  <div className="flex items-center gap-2 mt-6">
    <Button variant={mode === "latest" ? "secondary" : "outline"} onClick={() => onChange("latest")}>최신순</Button>
    <Button variant={mode === "popular" ? "secondary" : "outline"} onClick={() => onChange("popular")}>인기순</Button>
  </div>
);

const Event = () => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      const posts = await getPosts();
      setPosts(posts);
    };
    loadPosts();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...posts];
    if (sort === "popular") arr.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    else arr.sort((a, b) => b.createdAt - a.createdAt);
    return arr;
  }, [posts, sort]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const contact = data.email ?? data.phone ?? "";
      const newPost = await addPost({ name: data.name, contact, message: data.message });
      setPosts((prev) => [newPost, ...prev]);
      toast({ title: "메시지가 업로드되었어요!", description: "따뜻한 마음을 전해주셔서 감사합니다." });
      setOpen(false);
      reset();
    } catch (error) {
      toast({ 
        title: "오류가 발생했습니다", 
        description: "메시지 업로드에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>이벤트 | 마음을 전하는 위시월</title>
        <meta name="description" content="이벤트에 참여하고 메시지를 남겨 마음을 전해보세요. 인기순/최신순으로 메시지를 둘러볼 수 있어요." />
        <link rel="canonical" href="/event" />
      </Helmet>

      {/* 헤더 - 이벤트 설명과 주요 버튼들 */}
      <header className="border-b bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">마음을 전하는 이벤트</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            소중한 사람에게 응원의 메시지를 남겨주세요. 여러분의 한마디가 큰 힘이 됩니다.
          </p>
          
          {/* 주요 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg" className="shadow-glow">내 메시지 전하기</Button>
              </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>메시지 남기기</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                      <Label htmlFor="name">이름 (별칭 가능)</Label>
                      <Input id="name" placeholder="예) 작은천사" {...register("name")} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">전화번호</Label>
                        <Input id="phone" type="tel" placeholder="010-0000-0000" {...register("phone")} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">이메일 혹은 전화번호 중 하나는 필수입니다. (이벤트 당첨시 연락을 위해 사용돼요)</p>

                    <div className="grid gap-2">
                      <Label htmlFor="message">메시지</Label>
                      <Textarea id="message" rows={5} placeholder="응원의 한마디를 남겨주세요" {...register("message")} />
                      {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="submit">세상에 전하기</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

            <Button variant="outline" size="lg" onClick={() => window.open(GiftURL, "_blank", "noopener,noreferrer")}>
              메시지가 담긴 선물 받기
            </Button>
          </div>
        </div>
      </header>

      {/* 메시지 목록 */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-blue-500" /> 
            모두의 메시지 ({sorted.length})
          </h2>
          <SortTabs mode={sort} onChange={setSort} />
        </div>

        <section className="grid gap-4">
          {sorted.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">아직 메시지가 없어요</h3>
                <p className="text-muted-foreground mb-6">첫 번째 마음을 전해보세요!</p>
                <Button onClick={() => setOpen(true)} variant="hero">
                  첫 메시지 남기기
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((p) => (
                <article key={p.id} className="bg-card border rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200">
                  <header className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{p.name || "익명"}</h3>
                      <time className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const newCount = await likePost(p.id);
                          setPosts((prev) => prev.map(x => x.id === p.id ? { ...x, likesCount: newCount } : x));
                        } catch (error) {
                          toast({ 
                            title: "오류가 발생했습니다", 
                            description: "좋아요 추가에 실패했습니다.",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={hasLiked(p.id)}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border hover:bg-accent disabled:opacity-60 transition-colors"
                      aria-label={`좋아요 ${p.likesCount || 0}개`}
                    >
                      <Heart className={`h-4 w-4 ${hasLiked(p.id) ? "fill-red-500 text-red-500" : ""}`} />
                      {p.likesCount || 0}
                    </button>
                  </header>
                  
                  <p className="text-foreground leading-relaxed mb-4 line-clamp-3">
                    {p.message}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/post/${p.id}`)}
                    className="w-full justify-center"
                  >
                    자세히 보기 →
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Event;
