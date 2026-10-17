declare module "react" {
  export function useState<T>(initial: T): [T, (next: T | ((current: T) => T)) => void];
}

declare module "react-native" {
  type NativeProps = { children?: unknown; [property: string]: unknown };
  export function Pressable(props: NativeProps): JSX.Element;
  export function Text(props: NativeProps): JSX.Element;
  export function View(props: NativeProps): JSX.Element;
  export const StyleSheet: { create<T>(styles: T): T };
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [element: string]: Record<string, unknown>;
  }
}
