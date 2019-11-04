import {
  Animated
  // Platform,
  // StatusBar
} from "react-native";
import { ifIphoneX } from "react-native-iphone-x-helper";
// import { Style } from "../screens/messages/MessagesHomeScreen";

export type AnimationPropsType = {
  initialScroll: number;
  scrollY: Animated.Value;
  fullHeight: number;
  handleIntermediateState: (
    scrollToOffset: (offset: number, animated?: boolean) => void
  ) => void;
};

type State = {
  scrollToOffset: (
    configScroll: {
      offset: number;
      animated: boolean;
      tab?: number;
    }
  ) => void;
};

type ValueListenerCallback = (state: { value: number }) => void;

type BarStateType = "CLAMPED" | "NORMAL";
const CLAMPED = "CLAMPED";
const NORMAL = "NORMAL";

export default class ScreenHeaderAnimation {
  /**
   * SearchBar Sizes
   *
   * SearchBar height consists of nested components
   * See styles /components/SearchBar.js
   *
   * arrowHeight = 36
   * inputHeight = 45
   * tabBarHeight = 45
   * inputPaddingBottom = 3
   * containerPaddingTop = 28
   * containerPaddingBottom = 10
   * locationInputPaddingTop = 10
   *
   * Calculate
   *
   * containerPaddingTop + inputHeight + inputHeight +
   * containerPaddingBottom + arrowHeight +
   * inputPaddingBottom + locationInputPaddingTop = 177 (Wrapper Height)
   *
   * 177 + tabBarHeight = 222 (Full height)
   *
   * HeaderHeight: 72
   * TabBarHeight: 48
   * TopMenuBar: 56
   */

  // private statusBarHeight = 21;
  // // private wrapperHeight = 177;
  // private paddingStatusBar = 41;
  // private arrowHeight = 36 - ifIphoneX(2, 0);
  // private topPartHeight = this.arrowHeight + 45 + 10; // 91 = arrowHeight + inputHeight + padding (Top part)
  // // private fullHeight = this.topPartHeight + 131; // = 222
  // private fullHeight = this.arrowHeight + 131; // = 222
  // // private distanceRange = this.fullHeight - this.topPartHeight;
  // private maxClamp =
  //   this.fullHeight - (this.paddingStatusBar + this.statusBarHeight); // 160
  // private minClamp = this.topPartHeight;
  // // value used in handleIntermediateState
  // private diffClamp = this.maxClamp - this.minClamp;
  // private initialScroll = this.topPartHeight;
  // private maxActionAnimated = 88; // Location input height + padding (Bottom part)
  // private actionAnimated = new Animated.Value(0);
  // private scrollY = new Animated.Value(this.initialScroll);
  // private _clampedScrollValue: number = 0;
  // private clampedScroll: Animated.AnimatedDiffClamp | null = null;
  // private _scrollValue: number = 0;
  // private initialState: State | null = null;
  // // private _statusBarStyle: Style | null = null;
  // private barState: BarStateType = NORMAL;

  private statusBarHeight = 21;
  // private wrapperHeight = 177;
  private paddingStatusBar = 0;
  private arrowHeight = 0; // non esiste
  // topPartHeight è la prima soglia dall'alto della parte mobile che si incontra
  private topPartHeight = this.statusBarHeight + this.arrowHeight + 56; // H barra di stato + 0 + H barra comandi
  // fullHeight arriva fino al fondo del component
  private fullHeight = 72 + 40; // + title header + tab bar
  // private distanceRange = this.fullHeight - this.topPartHeight;
  // maxClamp = limite basso dell'elemento mobile 
  private maxClamp =
    // this.fullHeight - (this.paddingStatusBar + this.statusBarHeight); // 160
    this.topPartHeight + this.fullHeight - 40; // - tab bar height
  // minClamp = limite alto dell'elemento mobile
  // private minClamp = this.topPartHeight;
  private minClamp = 0;
  // value used in handleIntermediateState
  private diffClamp = this.maxClamp - this.minClamp;

  private initialScroll = 0;
  private maxActionAnimated = 88;       // animated value used to scroll to top when tab changes
                                        // Calculated as follows: Location input height + padding (Bottom part)
  private actionAnimated = new Animated.Value(0);
  private scrollY = new Animated.Value(this.initialScroll);
  private _clampedScrollValue: number = 0;
  private clampedScroll: Animated.AnimatedDiffClamp | null = null;
  private _scrollValue: number = 0;
  private initialState: State | null = null;
  // private _statusBarStyle: Style | null = null;
  private barState: BarStateType = NORMAL;

  constructor(initialState: State) {
    this.initialState = initialState;

    this._createClampedScroll();
    this.scrollY.addListener(this._updateScroll);
  }

  public destroy() {
    this.scrollY.removeAllListeners();
  }

  private _updateScroll: ValueListenerCallback = ({ value }: {value:number}) => {
    const diff = value - this._scrollValue; // valore finale - valore iniziale
    // this._scrollValue =                     // prendo il valore di scroll relativo
    //   Math.max(value, this.topPartHeight);  // Fix normal state
    // this._clampedScrollValue = Math.min(
    //   Math.max(this._clampedScrollValue + diff, this.minClamp),
    //   this.maxClamp
    // );
    console.log('_updateScroll > scrollY', value );
    this._scrollValue = value;
    this._clampedScrollValue = value;

    // this._changeStatusBarStyle();
    this._changebarState("_updateScroll");
  };

  private _updateScrollManually = ({ value }: { value: number }) => {
    // value vale sempre o minClamp o maxClamp
    if (value) this._clampedScrollValue = value;

    // this._changeStatusBarStyle();
    this._changebarState("_updateScrollManually");
  };

  /**
   *  Handle scroll values of floating header, bounding list scroll interpolated
   *  values bewteen min and max
   * */
  private _createClampedScroll() {
    // Quest'animazione serve per rivedere subito l'header quando scrollo verso l'alto.
    this.clampedScroll = Animated.diffClamp(
      this.scrollY
        // .interpolate({
        //   // Only positive values
        //   // Identity is used to follow only positive variations
        //   inputRange: [0, 1],
        //   outputRange: [0, 1],
        //   extrapolateLeft: "clamp"
        // })
        // .interpolate({
        //   // This interpolation lets the header and the list scroll at the same
        //   // speed so that the first element to scroll out is the header disappearing
        //   // inputRange: [0, this.topPartHeight],
        //   inputRange: [0, 72],
        //   // outputRange: [this.topPartHeight, this.topPartHeight],
        //   outputRange: [72, 72],
        //   extrapolate: "identity"
        // })
        ,
      72,
      144
      // this.minClamp,
      // this.maxClamp
    );
  }

  // serve a ripristinare il valore della status bar
  // _setbarState(state) {
  private _resetBar() {

    this._setBar(40);

    // Animated.timing(this.actionAnimated, {
    //   toValue: 40,
    //   // toValue: this.maxActionAnimated,
    //   duration: 250,
    //   useNativeDriver: true
    // }).start();

    // this.barState = NORMAL;
  }

  private _setBar(val: number) {
    Animated.timing(this.actionAnimated, {
      toValue: val,
      // toValue: this.maxActionAnimated,
      duration: 250,
      useNativeDriver: true
    }).start();

    // this.barState = NORMAL;
  }

  /**
   * Handle the header state in relation to the scroll position
   */
  private _changebarState(callee?:string) {
    let newState: BarStateType | undefined = undefined;
    let clampedValue = Math.round(this._clampedScrollValue);
    callee && console.log('callee', callee);
    console.log('this._clampedScrollValue', this._clampedScrollValue);
    console.log('clampedValue', clampedValue);
    // @ts-ignore
    console.log('Math.round(this.scrollY._value) < this.topPartHeight', Math.round(this.scrollY._value) < this.topPartHeight);
    // @ts-ignore
    console.log('this.scrollY._value, this.topPartHeight', this.scrollY._value, this.topPartHeight);
    // @ts-ignore
    // if (Math.round(this.scrollY._value) < this.topPartHeight) {
      //   newState = types.EXPANDED;
      // } else 
    if(clampedValue === this.minClamp) {
      newState = NORMAL;
    } else if (clampedValue === this.maxClamp) {
      newState = CLAMPED;
    }
    console.log('newState', newState);
      
    if (newState !== undefined && newState !== this.barState) {
      this.barState = newState;
    }
  }

  // serve a cambiare il colore della status bar di android
  // _changeStatusBarStyle() {
  //   let statusBarStyle =
  //     Math.round(this._clampedScrollValue) != this.maxClamp
  //       ? "light-content"
  //       : "dark-content";

  //   if (statusBarStyle != this._statusBarStyle) {
  //     StatusBar.setBarStyle(statusBarStyle);
  //     this._statusBarStyle = statusBarStyle;
  //   }
  // }

  _handleIntermediateState = (
    scrollToOffset: (offset: number, animated?: boolean) => void
  ) => {
    // // @ts-ignore
    // let scrollY = this.scrollY._value;
    // if (scrollY < this.topPartHeight) {
    //   // Full
    //   scrollToOffset(
    //     scrollY > this.topPartHeight / 2 ? this.topPartHeight : 0,
    //     false
    //   );
    // } else {
    //   // Clamped
    //   if (
    //     this._clampedScrollValue < this.maxClamp &&
    //     this._clampedScrollValue > this.minClamp
    //   ) {
    //     let scrollTo;
    //     if (this._clampedScrollValue > (this.maxClamp + this.minClamp) / 2) {
    //       scrollTo =
    //         scrollY +
    //         this._interpolate(
    //           this._clampedScrollValue,
    //           [this.maxClamp, this.minClamp],
    //           [0, this.diffClamp]
    //         );
    //     } else {
    //       scrollTo =
    //         scrollY -
    //         this._interpolate(
    //           this._clampedScrollValue,
    //           [this.minClamp, this.maxClamp],
    //           [0, this.diffClamp]
    //         );
    //     }

    //     scrollToOffset(scrollTo, false);
    //   }
    // }
  };

  // custom linear interpolation
  private _interpolate = (
    x: number,
    inputRange: number[],
    outputRange: number[]
  ) => {
    let minX = inputRange[0];
    let maxX = inputRange[1];
    let minY = outputRange[0];
    let maxY = outputRange[1];

    return (x - minX) * ((maxY - minY) / (maxX - minX) + minY);
  };

  public onTabPress = (page: number) => {
    let offset: number =
      this.barState === NORMAL
        ? this.minClamp
        : this.barState === CLAMPED
          ? this.maxClamp
          : 0;

    this.initialState &&
      this.initialState.scrollToOffset({
        offset: offset,
        animated: false,
        tab: page
      });

    this.scrollY.setValue(offset);
    this._createClampedScroll();
    this._updateScrollManually({ value: offset });

    // this._resetBar(); // TODO: testare se funziona
  };

  // scrollToOffset(offset: number, animated: boolean) {
  //   // @ts-ignore
  //   if (offset != this.scrollY._value) {
  //     this.initialState &&
  //       this.initialState.scrollToOffset({
  //         offset,
  //         animated
  //       });
  //   }
  // }

  // Object exported and shared by contextProvider
  public animationProps: AnimationPropsType = {
    initialScroll: this.initialScroll,
    scrollY: this.scrollY,
    fullHeight: this.fullHeight,
    handleIntermediateState: this._handleIntermediateState
  };

  /**
   * Shifts up the whole header
   */
  public getTransformWrapper() {
    console.log('this.clampedScroll', this.clampedScroll);
    let byScroll = 
    // this.clampedScroll
    //   ? Animated.add(
    //       Animated.multiply(this.clampedScroll, -1),
    //       this.scrollY
    //         .interpolate({
    //           inputRange: [0, 1],
    //           outputRange: [0, -1]
    //         })
    //         .interpolate({
    //           inputRange: [-this.topPartHeight, 0],
    //           outputRange: [0, this.minClamp],
    //           extrapolate: "clamp"
    //         })

    //       // this.minClamp

    //       // this.scrollY
    //       //   .interpolate({
    //       //     inputRange: [0, 1],
    //       //     outputRange: [0, -1]
    //       //   })
    //       //   .interpolate({
    //       //     inputRange: [-this.topPartHeight, 0],
    //       //     outputRange: [0, this.minClamp],
    //       //     extrapolate: "clamp"
    //       //   })

    //     )
    //   : 
      new Animated.Value(0);

    return {
      transform: [
        {
          // adds possibile animation of changing tab
          translateY: Animated.add(byScroll, this.actionAnimated)
        }
      ]
    };
  }

  /**
   * Shift the header title bar
   */
  public getTransformSearchBar() {
    return {
      transform: [
        {
          translateY: 
          // Animated.add(
            // this.actionAnimated
            // .interpolate({
            //   inputRange: [0, this.maxActionAnimated],
            //   outputRange: [0, -this.topPartHeight + this.arrowHeight],
            //   extrapolate: "clamp"
            // })
            // ,
            this.scrollY
            .interpolate({
              inputRange: [0, this.topPartHeight], 
              outputRange: [0, this.topPartHeight - this.arrowHeight],
              extrapolate: "clamp"
            })
          // )
        }
      ]
    };
  }

  /**
   * Make the header title disappear when collapsed
   */
  public getOpacitySearchBar() {
    // if (this.clampedScroll)
    //   return {
    //     opacity: this.clampedScroll.interpolate({
    //       inputRange: [0, this.maxClamp],
    //       // inputRange: [this.topPartHeight, this.maxClamp],
    //       outputRange: [1, 0],
    //       extrapolate: "clamp"
    //     })
    //   };
    // else
      return {
        opacity: 1
      };
  }

  // getStyleSuggestion() {
  //   let scroll = this.scrollY.interpolate({
  //     // To negative
  //     inputRange: [0, 1],
  //     outputRange: [0, -1]
  //   });

  //   return {
  //     opacity: Animated.add(
  //       this.actionAnimated.interpolate({
  //         inputRange: [0, this.maxActionAnimated],
  //         outputRange: [0, 1],
  //         extrapolate: "clamp"
  //       }),
  //       scroll.interpolate({
  //         inputRange: [-this.topPartHeight, 0],
  //         outputRange: [0, 1],
  //         extrapolate: "clamp"
  //       })
  //     ),
  //     transform: [
  //       {
  //         translateY: Animated.add(
  //           this.actionAnimated.interpolate({
  //             inputRange: [0, this.maxActionAnimated],
  //             outputRange: [0, this.topPartHeight + ifIphoneX(10, 0)],
  //             extrapolate: "clamp"
  //           }),
  //           scroll.interpolate({
  //             inputRange: [-this.topPartHeight, 0],
  //             outputRange: [
  //               this.topPartHeight,
  //               this.wrapperHeight + ifIphoneX(11, 0)
  //             ],
  //             extrapolate: "clamp"
  //           })
  //         )
  //       }
  //     ]
  //   };
  // }
}
