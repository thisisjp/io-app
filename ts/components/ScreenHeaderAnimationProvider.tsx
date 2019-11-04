import React from "react";
// import { StatusBar } from "react-native";
// import PropTypes from "prop-types";
import ScreenHeaderAnimation, {
  AnimationPropsType
} from "./ScreenHeaderAnimation";
import { ScreenHeaderContext } from "./ScreenHeaderContext";

type Props = {
  currentTab: number;
};

export type ScreenHeaderAnimationProviderContext = {
  animation: AnimationPropsType;
  addHandlerScroll: (tab: number, handler: any) => void;
  _canJumpToTab: (canJumpToTab: boolean) => void;
};

type ScrollHandlerType = { [tab: number]: (offset:number, animation?:boolean) => void };

type State = {
  currentTab: number | null;
  canJumpToTab: boolean;
  contextProvider: ScreenHeaderAnimationProviderContext;
};

export default class ScreenHeaderAnimationProvider extends React.Component<
  Props,
  State
> {
  // screenHeaderAnimation: ScreenHeaderAnimation;

  private _handlersScroll:ScrollHandlerType = {};
  private screenHeaderAnimation = new ScreenHeaderAnimation({
    // @ts-ignore
    scrollToOffset: (configScroll: {
      tab?: number;
      offset: number;
      animated: boolean;
    }) => {
      return
    }
  });

  constructor(props: Props) {
    super(props);

    this.screenHeaderAnimation = new ScreenHeaderAnimation({
      scrollToOffset: (configScroll: {
        tab?: number;
        offset: number;
        animated: boolean;
      }) => {
        let tab = configScroll.tab ? configScroll.tab : this.props.currentTab;

        let scrollToOffset = this._handlersScroll[tab];
        scrollToOffset &&
          scrollToOffset(configScroll.offset, configScroll.animated);
      }
    });

    this.state = {
      currentTab: null,
      canJumpToTab: true,
      contextProvider: {
        animation: this.screenHeaderAnimation.animationProps,
        addHandlerScroll: this._addHandlerScroll,
        _canJumpToTab: this._canJumpToTab
      }
    };
  }

  componentWillUnmount() {
    this.screenHeaderAnimation.destroy();
  }

  _addHandlerScroll = (tab: number, handler: any) => {
    this._handlersScroll[tab] = handler;
  };

  _canJumpToTab = (canJumpToTab: boolean) => this.setState({ canJumpToTab });

  render() {
    return (
      <ScreenHeaderContext.Provider value={this.state.contextProvider}>
        {
          // @ts-ignore
          this.props.children(this.screenHeaderAnimation, {
            canJumpToTab: this.state.canJumpToTab
          })}
        </ScreenHeaderContext.Provider>
    );
  }
}
