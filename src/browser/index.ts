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
  //   displayName: 'Header text',
  //   name: 'headerText',
  //   valueType: 'string',
  //   defaultValue: 'RSS Feed',
  // }, {
    displayName: 'Show header',
    name: 'showHeader',
    valueType: 'boolean',
    defaultValue: true,
  }]
}];