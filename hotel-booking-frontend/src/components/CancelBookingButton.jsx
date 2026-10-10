import { useState } from "react";
import * as apiClient from "../api-client";
import { isBookingCancellable } from "../utils/booking-utils";
import { useAppContext } from "../contexts/AppContext";

const CancelBookingButton = ({ booking, className }) => {
  const { showToast } = useAppContext();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.cancelBooking(booking._id, {
        cancellationReason: reason.trim() || undefined,
      });

      const skipNote = data.refundSkipped ? ` ${data.refundSkipped}` : "";
      const refundNote = data.refundAmount > 0 ? ` Refunded £${data.refundAmount.toFixed(2)}.` : "";
      
      showToast({
        title: "Booking cancelled",
        description: `${refundNote}${skipNote}`.trim() || "Status updated.",
        type: "SUCCESS",
      });
      setOpen(false);
      setReason("");
      
      // Force reload to update ui
      window.location.reload();
    } catch (err) {
      const message = err?.response?.data?.message || "Could not cancel booking";
      showToast({
        title: "Cancel failed",
        description: message,
        type: "ERROR",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBookingCancellable(booking)) {
    return null;
  }

  if (!open) {
    return (
      <div className={className}>
        <button
          type="button"
          className="px-3 py-1 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
          onClick={() => setOpen(true)}
        >
          Cancel booking
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-3 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 ${className || ""}`}>
      <p className="text-sm text-red-800">
        Cancel this upcoming stay? Paid bookings receive a full Stripe refund when a payment intent is on file.
      </p>
      <label className="block text-sm font-medium text-gray-700">
        Reason (optional)
        <input
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Change of plans"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleCancel}
          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "Cancelling…" : "Confirm cancel"}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            setOpen(false);
            setReason("");
          }}
          className="px-3 py-1 text-gray-700 hover:bg-red-100 rounded-md text-sm font-medium disabled:opacity-50"
        >
          Keep booking
        </button>
      </div>
    </div>
  );
};

export default CancelBookingButton;
