import * as pot from "italia-ts-commons/lib/pot";
import {
  // ScrollableTab,
  Tab,
  TabHeading,
  Tabs,
  Text,
  // View,
  DefaultTabBar,
  Button
} from "native-base";
import * as React from "react";
import {
  // Platform,
  StyleSheet
} from "react-native";
// import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";

import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import AnimatedMessagesInbox from "../../components/messages/AnimatedMessagesInbox";
import MessagesSearch from "../../components/messages/MessagesSearch";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import AnimatedTabBar from "../../components/AnimatedTabBar";
import ScreenHeaderAnimationProvider from "../../components/ScreenHeaderAnimationProvider";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  currentTab: number;
  hasRefreshedOnceUp: boolean;
};

export type Style = { [className: string]: string };

type ChangeTabEvent = {
  from: number;
  i: number;
  ref: any;
};
// Scroll range is directly influenced by floating header height
// const SCROLL_RANGE_FOR_ANIMATION =
//   customVariables.appHeaderHeight +
//   (Platform.OS === "ios"
//     ? isIphoneX()
//       ? 18
//       : getStatusBarHeight(true)
//     : customVariables.spacerHeight);

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarContent: {
    fontSize: customVariables.fontSizeSmall
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap eachother, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  searchDisableIcon: {
    color: customVariables.headerFontColor
  }
});

/**
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0,
      // hasRefreshedOnceUp is used to avoid unwanted refresh of
      // animation after a new set of messages is received from
      // backend at first load
      hasRefreshedOnceUp: false
    };
  }

  public componentDidMount() {
    this.props.refreshMessages();
  }

  public componentDidUpdate(prevprops: Props, prevstate: State) {
    // hasRefreshedOnceUp is used to avoid unwanted refresh of
    // animation after a new set of messages is received from
    // backend at first load
    if (
      pot.isLoading(prevprops.lexicallyOrderedMessagesState) &&
      !pot.isLoading(this.props.lexicallyOrderedMessagesState) &&
      !prevstate.hasRefreshedOnceUp
    ) {
      this.setState({ hasRefreshedOnceUp: true });
    }
  }

  private renderAnimatedTabBar = (animation: any, canJumpToTab: boolean) => (
    props: any
  ) => {
    return (
      <AnimatedTabBar
        animation={animation}
        renderTabBar={() => (
          <DefaultTabBar
            renderTab={(
              name: string,
              page: number,
              isTabActive: boolean,
              onPressHandler: (_: number) => void,
              tabStyle: Style,
              activeTabStyle: Style,
              textStyle: Style,
              activeTextStyle: Style,
              // @ts-ignore
              tabHeaderStyle: Style,
              tabFontSize: number
              // tslint:disable: parameters-max-number
            ) => (
              <Button
                style={{ flex: 1 }}
                key={name}
                onPress={() => {
                  if (page !== this.state.currentTab && canJumpToTab) {
                    animation.onTabPress(page);
                  }
                  onPressHandler(page);
                }}
              >
                <TabHeading
                  style={[isTabActive ? activeTabStyle : tabStyle]}
                  // active={props.isTabActive}
                >
                  <Text
                    style={[
                      styles.tabBarContent,
                      { fontSize: tabFontSize },
                      isTabActive ? activeTextStyle : textStyle
                    ]}
                  >
                    {name}
                  </Text>
                </TabHeading>
              </Button>
            )}
            {...props}
          />
        )}
      />
    );
  };

  // private renderTabBar = (canJumpToTab: boolean) => (props: any) => {
  //   return (
  //     <DefaultTabBar
  //       tabs={[
  //         { name: "a", page: 0 },
  //         { name: "b", page: 1 },
  //         { name: "c", page: 2 }
  //         // { name: `${I18n.t("messages.tab.inbox")}`, page: 0 },
  //         // { name: `${I18n.t("messages.tab.deadlines")}`, page: 1 },
  //         // { name: `${I18n.t("messages.tab.archive")}`, page: 2 }
  //       ]}
  //       renderTab={(
  //         name: string,
  //         page: number,
  //         isTabActive: boolean,
  //         onPressHandler: (_: number) => void,
  //         tabStyle: Style,
  //         activeTabStyle: Style,
  //         textStyle: Style,
  //         activeTextStyle: Style,
  //         // @ts-ignore
  //         tabHeaderStyle: Style,
  //         tabFontSize: number
  //       ) => (
  //         <Button
  //           style={{ flex: 1 }}
  //           key={name}
  //           onPress={() => {
  //             onPressHandler(page);
  //           }}
  //         >
  //           <TabHeading
  //             style={[isTabActive ? activeTabStyle : tabStyle]}
  //             // active={props.isTabActive}
  //           >
  //             <Text
  //               style={[
  //                 styles.tabBarContent,
  //                 { fontSize: tabFontSize },
  //                 isTabActive ? activeTextStyle : textStyle
  //               ]}
  //             >
  //               {name}
  //             </Text>
  //           </TabHeading>
  //         </Button>
  //       )}
  //       {...props}
  //     />
  //   );
  // };

  public render() {
    const { isSearchEnabled } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        isSearchAvailable={true}
        searchType="Messages"
        appLogo={true}
        foregroundForAnimation={true}
      >
        {/* <ScreenContentHeader
          title={I18n.t("messages.contentTitle")}
          icon={require("./../../../img/icons/message-icon.png")}
        /> */}
        {isSearchEnabled ? this.renderSearch() : this.renderTabs()}
      </TopScreenComponent>
    );
  }

  /**
   * Render Inbox, Deadlines and Archive tabs.
   */
  private renderTabs = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail,
      updateMessagesArchivedState
    } = this.props;

    return (
      <ScreenHeaderAnimationProvider currentTab={this.state.currentTab}>
        {(animation: any, { canJumpToTab }: { canJumpToTab: boolean }) => (
          <Tabs
            tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
            tabBarUnderlineStyle={styles.tabBarUnderlineActive}
            onChangeTab={(evt: ChangeTabEvent) => {
              this.setState({ currentTab: evt.i });
            }}
            initialPage={0}
            renderTabBar={this.renderAnimatedTabBar(animation, canJumpToTab)}
            // renderTabBar={this.renderTabBar(true)}
          >
            <Tab
              // heading={
              //   <TabHeading>
              //     <Text style={styles.tabBarContent}>
              //       {I18n.t("messages.tab.inbox")}
              //     </Text>
              //   </TabHeading>
              // }
              // heading={"foo"}
              heading={I18n.t("messages.tab.inbox")}
            >
              <AnimatedMessagesInbox
                messagesState={lexicallyOrderedMessagesState}
                servicesById={servicesById}
                paymentsByRptId={paymentsByRptId}
                onRefresh={refreshMessages}
                setMessagesArchivedState={updateMessagesArchivedState}
                navigateToMessageDetail={navigateToMessageDetail}
              />
              {/* <MessagesInbox
                messagesState={lexicallyOrderedMessagesState}
                servicesById={servicesById}
                paymentsByRptId={paymentsByRptId}
                onRefresh={refreshMessages}
                setMessagesArchivedState={updateMessagesArchivedState}
                navigateToMessageDetail={navigateToMessageDetail} /> */}
            </Tab>
            <Tab
              // heading={
              //   <TabHeading>
              //     <Text style={styles.tabBarContent}>
              //       {I18n.t("messages.tab.deadlines")}
              //     </Text>
              //   </TabHeading>
              // }
              // heading={"bar"}
              heading={I18n.t("messages.tab.deadlines")}
            >
              <MessagesDeadlines
                messagesState={lexicallyOrderedMessagesState}
                servicesById={servicesById}
                paymentsByRptId={paymentsByRptId}
                setMessagesArchivedState={updateMessagesArchivedState}
                navigateToMessageDetail={navigateToMessageDetail}
              />
            </Tab>

            <Tab
              // heading={
              //   <TabHeading>
              //     <Text style={styles.tabBarContent}>
              //       {I18n.t("messages.tab.archive")}
              //     </Text>
              //   </TabHeading>
              // }
              // heading={"baz"}
              heading={I18n.t("messages.tab.archive")}
            >
              <MessagesArchive
                messagesState={lexicallyOrderedMessagesState}
                servicesById={servicesById}
                paymentsByRptId={paymentsByRptId}
                onRefresh={refreshMessages}
                setMessagesArchivedState={updateMessagesArchivedState}
                navigateToMessageDetail={navigateToMessageDetail}
              />
            </Tab>
          </Tabs>
        )}
      </ScreenHeaderAnimationProvider>
    );
  };

  /**
   * Render MessageSearch component.
   */
  private renderSearch = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail
    } = this.props;

    return this.props.searchText
      .map(
        _ =>
          _.length < MIN_CHARACTER_SEARCH_TEXT ? (
            <SearchNoResultMessage errorType="InvalidSearchBarText" />
          ) : (
            <MessagesSearch
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              onRefresh={refreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
              searchText={_}
            />
          )
      )
      .getOrElse(<SearchNoResultMessage errorType="InvalidSearchBarText" />);
  };
}

const mapStateToProps = (state: GlobalState) => ({
  lexicallyOrderedMessagesState: lexicallyOrderedMessagesStateSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state),
  searchText: searchTextSelector(state),
  isSearchEnabled: isSearchMessagesEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshMessages: () => {
    dispatch(loadMessages.request());
  },
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesHomeScreen);
