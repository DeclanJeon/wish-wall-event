import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import hero from "@/assets/hero-crystal.jpg";
import { addPost, getPosts, hasLiked, likePost } from "@/lib/eventStore";
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
    setPosts(getPosts());
  }, []);

  const sorted = useMemo(() => {
    const arr = [...posts];
    if (sort === "popular") arr.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    else arr.sort((a, b) => b.createdAt - a.createdAt);
    return arr;
  }, [posts, sort]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    const contact = data.email ?? data.phone ?? "";
    const newPost = addPost({ name: data.name, contact, message: data.message });
    setPosts((prev) => [newPost, ...prev]);
    toast({ title: "메시지가 업로드되었어요!", description: "따뜻한 마음을 전해주셔서 감사합니다." });
    setOpen(false);
    reset();
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>이벤트 | 마음을 전하는 위시월</title>
        <meta name="description" content="이벤트에 참여하고 메시지를 남겨 마음을 전해보세요. 인기순/최신순으로 메시지를 둘러볼 수 있어요." />
        <link rel="canonical" href="/event" />
      </Helmet>

      <header className="relative overflow-hidden">
        <img src={hero} alt="이벤트 크리스탈 이미지, 하늘과 실크 파도 배경" className="w-full h-[320px] md:h-[420px] object-cover animate-[float-slow_10s_ease-in-out_infinite]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-background/10" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">마음을 전하는 이벤트</h1>
            <p className="max-w-2xl text-muted-foreground">소중한 사람에게 응원의 메시지를 남겨주세요. 여러분의 한마디가 큰 힘이 됩니다. 남긴 메시지는 모두가 볼 수 있으며, 인기순/최신순으로 정렬해 볼 수 있어요.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="shadow-glow">내 메시지 전하기</Button>
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

              <Button variant="outline" onClick={() => window.open(GiftURL, "_blank", "noopener,noreferrer")}>메시지가 담긴 선물 받기</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2"><MessageSquare className="opacity-70" /> 모두의 메시지</h2>
          <SortTabs mode={sort} onChange={setSort} />
        </div>

        <section className="mt-6 grid gap-4">
          {sorted.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 bg-glass rounded-lg">아직 메시지가 없어요. 첫 마음을 전해보세요!</div>
          ) : (
            <ul className="grid md:grid-cols-2 gap-4">
              {sorted.map((p) => (
                <li key={p.id} className="border rounded-lg p-4 bg-card/60 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button className="text-left" onClick={() => navigate(`/post/${p.id}`)} aria-label="게시글 보기">
                        <h3 className="font-semibold truncate max-w-[18rem]">{p.name || "익명"}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.message}</p>
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => {
                          const newCount = likePost(p.id);
                          setPosts((prev) => prev.map(x => x.id === p.id ? { ...x, likesCount: newCount } : x));
                        }}
                        disabled={hasLiked(p.id)}
                        className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border hover:bg-accent disabled:opacity-60"
                        aria-label="좋아요"
                      >
                        <Heart className={hasLiked(p.id) ? "fill-primary text-primary" : ""} />
                        {p.likesCount || 0}
                      </button>
                      <Link to={`/post/${p.id}`} className="text-xs underline text-muted-foreground">자세히 보기</Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Event;
