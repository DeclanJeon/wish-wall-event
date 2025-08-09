import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ConceptModal from "@/components/ConceptModal";
import heroImage from "@/assets/hero-crystal.jpg";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToEvent = () => {
    setIsModalOpen(false);
    navigate("/event");
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setIsModalOpen(true)}
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-2xl"
              >
                내 메시지 전하기
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/20">
                <a href="https://smartstore.naver.com/cleopatrasalt" target="_blank" rel="noopener noreferrer">
                  선물 받으러 가기
                </a>
              </Button>
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

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-card shadow-lg">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-bold text-lg mb-3">예쁜 카드로 메시지 작성</h3>
              <p className="text-muted-foreground">다양한 스타일과 색상의 카드로 나만의 특별한 메시지를 꾸며보세요</p>
            </div>
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
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onNavigateToEvent={handleNavigateToEvent}
      />
    </div>
  );
};

export default Index;
