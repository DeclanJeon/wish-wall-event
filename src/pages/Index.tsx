import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConceptModal from "@/components/ConceptModal";
import heroImage from "@/assets/hero-crystal.jpg";

const Index = () => {
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToEvent = () => {
    navigate("/event?showForm=true");
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>위시월 이벤트 | 마음을 전하세요</title>
        <meta name="description" content="소중한 사람에게 응원의 메시지를 남기고 선물도 받아보세요. 지금 바로 참여하기!" />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Hero Section with Banner Image */}
      <div className="relative min-h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              마음을 전하는<br/>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">위시월 이벤트</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 leading-relaxed opacity-90">
              소중한 사람에게 따뜻한 마음을 전해보세요
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center max-w-2xl mx-auto mt-6">
              {/* 메인 액션 버튼 - 강조된 디자인 */}
              <div className="relative w-full max-w-md group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <Button 
                  onClick={() => navigate('/event')}
                  className="relative w-full h-20 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
                >
                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">💌</span>
                      <span className="text-lg font-bold text-white drop-shadow-sm">내 메시지 전하기</span>
                    </div>
                    <div className="mt-1 px-4 py-1 bg-white/20 rounded-full">
                      <span className="text-sm font-medium text-white/95">지금 바로 마음을 전해보세요</span>
                    </div>
                  </div>
                </Button>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-pink-600 text-xs font-medium px-3 py-1 rounded-full shadow-md transform transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1">
                  클릭해서 메시지 작성하기
                </div>
              </div>

              {/* 보조 액션 버튼 */}
              <div className="w-full max-w-xs">
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="w-full h-16 border-2 border-pink-400/80 bg-pink-500/10 hover:border-pink-300 hover:bg-pink-500/20 transition-colors duration-200 flex items-center justify-center gap-2 group"
                >
                  <a href="https://smartstore.naver.com/cleopatrasalt" target="_blank" rel="noopener noreferrer">
                    <Gift className="h-5 w-5 text-pink-200 group-hover:text-white transition-colors" />
                    <span className="text-pink-100 group-hover:text-white font-medium transition-colors">선물 받으러 가기</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">위시월 이벤트</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            여러분의 따뜻한 메시지가 모여 하나의 아름다운 벽이 됩니다.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border bg-card shadow-lg">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="font-bold text-lg mb-3">서로 응원하기</h3>
              <p className="text-muted-foreground">다른 분들의 메시지에 좋아요와 댓글로 따뜻한 마음을 나눠보세요</p>
            </div>
            <div className="p-6 rounded-xl border bg-card shadow-lg">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="font-bold text-lg mb-3">특별한 선물</h3>
              <p className="text-muted-foreground">참여하신 분들께 준비된 특별한 선물도 받아가세요</p>
            </div>
          </div>
        </div>
      </div>

      <ConceptModal 
        open={isConceptModalOpen}
        onOpenChange={setIsConceptModalOpen}
        onStartWriting={handleNavigateToEvent}
      />
    </div>
  );
};

export default Index;
