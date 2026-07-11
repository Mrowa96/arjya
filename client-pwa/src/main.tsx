import { StrictMode, Suspense, lazy } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import { ApiUrlManager } from './features/apiUrlManager/ApiUrlManager.tsx';
import { AppAudioPlayerProvider } from './features/audioPlayer/AppAudioPlayerProvider.tsx';
import { LocalEpisodesProvider } from './features/localEpisodes/LocalEpisodesProvider.tsx';
import { NetworkStateProvider } from './features/networkState/NetworkStateProvider.tsx';
import { SettingsProvider } from './features/settings/SettingsProvider.tsx';
import { Loader } from './ui/Loader/Loader.tsx';
import { MiniPlayer } from './ui/MiniPlayer/MiniPlayer.tsx';
import { ToastsProvider } from './ui/Toast/Toast.tsx';

import './index.css';

const queryClient = new QueryClient();

const HomePage = lazy(() => import('./pages/HomePage/HomePage.tsx'));
const PodcastDetailPage = lazy(() => import('./pages/PodcastDetailPage/PodcastDetailPage.tsx'));
const PodcastEpisodeDetailPage = lazy(
  () => import('./pages/PodcastEpisodeDetailPage/PodcastEpisodeDetailPage.tsx'),
);
const SettingsPage = lazy(() => import('./pages/SettingsPage/SettingsPage.tsx'));
const OfflineEpisodesPage = lazy(
  () => import('./pages/OfflineEpisodesPage/OfflineEpisodesPage.tsx'),
);
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ApiUrlManager>
          <ToastsProvider>
            <Suspense fallback={<Loader size={64} wrapperSize="large" withWrapper />}>
              <NetworkStateProvider>
                <LocalEpisodesProvider>
                  <SettingsProvider>
                    <AppAudioPlayerProvider>
                      <Suspense fallback={<Loader size={64} wrapperSize="large" withWrapper />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route
                            path="/podcast/:podcastId/episode/:episodeId"
                            element={<PodcastEpisodeDetailPage />}
                          />
                          <Route path="/podcast/:podcastId" element={<PodcastDetailPage />} />
                          <Route path="/offline-episodes" element={<OfflineEpisodesPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>

                      <MiniPlayer />
                    </AppAudioPlayerProvider>
                  </SettingsProvider>
                </LocalEpisodesProvider>
              </NetworkStateProvider>
            </Suspense>
          </ToastsProvider>
        </ApiUrlManager>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
