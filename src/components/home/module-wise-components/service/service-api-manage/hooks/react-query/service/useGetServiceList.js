import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

const getData = async ({ url, params }) => {
  const { data } = await MainApi.get(url, { params });
  return data;
};

// Generic reader for the paginated Service lists (latest, popular, campaigns, quick experts ...).
export default function useGetServiceList(
  { url, params = {}, key = url },
  enabled = true
) {
  return useQuery(["service-list", key, params], () => getData({ url, params }), {
    enabled: Boolean(enabled) && Boolean(url),
    onError: onSingleErrorResponse,
  });
}
