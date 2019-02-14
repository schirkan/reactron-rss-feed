import { IReactronComponentContext, topicNames } from '@schirkan/reactron-interfaces';
import moment from 'moment';
import * as React from 'react';
import { IRssFeedService } from 'src/common/interfaces/IRssFeedService';
import { IRssFeed, IRssFeedItem } from 'src/common/interfaces/IRssFeed';

import './RssFeed.scss';

interface IRssFeedProps {
  url: string;
  showHeader: boolean;
  showTime: boolean;
  showContent: boolean;
  maxEntries: number;
  visibleEntries: number;
  scrollDelay: number;
}

interface IRssFeedState {
  loading: boolean;
  data?: IRssFeed;
  error?: any;
  position: number;
}

export class RssFeed extends React.Component<IRssFeedProps, IRssFeedState> {
  public context: IReactronComponentContext;
  private timer?: number;

  constructor(props: IRssFeedProps) {
    super(props);
    this.state = { loading: false, position: 0 };
    this.loadData = this.loadData.bind(this);
    this.renderRssFeedItem = this.renderRssFeedItem.bind(this);
    this.scrollToNext = this.scrollToNext.bind(this);
  }

  public componentDidMount() {
    this.context.topics.subscribe(topicNames.refresh, this.loadData);
    this.loadData();

    this.timer = window.setInterval(this.scrollToNext, this.props.scrollDelay * 1000);
  }

  public componentWillUnmount() {
    this.context.topics.unsubscribe(topicNames.refresh, this.loadData);

    window.clearInterval(this.timer);
  }

  public componentDidUpdate(prevProps: any) {
    if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
      this.loadData();
    }
  }

  private async loadData() {
    const service = await this.context.getService<IRssFeedService>('RssFeedService');
    if (service) {
      this.setState({ loading: true });
      try {
        const data = await service.getFeedEntries(this.props.url);
        this.setState({ data, loading: false });
      } catch (error) {
        this.setState({ error, loading: false });
      }
    }
  }

  private scrollToNext() {
    this.setState(prevState => {
      let newPosition = prevState.position - 1;
      if (newPosition < 0) {
        newPosition = this.props.visibleEntries - 1;
      }
      // let newPosition = prevState.position + 1;
      // if (newPosition >= this.props.visibleEntries) {
      //   newPosition = 0;
      // }
      return { position: newPosition };
    });
  }

  private renderRssFeedItem(item: IRssFeedItem, index: number) {
    let dateCell = null;
    if (this.props.showTime) {
      const timezone = this.context.settings.timezone;
      const date = moment(item.isoDate).tz(timezone);
      dateCell = <span className="time">{date.format('LT')}</span>;
    }

    const removeItemIndex = this.props.visibleEntries - 1; // 0;
    const newItemIndex = 0; // this.props.visibleEntries - 1;;
    let className = 'feed-item';
    if (index === removeItemIndex) {
      className += ' hide';
    }
    if (index === newItemIndex) {
      className += ' show';
    }
    const animationDelay = (index === removeItemIndex) ? (this.props.scrollDelay - 1) + 's' : undefined;

    return (
      <div key={(item.guid || '') + (item.title || '')} className={className} style={{ animationDelay }}>
        <div className="feed-item-header">
          {dateCell}
          <span className="title">{item.title}</span>
        </div>
        {this.props.showContent && <div className="feed-item-content">{item.contentSnippet || item.content}</div>}
      </div>
    );
  }

  private renderRssFeed() {
    if (!this.state.data) {
      return null;
    }
    const items = this.state.data.items.slice(0, this.props.maxEntries);
    const items1 = items.slice(this.state.position, this.props.visibleEntries);
    const items2 = this.state.position > 0 ? items.slice(0, this.state.position) : [];
    items1.push(...items2);

    return (
      <div className="feed">
        {items1.map(this.renderRssFeedItem)}
      </div>
    );
  }

  private renderHeader() {
    if (!this.props.showHeader) {
      return null;
    }
    return (
      <h2>
        {this.state.data && this.state.data.title}
        {this.state.loading && this.context.renderLoading(undefined, '1x', { display: 'inline-block', marginLeft: '8px' })}
      </h2>
    );
  }

  public render() {
    if (this.state.error) {
      return 'Error: ' + this.state.error;
    }

    if (!this.props.url) {
      return <div>No RSS feed URL specified!</div>;
    }

    return (
      <section className="RssFeed">
        {this.renderHeader()}
        {this.renderRssFeed()}
      </section>
    );
  }
}
