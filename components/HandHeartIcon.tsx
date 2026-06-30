import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HandHeartIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
  style?: any;
}

/**
 * A custom SVG icon matching the Lucide React "HandHeart" concept:
 * a stylised hand offering a small heart above the palm.
 * Supports filled (active) and outline (inactive) variants.
 */
export const HandHeartIcon: React.FC<HandHeartIconProps> = ({
  size = 24,
  color = '#0f6cbd',
  filled = false,
  style,
}) => {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Heart above palm */}
        <Path
          d="M12 5.5C12 4.12 13.12 3 14.5 3c.97 0 1.82.55 2.24 1.36A2.49 2.49 0 0 1 19 3c1.38 0 2.5 1.12 2.5 2.5 0 2.56-3.5 4.5-5.25 5.5C14.5 10 11 8.06 11 5.5h1z"
          fill={filled ? color : 'none'}
          stroke={color}
          strokeWidth={filled ? 0 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hand / palm */}
        <Path
          d="M2 14l4-1V9a1 1 0 0 1 2 0v6l5.34 1.78a1.98 1.98 0 0 1 1.36 1.42l.3 1.3a.5.5 0 0 1-.48.62H6.84a2 2 0 0 1-1.5-.68L2 14z"
          fill={filled ? color : 'none'}
          stroke={color}
          strokeWidth={filled ? 0 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};
