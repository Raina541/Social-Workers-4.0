import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Opportunity } from '../services/personalization';
import { Ionicons } from '@expo/vector-icons';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: () => void;
  isDarkMode: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onPress, isDarkMode }) => {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: themeColors.neutralBackground1,
          borderColor: themeColors.neutralStroke2,
        },
        pressed && { backgroundColor: themeColors.neutralBackgroundPressed }
      ]}
    >
      <View style={styles.header}>
        <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, flex: 1 }]} numberOfLines={1}>
          {opportunity.title}
        </Text>
        <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1 }]}>
          {opportunity.isRemote ? 'Remote' : `${opportunity.distanceKm} km`}
        </Text>
      </View>
      
      {opportunity.description && (
        <Text style={[Typography.caption, { color: themeColors.neutralForeground2, marginTop: Spacing.xxs }]} numberOfLines={2}>
          {opportunity.description}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={themeColors.neutralForeground3} style={{ marginRight: 4 }} />
          <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
            {Math.round(opportunity.durationHrs * 60)}m commitment
          </Text>
        </View>
        
        {opportunity.spotsLeft !== undefined && (
          <Text style={[Typography.captionStrong, { color: themeColors.warningForeground1 }]}>
            {opportunity.spotsLeft} spots left
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Shapes.rounded,
    padding: Spacing.s,
    marginBottom: Spacing.s,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
