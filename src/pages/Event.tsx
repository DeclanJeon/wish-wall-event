import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Gift, Home, LayoutGrid, List, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { EventPost, SortMode } from "@/lib/eventTypes";
import { getPosts, likePost, hasLiked } from "@/lib/supabaseStore";
import { useToast } from "@/hooks/use-toast";
import MessageCard from "@/components/MessageCard";
import MessageForm from "@/components/MessageForm";
import ConceptModal from "@/components/ConceptModal";

const SortTabs = ({ mode, onChange }: { mode: SortMode; onChange: (m: SortMode) => void }) => (
  <div className="flex items-center gap-2">
    <Button variant={mode === "latest" ? "secondary" : "outline"} onClick={() => onChange("latest")}>최신순</Button>
    <Button variant={mode === "popular" ? "secondary" : "outline"} onClick={() => onChange("popular")}>인기순</Button>
  </div>
);

const ViewToggle = ({ view, onChange }: { view: "card" | "list"; onChange: (v: "card" | "list") => void }) => (
  <div className="flex items-center gap-2">
    <Button 
      variant={view === "card" ? "secondary" : "outline"} 
      size="sm"
      onClick={() => onChange("card")}
    >
      <LayoutGrid className="h-4 w-4" />
      카드형
    </Button>
    <Button 
      variant={view === "list" ? "secondary" : "outline"} 
      size="sm"
      onClick={() => onChange("list")}
    >
      <List className="h-4 w-4" />
      목록형
    </Button>
  </div>
);

const Event = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [sort, setSort] = useState<SortMode>("latest");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const postsData = await getPosts();
    setPosts(postsData);
  };

  const sortedPosts = useMemo(() => {
    const arr = [...posts];
    if (sort === "popular") {
      arr.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    } else {
      arr.sort((a, b) => b.createdAt - a.createdAt);
    }
    return arr;
  }, [posts, sort]);

  const handleLike = async (postId: string) => {
    try {
      const newCount = await likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: newCount } : p));
    } catch (error) {
      toast({
        title: "오류",
        description: "좋아요 추가에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleFormSuccess = () => {
    fetchPosts();
  };

  const renderListView = () => (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <div key={post.id} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{post.name || "익명"}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                disabled={hasLiked(post.id)}
                className={`flex items-center gap-2 ${hasLiked(post.id) ? "text-red-500" : "text-muted-foreground"}`}
              >
                <Heart className={`h-4 w-4 ${hasLiked(post.id) ? "fill-current" : ""}`} />
                {post.likesCount}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(post.id)}
              >
                자세히 보기
              </Button>
            </div>
          </div>
          
          <div 
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: post.message }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>이벤트 | 마음을 전하는 위시월</title>
        <meta name="description" content="이벤트에 참여하고 메시지를 남겨 마음을 전해보세요. 인기순/최신순으로 메시지를 둘러볼 수 있어요." />
        <link rel="canonical" href="/event" />
      </Helmet>

      {/* 헤더 */}
      <header className="border-b bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">마음을 전하는 이벤트</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            소중한 사람에게 응원의 메시지를 남겨주세요. 여러분의 한마디가 큰 힘이 됩니다.
          </p>
          
          {/* 주요 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setIsFormOpen(true)}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              
              <span className="ml-2 text-xs opacity-75">내 메시지 전하기</span><br/>
              <span className="ml-2 text-xs opacity-75">
                예: "힘내세요! 응원합니다 💪"
              </span>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.open("https://smartstore.naver.com/cleopatrasalt", "_blank")}
              className="flex items-center gap-2"
            >
              <Gift className="h-4 w-4" />
              메시지가 담긴 선물 받기
            </Button>
          </div>
        </div>
      </header>

      {/* 메시지 목록 */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="text-blue-500" /> 
            모두의 메시지 ({sortedPosts.length})
          </h2>
          
          <div className="flex items-center gap-4">
            <ViewToggle view={viewMode} onChange={setViewMode} />
            <SortTabs mode={sort} onChange={setSort} />
          </div>
        </div>

        <section>
          {sortedPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">아직 메시지가 없어요</h3>
                <p className="text-muted-foreground mb-6">첫 번째 마음을 전해보세요!</p>
                <Button onClick={() => setIsFormOpen(true)} size="lg">
                  첫 메시지 남기기
                </Button>
              </div>
            </div>
          ) : viewMode === "card" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPosts.map((post) => (
                <MessageCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onViewDetails={handleViewDetails}
                  isLiked={hasLiked(post.id)}
                />
              ))}
            </div>
          ) : (
            renderListView()
          )}
        </section>
      </main>

      <MessageForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />
      
      <ConceptModal 
        open={isConceptModalOpen} 
        onOpenChange={setIsConceptModalOpen} 
        onStartWriting={() => {
          setIsConceptModalOpen(false);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};

export default Event;