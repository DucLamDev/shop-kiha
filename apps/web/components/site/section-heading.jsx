import { cn } from '@/lib/utils';

// Tiêu đề mục theo mẫu: dòng nhỏ viết hoa màu ô liu + tiêu đề lớn nét mảnh màu nâu.
// title có thể là chuỗi hoặc mảng dòng; dòng thứ hai trở đi xuống hàng.
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  id,
  as: Heading = 'h2',
}) {
  const titleLines = Array.isArray(title) ? title : [title];
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading id={id} className="display-title mt-4 text-[2.4rem] sm:text-5xl lg:text-[3.5rem]">
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </Heading>
        {description && (
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
