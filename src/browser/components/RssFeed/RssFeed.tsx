import { IReactronComponentContext, topicNames } from '@schirkan/reactron-interfaces';
import moment from 'moment';
import * as React from 'react';
import { IRssFeedService } from 'src/common/interfaces/IRssFeedService';
import { IRssFeed } from 'src/common/interfaces/IRssFeed';

import './RssFeed.scss';

interface IRssFeedProps {
  url: string;
  showHeader: boolean;
  headerText: string;
}

interface IRssFeedState {
  loading: boolean;
  data?: IRssFeed;
  error?: any;
}

export class RssFeed extends React.Component<IRssFeedProps, IRssFeedState> {
  public context: IReactronComponentContext;

  constructor(props: IRssFeedProps) {
    super(props);
    this.state = { loading: false };
    this.loadData = this.loadData.bind(this);
  }

  public componentDidMount() {
    this.context.topics.subscribe(topicNames.refresh, this.loadData);
    this.loadData();
  }

  public componentWillUnmount() {
    this.context.topics.unsubscribe(topicNames.refresh, this.loadData);
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

  private renderRssFeed() {
    return null;
  }

  private renderHeader() {
    if (!this.props.showHeader) {
      return null;
    }
    return (
      <h2>
        {this.props.headerText}
        {(this.state.loading) && this.context.renderLoading(undefined, '1x', { display: 'inline-block', marginLeft: '8px' })}
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
