import { Loader2 } from "lucide-react";
export default function Loading({
  fullPage = false,
  size = 48,
}: {
  fullPage?: boolean;
  size?: number;
}) {
  return (
    <div
      className={
        fullPage
          ? "fixed inset-0 z-50 flex items-center justify-center bg-gray-100"
          : "flex justify-center p-8"
      }
      role="status"
      aria-label="Loading"
    >
      <Loader2
        size={fullPage ? size + 16 : size}
        className="animate-spin text-purple-600"
      />
    </div>
  );
}