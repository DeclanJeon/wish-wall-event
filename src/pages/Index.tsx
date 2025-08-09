import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>위시월 이벤트 | 마음을 전하세요</title>
        <meta name="description" content="소중한 사람에게 응원의 메시지를 남기고 선물도 받아보세요. 지금 바로 참여하기!" />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          {/* 핵심 메시지 */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            마음을 전하는<br/>
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">위시월 이벤트</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            소중한 사람에게 응원의 한마디를 남겨주세요.<br/>
            여러분의 따뜻한 메시지가 모여 하나의 벽이 됩니다.
          </p>

          {/* 주요 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild variant="hero" size="lg" className="shadow-glow">
              <a href="/event">메시지 남기러 가기</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://smartstore.naver.com/cleopatrasalt" target="_blank" rel="noopener noreferrer">
                선물 받으러 가기
              </a>
            </Button>
          </div>

          {/* 간단한 설명 */}
          <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div className="p-4 rounded-lg border bg-card/30">
              <h3 className="font-semibold mb-2">📝 메시지 작성</h3>
              <p>이름과 연락처, 응원 메시지를 남겨주세요</p>
            </div>
            <div className="p-4 rounded-lg border bg-card/30">
              <h3 className="font-semibold mb-2">❤️ 서로 응원</h3>
              <p>다른 사람의 메시지에 좋아요와 댓글을 달아보세요</p>
            </div>
            <div className="p-4 rounded-lg border bg-card/30">
              <h3 className="font-semibold mb-2">🎁 선물 받기</h3>
              <p>참여하고 특별한 선물도 받아가세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
