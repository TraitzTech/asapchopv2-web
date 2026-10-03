import { useMutation, useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { service_review_submit_api } from "../../../ApiRoutes";

interface ServicemanReviewPayload {
  booking_id: number | string;
  serviceman_id: number | string;
  rating: number | string;
  comment?: string;
}

const postData = async (payload: ServicemanReviewPayload) => {
  const { data } = await MainApi.post(service_review_submit_api, payload);
  return data;
};

export const useSubmitServicemanReview = () => {
  const queryClient = useQueryClient();
  return useMutation("serviceman-review-submit", postData, {
    onSuccess: () => {
      queryClient.invalidateQueries("service-booking-details");
    },
  });
};
