import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { provider_reviews_api, service_reviews_api } from "../../../ApiRoutes";

const REVIEW_LIMIT = 10;

const getData = async ({ type, id, offset }) => {
  const base = type === "provider" ? provider_reviews_api : service_reviews_api;
  const { data } = await MainApi.get(`${base}/${id}`, {
    params: { offset, limit: REVIEW_LIMIT },
  });
  return data;
};

// Reviews (+ star breakdown) of one service or one provider.
export default function useGetServiceReviews({ type = "service", id, offset = 1 }, enabled = true) {
  return useQuery(["service-reviews", type, id, offset], () => getData({ type, id, offset }), {
    enabled: Boolean(id) && Boolean(enabled),
    keepPreviousData: true,
    onError: onSingleErrorResponse,
  });
}

export { REVIEW_LIMIT };
