import { useState } from "react";

export function ErrorThrower() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Simulated crash for ErrorBoundary verification");
  }

  return (
    <button
      type="button"
      onClick={() => setShouldThrow(true)}
      data-testid="trigger-error"
    >
      Trigger Error
    </button>
  );
}