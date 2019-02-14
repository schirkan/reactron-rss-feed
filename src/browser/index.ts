import { IReactronComponentDefinition } from '@schirkan/reactron-interfaces';
import { RssFeed } from './components/RssFeed/RssFeed';

export * from './components/RssFeed/RssFeed';

export const components: IReactronComponentDefinition[] = [{
  component: RssFeed,
  name: 'RssFeed',
  description: 'RssFeed',
  displayName: 'RssFeed',
  fields: [{
    displayName: 'RSS feed URL',
    name: 'url',
    valueType: 'string',
  }, {
    displayName: 'Show header',
    name: 'showHeader',
    valueType: 'boolean',
    defaultValue: true,
  }, {
    displayName: 'Show time',
    name: 'showTime',
    valueType: 'boolean',
    defaultValue: true,
  }, {
    displayName: 'Show content',
    name: 'showContent',
    valueType: 'boolean',
    defaultValue: true,
  }, {
    displayName: 'Visible entries',
    name: 'visibleEntries',
    valueType: 'number',
    defaultValue: 5,
    minValue: 1,
    maxValue: 100,
  }, {
    displayName: 'Max entries',
    name: 'maxEntries',
    valueType: 'number',
    defaultValue: 15,
    minValue: 1,
    maxValue: 100,
  }, {
    displayName: 'Scroll delay in s',
    name: 'scrollDelay',
    valueType: 'number',
    defaultValue: 3,
    minValue: 1,
    maxValue: 100,
  }]
}];