'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Zalo không hỗ trợ điền sẵn tin nhắn qua liên kết công khai, nên chỉ sao chép
// tên + đường dẫn sản phẩm để khách tự dán vào cuộc trò chuyện.
export function CopyProduct({ name, className }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`Mình muốn tư vấn ${name}: ${window.location.href}`);
      setCopied(true);
      toast.success('Đã sao chép. Bạn có thể dán nội dung vào Zalo.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Không thể sao chép. Bạn có thể sao chép đường dẫn trên thanh địa chỉ.');
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-1 py-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-walnut',
        className,
      )}
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      {copied ? 'Đã sao chép thông tin sản phẩm' : 'Sao chép tên & link sản phẩm để gửi Zalo'}
    </button>
  );
}
