import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConceptModal from "@/components/ConceptModal";
import heroImage from "@/assets/hero-crystal.jpg";

const Index = () => {
  const [showConceptModal, setShowConceptModal] = useState(false);
  const navigate = useNavigate();

  const handleGoToEvent = () => {
    setShowConceptModal(false);
    navigate("/event");
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>위시월 이벤트 | 마음을 전하세요</title>
        <meta name="description" content="소중한 사람에게 응원의 메시지를 남기고 선물도 받아보세요. 지금 바로 참여하기!" />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* 히어로 섹션 */}
      <section className="relative min-h-screen flex flex-col items-center justify-center">
        {/* 배경 이미지 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* 컨텐츠 */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            마음을 전하는<br/>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">위시월 이벤트</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            소중한 사람에게 응원의 한마디를 남겨주세요.<br/>
            여러분의 따뜻한 메시지가 모여 하나의 벽이 됩니다.
          </p>

          {/* 주요 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => setShowConceptModal(true)}
              variant="hero" 
              size="lg" 
              className="shadow-glow bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              💝 내 메시지 전하기
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="border-white/30 text-white hover:bg-white/10"
            >
              <a href="https://smartstore.naver.com/cleopatrasalt" target="_blank" rel="noopener noreferrer">
                🎁 선물 받으러 가기
              </a>
            </Button>
          </div>

          {/* 홈 버튼 */}
          <div className="absolute top-6 left-6">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              🏠 홈
            </Button>
          </div>
        </div>
      </section>

      {/* 컨셉 모달 */}
      <ConceptModal
        open={showConceptModal}
        onOpenChange={setShowConceptModal}
        onGoToEvent={handleGoToEvent}
      />
    </div>
  );
};

export default Index;
