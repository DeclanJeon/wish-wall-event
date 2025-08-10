import { useState, useEffect } from "react";
import { EventPost } from "@/lib/eventTypes";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PopularPostsSliderProps {
  posts: EventPost[];
  onViewPost: (postId: string) => void;
}

const PopularPostsSlider = ({ posts, onViewPost }: PopularPostsSliderProps) => {
  const [popularPosts, setPopularPosts] = useState<EventPost[]>([]);

  useEffect(() => {
    // 좋아요 수 기준으로 상위 5개 게시글 선택
    const sortedByLikes = [...posts]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 5);
    setPopularPosts(sortedByLikes);
  }, [posts]);

  if (popularPosts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔥</span>
        <h3 className="text-lg font-semibold">인기 메시지</h3>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {popularPosts.map((post) => (
            <CarouselItem key={post.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-2 border-pink-200/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-sm">{post.name || "익명"}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-red-500">
                          <Heart className="h-3 w-3 fill-current" />
                          <span>{post.likesCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="text-sm text-muted-foreground line-clamp-3 mb-3"
                    dangerouslySetInnerHTML={{ 
                      __html: post.message.length > 80 
                        ? post.message.substring(0, 80) + "..." 
                        : post.message 
                    }}
                  />
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewPost(post.id)}
                    className="w-full text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    자세히 보기
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-12" />
        <CarouselNext className="-right-12" />
      </Carousel>
    </div>
  );
};

export default PopularPostsSlider;