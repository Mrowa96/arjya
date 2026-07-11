import { useMutation } from '@tanstack/react-query';

import { ApiError, type ApiSearchListData, getApiClient } from '../../utils/api';

export function useSearchPodcast() {
  return useMutation<ApiSearchListData, ApiError, string>({
    mutationFn: async (phrase: string) => {
      try {
        const response = await getApiClient().podcast.searchList({ phrase });

        return response.data;
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
  });
}
