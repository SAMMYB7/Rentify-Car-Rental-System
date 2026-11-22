import { useState } from "react";
import { toast } from "sonner";
import api from "../../api/axios";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const todayIso = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** Both the start and end date count, matching the backend (20 Nov - 21 Nov = 2 days). */
const rentalDays = (start, end) => {
  if (!start || !end) return 0;
  const diff = Math.round((new Date(end) - new Date(start)) / MS_PER_DAY);
  return diff >= 0 ? diff + 1 : 0;
};

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message ||
  (typeof err.response?.data === "string" && err.response.data) ||
  fallback;

/** Lets the renter change the dates of an UNPAID booking (paid ones must be cancelled and rebooked). */
const EditDatesModal = ({ booking, onClose, onSaved }) => {
  const [startDate, setStartDate] = useState(booking.startDate);
  const [endDate, setEndDate] = useState(booking.endDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const days = rentalDays(startDate, endDate);
  const newTotal = days * (booking.pricePerDay || 0);
  const unchanged = startDate === booking.startDate && endDate === booking.endDate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (days === 0) {
      setError("The return date must be on or after the pick-up date.");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/bookings/${booking.id}`, { carId: booking.carId, startDate, endDate });
      toast.success("Booking dates updated", {
        description: `${startDate} to ${endDate} • ${days} day${days === 1 ? "" : "s"} • ₹${newTotal.toLocaleString("en-IN")}`,
      });
      onSaved();
    } catch (err) {
      const msg = getErrorMessage(err, "Could not update the booking.");
      setError(msg);
      toast.error("Could not change dates", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md p-6 md:p-8 shadow-lg border-t-2 border-gray-900">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Change dates</h2>
        <p className="text-sm text-gray-600 mb-6">
          {booking.carBrand} {booking.carModel}. You can change dates until you pay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Pick-up</label>
              <input
                id="startDate"
                type="date"
                min={todayIso()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Return</label>
              <input
                id="endDate"
                type="date"
                min={startDate || todayIso()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-900 p-3 text-sm text-gray-700">
            {days > 0 ? (
              <>
                {days} day{days === 1 ? "" : "s"} &times; &#8377;{(booking.pricePerDay || 0).toLocaleString("en-IN")} ={" "}
                <span className="font-semibold">&#8377;{newTotal.toLocaleString("en-IN")}</span>
              </>
            ) : (
              "Choose a valid date range."
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
              Close
            </button>
            <button
              type="submit"
              disabled={saving || unchanged || days === 0}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save dates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDatesModal;
