// components/NoticeModal.tsx
import { useState } from "react";
import { X, Megaphone, MessageSquare, Heart, MessageCircle, AlertCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoticeModal = ({ open, onOpenChange }: NoticeModalProps) => {
  const [dontShowToday, setDontShowToday] = useState(false);

  const handleClose = () => {
    if (dontShowToday) {
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999);
      localStorage.setItem('hideNoticeUntil', tomorrow.getTime().toString());
    }
    onOpenChange(false);
  };

  // X 버튼 클릭 시에도 동일한 로직 적용
  const handleXButtonClick = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        {/* 헤더 배경 그라데이션 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
          <DialogHeader>
            <div className="flex items-center justify-center mb-3">
              <Megaphone className="h-10 w-10 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              ✨ 전국민 메시지 나누기 이벤트 ✨
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {/* 메인 안내 메시지 */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              따뜻한 메시지를 남겨주신 분들 중 추첨을 통해
              <br />
              <span className="font-semibold text-primary">소정의 선물을 드립니다!</span>
            </p>
          </div>

          {/* 참여 방법 */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              이렇게 참여하세요
            </h3>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="mt-0.5">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">메시지 작성하기</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    응원, 감사, 축하 등 따뜻한 마음을 전해주세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="mt-0.5">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">좋아요 누르기</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    마음에 드는 메시지에 하트를 눌러 공감해주세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="mt-0.5">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">댓글로 소통하기</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    다른 사람의 메시지에 댓글로 따뜻한 마음을 나눠요
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 이벤트 혜택 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                  이벤트 혜택
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  참여자 중 추첨을 통해 스타벅스 기프티콘, 
                  문화상품권 등 다양한 선물을 드립니다!
                </p>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-red-900 dark:text-red-200">
                  커뮤니티 가이드라인
                </p>
                <ul className="text-xs text-red-800 dark:text-red-300 mt-2 space-y-1">
                  <li>• 서로를 존중하는 따뜻한 메시지를 작성해주세요</li>
                  <li>• 비방, 욕설, 혐오 표현은 자동으로 필터링됩니다</li>
                  <li>• 개인정보 노출에 주의해주세요</li>
                  <li>• 광고성 메시지는 삭제될 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontShowToday"
                checked={dontShowToday}
                onCheckedChange={(checked) => setDontShowToday(checked as boolean)}
              />
              <label
                htmlFor="dontShowToday"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
              >
                오늘 하루 보지 않기
              </label>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeModal;
