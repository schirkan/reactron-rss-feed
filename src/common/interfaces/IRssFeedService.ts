import { IReactronService } from "@schirkan/reactron-interfaces";
import { IRssFeed } from "./IRssFeed";

export interface IRssFeedService extends IReactronService {
  getFeedEntries(url: string): Promise<IRssFeed>;
}