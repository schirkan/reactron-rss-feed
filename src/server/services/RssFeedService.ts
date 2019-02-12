import { IReactronServiceContext } from '@schirkan/reactron-interfaces';
import { IRssFeedServiceOptions } from 'src/common/interfaces/IRssFeedServiceOptions';
import { IRssFeedService } from 'src/common/interfaces/IRssFeedService';
import { IRssFeed } from 'src/common/interfaces/IRssFeed';
import Parser, { Output } from 'rss-parser';
import * as request from 'request-promise-native';

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

  public async getFeedEntries(url: string): Promise<IRssFeed> {
    return this.getOrCreate<IRssFeed>(url, async () => {
      const response = await this.getResponseInternal<string>('get', url);
      let parser = new Parser();
      let feed = await parser.parseString(response);
      return RssFeedService.mapToRssFeed(feed);
    });
  }

  public static mapToRssFeed(data: Output): IRssFeed {
    const feed: IRssFeed = {
      description: data.description,
      feedUrl: data.feedUrl,
      link: data.link,
      title: data.title,
      items: []
    };
    if (data.items) {
      feed.items = data.items.map(x => ({
        link: x.link,
        guid: x.guid,
        title: x.title,
        pubDate: x.pubDate,
        creator: x.creator,
        content: x.content,
        isoDate: x.isoDate,
        categories: x.categories,
        contentSnippet: x.contentSnippet,
      }));
    }
    return feed;
  }

  private async getResponseInternal<TResponse>(method: 'get' | 'post', url: string,
    requestOptions?: request.RequestPromiseOptions): Promise<TResponse> {
    this.context.log.debug('fetch', url);
    requestOptions = { ...requestOptions, rejectUnauthorized: false, resolveWithFullResponse: true };

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
      return response.body;
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