import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { EventPost } from '@/lib/eventTypes';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export type CardStyle = 'letter' | 'memo' | 'postcard' | 'sticky' | 'modern';

interface MessageCardProps {
  post: EventPost;
  onLike: (id: string) => void;
  onViewDetails: (id: string) => void;
  style?: CardStyle;
  color?: string;
}

const cardStyles = {
  letter: {
    background: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    shadow: 'shadow-md',
    pattern: 'bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fbbf24" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]'
  },
  memo: {
    background: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    shadow: 'shadow-lg',
    pattern: 'bg-[url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%233b82f6" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-8.837-7.163-16-16-16s-16 7.163-16 16 7.163 16 16 16 16-7.163 16-16zm-12-2v8h4v-8h-4z"/%3E%3C/g%3E%3C/svg%3E")]'
  },
  postcard: {
    background: 'bg-gradient-to-br from-rose-50 to-pink-50',
    border: 'border-rose-200 border-2 border-dashed',
    shadow: 'shadow-xl',
    pattern: 'bg-[url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ec4899" fill-opacity="0.1"%3E%3Cpath d="M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z"/%3E%3C/g%3E%3C/svg%3E")]'
  },
  sticky: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    shadow: 'shadow-md transform rotate-1',
    pattern: 'bg-[url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2310b981" fill-opacity="0.1"%3E%3Cpath d="M0 0h20v20H0V0zm10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/%3E%3C/g%3E%3C/svg%3E")]'
  },
  modern: {
    background: 'bg-gradient-to-br from-slate-50 to-gray-50',
    border: 'border-slate-200',
    shadow: 'shadow-lg',
    pattern: 'bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236b7280" fill-opacity="0.05"%3E%3Cpath d="M30 30c0-11.046-8.954-20-20-20S-10 18.954-10 30s8.954 20 20 20 20-8.954 20-20zM10 50c11.046 0 20-8.954 20-20S21.046 10 10 10s-20 8.954-20 20 8.954 20 20 20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]'
  }
};

const MessageCard: React.FC<MessageCardProps> = ({
  post,
  onLike,
  onViewDetails,
  style = 'modern',
  color
}) => {
  const cardStyle = cardStyles[style];
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { 
    addSuffix: true, 
    locale: ko 
  });

  return (
    <Card 
      className={`transition-all duration-300 hover:scale-105 cursor-pointer ${cardStyle.background} ${cardStyle.border} ${cardStyle.shadow} ${cardStyle.pattern}`}
      style={color ? { backgroundColor: color } : undefined}
      onClick={() => onViewDetails(post.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-card-foreground">{post.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div 
          className="text-card-foreground mb-4 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: post.message }}
        />
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            className="text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4 mr-1" />
            {post.likesCount}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(post.id);
            }}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            자세히 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageCard;