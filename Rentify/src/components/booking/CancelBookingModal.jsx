import { useState } from "react";
import { toast } from "sonner";
import api from "../../api/axios";

const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message ||
  (typeof err.response?.data === "string" && err.response.data) ||
  fallback;

/**
 * Confirms a cancellation and shows exactly what will be refunded. The refund figures come from the
 * backend's cancellation policy (booking.refundIfCancelled / cancellationFee), the same rule that is
 * applied when the cancellation goes through.
 */
const CancelBookingModal = ({ booking, onClose, onCancelled }) => {
  const [cancelling, setCancelling] = useState(false);
  const isPaid = booking.status === "PAID";

  const handleConfirm = async () => {
    setCancelling(true);
    const toastId = toast.loading(isPaid ? "Cancelling and processing your refund..." : "Cancelling your booking...");
    try {
      const { data } = await api.delete(`/bookings/${booking.id}`);
      toast.success("Booking cancelled", { id: toastId, description: data.message });
      if (data.refundAmount > 0) {
        toast.success(`Refund of ${rupees(data.refundAmount)} initiated`, {
          description: "It usually reaches your account within 5-7 working days.",
        });
      }
      if (data.emailSent) {
        toast.info("Cancellation confirmation sent to your email");
      }
      onCancelled();
    } catch (err) {
      toast.error("Could not cancel booking", {
        id: toastId,
        description: getErrorMessage(err, "Please try again."),
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md p-6 md:p-8 shadow-lg border-t-2 border-red-600">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Cancel this booking?</h2>
        <p className="text-sm text-gray-600 mb-5">
          {booking.carBrand} {booking.carModel} &middot; {booking.startDate} to {booking.endDate}
        </p>

        {isPaid ? (
          <table className="w-full text-sm mb-4 border border-gray-200">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-3 py-2 text-gray-600">Amount paid</td>
                <td className="px-3 py-2 text-right text-gray-900">{rupees(booking.totalPrice)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-3 py-2 text-gray-600">Cancellation fee</td>
                <td className="px-3 py-2 text-right text-gray-900">{rupees(booking.cancellationFee)}</td>
              </tr>
              <tr className="bg-gray-900 text-white font-semibold">
                <td className="px-3 py-2">You get back</td>
                <td className="px-3 py-2 text-right">{rupees(booking.refundIfCancelled)}</td>
              </tr>
            </tbody>
          </table>
        ) : null}

        <p className="text-sm bg-gray-50 border-l-4 border-gray-900 p-3 text-gray-700 mb-4">
          {booking.cancellationNote}
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Full refund if you cancel more than 48 hours before pick-up. Within 48 hours, one day&apos;s rental is kept as
          a cancellation fee. This can&apos;t be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={cancelling} className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
            Keep booking
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={cancelling}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Yes, cancel booking"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
