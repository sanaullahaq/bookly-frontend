import { useState, type SyntheticEvent } from "react";
import { Star } from "lucide-react";
import type { ReviewCreate } from "../../types/reviews";
import { useAddReview } from "./queries";
import ErrorMessage from "../../components/ErrorMessage";

export default function ReviewForm({ bookUid }: { bookUid: string }) {
  const addMutation = useAddReview(bookUid);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (rating === 0) {
      setValidationError("Please select a rating.");
      return;
    }
    if (!reviewText.trim()) {
      setValidationError("Please write a review.");
      return;
    }

    setValidationError(null);

    const data: ReviewCreate = { rating, review_text: reviewText.trim() };
    await addMutation.mutateAsync(data);
    setRating(0);
    setReviewText("");
  }

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Add a review</h2>

      {(addMutation.isError || validationError) && (
        <div className="mb-4">
          <ErrorMessage
            error={
              addMutation.isError
                ? addMutation.error
                : { message: validationError ?? "", error_code: "validation" }
            }
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                // Rate 1 star(s)
                className={value <= rating ? "text-amber-400" : "text-gray-300"}
              >
                <Star
                  size={20}
                  fill={value <= rating ? "currentColor" : "none"}
                />
              </button>
            );
          })}
          {/* detailed note available here: /notes/array-from-star-rating-explained.md */}
          <span className="ml-2 text-xs text-gray-500">
            {rating === 0 ? "Tap to rate" : `${rating}/5`}
          </span>
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
          rows={3}
          placeholder="What did you think?"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />

        <button
          type="submit"
          disabled={addMutation.isPending}
          aria-busy={addMutation.isPending}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addMutation.isPending ? "Posting…" : "Post Review"}
        </button>
      </form>
    </section>
  );
}
