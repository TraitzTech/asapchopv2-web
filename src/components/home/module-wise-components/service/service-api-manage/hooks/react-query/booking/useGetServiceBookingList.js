import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { getGuestId, getToken } from "helper-functions/getToken";
import { service_booking_list_api } from "../../../ApiRoutes";
import { guestParams, normalizeBooking } from "../../../helpers/bookingAdapter";

const PAGE_LIMIT = 10;

const getData = async ({ offset = 1, tab = "all", only_parent = 1 }) => {
  const { data } = await MainApi.get(service_booking_list_api, {
    params: {
      offset,
      limit: PAGE_LIMIT,
      status: tab || "all",
      only_parent,
      ...guestParams(getToken(), getGuestId()),
    },
  });
  return { ...data, bookings: (data?.bookings ?? []).map(normalizeBooking) };
};

export default function useGetServiceBookingList(params = {}, enabled = true) {
  return useQuery(
    ["service-booking-list", params?.offset, params?.tab, params?.only_parent],
    () => getData(params),
    { enabled: Boolean(enabled), keepPreviousData: true, onError: onSingleErrorResponse }
  );
}
