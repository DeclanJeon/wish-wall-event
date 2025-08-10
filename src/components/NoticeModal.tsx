// components/NoticeModal.tsx
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoticeModal = ({ open, onOpenChange }: NoticeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            📢 이벤트 공지사항
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2">✨ 이벤트 안내</h3>
            <p className="text-sm text-muted-foreground">
              소중한 사람에게 따뜻한 마음을 전해보세요. 
              여러분의 응원 메시지가 큰 힘이 됩니다!
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg">💌</span>
              <div>
                <p className="font-medium">메시지 작성하기</p>
                <p className="text-sm text-muted-foreground">
                  응원, 감사, 축하 등 자유롭게 마음을 전해주세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg">❤️</span>
              <div>
                <p className="font-medium">좋아요 누르기</p>
                <p className="text-sm text-muted-foreground">
                  마음에 드는 메시지에 하트를 눌러 공감을 표현해보세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg">💬</span>
              <div>
                <p className="font-medium">댓글 남기기</p>
                <p className="text-sm text-muted-foreground">
                  다른 사람의 메시지에 댓글로 소통해보세요
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              ⚠️ 주의사항
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• 비방이나 욕설은 삼가해주세요</li>
              <li>• 개인정보 노출에 주의해주세요</li>
              <li>• 따뜻하고 긍정적인 메시지를 부탁드려요</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeModal;