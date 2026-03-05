declare module '@hua-labs/ui/native' {
  import type { ViewProps, TextProps as RNTextProps, PressableProps as RNPressableProps, View } from 'react-native';
  import type { ForwardRefExoticComponent, RefAttributes } from 'react';

  type RNStyleObject = Record<string, unknown>;

  interface BoxProps extends Omit<ViewProps, 'style'> {
    dot?: string;
    style?: RNStyleObject | Record<string, unknown>;
  }

  interface TextProps extends Omit<RNTextProps, 'style'> {
    dot?: string;
    style?: RNStyleObject | Record<string, unknown>;
  }

  interface PressableProps extends Omit<RNPressableProps, 'style'> {
    dot?: string;
    style?: RNStyleObject | Record<string, unknown>;
  }

  export const Box: ForwardRefExoticComponent<BoxProps & RefAttributes<View>>;
  export const Text: ForwardRefExoticComponent<TextProps & RefAttributes<View>>;
  export const Pressable: ForwardRefExoticComponent<PressableProps & RefAttributes<View>>;
}
