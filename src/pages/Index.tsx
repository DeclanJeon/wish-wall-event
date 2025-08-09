import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const IMAGES = [
  "/lovable-uploads/51869f3a-37cd-4c24-9534-2839a6108638.png",
  "/lovable-uploads/3f99c589-5279-42b3-85fa-881db560eede.png",
  "/lovable-uploads/968614b8-c0eb-43a7-bdf7-87770675c571.png",
  "/lovable-uploads/7466ac51-61cc-4afd-b97c-81d92057fae3.png",
  "/lovable-uploads/70d5cbd9-9514-48f2-8051-e5274edfe8f7.png",
  "/lovable-uploads/ab8e4cc7-5710-46f8-a1b1-53a18d82defb.png",
  "/lovable-uploads/411bdb95-4150-40b5-95e1-d143207e0d08.png"
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Wish Wall Event | 모두의 마음을 연결해요</title>
        <meta name="description" content="아름다운 크리스탈 이미지와 함께 이벤트에 참여하고 마음을 전해보세요." />
        <link rel="canonical" href="/" />
      </Helmet>

      <header
        className="relative flex items-center min-h-[70vh] overflow-hidden"
        style={{
          backgroundImage: `url(${IMAGES[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/55 to-background/20" />
        <div className="relative container mx-auto px-6 py-20">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">마음을 전하는 위시월</h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-muted-foreground">반짝이는 순간처럼 여러분의 따뜻한 메시지를 모아 하나의 벽을 만듭니다. 지금 바로 참여해보세요.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" className="shadow-glow">
              <a href="/event" aria-label="이벤트 참여하기">이벤트 참여하기</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://smartstore.naver.com/cleopatrasalt" target="_blank" rel="noopener noreferrer">메시지가 담긴 선물 받기</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-14">
        <section>
          <h2 className="text-xl font-semibold mb-4">영감 갤러리</h2>
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {IMAGES.map((src, i) => (
                  <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                    <figure className="overflow-hidden rounded-lg border bg-card/60">
                      <img src={src} alt={`크리스탈 일러스트 ${i + 1}`} className="w-full h-56 object-cover hover:scale-105 transition-transform" loading="lazy" />
                    </figure>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
