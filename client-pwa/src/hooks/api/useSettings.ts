import { useCallback } from 'react';

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { type ApiSettingsListData, getApiClient } from '../../utils/api';

const queryKey = ['settings'];

export function useSettings(initialData: ApiSettingsListData) {
  return useQuery(
    queryOptions({
      initialData,
      queryKey,
      queryFn: async () => {
        const response = await getApiClient().settings.settingsList();

        return response.data;
      },
    }),
  );
}

export function useInvalidateSettings() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey,
    });
  }, [queryClient]);
}
