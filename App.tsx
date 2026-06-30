import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography, Shapes } from './constants/Theme';
import { PresenceState } from './components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screen Sections
import { Home } from './screens/Home';
import { Feed, Opportunity as FeedOpportunity } from './screens/Feed';
import { Community } from './screens/Community';
import { Blog } from './screens/Blog';
import { Profile } from './screens/Profile';
import { HandshakeHeartIcon } from './components/HandshakeHeartIcon';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { Personalization } from './services/personalization';
import { AuthFlow } from './screens/auth-onboarding/AuthFlow';
import { NgoDetail } from './screens/NgoDetail';

// screenWidth is now resolved dynamically using useWindowDimensions() inside MainLayout

type IconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  name: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ScrapbookThemeProvider } from './context/ScrapbookThemeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrapbookThemeProvider>
        <SafeAreaProvider>
          <MainLayout />
        </SafeAreaProvider>
      </ScrapbookThemeProvider>
    </GestureHandlerRootView>
  );
}

function MainLayout() {
  const { width: screenWidth } = useWindowDimensions();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [presence, setPresence] = useState<PresenceState>('Available');
  const [activeTab, setActiveTab] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(Personalization.getNotifications().filter(n => n.unread).length);
  const [parentScrollEnabled, setParentScrollEnabled] = useState(true);
  const [feedActiveMode, setFeedActiveMode] = useState<'In-person' | 'Online' | 'Micro volunteering'>('In-person');
  const [feedTimeFilter, setFeedTimeFilter] = useState<number | undefined>(undefined);
  const [selectedOpportunity, setSelectedOpportunity] = useState<FeedOpportunity | null>(null);
  const [feedActiveDomainId, setFeedActiveDomainId] = useState<string | undefined>(undefined);
  const [selectedNgoName, setSelectedNgoName] = useState<string | null>(null);

  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const tabs: TabConfig[] = [
    { name: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
    { name: 'Opportunities', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
    { name: 'Community', activeIcon: 'people', inactiveIcon: 'people-outline' },
    { name: 'Blog', activeIcon: 'book', inactiveIcon: 'book-outline' },
    { name: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
  ];

  // Navigate to a specific section tab
  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    if (index !== activeTab && index >= 0 && index < tabs.length) {
      setActiveTab(index);
    }
  };

  // Check first-launch/onboarding status from AsyncStorage on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('@has_onboarded');
        if (value === 'true') {
          setIsOnboarded(true);
          const cachedUser = await AsyncStorage.getItem('@user_data');
          if (cachedUser) {
            setUserData(JSON.parse(cachedUser));
          }
        } else {
          setIsOnboarded(false);
        }
      } catch (e) {
        setIsOnboarded(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  const handleAuthComplete = async (user: any) => {
    try {
      await AsyncStorage.setItem('@has_onboarded', 'true');
      await AsyncStorage.setItem('@user_data', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save onboarding status', e);
    }
    setUserData(user);
    setIsOnboarded(true);
    // Use setTimeout to ensure ScrollView layout has updated and loaded before scrolling
    setTimeout(() => {
      handleTabPress(0);
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@has_onboarded');
      await AsyncStorage.removeItem('@user_data');
    } catch (e) {
      console.warn('Failed to clear onboarding status', e);
    }
    setUserData(null);
    setIsOnboarded(false);
    setActiveTab(0);
  };

  // If status is checking, show loading indicator
  if (isOnboarded === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.neutralBackground1 }}>
        <ActivityIndicator size="large" color={themeColors.brandForeground1} />
      </View>
    );
  }

  // If not onboarded, show Onboarding AuthFlow screen
  if (!isOnboarded) {
    return (
      <AuthFlow
        isDarkMode={isDarkMode}
        onAuthComplete={handleAuthComplete}
      />
    );
  }

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: themeColors.neutralBackground1,
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: themeColors.neutralBackground1,
            borderBottomColor: themeColors.neutralStroke2,
          },
        ]}
      >
        <View style={styles.logoRow}>
          <HandshakeHeartIcon size={24} color={themeColors.brandForeground1} style={styles.logoIcon} />
          <Text style={[styles.logoText, { color: themeColors.brandForeground1 }]}>
            SocialWorkers
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable onPress={() => setIsNotificationsOpen(true)} style={styles.notificationBell}>
            <Ionicons name="notifications-outline" size={22} color={themeColors.neutralForeground1} />
            {unreadCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: themeColors.brandForeground1 }]} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Swipeable Pager Area */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={parentScrollEnabled}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        bounces={false}
        overScrollMode="never"
        style={styles.pager}
      >
        <View style={[styles.page, { width: screenWidth }]}>
          <Home
            isDarkMode={isDarkMode}
            activeTab={activeTab}
            userData={userData}
            onNavigateToTab={handleTabPress}
            onSelectFeedMode={(mode, timeFilter, domainId) => {
              setFeedActiveMode(mode);
              setFeedTimeFilter(timeFilter);
              setFeedActiveDomainId(domainId);
            }}
            onSelectOpportunity={setSelectedOpportunity}
            onViewNgo={(name) => setSelectedNgoName(name)}
          />
        </View>
        
        <View style={[styles.page, { width: screenWidth }]}>
          <Feed
            isDarkMode={isDarkMode}
            activeMode={feedActiveMode}
            onChangeActiveMode={(mode) => {
              setFeedActiveMode(mode);
              setFeedTimeFilter(undefined);
              setFeedActiveDomainId(undefined);
            }}
            timeFilter={feedTimeFilter}
            onChangeTimeFilter={setFeedTimeFilter}
            selectedOpportunity={selectedOpportunity}
            onSelectOpportunity={setSelectedOpportunity}
            activeDomainId={feedActiveDomainId}
            onChangeActiveDomainId={setFeedActiveDomainId}
            onViewNgo={(name) => setSelectedNgoName(name)}
          />
        </View>
        
        <View style={[styles.page, { width: screenWidth }]}>
          <Community isDarkMode={isDarkMode} setParentScrollEnabled={setParentScrollEnabled} />
        </View>
        
        <View style={[styles.page, { width: screenWidth }]}>
          <Blog
            isDarkMode={isDarkMode}
            setParentScrollEnabled={setParentScrollEnabled}
            onViewNgo={(name) => setSelectedNgoName(name)}
            userData={userData}
          />
        </View>
        
        <View style={[styles.page, { width: screenWidth }]}>
          <Profile
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            presence={presence}
            onChangePresence={setPresence}
            userData={userData}
            onLogout={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: themeColors.neutralBackground1,
            borderTopColor: themeColors.neutralStroke2,
            paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.s,
            paddingTop: Spacing.xxs,
          },
        ]}
      >
        {tabs.map((tab, index) => {
          const isSelected = activeTab === index;
          // Distribute horizontal space dynamically: give Opportunities (index 1) and Community (index 2) more space
          const flexWeights = [0.85, 1.4, 1.1, 0.85, 0.8];
          const tabFlex = flexWeights[index];

          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(index)}
              style={[styles.tabItem, { flex: tabFlex }]}
            >
              {/* Active Tab Accent Line */}
              <View
                style={[
                  styles.tabAccentLine,
                  {
                    backgroundColor: isSelected ? themeColors.brandForeground1 : 'transparent',
                  },
                ]}
              />

              <View style={styles.tabContent}>
                <Ionicons
                  name={isSelected ? tab.activeIcon : tab.inactiveIcon}
                  size={22}
                  color={isSelected ? themeColors.brandForeground1 : themeColors.neutralForeground3}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected ? Typography.captionStrong : Typography.caption,
                    {
                      color: isSelected ? themeColors.brandForeground1 : themeColors.neutralForeground3,
                      marginTop: 2,
                    },
                  ]}
                >
                  {tab.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {/* Notifications Screen Overlay Modal */}
      {isNotificationsOpen && (
        <Modal
          visible={isNotificationsOpen}
          animationType="slide"
          onRequestClose={() => setIsNotificationsOpen(false)}
        >
          <NotificationsScreen
            isDarkMode={isDarkMode}
            onBack={() => setIsNotificationsOpen(false)}
            onUnreadCountChange={setUnreadCount}
            onViewIdea={(ideaId) => {
              setIsNotificationsOpen(false);
              handleTabPress(2);
            }}
          />
        </Modal>
      )}

      {/* NGO Detail Screen Overlay Modal */}
      {selectedNgoName && (
        <Modal
          visible={!!selectedNgoName}
          animationType="slide"
          onRequestClose={() => setSelectedNgoName(null)}
        >
          <NgoDetail
            ngoName={selectedNgoName}
            isDarkMode={isDarkMode}
            onBack={() => setSelectedNgoName(null)}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    marginRight: Spacing.s,
    padding: Spacing.xxs,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingVertical: Spacing.xxs,
  },
  tabAccentLine: {
    height: 3,
    width: '50%',
    borderBottomLeftRadius: 1.5,
    borderBottomRightRadius: 1.5,
    position: 'absolute',
    top: 0,
  },
  tabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 9.5,
    letterSpacing: -0.15,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  notificationBell: {
    position: 'relative',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
