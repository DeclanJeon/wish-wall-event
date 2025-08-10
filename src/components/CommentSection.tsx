import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Reply, ArrowUpDown } from "lucide-react";
import { EventComment } from "@/lib/eventTypes";
import { getComments, addComment } from "@/lib/supabaseStore";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import RichEditor from "./RichEditor";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: string;
  sortOrder?: 'latest' | 'oldest';
}

interface CommentWithReplies extends Omit<EventComment, 'author'> {
  author?: string;
  replies: CommentWithReplies[];
  collapsed: boolean;
  name?: string; // For backward compatibility
}

const CommentSection = ({ postId, sortOrder = 'latest' }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);
  
  useEffect(() => {
    // Re-sort comments when sortOrder changes
    if (comments.length > 0) {
      const reorganized = organizeComments(comments.flatMap(flattenComment));
      setComments(reorganized);
    }
  }, [sortOrder]);
  
  // Helper function to flatten the comment tree
  const flattenComment = (comment: CommentWithReplies): EventComment[] => {
    const comments: EventComment[] = [{
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      author: comment.author || comment.name || '익명', // Handle both author and name for backward compatibility
      message: comment.message,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isPrivate: comment.isPrivate
    }];
    
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach(reply => {
        comments.push(...flattenComment(reply));
      });
    }
    
    return comments;
  };

  const fetchComments = async () => {
    const commentsData = await getComments(postId);
    const organizedComments = organizeComments(commentsData);
    setComments(organizedComments);
  };

  const sortComments = (comments: CommentWithReplies[]): CommentWithReplies[] => {
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      if (sortOrder === 'latest') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  };

  const organizeComments = (commentsData: EventComment[]): CommentWithReplies[] => {
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // First, create all comment objects
    commentsData.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        author: comment.author || (comment as any).name || '익명', // Handle both author and name
        replies: [],
        collapsed: false
      });
    });

    // Then, organize them into hierarchies
    commentsData.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort root comments
    const sortedRootComments = sortComments(rootComments);
    
    // Sort replies for each comment
    const sortReplies = (comments: CommentWithReplies[]): CommentWithReplies[] => {
      return comments.map(comment => ({
        ...comment,
        replies: comment.replies ? sortReplies(comment.replies) : []
      }));
    };

    return sortReplies(sortedRootComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentMessage.trim() || !newCommentAuthor.trim()) {
      toast({
        title: "오류",
        description: "이름과 댓글을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(postId, {
        author: newCommentAuthor,
        message: newCommentMessage,
      });
      
      setNewCommentAuthor("");
      setNewCommentMessage("");
      await fetchComments();
      
      toast({
        title: "성공",
        description: "댓글이 등록되었습니다!",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "댓글 등록에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyMessage.trim() || !replyAuthor.trim()) {
      toast({
        title: "오류",
        description: "이름과 답글을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(postId, {
        author: replyAuthor,
        message: replyMessage,
        parentId,
      });
      
      setReplyAuthor("");
      setReplyMessage("");
      setReplyingTo(null);
      await fetchComments();
      
      toast({
        title: "성공",
        description: "답글이 등록되었습니다!",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "답글 등록에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCollapse = (commentId: string) => {
    const updateCollapse = (comments: CommentWithReplies[]): CommentWithReplies[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, collapsed: !comment.collapsed };
        }
        return {
          ...comment,
          replies: updateCollapse(comment.replies)
        };
      });
    };
    setComments(updateCollapse(comments));
  };

  const renderComment = (comment: CommentWithReplies, depth = 0) => {
    const hasReplies = comment.replies.length > 0;
    const marginLeft = depth * 24;

    return (
      <div key={comment.id} style={{ marginLeft: `${marginLeft}px` }} className="border-l-2 border-gray-100 pl-4">
        <div className="bg-card p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold">{comment.author}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
              </p>
            </div>
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCollapse(comment.id)}
                className="flex items-center gap-1"
              >
                {comment.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {comment.replies.length}개 답글
              </Button>
            )}
          </div>
          
          <div 
            className="prose prose-sm max-w-none mb-3"
            dangerouslySetInnerHTML={{ __html: comment.message }}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="flex items-center gap-1"
          >
            <Reply className="h-4 w-4" />
            답글
          </Button>

          {replyingTo === comment.id && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor={`reply-author-${comment.id}`}>이름</Label>
                <Input
                  id={`reply-author-${comment.id}`}
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label>답글</Label>
                <RichEditor
                  value={replyMessage}
                  onChange={setReplyMessage}
                  placeholder="답글을 작성하세요..."
                  maxLength={10000}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? "등록 중..." : "답글 등록"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setReplyingTo(null)}
                  size="sm"
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>

        {hasReplies && !comment.collapsed && (
          <div className="ml-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">댓글 {comments.length}개</h3>
      </div>

      {/* New Comment Form */}
      <div className="bg-card p-4 rounded-lg border">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment-author">이름</Label>
            <Input
              id="comment-author"
              value={newCommentAuthor}
              onChange={(e) => setNewCommentAuthor(e.target.value)}
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div className="space-y-2">
            <Label>댓글</Label>
            <RichEditor
              value={newCommentMessage}
              onChange={setNewCommentMessage}
              placeholder="댓글을 작성하세요..."
              maxLength={10000}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "댓글 등록"}
          </Button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-0">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentSection;