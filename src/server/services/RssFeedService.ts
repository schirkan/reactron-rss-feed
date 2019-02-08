import { IReactronServiceContext } from '@schirkan/reactron-interfaces';
import * as request from 'request-promise-native';
import { IRssFeedServiceOptions } from 'src/common/interfaces/IRssFeedServiceOptions';
import { IRssFeedService } from 'src/common/interfaces/IRssFeedService';
import { IRssFeed } from 'src/common/interfaces/IRssFeed';

interface ICacheItem {
  timestamp: number;
  result: Promise<any>;
}

export class RssFeedService implements IRssFeedService {
  private options: IRssFeedServiceOptions;
  private cache: { [url: string]: ICacheItem } = {};

  constructor(private context: IReactronServiceContext) { }

  public async setOptions(options: IRssFeedServiceOptions): Promise<void> {
    this.options = options;
  }

  public async getOptions(): Promise<Readonly<IRssFeedServiceOptions>> {
    return this.options;
  }

  getFeedEntries(url: string): Promise<IRssFeed> {
    const result = this.getOrCreate<IRssFeed>(url, () => {
      return this.getResponseInternal('get', url, {}, RssFeedService.mapToRssFeed);
    });
    return result;
  }

  public static mapToRssFeed(data: any): IRssFeed {
    return data; // TODO
  }

  private async getResponseInternal<TResponse>(method: 'get' | 'post', url: string,
    requestOptions: request.RequestPromiseOptions, mapper: (response: any) => TResponse): Promise<TResponse> {
    this.context.log.debug('fetch', url);
    requestOptions = { ...requestOptions, json: true, rejectUnauthorized: false, resolveWithFullResponse: true };

    try {
      let response: request.FullResponse | undefined;
      switch (method) {
        case "get":
          response = await request.get(url, requestOptions);
          break;
        case "post":
          requestOptions.headers!["Content-Type"] = "application/x-www-form-urlencoded";
          response = await request.post(url, requestOptions);
          break;
      }
      if (!response) {
        throw new Error('response is undefined');
      }
      if (response.statusCode !== 200) {
        this.context.log.error(response.statusMessage, response.body);
        throw new Error(response.statusMessage);
      }
      this.context.log.debug(response.body);
      return mapper(response.body);
    } catch (error) {
      this.context.log.error(error);
      throw error;
    }
  }

  private async getOrCreate<TResponse>(key: string, creator: () => Promise<TResponse>): Promise<TResponse> {
    const now = Date.now();
    const validCacheTime = now - (this.options.cacheDuration * 60 * 1000);

    // check timestamp
    if (this.cache[key] && this.cache[key].timestamp < validCacheTime) {
      delete (this.cache[key]);
    }

    if (!this.cache[key]) {
      this.cache[key] = {
        timestamp: now,
        result: creator()
      };
    } else {
      this.context.log.debug('cache hit');
    }

    return this.cache[key].result;
  }
}