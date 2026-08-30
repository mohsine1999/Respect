import type { PropsWithChildren } from 'react';
import Svg, { Circle as SvgCircle, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from 'tamagui';

export type IconProps = {
  color?: string;
  size?: number;
};

function IconFrame({ color = 'black', size = 24, children }: PropsWithChildren<IconProps>) {
  const theme = useTheme();
  const themeValue = color.startsWith('$')
    ? (theme as unknown as Record<string, { val?: string }>)[color.slice(1)]?.val
    : undefined;
  const stroke = themeValue ?? color;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </IconFrame>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <Path d="m9 18 6-6-6-6" />
    </IconFrame>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <Path d="M8 2v4" />
      <Path d="M16 2v4" />
      <Rect width={18} height={18} x={3} y={4} rx={2} />
      <Path d="M3 10h18" />
      <Path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </IconFrame>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <Line x1={12} x2={12} y1={20} y2={10} />
      <Line x1={18} x2={18} y1={20} y2={4} />
      <Line x1={6} x2={6} y1={20} y2={16} />
    </IconFrame>
  );
}

export function ListChecksIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <Path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8" />
    </IconFrame>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <SvgCircle cx={12} cy={12} r={3} />
    </IconFrame>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <SvgCircle cx={12} cy={12} r={4} />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </IconFrame>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <Path d="M20 6 9 17l-5-5" />
    </IconFrame>
  );
}

export function CircleIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <SvgCircle cx={12} cy={12} r={10} />
    </IconFrame>
  );
}
