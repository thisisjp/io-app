import React from "react";
import { ScreenHeaderContext } from "../ScreenHeaderContext";
import { ScreenHeaderAnimationProviderContext as InjectWithScreenHeaderAnimationProps } from "../ScreenHeaderAnimationProvider";

export function withScreenHeaderContext<
  P extends InjectWithScreenHeaderAnimationProps
>(WrappedComponent: React.ComponentType<P>) {
  class WithScreenHeaderContext extends React.Component<
    Pick<P, Exclude<keyof P, keyof InjectWithScreenHeaderAnimationProps>>
  > {
    public render() {
      return (
        <ScreenHeaderContext.Consumer>
          {contextProps => (
            <WrappedComponent {...contextProps} {...this.props as P} />
          )}
        </ScreenHeaderContext.Consumer>
      );
    }
  }

  return WithScreenHeaderContext;
}

export default withScreenHeaderContext;
