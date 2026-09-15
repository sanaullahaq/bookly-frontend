import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { RATE_LIMIT, type ReviewOut } from "../../types/reviews";
import { useAuth } from "../auth/useAuth";
import { useDeleteReview } from "./queries";
import ConfirmDialog from "../../components/ConfirmDialog";
import ErrorMessage from "../../components/ErrorMessage";

export default function ReviewList({
  bookUid,
  reviews,
}: {
  bookUid: string;
  reviews: ReviewOut[];
}) {
  const { user } = useAuth();
  const deleteMutation = useDeleteReview(bookUid);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewOut | null>(null);

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Reviews</h2>

      {deleteMutation.isError && (
        <div className="mb-4">
          <ErrorMessage error={deleteMutation.error} />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review.uid}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: RATE_LIMIT }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating ? "text-amber-400" : "text-gray-300"
                      }
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
                  {/* detailed note available here: /notes/array-from-star-rating-explained.md */}
                </div>
                {user?.uid === review.user_uid && (
                  <button
                    type="button"
                    onClick={() => setReviewToDelete(review)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700">{review.review_text}</p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={reviewToDelete !== null}
        title="Delete review?"
        message="Are you sure you want to delete your review? This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setReviewToDelete(null)}
        onConfirm={async () => {
          if (!reviewToDelete) return;
          const uid = reviewToDelete.uid;
          setReviewToDelete(null);
          await deleteMutation.mutateAsync(uid);
        }}
      />
    </section>
  );
}
