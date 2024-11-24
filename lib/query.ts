import { queryOptions } from "@tanstack/react-query";
import { api, CharacterAttributes, Single } from "./api";
import { AxiosError } from "axios";

export function characterOptions(slug: string) {
  return queryOptions({
    queryKey: ["character", slug],
    queryFn: async ({ signal }) => {
      const response = await api.get(`/characters/${slug}`, { signal });
      const data: Single<CharacterAttributes> = response.data;
      return data.data.attributes;
    },
    retry: (failureCount, error: AxiosError) =>
      error.response?.status === 404 ? false : failureCount < 3,
  });
}
