import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { provider_services_api } from "../../../ApiRoutes";

export const PROVIDER_SERVICES_LIMIT = 12;

const getData = async ({ providerId, offset, categoryId, name }) => {
  const { data } = await MainApi.get(`${provider_services_api}/${providerId}`, {
    params: {
      offset,
      limit: PROVIDER_SERVICES_LIMIT,
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(name ? { name } : {}),
    },
  });
  return data;
};

// Services of a provider with its category tabs (returned on the first page).
export default function useGetProviderServices({ providerId, offset = 1, categoryId, name }) {
  return useQuery(
    ["provider-services", providerId, offset, categoryId, name],
    () => getData({ providerId, offset, categoryId, name }),
    { enabled: Boolean(providerId), keepPreviousData: true, onError: onSingleErrorResponse }
  );
}
