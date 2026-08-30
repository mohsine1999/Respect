import { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { evaluateAdEligibility } from './eligibility';
import { useMonetization } from './MonetizationProvider';
import type { AdPlacement } from './types';

export interface AdSlotProps {
  placement: AdPlacement;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AdSlot({ placement, style, testID }: AdSlotProps) {
  const { adapter, config, viewer } = useMonetization();
  const [width, setWidth] = useState(0);
  const eligibility = evaluateAdEligibility({ config, placement, viewer });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredWidth = Math.max(0, Math.floor(event.nativeEvent.layout.width));
    setWidth((currentWidth) => (currentWidth === measuredWidth ? currentWidth : measuredWidth));
  }, []);

  if (!eligibility.eligible) return null;

  const Banner = adapter.Banner;
  return (
    <View collapsable={false} onLayout={handleLayout} style={[styles.slot, style]} testID={testID}>
      {width > 0 ? <Banner placement={placement} width={width} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
