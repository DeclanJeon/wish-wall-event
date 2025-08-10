// pages/Event.tsx
import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Gift, Home, LayoutGrid, List, ArrowUpDown, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { EventPost, SortMode } from "@/lib/eventTypes";
import { getPosts, likePost, hasLiked } from "@/lib/supabaseStore";
import { useToast } from "@/hooks/use-toast";
import MessageCard from "@/components/MessageCard";
import MessageForm from "@/components/MessageForm";
import NoticeModal from "@/components/NoticeModal";
import PopularPostsSlider from "@/components/PopularPostsSlider";

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

// 로딩 컴포넌트
const LoadingSection = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-foreground">메시지를 불러오고 있습니다</h3>
      <p className="text-sm text-muted-foreground">잠시만 기다려주세요...</p>
    </div>
  </div>
);

const Event = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [sort, setSort] = useState<SortMode>("latest");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  const [commentSortOrder, setCommentSortOrder] = useState<"latest" | "oldest">("latest");
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    
    // 공지사항 모달 표시 여부 체크
    const checkNoticeModal = () => {
      const hideUntil = localStorage.getItem('hideNoticeUntil');
      
      if (!hideUntil) {
        // 처음 방문하는 경우
        setIsNoticeModalOpen(true);
        return;
      }
      
      const hideUntilDate = new Date(parseInt(hideUntil));
      const now = new Date();
      
      // 숨김 기간이 지난 경우에만 모달 표시
      if (now > hideUntilDate) {
        setIsNoticeModalOpen(true);
      }
      // 숨김 기간이 아직 유효한 경우 모달을 열지 않음
    };
    
    // 약간의 딜레이 후 체크 (페이지 로드 완료 후)
    const timer = setTimeout(checkNoticeModal, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true); // 로딩 시작
    try {
      const postsData = await getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast({
        title: "오류",
        description: "메시지를 불러오는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false); // 로딩 완료
    }
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

  const currentPosts = useMemo(() => {
    return sortedPosts.slice(0, currentPage * postsPerPage);
  }, [sortedPosts, currentPage, postsPerPage]);

  const hasMorePosts = currentPosts.length < sortedPosts.length;

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
    setIsFormOpen(false);
  };
  
  const handleCommentSortToggle = () => {
    setCommentSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
  };

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
            {/* 공지사항 다시보기 버튼 */}
            <Button 
              variant="ghost" 
              onClick={() => setIsNoticeModalOpen(true)}
              className="text-sm"
            >
              📢 공지사항
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">마음을 전하는 이벤트</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            소중한 사람에게 응원의 메시지를 남겨주세요. 여러분의 한마디가 큰 힘이 됩니다.
          </p>
          
          {/* 주요 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center max-w-2xl mx-auto">
            {/* 메시지 버튼 - 강조된 디자인 */}
            <div className="relative w-full max-w-md group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="relative w-full h-20 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
              >
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">💌</span>
                    <span className="text-lg font-bold text-white drop-shadow-sm">내 메시지 전하기</span>
                  </div>
                  <div className="mt-1 px-4 py-1 bg-white/20 rounded-full">
                    <span className="text-sm font-medium text-white/95">예: 힘내세요! 응원합니다 💪</span>
                  </div>
                </div>
              </Button>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-pink-600 text-xs font-medium px-3 py-1 rounded-full shadow-md transform transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1">
                클릭해서 메시지 작성하기
              </div>
            </div>

            {/* 선물 받기 버튼 - 보조 액션 */}
            <div className="w-full max-w-xs">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => window.open("https://smartstore.naver.com/cleopatrasalt", "_blank")}
                className="w-full h-16 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Gift className="h-5 w-5 text-pink-500" />
                <span className="text-gray-700 font-medium">메시지가 담긴 선물 받기</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메시지 목록 */}
      <main className="container mx-auto px-6 py-12">
        {/* 로딩 중이 아닐 때만 헤더 표시 */}
        {!isLoading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="text-blue-500" /> 
              모두의 메시지 ({sortedPosts.length})
            </h2>
            <div className="flex items-center gap-4">
              <ViewToggle view={viewMode} onChange={setViewMode} />
              <SortTabs mode={sort} onChange={setSort} />
              {/* <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCommentSortToggle}
                className="flex items-center gap-1"
              >
                <ArrowUpDown className="h-4 w-4" />
                댓글 {commentSortOrder === 'latest' ? '최신순' : '과거순'}
              </Button> */}
            </div>
          </div>
        )}

        {/* 인기 메시지 슬라이더 - 로딩 중이 아니고 게시글이 있을 때만 표시 */}
        {!isLoading && sortedPosts.length > 0 && (
          <PopularPostsSlider posts={sortedPosts} onViewPost={handleViewDetails} />
        )}

        <section>
          {isLoading ? (
            // 로딩 중일 때
            <LoadingSection />
          ) : sortedPosts.length === 0 ? (
            // 로딩 완료 후 게시글이 없을 때
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
            // 카드 뷰
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPosts.map((post) => (
                  <MessageCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onViewDetails={handleViewDetails}
                    isLiked={hasLiked(post.id)}
                    onClick={() => handleViewDetails(post.id)}
                  />
                ))}
              </div>
              {hasMorePosts && (
                <div className="text-center mt-12">
                  <Button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    더 많은 메시지 보기
                  </Button>
                </div>
              )}
            </>
          ) : (
            // 리스트 뷰
            <>
              <div className="space-y-4">
                {currentPosts.map((post) => (
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
              {hasMorePosts && (
                <div className="text-center mt-12">
                  <Button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    더 많은 메시지 보기
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* 모달들 */}
      <MessageForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />
      
      {/* 공지사항 모달 */}
      <NoticeModal 
        open={isNoticeModalOpen} 
        onOpenChange={setIsNoticeModalOpen}
      />
    </div>
  );
};

export default Event;
