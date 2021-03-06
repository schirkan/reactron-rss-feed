import { IReactronServiceDefinition } from '@schirkan/reactron-interfaces';
import { RssFeedService } from './services/RssFeedService';

// export interfaces
export * from '../common/interfaces/IRssFeed';
export * from '../common/interfaces/IRssFeedService';
export * from '../common/interfaces/IRssFeedServiceOptions';

// export reactron service definition
export const services: IReactronServiceDefinition[] = [{
  description: 'Service for RSS Feeds',
  displayName: 'RSS Feed Service',
  fields: [{
    defaultValue: 5,
    description: 'Cache duration in minutes',
    displayName: 'Cache duration (min)',
    name: 'cacheDuration',
    valueType: 'number',
    minValue: 0,
    maxValue: 60,
    stepSize: 1
  }],
  name: 'RssFeedService',
  service: RssFeedService
}];