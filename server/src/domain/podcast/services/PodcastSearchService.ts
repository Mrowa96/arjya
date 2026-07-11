import { ClientError, gql, request } from 'graphql-request';
import * as v from 'valibot';

import { type Collection } from '../../../infrastructure/collection.ts';
import { type Result, ResultError, resultErrorConst } from '../../../infrastructure/result.ts';
import { tryCatch } from '../../../infrastructure/tryCatch.ts';
import { getSettings } from '../../settings/repository.ts';
import { getPodcastCollection } from '../repository.ts';
import { PodcastThumbnailService } from './PodcastThumbnailService.ts';

const foundPodcastSchema = v.object({
  uuid: v.string(),
  name: v.string(),
  imageUrl: v.pipe(v.string(), v.url()),
  rssUrl: v.pipe(v.string(), v.url()),
});

const responseSchema = v.object({
  search: v.object({
    podcastSeries: v.array(foundPodcastSchema),
  }),
});

export class PodcastSearchService {
  async search(
    phrase: string,
  ): Promise<Result<Collection<{ name: string; rssUrl: string; thumbnailUrl: string | null }>>> {
    const settings = getSettings();

    if (!settings.search.enabled || !settings.search.userId || !settings.search.apiKey) {
      return {
        isSuccess: false,
        error: new ResultError(
          "Search feature cannot be used, because it's not configured proparly in settings.",
          {
            code: resultErrorConst.SEARCH_NOT_CONFIGURED,
          },
        ),
      };
    }

    const [foundPodcastsCollection, searchPodcastError] = await tryCatch(async () => {
      const gqlQuery = gql`
        query getPodcast($phrase: String!) {
          search(term: $phrase, filterForTypes: PODCASTSERIES, limitPerPage: 4) {
            searchId
            podcastSeries {
              uuid
              name
              imageUrl
              rssUrl
            }
          }
        }
      `;

      const result = await request({
        url: 'https://api.taddy.org/',
        document: gqlQuery,
        variables: {
          phrase,
        },
        requestHeaders: {
          'X-USER-ID': settings.search.userId,
          'X-API-KEY': settings.search.apiKey,
        },
      });

      const response = v.parse(responseSchema, result);

      const existingPodcasts = getPodcastCollection();
      const existingPodcastsRssUrls = existingPodcasts.items.map(({ rssFeedUrl }) => rssFeedUrl);

      const podcastsToReturn = response.search.podcastSeries.filter(
        (foundPodcast) => !existingPodcastsRssUrls.includes(foundPodcast.rssUrl),
      );

      return podcastsToReturn;
    });

    if (searchPodcastError) {
      if (searchPodcastError instanceof ClientError) {
        const apiRateLimitExceededError = searchPodcastError.response.errors?.find(
          (error) =>
            'code' in error &&
            typeof error.code === 'string' &&
            error.code === 'API_RATE_LIMIT_EXCEEDED',
        );

        const apiKeyInvalidError = searchPodcastError.response.errors?.find(
          (error) =>
            'code' in error && typeof error.code === 'string' && error.code === 'API_KEY_INVALID',
        );

        if (apiRateLimitExceededError) {
          return {
            isSuccess: false,
            error: new ResultError(
              `Rate limit for Taddy Api exceeded while searching for podcast with phrase: "${phrase}".`,
              {
                cause: searchPodcastError,
                code: resultErrorConst.SEARCH_API_LIMIT_EXCEEDED,
              },
            ),
          };
        } else if (apiKeyInvalidError) {
          return {
            isSuccess: false,
            error: new ResultError(
              `Invalid api key for Taddy Api provided while searching for podcast with phrase: "${phrase}".`,
              {
                cause: searchPodcastError,
                code: resultErrorConst.SEARCH_CONFIG_INVALID,
              },
            ),
          };
        }
      }

      return {
        isSuccess: false,
        error: new ResultError(
          `Unknown error while searching for podcast with phrase: "${phrase}".`,
          {
            cause: searchPodcastError,
          },
        ),
      };
    }

    const podcastThumbnailService = new PodcastThumbnailService({
      thumbnailWidth: 256,
      thumbnailHeight: 256,
    });

    const thumbnailServiceResult = await podcastThumbnailService.savePodcastsThumbnail(
      foundPodcastsCollection.map((item) => ({ id: item.uuid, imageUrl: item.imageUrl })),
    );

    const podcastsToReturn = foundPodcastsCollection.map((item) => ({
      name: item.name,
      rssUrl: item.rssUrl,
      thumbnailUrl: thumbnailServiceResult.isSuccess
        ? thumbnailServiceResult.data.successfulItems.find(
            (thumbnailItem) => thumbnailItem.id === item.uuid,
          )?.thumbnailUrl || null
        : null,
    }));

    return {
      isSuccess: true,
      data: {
        items: podcastsToReturn,
        meta: {
          total: podcastsToReturn.length,
          limit: 4,
          offset: 0,
        },
      },
    };
  }
}
