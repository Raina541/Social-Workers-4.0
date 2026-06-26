import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Theme';

interface RelaxedVolunteerIllustrationProps {
  isDarkMode?: boolean;
  style?: any;
}

export const RelaxedVolunteerIllustration: React.FC<RelaxedVolunteerIllustrationProps> = ({ isDarkMode = false, style }) => {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.neutralBackground2 }, style]}>
      <Ionicons name="accessibility-outline" size={64} color={themeColors.brandForeground1} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: '100%',
    height: 150,
  }
});
