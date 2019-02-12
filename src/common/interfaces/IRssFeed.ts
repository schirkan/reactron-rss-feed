export interface IRssFeed {
  link?: string;
  title?: string;
  items: IRssFeedItem[];
  feedUrl?: string;
  description?: string;
}

export interface IRssFeedItem {
  link?: string;
  guid?: string;
  title?: string;
  pubDate?: string;
  creator?: string;
  content?: string;
  isoDate?: string;
  categories?: string[];
  contentSnippet?: string;
}