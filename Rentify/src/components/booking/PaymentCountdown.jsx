import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";

const formatLeft = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * Shows how long the renter has left to pay for an unpaid booking.
 * Unpaid bookings only hold the car for a limited time (30 min); after that they are released.
 */
const PaymentCountdown = ({ dueAt, onExpire }) => {
  const [msLeft, setMsLeft] = useState(() => new Date(dueAt) - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const left = new Date(dueAt) - Date.now();
      setMsLeft(left);
      if (left <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dueAt, onExpire]);

  if (!dueAt) return null;

  if (msLeft <= 0) {
    return (
      <span className="inline-flex items-center text-sm text-red-700">
        <FaClock className="mr-1" /> Payment window expired
      </span>
    );
  }

  const urgent = msLeft < 5 * 60 * 1000;
  return (
    <span className={`inline-flex items-center text-sm ${urgent ? "text-red-700 font-semibold" : "text-gray-600"}`}>
      <FaClock className="mr-1" /> Pay within {formatLeft(msLeft)} to keep this car
    </span>
  );
};

export default PaymentCountdown;
