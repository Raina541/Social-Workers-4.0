import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

interface MicroVolunteeringProps {
  isDarkMode: boolean;
  onBack: () => void;
}

export const MicroVolunteering: React.FC<MicroVolunteeringProps> = ({ isDarkMode, onBack }) => {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.neutralBackground2 }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.neutralStroke2, backgroundColor: themeColors.neutralBackground1 }]}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.neutralForeground1} />
        </Pressable>
        <Text style={[Typography.bodyStrong, styles.headerTitle, { color: themeColors.neutralForeground1 }]}>
          Micro Volunteering
        </Text>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="flash-outline" size={48} color={themeColors.brandForeground1} />
        <Text style={[Typography.subtitle, { color: themeColors.neutralForeground1, marginTop: Spacing.s }]}>
          Short Tasks, Big Impact
        </Text>
        <Text style={[Typography.body, { color: themeColors.neutralForeground3, textAlign: 'center', marginTop: Spacing.xs, paddingHorizontal: Spacing.m }]}>
          Micro-volunteering allows you to help out with quick tasks that take less than 30 minutes. Complete small tasks and earn responder badges!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.s,
    padding: Spacing.xxs,
  },
  headerTitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.l,
  }
});
