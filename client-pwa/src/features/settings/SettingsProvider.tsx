import { type PropsWithChildren, type ReactNode, createContext, use, useContext } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { useSettings as useApiSettings } from '../../hooks/api/useSettings';
import { useUpdateSettings } from '../../hooks/api/useUpdateSettings';
import {
  type ApiSettingsListData,
  type ApiSettingsUpdateData,
  type HttpResponse,
  getApiClient,
} from '../../utils/api';

type Props = {
  children: ReactNode;
};

type SettingsContextType = {
  settings: ApiSettingsListData;
  isUpdateSettingsPending: boolean;
  updateSettingsError: Error | null;
  updateSettings: (_data: ApiSettingsUpdateData) => Promise<boolean>;
};

const defaultSettings: SettingsContextType['settings'] = {
  podcastUpdateJob: {
    enabled: true,
  },
  restoreLastPlayedSource: {
    enabled: false,
  },
  search: {
    enabled: false,
    apiKey: null,
    userId: null,
  },
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isUpdateSettingsPending: false,
  updateSettingsError: null,
  updateSettings: () => Promise.resolve(true),
});

let settingsPromise: Promise<HttpResponse<ApiSettingsListData>>;

function fetchSettings() {
  return new Promise(
    (resolve: (value: HttpResponse<ApiSettingsListData, unknown>) => void, reject) => {
      const abortController = new AbortController();

      getApiClient()
        .settings.settingsList({ signal: abortController.signal })
        .then(resolve)
        .catch(reject);

      window.setTimeout(() => {
        abortController.abort('Unable to fetch settings fast enough.');
      }, 3000);
    },
  );
}

function getSettingsPromise() {
  if (!settingsPromise) {
    settingsPromise = fetchSettings();
  }

  return settingsPromise;
}

export function SafeSettingsProvider({ children }: Props) {
  const {
    mutateAsync: updateSettings,
    isPending: isUpdateSettingsPending,
    error: updateSettingsError,
  } = useUpdateSettings();

  return (
    <SettingsContext.Provider
      value={{
        settings: defaultSettings,
        isUpdateSettingsPending,
        updateSettingsError,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function UnsafeSettingsProvider({ children }: Props) {
  const settings = use(getSettingsPromise());
  const {
    mutateAsync: updateSettings,
    isPending: isUpdateSettingsPending,
    error: updateSettingsError,
  } = useUpdateSettings();

  const { data: apiSettings } = useApiSettings(settings.data);

  return (
    <SettingsContext.Provider
      value={{
        settings: apiSettings,
        isUpdateSettingsPending,
        updateSettingsError,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function SettingsProvider({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary fallback={<SafeSettingsProvider>{children}</SafeSettingsProvider>}>
      <UnsafeSettingsProvider>{children}</UnsafeSettingsProvider>
    </ErrorBoundary>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
