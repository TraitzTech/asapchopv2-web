import { useMutation, useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { service_review_submit_api } from "../../../ApiRoutes";

interface ReviewPayload {
  booking_id: number | string;
  service_id: number | string;
  rating: number;
  comment?: string;
}

const postData = async (payload: ReviewPayload) => {
  const { data } = await MainApi.post(service_review_submit_api, payload);
  return data;
};

export const useSubmitServiceReview = () => {
  const queryClient = useQueryClient();
  return useMutation("service-review-submit", postData, {
    onSuccess: () => {
      queryClient.invalidateQueries("service-booking-details");
      queryClient.invalidateQueries("service-booking-list");
    },
  });
};
