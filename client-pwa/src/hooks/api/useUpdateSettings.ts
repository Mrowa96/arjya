import { useMutation } from '@tanstack/react-query';

import { ApiError, type ApiSettingsUpdateData, getApiClient } from '../../utils/api';
import { useInvalidateSettings } from './useSettings';

export function useUpdateSettings() {
  const invalidateSettings = useInvalidateSettings();

  return useMutation({
    mutationFn: async (data: ApiSettingsUpdateData) => {
      try {
        await getApiClient().settings.settingsUpdate(data);

        return true;
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
    async onSuccess() {
      await invalidateSettings();
    },
  });
}
