// tslint:disable:readonly-array

import * as React from "react";
import { Effect } from "redux-saga";

export type SagaCallReturnType<
  T extends (...args: any[]) => any,
  R = ReturnType<T>
> = R extends Iterator<infer B | Effect>
  ? B
  : R extends IterableIterator<infer B1 | Effect>
    ? B1
    : R extends Promise<infer B2> ? B2 : never;

export type ExtractProps<C extends React.Component> = C extends React.Component<
  infer P
>
  ? P
  : never;
