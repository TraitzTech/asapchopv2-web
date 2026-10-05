// The Service API returns flat booking JSON; the shared order screens (other-order,
// track-order, profile) read a grouped shape. These helpers translate once, here.

const HISTORY_KEYS = ["confirmed", "ongoing", "completed"];

export const guestParams = (token, guestId) =>
  !token && guestId ? { guest_id: guestId } : {};

const historyMap = (list) => {
  const map = {};
  (Array.isArray(list) ? list : []).forEach((entry) => {
    if (entry?.status && !map[entry.status]) map[entry.status] = entry.created_at;
  });
  return map;
};

export const normalizeBooking = (booking) => {
  if (!booking || typeof booking !== "object") return booking;
  const historyList = Array.isArray(booking.status_history)
    ? booking.status_history
    : [];
  const bookingDetails = booking.details ?? booking.booking_details ?? [];
  return {
    ...booking,
    module_type: "service",
    amount: {
      booking_amount: booking.booking_amount,
      discount_amount: booking.discount_amount,
      coupon_discount_amount: booking.coupon_discount_amount,
      pro_discount: booking.pro_discount,
      ref_bonus_amount: booking.ref_bonus_amount,
      tax_amount: booking.tax_amount,
      tax_status: booking.tax_status,
      additional_charge: booking.additional_charge,
      partially_paid_amount: booking.partially_paid_amount,
    },
    booking_details: bookingDetails,
    status_history_list: historyList,
    status_history: Array.isArray(booking.status_history)
      ? historyMap(historyList)
      : booking.status_history,
  };
};

// Stages shown by the shared TrackOrder stepper: confirmed -> ongoing -> completed.
export const buildTracking = (booking) => {
  const history = historyMap(booking?.status_history_list ?? booking?.status_history);
  const current = (booking?.booking_status ?? "").toLowerCase();
  const effective = current === "accepted" ? "confirmed" : current;
  const currentIndex = HISTORY_KEYS.indexOf(effective);
  return HISTORY_KEYS.map((status, index) => ({
    status,
    reached: Boolean(history[status]) || (currentIndex >= 0 && index <= currentIndex),
    is_current: effective === status,
    timestamp: history[status] ?? null,
  }));
};
