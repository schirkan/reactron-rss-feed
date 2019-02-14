System.register(['@schirkan/reactron-interfaces', 'moment', 'react'], function (exports, module) {
    'use strict';
    var topicNames, moment, Component, createElement;
    return {
        setters: [function (module) {
            topicNames = module.topicNames;
        }, function (module) {
            moment = module.default;
        }, function (module) {
            Component = module.Component;
            createElement = module.createElement;
        }],
        execute: function () {

            /*! *****************************************************************************
            Copyright (c) Microsoft Corporation. All rights reserved.
            Licensed under the Apache License, Version 2.0 (the "License"); you may not use
            this file except in compliance with the License. You may obtain a copy of the
            License at http://www.apache.org/licenses/LICENSE-2.0

            THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
            KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
            WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
            MERCHANTABLITY OR NON-INFRINGEMENT.

            See the Apache Version 2.0 License for specific language governing permissions
            and limitations under the License.
            ***************************************************************************** */

            function __awaiter(thisArg, _arguments, P, generator) {
                return new (P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                    function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            }

            function styleInject(css, ref) {
              if ( ref === void 0 ) ref = {};
              var insertAt = ref.insertAt;

              if (!css || typeof document === 'undefined') { return; }

              var head = document.head || document.getElementsByTagName('head')[0];
              var style = document.createElement('style');
              style.type = 'text/css';

              if (insertAt === 'top') {
                if (head.firstChild) {
                  head.insertBefore(style, head.firstChild);
                } else {
                  head.appendChild(style);
                }
              } else {
                head.appendChild(style);
              }

              if (style.styleSheet) {
                style.styleSheet.cssText = css;
              } else {
                style.appendChild(document.createTextNode(css));
              }
            }

            var css = "@-webkit-keyframes hide-feed-item {\n  0% {\n    max-height: 10em; }\n  50% {\n    opacity: 1; }\n  100% {\n    max-height: 0;\n    opacity: 0; } }\n\n@keyframes hide-feed-item {\n  0% {\n    max-height: 10em; }\n  50% {\n    opacity: 1; }\n  100% {\n    max-height: 0;\n    opacity: 0; } }\n\n@-webkit-keyframes show-feed-item {\n  0% {\n    max-height: 0;\n    opacity: 0; }\n  50% {\n    opacity: 1; }\n  100% {\n    max-height: 10em;\n    opacity: 1; } }\n\n@keyframes show-feed-item {\n  0% {\n    max-height: 0;\n    opacity: 0; }\n  50% {\n    opacity: 1; }\n  100% {\n    max-height: 10em;\n    opacity: 1; } }\n\nsection.RssFeed .feed {\n  overflow: hidden; }\n  section.RssFeed .feed .feed-item {\n    overflow: hidden; }\n    section.RssFeed .feed .feed-item.hide {\n      -webkit-animation: hide-feed-item 1s;\n              animation: hide-feed-item 1s; }\n    section.RssFeed .feed .feed-item.show {\n      -webkit-animation: show-feed-item 1s;\n              animation: show-feed-item 1s; }\n    section.RssFeed .feed .feed-item .feed-item-header {\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis; }\n      section.RssFeed .feed .feed-item .feed-item-header .time {\n        margin-right: 8px; }\n    section.RssFeed .feed .feed-item .feed-item-content {\n      margin-left: 1em;\n      margin-bottom: 0.8em;\n      margin-top: 0.4em;\n      position: relative; }\n      section.RssFeed .feed .feed-item .feed-item-content::before {\n        content: ' ';\n        height: 100%;\n        border: 0.1em #fff solid;\n        border-radius: 0.2em;\n        position: absolute;\n        margin-left: -0.6em;\n        box-sizing: border-box; }\n";
            styleInject(css);

            class RssFeed extends Component {
                constructor(props) {
                    super(props);
                    this.state = { loading: false, position: 0 };
                    this.loadData = this.loadData.bind(this);
                    this.renderRssFeedItem = this.renderRssFeedItem.bind(this);
                    this.scrollToNext = this.scrollToNext.bind(this);
                }
                componentDidMount() {
                    this.context.topics.subscribe(topicNames.refresh, this.loadData);
                    this.loadData();
                    this.timer = window.setInterval(this.scrollToNext, this.props.scrollDelay * 1000);
                }
                componentWillUnmount() {
                    this.context.topics.unsubscribe(topicNames.refresh, this.loadData);
                    window.clearInterval(this.timer);
                }
                componentDidUpdate(prevProps) {
                    if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
                        this.loadData();
                    }
                }
                loadData() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const service = yield this.context.getService('RssFeedService');
                        if (service) {
                            this.setState({ loading: true });
                            try {
                                const data = yield service.getFeedEntries(this.props.url);
                                this.setState({ data, loading: false });
                            }
                            catch (error) {
                                this.setState({ error, loading: false });
                            }
                        }
                    });
                }
                scrollToNext() {
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
                renderRssFeedItem(item, index) {
                    let dateCell = null;
                    if (this.props.showTime) {
                        const timezone = this.context.settings.timezone;
                        const date = moment(item.isoDate).tz(timezone);
                        dateCell = createElement("span", { className: "time" }, date.format('LT'));
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
                    return (createElement("div", { key: (item.guid || '') + (item.title || ''), className: className, style: { animationDelay } },
                        createElement("div", { className: "feed-item-header" },
                            dateCell,
                            createElement("span", { className: "title" }, item.title)),
                        this.props.showContent && createElement("div", { className: "feed-item-content" }, item.contentSnippet || item.content)));
                }
                renderRssFeed() {
                    if (!this.state.data) {
                        return null;
                    }
                    const items = this.state.data.items.slice(0, this.props.maxEntries);
                    const items1 = items.slice(this.state.position, this.props.visibleEntries);
                    const items2 = this.state.position > 0 ? items.slice(0, this.state.position) : [];
                    items1.push(...items2);
                    return (createElement("div", { className: "feed" }, items1.map(this.renderRssFeedItem)));
                }
                renderHeader() {
                    if (!this.props.showHeader) {
                        return null;
                    }
                    return (createElement("h2", null,
                        this.state.data && this.state.data.title,
                        this.state.loading && this.context.renderLoading(undefined, '1x', { display: 'inline-block', marginLeft: '8px' })));
                }
                render() {
                    if (this.state.error) {
                        return 'Error: ' + this.state.error;
                    }
                    if (!this.props.url) {
                        return createElement("div", null, "No RSS feed URL specified!");
                    }
                    return (createElement("section", { className: "RssFeed" },
                        this.renderHeader(),
                        this.renderRssFeed()));
                }
            } exports('RssFeed', RssFeed);

            const components = exports('components', [{
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
                }]);

        }
    };
});
//# sourceMappingURL=bundle.browser.js.map
