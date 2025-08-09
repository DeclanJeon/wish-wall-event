import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import RichEditor from "./RichEditor";
import { addPost } from "@/lib/supabaseStore";
import { useToast } from "@/hooks/use-toast";

interface MessageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MessageForm = ({ open, onOpenChange, onSuccess }: MessageFormProps) => {
  const [name, setName] = useState("");
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [cardStyle, setCardStyle] = useState("letter");
  const [cardColor, setCardColor] = useState("white");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "오류",
        description: "메시지를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const contact = contactType === "email" ? email : phone;
    if (!contact.trim()) {
      toast({
        title: "오류",
        description: `${contactType === "email" ? "이메일" : "전화번호"}를 입력해주세요.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addPost({
        name: name || "익명",
        contact,
        message,
        cardStyle,
        cardColor,
      });
      
      toast({
        title: "성공",
        description: "메시지가 등록되었습니다!",
      });
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCardStyle("letter");
      setCardColor("white");
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "오류",
        description: "메시지 등록에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>응원 메시지 작성하기</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">이름 (선택사항)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요 (미입력시 '익명'으로 표시)"
            />
          </div>

          <div className="space-y-4">
            <Label>연락처</Label>
            <RadioGroup value={contactType} onValueChange={(value: "email" | "phone") => setContactType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-radio" />
                <Label htmlFor="email-radio">이메일</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-radio" />
                <Label htmlFor="phone-radio">전화번호</Label>
              </div>
            </RadioGroup>

            {contactType === "email" ? (
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
              />
            ) : (
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="전화번호를 입력하세요"
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>카드 스타일</Label>
            <Select value={cardStyle} onValueChange={setCardStyle}>
              <SelectTrigger>
                <SelectValue placeholder="카드 스타일을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">편지형</SelectItem>
                <SelectItem value="memo">메모지형</SelectItem>
                <SelectItem value="postit">포스트잇형</SelectItem>
                <SelectItem value="vintage">빈티지형</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>카드 색상</Label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { value: "white", color: "bg-white border-gray-200", label: "화이트" },
                { value: "yellow", color: "bg-yellow-100", label: "옐로우" },
                { value: "pink", color: "bg-pink-100", label: "핑크" },
                { value: "blue", color: "bg-blue-100", label: "블루" },
                { value: "green", color: "bg-green-100", label: "그린" },
                { value: "purple", color: "bg-purple-100", label: "퍼플" },
              ].map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setCardColor(colorOption.value)}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${colorOption.color} ${
                    cardColor === colorOption.value ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                  }`}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>응원 메시지</Label>
            <RichEditor
              value={message}
              onChange={setMessage}
              placeholder="따뜻한 응원 메시지를 작성해보세요..."
              maxLength={10000}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "메시지 등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForm;