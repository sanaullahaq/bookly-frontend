import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  /**
    creates a ref that will hold a reference to the actual "Confirm" <button> DOM element — but before rendering, useRef(null) starts it as null, and the .current gets populated only after the button mounts.
    
    Why it's there (the intent): it's the standard pattern for focus management in a modal dialog. When the dialog opens, you want keyboard focus to move into the dialog (usability/accessibility best practice), not stay on the page behind it. The typical usage is a useEffect that runs when open becomes true and calls confirmRef.current?.focus():
    
    useEffect(() => {
       if (open) confirmRef.current?.focus();
     }, [open]);
    
     Why the Confirm button specifically: the safest, most predictable focus target is the least-destructive action — so users who press Enter/Space don't accidentally trigger the destructive delete. Many dialogs focus Cancel instead for that reason. But focusing Confirm (or whichever button you pick) is a deliberate, common choice.
     
    */

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="mb-2 text-lg font-semibold text-gray-900">{title}</h2>
        {message && <p className="mb-4 text-sm text-gray-600">{message}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
