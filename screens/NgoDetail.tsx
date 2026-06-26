import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  Alert,
  Platform,
  Vibration,
} from 'react-native';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { getOrCreateNgoProfile, NGOProfile, ActiveListing, PastEvent, IdeaThread } from '../services/ngoData';
import { Personalization, MOCK_FRIENDS, CauseType } from '../services/personalization';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Sub-component to highlight matched characters in search
interface HighlightTextProps {
  text: string;
  highlight: string;
  style?: any;
  highlightStyle?: any;
}

const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  style,
  highlightStyle,
}) => {
  const cleanHighlight = highlight.replace(/^@/, '').trim();
  if (!cleanHighlight) {
    return <Text style={style}>{text}</Text>;
  }

  const escapedHighlight = cleanHighlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === cleanHighlight.toLowerCase();
        return (
          <Text key={index} style={isMatch ? [highlightStyle, { fontWeight: 'bold' }] : null}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

// Skeleton Placeholder Row component for loading state
interface SkeletonRowProps {
  themeColors: any;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ themeColors }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.neutralStroke2,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: themeColors.neutralStroke2,
          opacity: 0.6,
        }}
      />
      <View style={{ flex: 1, marginLeft: Spacing.s }}>
        <View
          style={{
            height: 12,
            width: '60%',
            backgroundColor: themeColors.neutralStroke2,
            borderRadius: 6,
            marginBottom: 6,
            opacity: 0.6,
          }}
        />
        <View
          style={{
            height: 10,
            width: '40%',
            backgroundColor: themeColors.neutralStroke2,
            borderRadius: 5,
            opacity: 0.6,
          }}
        />
      </View>
    </View>
  );
};

// Odometer Rolling Number Component
interface OdometerTextProps {
  value: number;
  style?: any;
}

const OdometerText: React.FC<OdometerTextProps> = ({ value, style }) => {
  const [prevVal, setPrevVal] = useState(value);
  const [currVal, setCurrVal] = useState(value);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value !== currVal) {
      setPrevVal(currVal);
      setCurrVal(value);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  if (prevVal === currVal) {
    return <Text style={style}>{currVal}</Text>;
  }

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });

  return (
    <View style={{ height: 22, overflow: 'hidden' }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Text style={[style, { height: 22, lineHeight: 22 }]}>{prevVal}</Text>
        <Text style={[style, { height: 22, lineHeight: 22 }]}>{currVal}</Text>
      </Animated.View>
    </View>
  );
};

// Interactive Support Button Component with scale spring pop animation
interface SupportButtonProps {
  ideaId: string;
  initialCount: number;
  hasSupported: boolean;
  onPress: () => void;
  isDarkMode: boolean;
  themeColors: any;
}

const SupportButton: React.FC<SupportButtonProps> = ({
  ideaId,
  initialCount,
  hasSupported,
  onPress,
  isDarkMode,
  themeColors,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const currentCount = initialCount + (hasSupported ? 1 : 0);
  const supportTaps = Personalization.getSupportTapsCount();
  const showLabel = supportTaps < 3;

  const handlePress = () => {
    // Heart scale animation: 1 -> 1.3 -> 1
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        friction: 8,
        tension: 15,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.0,
        useNativeDriver: true,
        friction: 8,
        tension: 15,
      }),
    ]).start();

    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        borderColor: themeColors.brandForeground1,
        borderWidth: 1.5,
        backgroundColor: hasSupported ? themeColors.brandBackgroundSubtle : 'transparent',
        paddingHorizontal: Spacing.s + 4,
        height: 44, // Tap target >= 44px
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
      }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={hasSupported ? "heart" : "heart-outline"}
          size={20}
          color={themeColors.brandForeground1}
        />
      </Animated.View>
      
      {showLabel && (
        <Text style={{ color: themeColors.brandForeground1, marginLeft: 6, fontSize: 13, fontWeight: '600' }}>
          Support
        </Text>
      )}

      {showLabel && (
        <Text style={{ color: themeColors.brandForeground1, marginHorizontal: 4 }}>·</Text>
      )}

      <OdometerText
        value={currentCount}
        style={{
          color: themeColors.brandForeground1,
          fontWeight: '600',
          fontSize: 17, // ~16-18px semibold
          marginLeft: showLabel ? 0 : 6,
        }}
      />
    </Pressable>
  );
};

interface NgoDetailProps {
  ngoName: string;
  isDarkMode?: boolean;
  onBack: () => void;
}

export function NgoDetail({ ngoName, isDarkMode = false, onBack }: NgoDetailProps) {
  const profile: NGOProfile = getOrCreateNgoProfile(ngoName);
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  // Primary Accent Color based on cause category
  const primaryCause = profile.causes[0] || 'Education';
  const getCauseColor = (cause: string) => {
    if (cause.includes('Environment')) return '#107c41'; // Green
    if (cause.includes('Health')) return '#c41818'; // Red
    if (cause.includes('Poverty') || cause.includes('Hunger')) return '#d86109'; // Orange
    if (cause.includes('Women')) return '#e91e63'; // Pink
    if (cause.includes('Disaster')) return '#ff9800'; // Amber
    if (cause.includes('Animal')) return '#7a7574'; // Grey
    return '#0f6cbd'; // Default Blue
  };
  const accentColor = getCauseColor(primaryCause);

  // States
  const [isLiked, setIsLiked] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  // Toast state
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState<{ message: string; onUndo: () => void } | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  
  // Testimonial Collapsed States
  const [collapsedTestimonials, setCollapsedTestimonials] = useState<Record<string, boolean>>({
    '0': false, // Ritika M is expanded by default as shown in Frame 99.jpg
    '1': true,  // Devansh K is collapsed by default as shown in Frame 99.jpg
    '2': true,
  });

  // Photo Gallery Modal States
  const [activeGallery, setActiveGallery] = useState<string[] | null>(null);

  // Listing Detail Modal States
  const [selectedListing, setSelectedListing] = useState<ActiveListing | null>(null);

  // Past Event detail Modal
  const [selectedPastEvent, setSelectedPastEvent] = useState<PastEvent | null>(null);
  const [showAllPastEvents, setShowAllPastEvents] = useState(false);

  // Ideas List & Local Pitching States
  const [ideas, setIdeas] = useState<IdeaThread[]>(profile.ideas);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [pitchText, setPitchText] = useState('');
  const [supportState, setSupportState] = useState<Record<string, boolean>>({});

  // Friend picker states for Idea Threads
  const [pickerIdeaId, setPickerIdeaId] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoadingPickerResults, setIsLoadingPickerResults] = useState(false);
  const [accessibilityAnnouncement, setAccessibilityAnnouncement] = useState('');
  const pickerAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  // Debouncing search input by 150ms
  useEffect(() => {
    if (pickerIdeaId === null) return;
    setIsLoadingPickerResults(true);
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInputValue);
      setIsLoadingPickerResults(false);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchInputValue, pickerIdeaId]);

  const openPicker = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    setPickerIdeaId(ideaId);
    setSearchInputValue('');
    setDebouncedSearchQuery('');
    setSelectedFriends([...idea.taggedFriends]);
    setIsLoadingPickerResults(false);
    setAccessibilityAnnouncement('');
    pickerAnim.setValue(0);
    Animated.timing(pickerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closePicker = () => {
    Animated.timing(pickerAnim, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      setPickerIdeaId(null);
    });
  };

  const handleDonePicker = () => {
    if (!pickerIdeaId) return;
    const idea = ideas.find(i => i.id === pickerIdeaId);
    if (!idea) return;

    const oldFriends = idea.taggedFriends;
    const newFriends = selectedFriends;

    if (newFriends.length > 10) {
      Alert.alert("Limit Reached", "You can mention up to 10 friends per idea thread.");
      return;
    }

    const added = newFriends.filter(f => !oldFriends.includes(f));
    const removed = oldFriends.filter(f => !newFriends.includes(f));

    const updatedIdeas = ideas.map(i => {
      if (i.id === pickerIdeaId) {
        return {
          ...i,
          taggedFriends: newFriends,
          mentionsCount: i.mentionsCount + added.length - removed.length,
        };
      }
      return i;
    });

    setIdeas(updatedIdeas);
    closePicker();
    if (added.length > 0) {
      showToast(`Mentioned ${added.length} friend${added.length === 1 ? '' : 's'}`, () => {
        const revertedIdeas = ideas.map(i => {
          if (i.id === pickerIdeaId) {
            return {
              ...i,
              taggedFriends: oldFriends,
              mentionsCount: idea.mentionsCount,
            };
          }
          return i;
        });
        setIdeas(revertedIdeas);
      });
    }
  };

  const getFriendsLists = () => {
    const isAtSearch = debouncedSearchQuery.startsWith('@');
    const query = debouncedSearchQuery.replace(/^@/, '').toLowerCase().trim();
    if (query === '') {
      const recent = MOCK_FRIENDS.filter(f => f.recentInteraction);
      const others = MOCK_FRIENDS.filter(f => !f.recentInteraction).sort((a, b) => a.displayName.localeCompare(b.displayName));
      return { recent, others };
    }

    const filtered = MOCK_FRIENDS.filter(f => {
      if (isAtSearch) {
        return f.username.toLowerCase().startsWith(query);
      } else {
        return (
          f.displayName.toLowerCase().includes(query) ||
          f.username.toLowerCase().includes(query)
        );
      }
    });

    const recent = filtered.filter(f => f.recentInteraction);
    const others = filtered.filter(f => !f.recentInteraction).sort((a, b) => a.displayName.localeCompare(b.displayName));
    return { recent, others };
  };

  // Animation values
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const supportScaleAnims = useRef<Record<string, Animated.Value>>({});

  // Initialize scale animation for each idea
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    ideas.forEach(i => {
      anims[i.id] = new Animated.Value(1);
    });
    supportScaleAnims.current = anims;
  }, [ideas]);

  // Toast trigger helper
  const showToast = (message: string, onUndo?: () => void) => {
    // Pair with a subtle haptic tick on action
    try {
      Vibration.vibrate(15);
    } catch (err) {
      console.warn('Vibration failed', err);
    }

    setToast({ message, onUndo: onUndo || (() => {}) });
    toastAnim.setValue(0);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      hideToast();
    }, 5000);
  };

  const hideToast = () => {
    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setToast(null);
    });
  };

  const handleNotifyToggle = () => {
    const nextState = !isNotifying;
    setIsNotifying(nextState);
    showToast(nextState ? 'Notifications turned on' : 'Notifications turned off');
  };

  const handleLikeToggle = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    showToast(nextState ? 'Added to favorites' : 'Removed from favorites');
  };

  const toggleTestimonial = (idx: string) => {
    setCollapsedTestimonials(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleSupportIdea = (ideaId: string) => {
    const hasSupported = !!supportState[ideaId];
    const newSupportState = !hasSupported;
    
    if (newSupportState) {
      Personalization.recordSignal(primaryCause as CauseType, 'Support');
      Personalization.incrementSupportTapsCount();
    }

    // Increment support locally
    setSupportState(prev => ({
      ...prev,
      [ideaId]: newSupportState
    }));

    // Trigger spring animation
    const scaleAnim = supportScaleAnims.current[ideaId];
    if (scaleAnim) {
      scaleAnim.setValue(1);
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          friction: 4,
          tension: 40,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          useNativeDriver: true,
          friction: 4,
          tension: 40,
        })
      ]).start();
    }

    showToast(newSupportState ? 'Supported this idea thread!' : 'Withdrew support', () => {
      // Undo Support
      setSupportState(prev => ({
        ...prev,
        [ideaId]: hasSupported
      }));
    });
  };

  const handlePitchSubmit = () => {
    if (!pitchText.trim()) {
      Alert.alert('Empty Pitch', 'Please write a description for your idea.');
      return;
    }

    const newIdea: IdeaThread = {
      id: 'pitched_' + Date.now(),
      description: pitchText.trim(),
      creatorName: 'You (Volunteer)',
      creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      initialSupports: 1,
      taggedFriends: [],
      mentionsCount: 0
    };

    setIdeas([newIdea, ...ideas]);
    setPitchText('');
    setShowPitchModal(false);
    showToast('Event idea pitched successfully!');
  };

  // Duration Formatter for less than an hour (e.g. 0.08 hrs -> 4.8m)
  const formatDuration = (hrs: number) => {
    if (hrs < 1) {
      const minutes = hrs * 60;
      // Show decimals up to 1 digit if not whole
      const formattedMins = minutes % 1 === 0 ? minutes.toFixed(0) : minutes.toFixed(1);
      return `${formattedMins}m`;
    }
    return `${hrs} hrs.`;
  };

  // Initials Avatar Builder helper
  const renderInitialsAvatar = (name: string) => {
    const parts = name.split(' ');
    const initials = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
    return (
      <View style={[styles.initialsAvatar, { backgroundColor: themeColors.brandBackgroundSubtle }]}>
        <Text style={[styles.initialsAvatarText, { color: themeColors.brandForeground1 }]}>{initials}</Text>
      </View>
    );
  };

  // Group past events by month
  const groupEventsByMonth = (events: PastEvent[]) => {
    const groups: Record<string, PastEvent[]> = {};
    events.forEach(event => {
      let month = 'Other';
      if (event.date) {
        month = event.date;
      } else {
        if (event.id.endsWith('1')) month = 'June 2026';
        else if (event.id.endsWith('2')) month = 'May 2026';
        else if (event.id.endsWith('3')) month = 'April 2026';
        else month = 'March 2026';
      }
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(event);
    });
    return groups;
  };

  const { recent: recentFriends, others: allFriendsFiltered } = getFriendsLists();

  if (showAllPastEvents) {
    const eventsByMonth = groupEventsByMonth(profile.pastEvents);
    const months = Object.keys(eventsByMonth);

    return (
      <View style={[styles.mainContainer, { backgroundColor: themeColors.neutralBackground2, paddingTop: Platform.OS === 'ios' ? 44 : 20 }]}>
        {/* Top Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.m,
          paddingVertical: Spacing.s,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.neutralStroke2,
          backgroundColor: themeColors.neutralBackground1,
        }}>
          <Pressable onPress={() => setShowAllPastEvents(false)} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={themeColors.neutralForeground1} />
          </Pressable>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1, marginBottom: 0, fontSize: 20 }]}>
            Past Events
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.m }]} showsVerticalScrollIndicator={false}>
          {months.map(month => (
            <View key={month} style={{ marginBottom: Spacing.l }}>
              <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground2, fontSize: 16, marginBottom: Spacing.s, paddingHorizontal: Spacing.xs }]}>
                {month}
              </Text>
              
              {eventsByMonth[month].map(event => {
                const caseworkerName = profile.name === 'Gwalior Green Canopy Foundation' ? 'Arman Caseworker' : (profile.contact.pocName || 'Arman Caseworker');
                return (
                  <Pressable 
                    key={event.id}
                    onPress={() => setSelectedPastEvent(event)}
                    style={({ pressed }) => [
                      styles.pastEventCard, 
                      { 
                        backgroundColor: themeColors.neutralBackground1, 
                        opacity: pressed ? 0.95 : 1,
                        marginBottom: Spacing.s,
                      }
                    ]}
                  >
                    {/* Left: Thumbnail with Play overlay */}
                    <View style={styles.pastThumbnailWrapper}>
                      <Image source={{ uri: event.imageUri }} style={styles.pastThumbnail} />
                      {event.pastPhotos && event.pastPhotos.length > 0 && (
                        <Pressable 
                          onPress={() => setActiveGallery(event.pastPhotos)} 
                          style={styles.pastPlayOverlay}
                        >
                          <Ionicons name="play" size={20} color="#ffffff" />
                        </Pressable>
                      )}
                    </View>

                    {/* Right: details */}
                    <View style={styles.pastDetails}>
                      <Text style={[styles.pastEventTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <Text style={[styles.pastEventImpact, { color: themeColors.neutralForeground3 }]}>
                        {event.impactText}
                      </Text>
                      
                      {/* User caseworker row */}
                      <View style={styles.caseworkerRow}>
                        {renderInitialsAvatar(caseworkerName)}
                        <Text style={[styles.caseworkerName, { color: themeColors.neutralForeground2 }]}>
                          {caseworkerName}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: themeColors.neutralBackground2 }]}>
      
      {/* Scrollable Page Layout */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. BANNER SECTION */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: profile.bannerUri }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay} />
          
          {/* Top Bar Navigation (Overlaid on banner) */}
          <View style={styles.topBarContainer}>
            <Pressable onPress={onBack} style={styles.circularNavBtn}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </Pressable>
            <View style={styles.topRightActions}>
              <Pressable 
                onPress={handleNotifyToggle} 
                style={styles.circularNavBtn}
              >
                <Ionicons 
                  name={isNotifying ? "notifications" : "notifications-outline"} 
                  size={24} 
                  color="#ffffff" 
                />
              </Pressable>
              
              <Pressable 
                onPress={handleLikeToggle} 
                style={[styles.circularNavBtn, { marginLeft: Spacing.xs }]}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? "#ff3b30" : "#ffffff"} 
                />
              </Pressable>
            </View>
          </View>

          {/* Banner Overlaid Text (Bottom Left) */}
          <View style={styles.bannerTextSection}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="leaf-outline" size={11} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>VERIFIED NGO</Text>
            </View>
            <Text style={styles.ngoNameTitle}>{profile.name}</Text>
            <Text style={styles.ngoSubtext}>Est. {profile.established} · {profile.location}</Text>
          </View>
        </View>

        {/* 2. PROFILE ROW SECTION (Immediately below banner) */}
        <View style={styles.profileRowContainer}>
          <View style={[styles.logoCircle, { borderColor: themeColors.neutralStroke2 }]}>
            <Image source={{ uri: profile.logoUri }} style={styles.profileLogo} />
          </View>
          <View style={styles.profileChipsSection}>
            
            {/* Verification Sources (Row 1) */}
            <View style={styles.sourceChipsRow}>
              {profile.verifiedChannels.map(source => {
                let iconName: any = 'globe-outline';
                if (source === 'WhatsApp') iconName = 'logo-whatsapp';
                if (source === 'LinkedIn') iconName = 'logo-linkedin';
                if (source === 'Instagram') iconName = 'logo-instagram';
                return (
                  <View key={source} style={styles.sourceOutlineChip}>
                    <Ionicons name={iconName} size={11} color="#107c41" style={{ marginRight: 2 }} />
                    <Ionicons name="checkmark-circle" size={10} color="#107c41" />
                  </View>
                );
              })}
            </View>

            {/* Cause Tags (Horizontal flow) */}
            <View style={styles.causeTagsRow}>
              {profile.causes.map(cause => (
                <View 
                  key={cause} 
                  style={[
                    styles.causeTag, 
                    { 
                      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                      borderWidth: 1,
                      borderColor: themeColors.neutralStroke2,
                    }
                  ]}
                >
                  <Text style={[styles.causeTagText, { color: themeColors.neutralForeground2 }]}>{cause}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 3. BIOGRAPHY SECTION */}
        <View style={styles.biographyContainer}>
          <Text style={[styles.bioText, { color: themeColors.neutralForeground2 }]}>{profile.bio}</Text>
        </View>

        {/* 4. CONTACT & POC SECTION CARD */}
        <View style={styles.cardSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Contact</Text>
          <View style={[styles.contactCard, { borderColor: themeColors.neutralStroke1, backgroundColor: themeColors.neutralBackground1 }]}>
            
            <View style={styles.contactItemRow}>
              <Ionicons name="mail-outline" size={14} color={themeColors.neutralForeground3} style={styles.contactItemIcon} />
              <Text style={[styles.contactItemValue, { color: themeColors.neutralForeground1 }]}>{profile.contact.email}</Text>
            </View>

            <View style={styles.contactItemRow}>
              <Ionicons name="call-outline" size={14} color={themeColors.neutralForeground3} style={styles.contactItemIcon} />
              <Text style={[styles.contactItemValue, { color: themeColors.neutralForeground1 }]}>{profile.contact.phone}</Text>
            </View>

            <View style={styles.contactItemRow}>
              <Ionicons name="person-outline" size={14} color={themeColors.neutralForeground3} style={styles.contactItemIcon} />
              <Text style={[styles.contactItemValue, { color: themeColors.neutralForeground1 }]}>
                {profile.contact.pocName} — {profile.contact.pocPosition}
              </Text>
            </View>
          </View>
        </View>

        {/* 5. ACTIVE LISTINGS SECTION */}
        <View style={styles.cardSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Active listings</Text>
          {profile.activeListings.length === 0 ? (
            <Text style={[styles.emptySectionText, { color: themeColors.neutralForeground3 }]}>No active volunteering opportunities at the moment.</Text>
          ) : (
            profile.activeListings.map(listing => (
              <Pressable 
                key={listing.id}
                onPress={() => setSelectedListing(listing)}
                style={({ pressed }) => [
                  styles.listingCard,
                  {
                    backgroundColor: themeColors.neutralBackground1,
                    opacity: pressed ? 0.92 : 1
                  }
                ]}
              >
                {/* Description/Title is prominent */}
                <Text style={[styles.listingMainText, { color: themeColors.neutralForeground2 }]}>
                  {listing.description || listing.title}
                </Text>

                {/* Meta details: clock icon, duration, location */}
                <View style={styles.listingMetaRow}>
                  <Ionicons name="time-outline" size={13} color={themeColors.neutralForeground3} style={{ marginRight: 3 }} />
                  <Text style={[styles.listingMetaText, { color: themeColors.neutralForeground3 }]}>
                    {formatDuration(listing.durationHrs)}
                  </Text>
                  <Text style={[styles.listingMetaDivider, { color: themeColors.neutralForeground3 }]}> · </Text>
                  <Ionicons name="location-outline" size={13} color={themeColors.neutralForeground3} style={{ marginRight: 3 }} />
                  <Text style={[styles.listingMetaText, { color: themeColors.neutralForeground3 }]} numberOfLines={1}>
                    {listing.locationName}
                  </Text>
                </View>

                {/* Cause Tag */}
                <View style={styles.listingTagRow}>
                  <View style={[styles.listingCategoryPill, { borderColor: themeColors.neutralStroke1, backgroundColor: 'transparent' }]}>
                    <Text style={[styles.listingCategoryText, { color: themeColors.neutralForeground2 }]}>
                      {listing.categoryTag}
                    </Text>
                  </View>
                </View>

                {/* Overlapping sign-up initials */}
                <View style={styles.listingSignupsRow}>
                  <View style={styles.miniAvatarsOverlap}>
                    {(() => {
                      const signupNames = listing.friendsSignedUpNames && listing.friendsSignedUpNames.length > 0
                        ? listing.friendsSignedUpNames
                        : ['anita', 'sunita'];
                      return signupNames.slice(0, 2).map((name, idx) => {
                        const initial = name.charAt(0).toLowerCase();
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.initialsSignupBadge,
                              {
                                backgroundColor: themeColors.brandBackgroundSubtle,
                                marginLeft: idx === 0 ? 0 : -6,
                                zIndex: 10 - idx,
                              }
                            ]}
                          >
                            <Text style={[styles.initialsSignupText, { color: themeColors.brandForeground1 }]}>
                              {initial}
                            </Text>
                          </View>
                        );
                      });
                    })()}
                  </View>
                  <Text style={[styles.listingSignupsText, { color: themeColors.neutralForeground3 }]}>
                    {listing.friendsSignedUpCount || 9} people signed up
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* 6. PAST EVENTS SECTION */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1, marginBottom: 0 }]}>Past Events</Text>
            {profile.pastEvents.length > 2 && (
              <Pressable onPress={() => setShowAllPastEvents(true)} style={styles.seeAllBtn}>
                <Ionicons name="arrow-forward" size={18} color={themeColors.neutralForeground3} />
              </Pressable>
            )}
          </View>

          {profile.pastEvents.length === 0 ? (
            <Text style={[styles.emptySectionText, { color: themeColors.neutralForeground3 }]}>No past events recorded.</Text>
          ) : (
            profile.pastEvents.slice(0, 3).map(event => {
              // Custom caseworker name per mockup: Green Canopy features "Arman Caseworker"
              const caseworkerName = profile.name === 'Gwalior Green Canopy Foundation' ? 'Arman Caseworker' : (profile.contact.pocName || 'Arman Caseworker');
              return (
                <Pressable 
                  key={event.id}
                  onPress={() => setSelectedPastEvent(event)}
                  style={({ pressed }) => [
                    styles.pastEventCard, 
                    { 
                      backgroundColor: themeColors.neutralBackground1, 
                      opacity: pressed ? 0.95 : 1
                    }
                  ]}
                >
                  {/* Left: Thumbnail with Play overlay */}
                  <View style={styles.pastThumbnailWrapper}>
                    <Image source={{ uri: event.imageUri }} style={styles.pastThumbnail} />
                    {event.pastPhotos && event.pastPhotos.length > 0 && (
                      <Pressable 
                        onPress={() => setActiveGallery(event.pastPhotos)} 
                        style={styles.pastPlayOverlay}
                      >
                        <Ionicons name="play" size={20} color="#ffffff" />
                      </Pressable>
                    )}
                  </View>

                  {/* Right: details */}
                  <View style={styles.pastDetails}>
                    <Text style={[styles.pastEventTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={[styles.pastEventImpact, { color: themeColors.neutralForeground3 }]}>
                      {event.impactText}
                    </Text>
                    
                    {/* User caseworker row */}
                    <View style={styles.caseworkerRow}>
                      {renderInitialsAvatar(caseworkerName)}
                      <Text style={[styles.caseworkerName, { color: themeColors.neutralForeground2 }]}>
                        {caseworkerName}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* 7. COLLEGE CLASSMATES TOUCHPOINT CARD (Positioned right under past events card stack) */}
        {profile.touchpointClassmatesCount > 0 && (
          <View style={styles.cardSection}>
            <View style={[styles.touchpointCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2 }]}>
              <View style={styles.touchpointAvatarOverlap}>
                {profile.touchpointFriendAvatars.slice(0, 3).map((url, index) => (
                  <Image 
                    key={index} 
                    source={{ uri: url }} 
                    style={[styles.classmateAvatar, { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -8 }]} 
                  />
                ))}
              </View>
              <Text style={[styles.touchpointText, { color: themeColors.neutralForeground1 }]}>
                <Text style={{ fontWeight: 'bold' }}>{profile.touchpointClassmatesCount} of your college classmates</Text> volunteered here last month
              </Text>
            </View>
          </View>
        )}

        {/* 8. TESTIMONIALS / VOLUNTEER REVIEWS SECTION */}
        <View style={styles.cardSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Volunteer Reviews</Text>
          {profile.testimonials.length === 0 ? (
            <Text style={[styles.emptySectionText, { color: themeColors.neutralForeground3 }]}>No reviews left yet.</Text>
          ) : (
            profile.testimonials.map((t, index) => {
              const isCollapsed = collapsedTestimonials[index.toString()] !== false;
              return (
                <View 
                  key={t.id}
                  style={[
                    styles.testimonialCard, 
                    { 
                      backgroundColor: themeColors.neutralBackground1,
                      paddingVertical: isCollapsed ? 8 : 12,
                    }
                  ]}
                >
                  <Pressable 
                    onPress={() => toggleTestimonial(index.toString())}
                    style={styles.testimonialHeader}
                  >
                    <Image source={{ uri: t.avatarUri }} style={styles.testimonialAvatar} />
                    <View style={styles.testimonialMeta}>
                      <Text style={[styles.testimonialName, { color: themeColors.neutralForeground1 }]}>{t.name}</Text>
                      <Text style={[styles.testimonialVolunteeredText, { color: themeColors.neutralForeground3 }]}>
                        Volunteered {t.volunteeredCount} times
                      </Text>
                    </View>
                    <Ionicons 
                      name={isCollapsed ? "chevron-down" : "chevron-up"} 
                      size={16} 
                      color={themeColors.neutralForeground3} 
                    />
                  </Pressable>
                  
                  {!isCollapsed && (
                    <>
                      <View style={[styles.reviewDivider, { backgroundColor: themeColors.neutralStroke2 }]} />
                      <View style={styles.testimonialQuoteContainer}>
                        <Text style={[styles.testimonialQuoteText, { color: themeColors.neutralForeground2 }]}>
                          "{t.reviewText}"
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* 9. IDEAS THREADS SECTION */}
        <View style={[styles.cardSection, { marginBottom: Spacing.xxl }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Ideas threads</Text>

          <View style={styles.ideasStack}>
            {ideas.slice(0, 5).map((idea, index) => {
              const hasSupported = !!supportState[idea.id];
              
              // Frame 99 mockup features tag "Rahul mentioned you" for second item
              const showMentionBadge = idea.isMentionedBadge || (profile.name === 'Gwalior Green Canopy Foundation' && index === 1);
              
              return (
                <Card
                  key={idea.id}
                  variant="Filled"
                  isDarkMode={isDarkMode}
                  style={[
                    styles.ideaCard,
                    {
                      backgroundColor: themeColors.neutralBackground1,
                    }
                  ]}
                >
                  {/* 1. Mention badge if a friend mentioned the user */}
                  {showMentionBadge && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: themeColors.brandBackgroundSubtle,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: Shapes.rounded,
                        alignSelf: 'flex-start',
                        marginBottom: Spacing.s,
                      }}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color={themeColors.brandForeground1} />
                      <Text style={{ color: themeColors.brandForeground1, marginLeft: 6, fontSize: 12, fontWeight: '600' }}>
                        Rahul mentioned you
                      </Text>
                    </View>
                  )}

                  {/* Description */}
                  <Text style={[styles.ideaDescriptionText, { color: themeColors.neutralForeground1 }]}>
                    {idea.description}
                  </Text>

                  {/* Creator Profile */}
                  <View style={styles.ideaCreatorRow}>
                    <Image source={{ uri: idea.creatorLogo }} style={styles.ideaCreatorAvatar} />
                    <Text style={[styles.ideaCreatorName, { color: themeColors.neutralForeground2 }]}>
                      {idea.creatorName}
                    </Text>
                  </View>

                  <View style={[styles.ideaDivider, { backgroundColor: themeColors.neutralStroke2 }]} />

                  {/* 2. Interactive Footer Row (Mentions on Left, Support Pill Button on Right) */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    {/* Left: Mentions Stack */}
                    <Pressable
                      onPress={() => openPicker(idea.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: Spacing.s }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                        {idea.taggedFriends.slice(0, 3).map((username, idx) => {
                          const info = MOCK_FRIENDS.find(f => f.username.toLowerCase() === username.toLowerCase()) || {
                            displayName: username,
                            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
                          };
                          return (
                            <Image
                              key={username}
                              source={{ uri: info.avatar }}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                borderWidth: 1.5,
                                borderColor: themeColors.neutralBackground1,
                                marginLeft: idx === 0 ? 0 : -8,
                                zIndex: 10 - idx,
                              }}
                            />
                          );
                        })}
                        
                        {idea.mentionsCount > 3 && (
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: themeColors.neutralBackground3,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 1.5,
                              borderColor: themeColors.neutralBackground1,
                              marginLeft: -8,
                              zIndex: 0,
                            }}
                          >
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: themeColors.neutralForeground1 }}>
                              +{idea.mentionsCount - 3}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.ideaClassmatesText,
                          {
                            color: themeColors.neutralForeground3,
                            fontSize: 12,
                            flex: 1,
                          }
                        ]}
                        numberOfLines={2}
                      >
                        {(() => {
                          const prioritized = [...idea.taggedFriends].sort((a, b) => {
                            if (a === 'priya' || a === 'rahul') return -1;
                            if (b === 'priya' || b === 'rahul') return 1;
                            return 0;
                          });

                          if (prioritized.length === 0) {
                            return 'No mentions yet';
                          }
                          
                          const firstFriend = MOCK_FRIENDS.find(f => f.username.toLowerCase() === prioritized[0].toLowerCase())?.displayName || prioritized[0];
                          if (idea.mentionsCount <= 1) {
                            return `${firstFriend} tagged`;
                          }
                          return `${firstFriend} and ${idea.mentionsCount - 1} others tagged`;
                        })()}
                      </Text>
                    </Pressable>

                    {/* Right: Support Button */}
                    <SupportButton
                      ideaId={idea.id}
                      initialCount={idea.initialSupports}
                      hasSupported={hasSupported}
                      onPress={() => handleSupportIdea(idea.id)}
                      isDarkMode={isDarkMode}
                      themeColors={themeColors}
                    />

                  </View>
                </Card>
              );
            })}
          </View>

          {/* Pitch Event Button (Dashed outline button) */}
          <Pressable 
            onPress={() => setShowPitchModal(true)}
            style={({ pressed }) => [
              styles.dashedPitchBtn, 
              { 
                borderColor: themeColors.neutralStroke2, 
                backgroundColor: pressed ? themeColors.neutralBackground2 : 'transparent' 
              }
            ]}
          >
            <Ionicons name="add" size={16} color={themeColors.neutralForeground2} style={{ marginRight: 4 }} />
            <Text style={[styles.dashedPitchBtnText, { color: themeColors.neutralForeground2 }]}>Pitch a new event idea</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* Friend Picker Bottom Sheet Modal */}
      {pickerIdeaId !== null && (
        <Modal
          visible={pickerIdeaId !== null}
          transparent
          animationType="fade"
          onRequestClose={closePicker}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closePicker} />

            <Animated.View
              style={{
                backgroundColor: themeColors.neutralBackground1,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: Spacing.m,
                maxHeight: '80%',
                width: '100%',
                borderWidth: 1,
                borderColor: themeColors.neutralStroke2,
                transform: [
                  {
                    translateY: pickerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              }}
            >
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: themeColors.neutralStroke2, alignSelf: 'center', marginBottom: 12 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s }}>
                <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 18 }]}>
                  Mention Friends
                </Text>
                <Pressable onPress={closePicker} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color={themeColors.neutralForeground2} />
                </Pressable>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.neutralStroke1,
                  borderRadius: Shapes.rounded,
                  paddingHorizontal: Spacing.s,
                  height: 40,
                  marginBottom: Spacing.s,
                  backgroundColor: isDarkMode ? '#222' : '#f5f5f5',
                }}
              >
                <Ionicons name="search" size={18} color={themeColors.neutralForeground3} style={{ marginRight: 6 }} />
                <TextInput
                  ref={searchInputRef}
                  value={searchInputValue}
                  onChangeText={setSearchInputValue}
                  placeholder="Search friends..."
                  placeholderTextColor={themeColors.neutralForegroundDisabled}
                  style={{ flex: 1, color: themeColors.neutralForeground1, fontSize: 14 }}
                  keyboardType="default"
                  autoComplete="off"
                  accessibilityLabel="Search friends"
                  accessibilityRole="search"
                  autoFocus={true}
                />
                {searchInputValue.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setSearchInputValue('');
                      setDebouncedSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color={themeColors.neutralForeground3} />
                  </Pressable>
                )}
              </View>

              {/* Selected Friends Chips Row */}
              {selectedFriends.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s, paddingVertical: 4 }}>
                  <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground2, marginRight: 8, fontSize: 11 }]}>
                    Selected:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                    {selectedFriends.map(username => {
                      return (
                        <Pressable
                          key={username}
                          onPress={() => setSelectedFriends(prev => prev.filter(u => u !== username))}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: themeColors.brandBackgroundSubtle,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 12,
                            marginRight: 6,
                          }}
                        >
                          <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1, fontSize: 11 }]}>
                            @{username}
                          </Text>
                          <Ionicons name="close" size={12} color={themeColors.brandForeground1} style={{ marginLeft: 4 }} />
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Accessibility Announcer */}
              <Text
                accessibilityLiveRegion="polite"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
              >
                {accessibilityAnnouncement}
              </Text>

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {isLoadingPickerResults ? (
                  <View>
                    <SkeletonRow themeColors={themeColors} />
                    <SkeletonRow themeColors={themeColors} />
                    <SkeletonRow themeColors={themeColors} />
                  </View>
                ) : MOCK_FRIENDS.length === 0 ? (
                  /* Empty state: No Friends Added at all */
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl }}>
                    <Ionicons name="people-outline" size={48} color={themeColors.neutralForegroundDisabled} style={{ marginBottom: Spacing.s }} />
                    <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, textAlign: 'center' }]}>
                      You haven't added any friends yet
                    </Text>
                    <Pressable
                      onPress={() => {
                        closePicker();
                        Alert.alert("Find Friends", "Redirecting to Find Friends screen...");
                      }}
                      style={{ marginTop: Spacing.xs }}
                    >
                      <Text style={[Typography.body, { color: themeColors.brandForeground1, fontWeight: 'bold' }]}>
                        Find Friends
                      </Text>
                    </Pressable>
                  </View>
                ) : recentFriends.length === 0 && allFriendsFiltered.length === 0 ? (
                  /* Empty state: No Results for Query */
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl }}>
                    <Ionicons name="search-outline" size={48} color={themeColors.neutralForegroundDisabled} style={{ marginBottom: Spacing.s }} />
                    <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, textAlign: 'center' }]}>
                      No friends found
                    </Text>
                    <Text style={[Typography.caption, { color: themeColors.neutralForeground3, textAlign: 'center', marginTop: 4, paddingHorizontal: Spacing.m }]}>
                      No one in your friends list matches "{debouncedSearchQuery}".
                    </Text>
                    {debouncedSearchQuery.trim().length > 0 && (
                      <Pressable
                        onPress={() => {
                          closePicker();
                          showToast(`Invite sent to "${debouncedSearchQuery}"`, () => {});
                        }}
                        style={{
                          marginTop: Spacing.s,
                          borderWidth: 1.5,
                          borderColor: themeColors.brandForeground1,
                          paddingHorizontal: Spacing.m,
                          paddingVertical: 8,
                          borderRadius: 18,
                        }}
                      >
                        <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1 }]}>
                          Invite "{debouncedSearchQuery}" to SocialWorkers
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : debouncedSearchQuery.trim().length > 0 ? (
                  /* Query results view */
                  <View>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground3, marginBottom: 8 }]}>
                      Results for "{debouncedSearchQuery}"
                    </Text>
                    {[...recentFriends, ...allFriendsFiltered].map(friend => {
                      const isChecked = selectedFriends.includes(friend.username);
                      const toggleCheck = () => {
                        if (isChecked) {
                          setSelectedFriends(prev => prev.filter(u => u !== friend.username));
                        } else {
                          if (selectedFriends.length >= 10) {
                            Alert.alert("Limit Reached", "You can mention up to 10 friends per idea thread.");
                            return;
                          }
                          setSelectedFriends(prev => [...prev, friend.username]);
                        }
                      };

                      return (
                        <Pressable
                          key={friend.username}
                          onPress={toggleCheck}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: themeColors.neutralStroke2,
                          }}
                        >
                          <Image source={{ uri: friend.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                          <View style={{ flex: 1, marginLeft: Spacing.s }}>
                            <HighlightText
                              text={friend.displayName}
                              highlight={debouncedSearchQuery}
                              style={[Typography.body, { color: themeColors.neutralForeground1 }]}
                              highlightStyle={{ color: themeColors.brandForeground1 }}
                            />
                            <HighlightText
                              text={`@${friend.username}`}
                              highlight={debouncedSearchQuery}
                              style={[Typography.caption, { color: themeColors.neutralForeground3 }]}
                              highlightStyle={{ color: themeColors.brandForeground1 }}
                            />
                          </View>
                          <Ionicons
                            name={isChecked ? "checkbox" : "square-outline"}
                            size={22}
                            color={isChecked ? themeColors.brandForeground1 : themeColors.neutralForeground3}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  /* Default view (empty query) */
                  <View>
                    {recentFriends.length > 0 && (
                      <View style={{ marginBottom: Spacing.s }}>
                        <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground3, marginBottom: 6 }]}>
                          Recently Interacted
                        </Text>
                        {recentFriends.map(friend => {
                          const isChecked = selectedFriends.includes(friend.username);
                          const toggleCheck = () => {
                            if (isChecked) {
                              setSelectedFriends(prev => prev.filter(u => u !== friend.username));
                            } else {
                              if (selectedFriends.length >= 10) {
                                Alert.alert("Limit Reached", "You can mention up to 10 friends per idea thread.");
                                return;
                              }
                              setSelectedFriends(prev => [...prev, friend.username]);
                            }
                          };

                          return (
                            <Pressable
                              key={friend.username}
                              onPress={toggleCheck}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: themeColors.neutralStroke2,
                              }}
                            >
                              <Image source={{ uri: friend.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                              <View style={{ flex: 1, marginLeft: Spacing.s }}>
                                <Text style={[Typography.body, { color: themeColors.neutralForeground1 }]}>
                                  {friend.displayName}
                                </Text>
                                <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                                  @{friend.username}
                                </Text>
                              </View>
                              <Ionicons
                                name={isChecked ? "checkbox" : "square-outline"}
                                size={22}
                                color={isChecked ? themeColors.brandForeground1 : themeColors.neutralForeground3}
                              />
                            </Pressable>
                          );
                        })}
                      </View>
                    )}

                    {allFriendsFiltered.length > 0 && (
                      <View>
                        <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground3, marginBottom: 6 }]}>
                          All Friends
                        </Text>
                        {allFriendsFiltered.map(friend => {
                          const isChecked = selectedFriends.includes(friend.username);
                          const toggleCheck = () => {
                            if (isChecked) {
                              setSelectedFriends(prev => prev.filter(u => u !== friend.username));
                            } else {
                              if (selectedFriends.length >= 10) {
                                Alert.alert("Limit Reached", "You can mention up to 10 friends per idea thread.");
                                return;
                              }
                              setSelectedFriends(prev => [...prev, friend.username]);
                            }
                          };

                          return (
                            <Pressable
                              key={friend.username}
                              onPress={toggleCheck}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: themeColors.neutralStroke2,
                              }}
                            >
                              <Image source={{ uri: friend.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                              <View style={{ flex: 1, marginLeft: Spacing.s }}>
                                <Text style={[Typography.body, { color: themeColors.neutralForeground1 }]}>
                                  {friend.displayName}
                                </Text>
                                <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                                  @{friend.username}
                                </Text>
                              </View>
                              <Ionicons
                                name={isChecked ? "checkbox" : "square-outline"}
                                size={22}
                                color={isChecked ? themeColors.brandForeground1 : themeColors.neutralForeground3}
                              />
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              <View style={{ marginTop: Spacing.m, width: '100%', height: 44 }}>
                <Button
                  label={
                    selectedFriends.length === 0
                      ? "Mention friends"
                      : `Mention ${selectedFriends.length} friend${selectedFriends.length === 1 ? '' : 's'}`
                  }
                  appearance="Primary"
                  onPress={handleDonePicker}
                  isDarkMode={isDarkMode}
                  disabled={selectedFriends.length === 0}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Undo Toast Notification */}
      {toast !== null && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, { zIndex: 9998 }]}
            onPress={hideToast}
          />
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                backgroundColor: isDarkMode ? '#2d2d2d' : '#1e1e1e',
                paddingVertical: 12,
                paddingHorizontal: Spacing.m,
                borderRadius: Shapes.rounded,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                zIndex: 9999,
                opacity: toastAnim,
                transform: [
                  {
                    translateY: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
              {toast.message}
            </Text>
            <Pressable
              onPress={() => {
                toast.onUndo();
                hideToast();
              }}
              style={{ padding: 4 }}
            >
              <Text style={{ color: themeColors.brandForeground1, fontSize: 14, fontWeight: 'bold' }}>
                UNDO
              </Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      {/* PHOTO GALLERY MODAL */}
      <Modal visible={activeGallery !== null} transparent animationType="fade">
        <View style={styles.galleryContainer}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>Event Gallery</Text>
            <Pressable onPress={() => setActiveGallery(null)} style={styles.galleryCloseBtn}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryScroll}
          >
            {activeGallery?.map((photo, i) => (
              <View key={i} style={styles.gallerySlide}>
                <Image source={{ uri: photo }} style={styles.galleryImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ACTIVE LISTING DETAILS MODAL */}
      <Modal visible={selectedListing !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.neutralBackground1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.neutralForeground1 }]}>{selectedListing?.title}</Text>
              <Pressable onPress={() => setSelectedListing(null)} style={styles.modalCloseIcon}>
                <Ionicons name="close" size={24} color={themeColors.neutralForeground2} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.modalBadgeRow, { backgroundColor: accentColor + '15' }]}>
                <Text style={[styles.modalBadgeText, { color: accentColor }]}>{selectedListing?.cause}</Text>
              </View>

              <Text style={[styles.modalHeading, { color: themeColors.neutralForeground2 }]}>Details</Text>
              <View style={styles.modalMetaItem}>
                <Ionicons name="location-outline" size={18} color={accentColor} style={{ marginRight: 8 }} />
                <Text style={[styles.modalText, { color: themeColors.neutralForeground1 }]}>{selectedListing?.locationName}</Text>
              </View>
              <View style={styles.modalMetaItem}>
                <Ionicons name="time-outline" size={18} color={accentColor} style={{ marginRight: 8 }} />
                <Text style={[styles.modalText, { color: themeColors.neutralForeground1 }]}>Required: {selectedListing ? formatDuration(selectedListing.durationHrs) : ''}</Text>
              </View>
              <View style={styles.modalMetaItem}>
                <Ionicons name="construct-outline" size={18} color={accentColor} style={{ marginRight: 8 }} />
                <Text style={[styles.modalText, { color: themeColors.neutralForeground1 }]}>Activity: {selectedListing?.categoryTag}</Text>
              </View>

              <Text style={[styles.modalHeading, { color: themeColors.neutralForeground2, marginTop: Spacing.s }]}>Mutual Signups</Text>
              {selectedListing?.friendsSignedUpCount && selectedListing.friendsSignedUpCount > 0 ? (
                <Text style={[styles.modalText, { color: themeColors.neutralForeground2 }]}>
                  {selectedListing.friendsSignedUpNames.join(', ')} have already signed up.
                </Text>
              ) : (
                <Text style={[styles.modalText, { color: themeColors.neutralForeground3 }]}>No mutual connections registered yet.</Text>
              )}

              <Pressable 
                onPress={() => {
                  setSelectedListing(null);
                  showToast('Signed up successfully!');
                }}
                style={[styles.modalConfirmBtn, { backgroundColor: accentColor }]}
              >
                <Text style={styles.modalConfirmBtnText}>Sign Up Now</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PAST EVENT ARCHIVE DETAILS MODAL */}
      <Modal visible={selectedPastEvent !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.neutralBackground1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.neutralForeground1 }]}>{selectedPastEvent?.title}</Text>
              <Pressable onPress={() => setSelectedPastEvent(null)} style={styles.modalCloseIcon}>
                <Ionicons name="close" size={24} color={themeColors.neutralForeground2} />
              </Pressable>
            </View>

            <View style={styles.modalScrollBody}>
              <Image source={{ uri: selectedPastEvent?.imageUri }} style={styles.archiveCoverImage} />
              
              <Text style={[styles.modalHeading, { color: themeColors.neutralForeground2, marginTop: Spacing.m }]}>Impact Achieved</Text>
              <Text style={[styles.modalText, { color: themeColors.neutralForeground1, fontWeight: 'bold' }]}>
                {selectedPastEvent?.impactText}
              </Text>
              
              <Text style={[styles.modalText, { color: themeColors.neutralForeground2, marginTop: Spacing.xs }]}>
                A total of {selectedPastEvent?.participantsCount} local volunteers contributed their time to help make this event a major success.
              </Text>

              <Pressable 
                onPress={() => setSelectedPastEvent(null)}
                style={[styles.modalConfirmBtn, { backgroundColor: themeColors.neutralBackgroundPressed, marginTop: Spacing.l }]}
              >
                <Text style={[styles.modalConfirmBtnText, { color: themeColors.neutralForeground1 }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* PITCH NEW EVENT IDEA MODAL */}
      <Modal visible={showPitchModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.neutralBackground1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.neutralForeground1 }]}>Pitch Event Idea</Text>
              <Pressable onPress={() => { setShowPitchModal(false); setPitchText(''); }} style={styles.modalCloseIcon}>
                <Ionicons name="close" size={24} color={themeColors.neutralForeground2} />
              </Pressable>
            </View>

            <View style={styles.modalScrollBody}>
              <Text style={[styles.modalHeading, { color: themeColors.neutralForeground2 }]}>Your Idea Description</Text>
              <TextInput
                style={[styles.pitchInput, { borderColor: themeColors.neutralStroke1, color: themeColors.neutralForeground1 }]}
                placeholder="e.g. Host a weekend composting workshop in the community garden..."
                placeholderTextColor={themeColors.neutralForegroundDisabled}
                multiline
                numberOfLines={4}
                value={pitchText}
                onChangeText={setPitchText}
              />

              <Pressable 
                onPress={handlePitchSubmit}
                style={[styles.modalConfirmBtn, { backgroundColor: accentColor, marginTop: Spacing.s }]}
              >
                <Text style={styles.modalConfirmBtnText}>Submit Pitch</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  bannerContainer: {
    height: 240,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: Spacing.m,
    right: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circularNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: Spacing.m,
    borderRadius: 18,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginLeft: Spacing.xs,
  },
  followPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bannerTextSection: {
    position: 'absolute',
    bottom: Spacing.m,
    left: Spacing.m,
    right: Spacing.m,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Shapes.rounded,
    marginBottom: Spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  ngoNameTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ngoSubtext: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    marginTop: 2,
  },
  profileRowContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.m,
    marginTop: Spacing.m,
    alignItems: 'flex-start',
    zIndex: 5,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  profileLogo: {
    width: '100%',
    height: '100%',
  },
  profileChipsSection: {
    flex: 1,
    marginLeft: Spacing.s,
    marginTop: 0,
  },
  sourceChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xxs,
  },
  sourceOutlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#107c41',
    backgroundColor: 'rgba(16,124,65,0.04)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  causeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xxs,
  },
  causeTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  causeTagText: {
    fontSize: 12,
    fontWeight: '400',
  },
  biographyContainer: {
    paddingHorizontal: Spacing.m,
    marginTop: 12,
    marginBottom: Spacing.s,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardSection: {
    paddingHorizontal: Spacing.m,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 6,
  },
  contactCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  contactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },
  contactDivider: {
    height: 1,
    marginHorizontal: -10,
    marginVertical: Spacing.s,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  contactItemIcon: {
    width: 20,
  },
  contactItemValue: {
    fontSize: 13,
  },
  emptySectionText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: Spacing.xs,
  },
  listingCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 10,
    // Soft diffused ambient drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listingMainText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 6,
  },
  listingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  listingMetaText: {
    fontSize: 12,
  },
  listingMetaDivider: {
    fontSize: 12,
  },
  listingTagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  listingCategoryPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  listingCategoryText: {
    fontSize: 11,
    fontWeight: '400',
  },
  listingSignupsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  miniAvatarsOverlap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialsSignupBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  initialsSignupText: {
    fontSize: 10,
    fontWeight: '500',
  },
  listingSignupsText: {
    fontSize: 11,
    fontWeight: '400',
    marginLeft: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  seeAllBtn: {
    padding: 2,
  },
  pastEventCard: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pastThumbnailWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pastThumbnail: {
    width: '100%',
    height: '100%',
  },
  pastPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  pastEventTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  pastEventImpact: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 6,
  },
  caseworkerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  caseworkerName: {
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 6,
  },
  initialsAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsAvatarText: {
    fontSize: 10,
    fontWeight: '600',
  },
  touchpointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: Spacing.xxs,
  },
  touchpointAvatarOverlap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  classmateAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  touchpointText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  testimonialCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  testimonialMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginLeft: Spacing.s,
    marginRight: Spacing.xs,
  },
  testimonialName: {
    fontSize: 15,
    fontWeight: '600',
  },
  testimonialVolunteeredText: {
    fontSize: 12,
    fontWeight: '400',
  },
  reviewDivider: {
    height: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  testimonialQuoteContainer: {
    marginTop: 6,
    paddingLeft: 0,
  },
  testimonialQuoteText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  ideasStack: {
    marginTop: Spacing.xxs,
  },
  ideaCard: {
    borderRadius: 8,
    padding: Spacing.m,
    marginBottom: Spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: Spacing.s,
  },
  mentionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ideaDescriptionText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  ideaCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  ideaCreatorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  ideaCreatorName: {
    fontSize: 11,
    marginLeft: 6,
  },
  ideaDivider: {
    height: 1,
    marginVertical: Spacing.s,
  },
  ideaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ideaLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.s,
  },
  ideaClassmatesText: {
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  supportPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  supportPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dashedPitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: Spacing.xs,
  },
  dashedPitchBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: Spacing.m,
    right: Spacing.m,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  galleryHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: Spacing.m,
    right: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  galleryTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  galleryCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryScroll: {
    alignItems: 'center',
  },
  gallerySlide: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: screenHeight * 0.75,
    padding: Spacing.m,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: Spacing.s,
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalScrollBody: {
    paddingBottom: Spacing.xl,
  },
  modalBadgeRow: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: Spacing.m,
  },
  modalBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  modalText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  modalConfirmBtn: {
    padding: Spacing.m,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  archiveCoverImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  pitchInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.s,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: Spacing.s,
  },
});
