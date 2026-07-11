import 'csstype';

declare module '*.css' {}

declare module 'csstype' {
  interface Properties {
    [index: `--${string}`]: string | number | undefined;
  }
}
