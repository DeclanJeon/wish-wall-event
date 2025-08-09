import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { EventPost } from "@/lib/eventTypes";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface MessageCardProps {
  post: EventPost;
  onLike: (id: string) => void;
  onViewDetails: (id: string) => void;
  isLiked: boolean;
}

const getCardStyles = (style: string, color: string) => {
  const baseStyles = "relative p-6 transition-all duration-300 hover:shadow-lg";
  
  const styleClasses = {
    letter: "border-2 shadow-md",
    memo: "border border-dashed shadow-sm",
    postit: "shadow-md transform hover:rotate-1",
    vintage: "border-2 border-double shadow-lg"
  };

  const colorClasses = {
    white: "bg-white border-gray-200",
    yellow: "bg-yellow-100 border-yellow-300",
    pink: "bg-pink-100 border-pink-300",
    blue: "bg-blue-100 border-blue-300",
    green: "bg-green-100 border-green-300",
    purple: "bg-purple-100 border-purple-300"
  };

  return `${baseStyles} ${styleClasses[style as keyof typeof styleClasses] || styleClasses.letter} ${colorClasses[color as keyof typeof colorClasses] || colorClasses.white}`;
};

const MessageCard = ({ post, onLike, onViewDetails, isLiked }: MessageCardProps) => {
  return (
    <Card className={getCardStyles(post.cardStyle || 'letter', post.cardColor || 'white')}>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{post.name || "익명"}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </p>
          </div>
        </div>
        
        <div 
          className="prose prose-sm max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: post.message }}
        />
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {post.likesCount}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(post.id)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            자세히 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageCard;