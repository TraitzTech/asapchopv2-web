import { useMutation, useQuery, useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import {
  provider_details_api,
  service_booking_place_api,
  service_booking_tax_api,
} from "../../../ApiRoutes";

// Provider (booking flags, service locations, zone) shown on the checkout.
export const useGetCheckoutProvider = (providerId) =>
  useQuery(["service-checkout-provider", providerId], async () => {
    const { data } = await MainApi.get(`${provider_details_api}/${providerId}`);
    return data;
  }, { enabled: Boolean(providerId), onError: onSingleErrorResponse });

// Live price preview (subtotal, discount, coupon, tax, total, repeat series total).
export const useServiceBookingTax = () =>
  useMutation("service-booking-tax", async (payload) => {
    const { data } = await MainApi.post(service_booking_tax_api, payload);
    return data;
  });

// Places the booking; `redirect_link` is returned for digital payments.
export const usePlaceServiceBooking = () => {
  const queryClient = useQueryClient();
  return useMutation(
    "service-booking-place",
    async (payload) => {
      const { data } = await MainApi.post(service_booking_place_api, payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("cart-groups");
        queryClient.invalidateQueries("cart-itemss");
        queryClient.invalidateQueries("service-booking-list");
      },
    }
  );
};
