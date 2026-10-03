import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { getGuestId, getToken } from "helper-functions/getToken";
import { service_booking_details_api } from "../../../ApiRoutes";
import {
  buildTracking,
  guestParams,
  normalizeBooking,
} from "../../../helpers/bookingAdapter";

// The log is derived from the booking itself: the stage tracker plus, for a
// repeat booking, the list of its scheduled occurrences.
const getData = async ({ id }) => {
  const { data } = await MainApi.get(`${service_booking_details_api}/${id}`, {
    params: guestParams(getToken(), getGuestId()),
  });
  const booking = normalizeBooking(data);
  return {
    id: booking?.id,
    booking_status: booking?.booking_status,
    tracking: buildTracking(booking),
    repeat: booking?.repeat_log ?? [],
    booking,
  };
};

export default function useGetServiceBookingLog(params = {}, enabled = true) {
  return useQuery(["service-booking-log", params?.id], () => getData(params), {
    enabled: Boolean(enabled) && Boolean(params?.id),
    onError: onSingleErrorResponse,
  });
}
