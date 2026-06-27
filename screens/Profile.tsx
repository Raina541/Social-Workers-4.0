import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Pattern, Circle, Rect, Path, Line } from 'react-native-svg';
import { useScrapbookTheme, ScrapbookThemeColors, ScrapbookTheme } from '../context/ScrapbookThemeContext';
import { Colors, Spacing, Shapes, Typography } from '../constants/Theme';
import { PresenceState } from '../components/Avatar';
import { Button } from '../components/Button';
import { Personalization } from '../services/personalization';
import { SandboxCommunityView } from '../components/sandbox_community/SandboxCommunityView';

const { width: screenWidth } = Dimensions.get('window');

// ---------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------
interface ProfileProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  presence: PresenceState;
  onChangePresence: (state: PresenceState) => void;
  userData?: any;
  onLogout?: () => void;
}

interface JourneyNode {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUri?: string;
}

// ---------------------------------------------------------
// Helper Scrapbook Components
// ---------------------------------------------------------

// Custom Lined Paper Background drawing horizontal notebook lines and a vertical left margin
const LinedPaperBackground: React.FC<{ colors: ScrapbookThemeColors }> = ({ colors }) => (
  <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, zIndex: -10 }]}>
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="scrapbook-lined" x="0" y="0" width="100" height="26" patternUnits="userSpaceOnUse">
          <Line x1="0" y1="25" x2="100" y2="25" stroke={colors.dotColor} strokeWidth={1} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#scrapbook-lined)" />
      {/* Red margin line to simulate notebook lined paper */}
      <Line x1="45" y1="0" x2="45" y2="100%" stroke="rgba(220, 50, 50, 0.3)" strokeWidth={1.5} />
    </Svg>
  </View>
);

// Custom Sticker Badge component for achievements
const StickerBadge: React.FC<{ emoji: string; label: string; bgColor: string; textDark?: boolean }> = ({ emoji, label, bgColor, textDark = true }) => (
  <View
    style={{
      backgroundColor: bgColor,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#000000',
      width: '48%',
      aspectRatio: 1.6,
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 1,
      elevation: 2,
    }}
  >
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={{ fontFamily: 'Courier', fontSize: 10, fontWeight: 'bold', color: textDark ? '#3D2314' : '#ffffff', marginTop: 4, textAlign: 'center' }}>
      {label}
    </Text>
  </View>
);

// Washi Tape Overlay (Clean translucent pastel color tape strip)
const WashiTape: React.FC<{ color: string; style?: any; text?: string }> = ({ color, style }) => (
  <View
    style={[
      {
        position: 'absolute',
        backgroundColor: color,
        opacity: 0.45,
        zIndex: 10,
      },
      style,
    ]}
  />
);

// Hand-drawn Star Doodle Vector
const HandDrawnStar: React.FC<{ size?: number; color: string; style?: any }> = ({ size = 22, color, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 2 L14.8 8.6 L22 9.2 L16.8 13.8 L18.5 21 L12 17.2 L5.5 21 L7.2 13.8 L2 9.2 L9.2 8.6 Z"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Hand-drawn Heart Doodle Vector
const HandDrawnHeart: React.FC<{ size?: number; color: string; style?: any }> = ({ size = 20, color, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 21 C 12 21 3.5 14.5 3.5 9 C 3.5 5.5 6 3.5 9 3.5 C 10.8 3.5 11.5 4.8 12 5.5 C 12.5 4.8 13.2 3.5 15 3.5 C 18 3.5 20.5 5.5 20.5 9 C 20.5 14.5 12 21 12 21 Z"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Polaroid-style Image Frame with Caption and Rotation (subtle border, soft shadow)
const PolaroidFrame: React.FC<{
  imageUri: string;
  caption?: string;
  size?: number;
  colors: ScrapbookThemeColors;
  style?: any;
  rotation?: string;
  isBadge?: boolean;
}> = ({ imageUri, caption, size = 100, colors, style, rotation = '-2deg', isBadge = false }) => (
  <View
    style={[
      {
        backgroundColor: colors.paperColor,
        padding: 10,
        paddingBottom: 22,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
        alignItems: 'center',
        transform: [{ rotate: rotation }],
      },
      style,
    ]}
  >
    <View
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        backgroundColor: colors.secondary,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isBadge ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, width: '100%' }}>
          <Ionicons name="ribbon-outline" size={size * 0.5} color={colors.text} />
        </View>
      ) : (
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
      )}
    </View>
    {caption && (
      <Text
        style={{
          marginTop: 10,
          fontSize: 13,
          fontFamily: 'Courier',
          fontWeight: 'bold',
          color: colors.text,
          textAlign: 'center',
        }}
      >
        {caption}
      </Text>
    )}
  </View>
);

// Card with subtle borders and shadows (No hard black outline offsets, minimal border radius)
const ScrapbookCard: React.FC<{
  children: React.ReactNode;
  colors: ScrapbookThemeColors;
  style?: any;
  rotate?: string;
  isPrivate?: boolean;
  tapeColor?: string;
  tapeText?: string;
}> = ({ children, colors, style, rotate = '0deg', isPrivate = false, tapeColor }) => {
  return (
    <View style={{ marginVertical: 12, transform: [{ rotate }] }}>
      <View
        style={[
          {
            backgroundColor: colors.paperColor,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.08)',
            borderRadius: 4,
            padding: 16,
            opacity: isPrivate ? 0.82 : 1,
            position: 'relative',
            // shadow
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 5,
            elevation: 2,
          },
          style,
        ]}
      >
        {children}
        {isPrivate && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.text,
                borderStyle: 'dashed',
                paddingVertical: 4,
                paddingHorizontal: 12,
                transform: [{ rotate: '-8deg' }],
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: 'Courier', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }}>
                🔒 PRIVATE LOG
              </Text>
            </View>
          </View>
        )}
        {tapeColor && (
          <WashiTape
            color={tapeColor}
            style={{ top: -10, left: 35, width: 85, height: 20, transform: [{ rotate: '-4deg' }] }}
          />
        )}
      </View>
    </View>
  );
};

// Section Header with Edit and Visibility controls
const ScrapbookSectionHeader: React.FC<{
  title: string;
  onEdit?: () => void;
  isPublic: boolean;
  onToggleVisibility: () => void;
  colors: ScrapbookThemeColors;
}> = ({ title, onEdit, isPublic, onToggleVisibility, colors }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, marginTop: 18 }}>
    <View style={{ position: 'relative' }}>
      <Text style={{ fontSize: 16, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', letterSpacing: 1.2 }}>
        {title}
      </Text>
      <View style={{ height: 4, backgroundColor: colors.primary, width: '100%', position: 'absolute', bottom: -2, zIndex: -1, opacity: 0.6 }} />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {onEdit && (
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [
            {
              padding: 5,
              marginHorizontal: 3,
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: 6,
              backgroundColor: pressed ? colors.primary : colors.paperColor,
            },
          ]}
        >
          <Ionicons name="create-outline" size={16} color={colors.text} />
        </Pressable>
      )}
      <Pressable
        onPress={onToggleVisibility}
        style={({ pressed }) => [
          {
            padding: 5,
            marginHorizontal: 3,
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 6,
            backgroundColor: isPublic ? colors.primary : colors.paperColor,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name={isPublic ? "eye-outline" : "eye-off-outline"} size={16} color={colors.text} />
      </Pressable>
    </View>
  </View>
);

const getDomainStyle = (domainName: string) => {
  const lower = domainName.toLowerCase();
  let color = '#E6C15C'; // default soft yellow-gold
  let hours = '25h';
  
  if (lower.includes('env')) {
    color = '#7FA074'; // Soft sage green
    hours = '124h';
  } else if (lower.includes('edu') || lower.includes('learn') || lower.includes('teach')) {
    color = '#E5A988'; // Soft peach
    hours = '86h';
  } else if (lower.includes('anim') || lower.includes('pet') || lower.includes('dog')) {
    color = '#B59DE5'; // Soft pastel purple
    hours = '42h';
  } else if (lower.includes('food') || lower.includes('hung') || lower.includes('res')) {
    color = '#E25C38'; // Soft rust red
    hours = '68h';
  } else if (lower.includes('heal') || lower.includes('eld') || lower.includes('care') || lower.includes('ment')) {
    color = '#76CEFC'; // Soft sky blue
    hours = '31h';
  } else {
    // Deterministic hours based on length
    hours = `${30 + (domainName.length * 4) % 45}h`;
  }
  return { color, hours };
};

const DEFAULT_JOURNEY_NODES: JourneyNode[] = [
  {
    id: '1',
    title: 'Green Earth Tree Plantation',
    date: 'June 2026',
    description: 'Planted 15 saplings in the town square and helped set up the drip irrigation system.',
    imageUri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    title: 'Soup Kitchen Coordinator',
    date: 'May 2026',
    description: 'Coordinated food distribution and managed supplies for over 150 local citizens.',
  },
  {
    id: '3',
    title: 'Coding Bootcamp Tutor',
    date: 'March 2026',
    description: 'Introduced basic JS programming logic and helped high schoolers compile their first projects.',
    imageUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
  },
];

// ---------------------------------------------------------
// Main Profile Component
// ---------------------------------------------------------
export const Profile: React.FC<ProfileProps> = ({
  isDarkMode,
  onToggleDarkMode,
  presence,
  onChangePresence,
  userData,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, setTheme, colors } = useScrapbookTheme();
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  // Active Segment State
  const [activeSegment, setActiveSegment] = useState<'map' | 'journey'>('journey');

  // User Profile States
  const [name, setName] = useState('Nilap Saha');
  const [bio, setBio] = useState('Senior Case Manager • East County Division');
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [bannerPic, setBannerPic] = useState('https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80');

  // Volunteering Stats States
  const [totalHours, setTotalHours] = useState(142);
  const [domains, setDomains] = useState<string[]>(() => Personalization.getBookmarkedDomains());
  const [consistencyTag, setConsistencyTag] = useState('Bi-Monthly Volunteer');

  // Social Stats States
  const [friendsCount, setFriendsCount] = useState(48);
  const [followersCount, setFollowersCount] = useState(120);
  const [communitiesCount, setCommunitiesCount] = useState(6);

  // Volunteering Journey States
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>(DEFAULT_JOURNEY_NODES);

  useEffect(() => {
    if (userData) {
      setName(userData.fullName || 'Nilap Saha');
      setBio(`@${userData.username || 'nilap1'} • ${userData.role || 'Volunteer'}`);
      if (userData.interests) {
        setDomains(userData.interests);
      }
      if (userData.isNewUser) {
        setTotalHours(0);
        setJourneyNodes([]);
        setFriendsCount(0);
        setFollowersCount(0);
        setCommunitiesCount(0);
        setConsistencyTag('New Volunteer');
      } else {
        setTotalHours(142);
        setJourneyNodes(DEFAULT_JOURNEY_NODES);
        setFriendsCount(48);
        setFollowersCount(120);
        setCommunitiesCount(6);
        setConsistencyTag('Bi-Monthly Volunteer');
      }
    } else {
      setName('Nilap Saha');
      setBio('Senior Case Manager • East County Division');
      setTotalHours(142);
      setJourneyNodes(DEFAULT_JOURNEY_NODES);
      setFriendsCount(48);
      setFollowersCount(120);
      setCommunitiesCount(6);
      setConsistencyTag('Bi-Monthly Volunteer');
    }
  }, [userData]);

  // Privacy Settings (Visibility)
  const [isBioPublic, setIsBioPublic] = useState(true);
  const [isStatsPublic, setIsStatsPublic] = useState(true);

  // Sandbox Modal Visibility state
  const [isSandboxVisible, setIsSandboxVisible] = useState(false);
  const [isInterestsPublic, setIsInterestsPublic] = useState(true);
  const [isSocialPublic, setIsSocialPublic] = useState(true);
  const [isJourneyPublic, setIsJourneyPublic] = useState(true);

  // Modal Visibility States
  const [isBioEditVisible, setIsBioEditVisible] = useState(false);
  const [isManagePersonalsVisible, setIsManagePersonalsVisible] = useState(false);
  const [isAddTimelineVisible, setIsAddTimelineVisible] = useState(false);

  // Editing Timeline Mode state
  const [isJourneyEditing, setIsJourneyEditing] = useState(false);

  // Bio Modal Input fields
  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [tempProfilePic, setTempProfilePic] = useState('');
  const [tempBannerPic, setTempBannerPic] = useState('');

  // Journey Item Input fields
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUri, setNewImageUri] = useState('');

  // Certificates list
  const certificates = [
    { title: 'Forest Pioneer', date: 'May 2026', badge: true },
    { title: 'Community Savior', date: 'April 2026', badge: true },
    { title: 'Youth Educator', date: 'Jan 2026', badge: true },
  ];

  // Helper to trigger bio editor
  const handleOpenBioEdit = () => {
    setTempName(name);
    setTempBio(bio);
    setTempProfilePic(profilePic);
    setTempBannerPic(bannerPic);
    setIsBioEditVisible(true);
  };

  const handleSaveBio = () => {
    if (!tempName.trim()) {
      Alert.alert('Hold on!', 'Name cannot be empty.');
      return;
    }
    setName(tempName);
    setBio(tempBio);
    setProfilePic(tempProfilePic);
    setBannerPic(tempBannerPic);
    setIsBioEditVisible(false);
  };

  // Helper to add journey node
  const handleAddTimelineNode = () => {
    if (!newTitle.trim() || !newDate.trim()) {
      Alert.alert('Missing Info', 'Please specify at least a Title and Date.');
      return;
    }
    const newNode: JourneyNode = {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      description: newDescription,
      imageUri: newImageUri.trim() ? newImageUri.trim() : undefined,
    };
    setJourneyNodes([newNode, ...journeyNodes]);
    setNewTitle('');
    setNewDate('');
    setNewDescription('');
    setNewImageUri('');
    setIsAddTimelineVisible(false);
  };

  // Helper to delete timeline item
  const handleDeleteTimelineNode = (id: string) => {
    setJourneyNodes(journeyNodes.filter(node => node.id !== id));
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Lined Paper Background */}
      <LinedPaperBackground colors={colors} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 10,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Scrapbook Header Banner */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Courier', fontSize: 18, fontWeight: 'bold', color: colors.text, letterSpacing: 1.5 }}>
            📓 MY SCRAPBOOK
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Stamp Style Availability Pick */}
            <Pressable
              onPress={() => {
                const presenceOptions: PresenceState[] = ['Available', 'Busy', 'DND', 'Away', 'Offline'];
                const currentIndex = presenceOptions.indexOf(presence);
                const nextIndex = (currentIndex + 1) % presenceOptions.length;
                onChangePresence(presenceOptions[nextIndex]);
              }}
              style={{
                borderWidth: 2,
                borderColor: colors.border,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 4,
                backgroundColor: colors.paperColor,
                marginRight: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    presence === 'Available'
                      ? '#107c41'
                      : presence === 'Away'
                      ? '#d86109'
                      : presence === 'Busy' || presence === 'DND'
                      ? '#c41818'
                      : '#8a8a8a',
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 10, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>
                {presence}
              </Text>
            </Pressable>

            {/* Dark Mode toggle styled as a sticker stamp */}
            <Pressable
              onPress={onToggleDarkMode}
              style={{
                borderWidth: 2,
                borderColor: colors.border,
                padding: 6,
                borderRadius: 4,
                backgroundColor: isDarkMode ? colors.primary : colors.paperColor,
              }}
            >
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={14} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Cursive/Italic Centered Journal Title */}
        <Text style={{
          fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
          fontSize: 22,
          fontStyle: 'italic',
          fontWeight: 'normal',
          color: colors.text,
          textAlign: 'center',
          marginVertical: 14,
        }}>
          ~ {name}'s Volunteer Journal ~
        </Text>

        {/* ---------------------------------------------------------
            HEADER & BIO SECTION (Large Polaroid profile pic)
           --------------------------------------------------------- */}
        <View style={{ alignItems: 'center', marginVertical: 16, position: 'relative' }}>
          {/* Yellow washi tape at the top */}
          <WashiTape
            color="#FBBF24" // Yellow
            style={{
              top: -12,
              width: 110,
              height: 20,
              transform: [{ rotate: '-4deg' }],
              zIndex: 30,
            }}
          />
          <PolaroidFrame
            imageUri={profilePic}
            caption={name}
            size={180}
            colors={colors}
            rotation="-2deg"
            style={{ width: 210, zIndex: 10 }}
          />
        </View>

        {/* Bio Card */}
        <ScrapbookCard
          colors={colors}
          isPrivate={!isBioPublic}
          rotate="0.5deg"
          tapeColor="#FBBF24" // Yellow
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text, opacity: 0.8, letterSpacing: 0.8 }}>
              ABOUT ME
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: 12,
              paddingVertical: 2,
              paddingHorizontal: 8,
              backgroundColor: colors.paperColor,
            }}>
              <Ionicons name="eye-outline" size={11} color={colors.text} style={{ marginRight: 4, opacity: 0.6 }} />
              <Text style={{ fontFamily: 'Courier', fontSize: 9, fontWeight: 'bold', color: colors.text, opacity: 0.6 }}>PUBLIC</Text>
            </View>
          </View>

          <Text style={{
            fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif-medium',
            fontSize: 15,
            color: colors.text,
            lineHeight: 22,
            marginBottom: 12,
          }}>
            {bio}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {/* Active & Deployable green badge */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#E8F5E9',
                borderWidth: 1,
                borderColor: '#C8E6C9',
                borderRadius: 14,
                paddingVertical: 4,
                paddingHorizontal: 10,
              }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 6 }} />
                <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif', fontSize: 11, fontWeight: 'bold', color: '#2E7D32' }}>
                  Active & Deployable
                </Text>
              </View>

              {/* Public Badge */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 12,
                paddingVertical: 3,
                paddingHorizontal: 8,
                backgroundColor: colors.paperColor,
              }}>
                <Ionicons name="eye-outline" size={11} color={colors.text} style={{ marginRight: 4, opacity: 0.6 }} />
                <Text style={{ fontFamily: 'Courier', fontSize: 9, fontWeight: 'bold', color: colors.text, opacity: 0.6 }}>PUBLIC</Text>
              </View>
            </View>

            {/* Edit button */}
            <Pressable
              onPress={handleOpenBioEdit}
              style={{ padding: 6, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 6, backgroundColor: colors.paperColor }}
            >
              <Ionicons name="create-outline" size={13} color={colors.text} />
            </Pressable>
          </View>
        </ScrapbookCard>

        {/* ---------------------------------------------------------
            THEME PICKER STAMP ROW
           --------------------------------------------------------- */}
        <View style={{ marginBottom: 16, marginTop: 6 }}>
          <Text style={{ fontFamily: 'Courier', fontSize: 13, fontWeight: 'bold', color: colors.text, marginBottom: 8, letterSpacing: 0.8 }}>
            🎨 JOURNAL SKIN SELECTOR
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {(['Neon Pop', 'Kraft Paper', 'Pastel Dream', 'Monochrome Sketch'] as ScrapbookTheme[]).map((themeName) => {
              const isActive = theme === themeName;
              let stampBg = '#F4EBE1';
              let stampBorder = 'rgba(0, 0, 0, 0.1)';
              
              if (themeName === 'Neon Pop') { stampBg = '#1e1e24'; stampBorder = 'rgba(255, 255, 255, 0.15)'; }
              else if (themeName === 'Pastel Dream') { stampBg = '#FFF0F5'; stampBorder = 'rgba(75, 0, 130, 0.15)'; }
              else if (themeName === 'Monochrome Sketch') { stampBg = '#FFFFFF'; stampBorder = 'rgba(0, 0, 0, 0.1)'; }

              return (
                <Pressable
                  key={themeName}
                  onPress={() => setTheme(themeName)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      marginHorizontal: 3,
                      borderWidth: isActive ? 1.5 : 0.75,
                      borderColor: isActive ? colors.accentStar : stampBorder,
                      borderRadius: 4,
                      backgroundColor: stampBg,
                      paddingVertical: 8,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 1,
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: isActive ? 1.02 : 1 }],
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: 'Courier',
                      fontWeight: 'bold',
                      color: themeName === 'Neon Pop' ? '#ffffff' : '#000000',
                      textAlign: 'center',
                    }}
                  >
                    {themeName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ---------------------------------------------------------
            WHAT I CARE ABOUT CARD (Sticker progress bar list)
           --------------------------------------------------------- */}
        <ScrapbookCard
          colors={colors}
          isPrivate={!isInterestsPublic}
          rotate="-1deg"
          tapeColor={colors.tapePink}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{
              fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
              fontSize: 24,
              fontWeight: 'normal',
              color: colors.text,
            }}>
              What I care about
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {/* Community Badge */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 12,
                paddingVertical: 2,
                paddingHorizontal: 8,
                backgroundColor: colors.paperColor,
              }}>
                <Ionicons name="people-outline" size={11} color={colors.text} style={{ marginRight: 4, opacity: 0.6 }} />
                <Text style={{ fontFamily: 'Courier', fontSize: 9, fontWeight: 'bold', color: colors.text, opacity: 0.6 }}>COMMUNITY</Text>
              </View>

              <Pressable
                onPress={() => setIsManagePersonalsVisible(true)}
                style={{ padding: 4, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 6, backgroundColor: colors.paperColor }}
              >
                <Ionicons name="settings-outline" size={13} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => setIsInterestsPublic(!isInterestsPublic)}
                style={{ padding: 4, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 6, backgroundColor: colors.paperColor }}
              >
                <Ionicons name={isInterestsPublic ? "eye-outline" : "eye-off-outline"} size={13} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 12, paddingVertical: 6 }}>
            {domains.map((domain) => {
              const { color, hours } = getDomainStyle(domain);
              return (
                <View key={domain} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: color,
                      marginRight: 12,
                      borderWidth: 1.5,
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    }} />
                    <Text style={{
                      fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif-medium',
                      fontSize: 15,
                      color: colors.text,
                    }}>
                      {domain.replace(/🌱|🎓|🐶|🍎|👵|👦|🚨|🏠/g, '').trim()}
                    </Text>
                  </View>
                  <Text style={{
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    fontSize: 14,
                    color: colors.text,
                    opacity: 0.8,
                  }}>
                    {hours}
                  </Text>
                </View>
              );
            })}
            {domains.length === 0 && (
              <Text style={{ fontFamily: 'Courier', fontSize: 11, fontStyle: 'italic', color: colors.text, textAlign: 'center', marginVertical: 8 }}>
                No interests added yet. Tap settings to add!
              </Text>
            )}
          </View>
        </ScrapbookCard>

        {/* ---------------------------------------------------------
            THE NUMBERS CARD
           --------------------------------------------------------- */}
        <ScrapbookCard
          colors={colors}
          isPrivate={!isStatsPublic}
          rotate="1deg"
          tapeColor={colors.tapeBlue}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Courier', fontSize: 13, fontWeight: 'bold', color: colors.text, opacity: 0.8 }}>
              📊 THE NUMBERS
            </Text>
            <Pressable
              onPress={() => setIsStatsPublic(!isStatsPublic)}
              style={{ padding: 4, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 6, backgroundColor: colors.paperColor }}
            >
              <Ionicons name={isStatsPublic ? "eye-outline" : "eye-off-outline"} size={13} color={colors.text} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                {totalHours}
              </Text>
              <Text style={{ fontFamily: 'Courier', fontSize: 10, color: colors.text, marginTop: 4 }}>
                Hours
              </Text>
            </View>
            <View style={{ width: 1.5, height: 30, backgroundColor: colors.border, opacity: 0.3 }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                {journeyNodes.length}
              </Text>
              <Text style={{ fontFamily: 'Courier', fontSize: 10, color: colors.text, marginTop: 4 }}>
                Projects
              </Text>
            </View>
            <View style={{ width: 1.5, height: 30, backgroundColor: colors.border, opacity: 0.3 }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                {communitiesCount}
              </Text>
              <Text style={{ fontFamily: 'Courier', fontSize: 10, color: colors.text, marginTop: 4 }}>
                Stories
              </Text>
            </View>
          </View>

          {/* Certified volunteer banner at bottom */}
          <View style={{
            marginTop: 14,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderStyle: 'dashed',
            borderRadius: 4,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.text, letterSpacing: 1 }}>
              ♥ certified volunteer ♥
            </Text>
          </View>
        </ScrapbookCard>

        {/* ---------------------------------------------------------
            MANAGE PERSONALS BUTTON (CTAs to Full Modal Subpage)
           --------------------------------------------------------- */}
        <View style={{ marginVertical: 14 }}>
          <Button
            label="Manage Personals & Merits"
            onPress={() => setIsManagePersonalsVisible(true)}
            appearance="Primary"
            shape="Rounded"
            icon={<Ionicons name="folder-open-outline" size={18} color="#FFFFFF" />}
            isDarkMode={isDarkMode}
            style={{ width: '100%', height: 48 }}
          />
        </View>

        {/* ---------------------------------------------------------
            DEVELOPER SANDBOX MODE BUTTON
           --------------------------------------------------------- */}
        <View style={{ marginVertical: 14 }}>
          <Button
            label="Developer Sandbox Mode"
            onPress={() => setIsSandboxVisible(true)}
            appearance="Secondary"
            shape="Rounded"
            icon={<Ionicons name="flask-outline" size={18} color={themeColors.neutralForeground1} />}
            isDarkMode={isDarkMode}
            style={{ width: '100%', height: 48 }}
          />
        </View>

        {/* ---------------------------------------------------------
            LOG OUT BUTTON
           --------------------------------------------------------- */}
        {onLogout && (
          <View style={{ marginVertical: 14 }}>
            <Button
              label="Log Out"
              onPress={onLogout}
              appearance="Outline"
              shape="Rounded"
              icon={<Ionicons name="log-out-outline" size={18} color={themeColors.dangerForeground1} />}
              isDarkMode={isDarkMode}
              style={{ width: '100%', height: 48, borderColor: themeColors.dangerForeground1 }}
            />
          </View>
        )}

        {/* ---------------------------------------------------------
            VOLUNTEERING JOURNEY SECTION (Timeline/Map segment control)
           --------------------------------------------------------- */}
        <View style={{ marginTop: 18, marginBottom: 12 }}>
          {/* Section header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: 16, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                📍 THE ROAD SO FAR
              </Text>
              <View style={{ height: 4, backgroundColor: colors.primary, width: '100%', position: 'absolute', bottom: -2, zIndex: -1, opacity: 0.6 }} />
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {activeSegment === 'journey' && (
                <Pressable
                  onPress={() => setIsJourneyEditing(!isJourneyEditing)}
                  style={{ padding: 4, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 6, backgroundColor: isJourneyEditing ? colors.primary : colors.paperColor }}
                >
                  <Ionicons name="create-outline" size={13} color={colors.text} />
                </Pressable>
              )}
              <Pressable
                onPress={() => setIsJourneyPublic(!isJourneyPublic)}
                style={{ padding: 4, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 6, backgroundColor: colors.paperColor }}
              >
                <Ionicons name={isJourneyPublic ? "eye-outline" : "eye-off-outline"} size={13} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Segment Selector Buttons */}
          <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', borderRadius: 4, overflow: 'hidden', backgroundColor: colors.paperColor, marginVertical: 8 }}>
            <Pressable
              onPress={() => setActiveSegment('map')}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: activeSegment === 'map' ? colors.primary : colors.paperColor,
                borderRightWidth: 1,
                borderRightColor: 'rgba(0, 0, 0, 0.08)',
              }}
            >
              <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text }}>
                MAP VIEW
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveSegment('journey')}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: activeSegment === 'journey' ? colors.primary : colors.paperColor,
              }}
            >
              <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text }}>
                JOURNEY FEED
              </Text>
            </Pressable>
          </View>

          {/* Active Segment Rendering */}
          <View style={{ opacity: isJourneyPublic ? 1 : 0.8 }}>
            {activeSegment === 'map' ? (
              /* Custom Interactive Map Placeholder highlighting impact points in Gwalior and Chennai */
              <View style={{ transform: [{ rotate: '-1deg' }], marginVertical: 8 }}>
                <View style={{
                  backgroundColor: colors.paperColor,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  padding: 12,
                  minHeight: 220,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 5,
                  elevation: 2,
                }}>
                  {/* SVG map representation */}
                  <Svg width="100%" height="150" viewBox="0 0 200 120" style={{ marginBottom: 10 }}>
                    {/* Sketchy outline of India */}
                    <Path
                      d="M100 10 L108 30 L115 45 L120 60 L130 75 L120 90 L110 105 L100 115 L95 105 L85 95 L90 80 L80 65 L85 50 L92 35 Z"
                      fill={colors.secondary}
                      stroke={colors.border}
                      strokeWidth={1}
                      strokeDasharray="4 2"
                      opacity={0.4}
                    />
                    {/* Gwalior Pin */}
                    <Circle cx="95" cy="40" r="5" fill="#EF4444" stroke={colors.border} strokeWidth={1} />
                    <Line x1="95" y1="40" x2="60" y2="30" stroke={colors.border} strokeWidth={1} strokeDasharray="2 2" />
                    {/* Chennai Pin */}
                    <Circle cx="110" cy="85" r="5" fill="#3B82F6" stroke={colors.border} strokeWidth={1} />
                    <Line x1="110" y1="85" x2="150" y2="95" stroke={colors.border} strokeWidth={1} strokeDasharray="2 2" />
                  </Svg>
                  
                  {/* Pin labels */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', borderStyle: 'dashed', paddingTop: 8 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Courier', fontSize: 10, fontWeight: 'bold', color: '#EF4444' }}>🔴 GWALIOR</Text>
                      <Text style={{ fontFamily: 'Courier', fontSize: 9, color: colors.text }}>3 Campaigns</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Courier', fontSize: 10, fontWeight: 'bold', color: '#3B82F6' }}>🔵 CHENNAI</Text>
                      <Text style={{ fontFamily: 'Courier', fontSize: 9, color: colors.text }}>5 Campaigns</Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              /* Journey Timeline List as full-width Polaroid cards with top images, titles, dates, descriptions, and cause badges */
              <View style={{ gap: 16, marginTop: 8 }}>
                {journeyNodes.map((node, index) => {
                  const rot = index % 2 === 0 ? '-1.5deg' : '1.5deg';
                  return (
                    <View key={node.id} style={{ transform: [{ rotate: rot }] }}>
                      <View style={{
                        backgroundColor: colors.paperColor,
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.08)',
                        borderRadius: 4,
                        padding: 12,
                        position: 'relative',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 5,
                        elevation: 2,
                      }}>
                        {/* Washi Tape on each journey item */}
                        <WashiTape
                          color={index % 2 === 0 ? colors.tapePink : colors.tapeBlue}
                          style={{ top: -8, left: 15, width: 85, height: 16, transform: [{ rotate: '-2deg' }] }}
                        />

                        {/* Delete button when Journey is in edit mode */}
                        {isJourneyEditing && (
                          <Pressable
                            onPress={() => handleDeleteTimelineNode(node.id)}
                            style={{ position: 'absolute', top: 8, right: 8, padding: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 4, backgroundColor: colors.secondary }}
                          >
                            <Ionicons name="trash-outline" size={14} color="#c41818" />
                          </Pressable>
                        )}

                        {/* Top Image or Placeholder */}
                        {node.imageUri ? (
                          <View style={{ width: '100%', height: 160, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', overflow: 'hidden', marginTop: 14, marginBottom: 8, backgroundColor: colors.secondary }}>
                            <Image source={{ uri: node.imageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                          </View>
                        ) : (
                          <View style={{ width: '100%', height: 40, marginTop: 10 }} />
                        )}

                        <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.secondary }}>
                          {node.date}
                        </Text>
                        <Text style={{ fontFamily: 'Courier', fontSize: 15, fontWeight: 'bold', color: colors.text, marginTop: 4 }}>
                          {node.title}
                        </Text>
                        <Text style={{ fontFamily: 'Courier', fontSize: 11, color: colors.text, marginTop: 6, lineHeight: 15 }}>
                          {node.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {/* Journey Add Button */}
                <TouchableOpacity
                  onPress={() => setIsAddTimelineVisible(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: 4,
                    paddingVertical: 12,
                    backgroundColor: colors.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="add-circle-outline" size={18} color={colors.text} style={{ marginRight: 6 }} />
                    <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text }}>
                      ADD TO TIMELINE
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ---------------------------------------------------------
            PEN-PALS, CLUBS, EVENTS CARDS
           --------------------------------------------------------- */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
          {/* Pen-pals Card (Left) */}
          <View style={{ width: '48%', transform: [{ rotate: '-2deg' }] }}>
            <View style={{
              backgroundColor: colors.paperColor,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.08)',
              borderRadius: 4,
              padding: 10,
              minHeight: 120,
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 5,
              elevation: 2,
            }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.text }}>
                ✉ PEN-PALS
              </Text>
              
              {/* Overlapping Avatars */}
              <View style={{ flexDirection: 'row', marginVertical: 8, paddingLeft: 6 }}>
                {[
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80'
                ].map((uri, idx) => (
                  <View key={idx} style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    marginLeft: idx > 0 ? -10 : 0,
                    backgroundColor: colors.secondary
                  }}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                  </View>
                ))}
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: -10,
                }}>
                  <Text style={{ fontSize: 9, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>+5</Text>
                </View>
              </View>
              
              <Text style={{ fontFamily: 'Courier', fontSize: 9, color: colors.text }}>
                8 Active Pen-pals
              </Text>
            </View>
          </View>

          {/* Clubs Joined Card (Right) */}
          <View style={{ width: '48%', transform: [{ rotate: '2deg' }] }}>
            <View style={{
              backgroundColor: colors.paperColor,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.08)',
              borderRadius: 4,
              padding: 10,
              minHeight: 120,
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 5,
              elevation: 2,
            }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.text }}>
                ♣ CLUBS
              </Text>
              
              <View style={{ marginVertical: 4 }}>
                <Text style={{ fontFamily: 'Courier', fontSize: 10, fontWeight: 'bold', color: colors.text }}>• Eco Warriors</Text>
                <Text style={{ fontFamily: 'Courier', fontSize: 10, fontWeight: 'bold', color: colors.text }}>• Food Care India</Text>
                <Text style={{ fontFamily: 'Courier', fontSize: 10, fontWeight: 'bold', color: colors.text }}>• Tech For Youth</Text>
              </View>
              
              <Text style={{ fontFamily: 'Courier', fontSize: 9, color: colors.text }}>
                Member of 3 Clubs
              </Text>
            </View>
          </View>
        </View>

        {/* Events Joined Card */}
        <View style={{ marginTop: 12, transform: [{ rotate: '-1deg' }] }}>
          <View style={{
            backgroundColor: colors.paperColor,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.08)',
            borderRadius: 4,
            padding: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 5,
            elevation: 2,
          }}>
            <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>
              📅 Opportunities joined
            </Text>
            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 10, color: colors.text }}>• July 1 - Gwalior Plantation Drive (Registered)</Text>
              <Text style={{ fontFamily: 'Courier', fontSize: 10, color: colors.text }}>• July 15 - Children coding class (Teaching)</Text>
            </View>
          </View>
        </View>

        {/* ---------------------------------------------------------
            MERIT STICKERS GRID
           --------------------------------------------------------- */}
        <View style={{ marginTop: 18, marginBottom: 12 }}>
          <View style={{ position: 'relative', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              🏆 MERIT STICKERS
            </Text>
            <View style={{ height: 4, backgroundColor: colors.primary, width: '100%', position: 'absolute', bottom: -2, zIndex: -1, opacity: 0.6 }} />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
            <StickerBadge emoji="🏆" label="100+ Hours" bgColor="#FEF3C7" />
            <StickerBadge emoji="🌳" label="Tree Planter" bgColor="#D1FAE5" />
            <StickerBadge emoji="🥄" label="Soup Hero" bgColor="#FEE2E2" />
            <StickerBadge emoji="🐕" label="Dog Companion" bgColor="#F3E8FF" />
            <StickerBadge emoji="🔥" label="Food Rescuer" bgColor="#FFEDD5" />
            <StickerBadge emoji="✨" label="Learning Advocate" bgColor="#E0F2FE" />
          </View>
        </View>

        {/* ---------------------------------------------------------
            FOOTER SECTION
           --------------------------------------------------------- */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
          marginBottom: 10,
          borderTopWidth: 1.5,
          borderColor: colors.border,
          borderStyle: 'dashed',
          paddingTop: 16,
        }}>
          <Pressable onPress={() => Alert.alert('Privacy Policy', 'Your scrapbook profile data is kept strictly safe and secure.')}>
            <Text style={{ fontFamily: 'Courier', fontSize: 11, color: colors.text, textDecorationLine: 'underline' }}>
              Privacy Policy
            </Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert('Log Out', 'Are you sure you want to tear out your diary page and log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', onPress: () => console.log('Log out confirmed') }])}
            style={({ pressed }) => [
              {
                backgroundColor: '#EF4444',
                borderWidth: 2,
                borderColor: '#000000',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 20,
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
                elevation: 2,
                transform: [{ translateY: pressed ? 1.5 : 0 }],
              },
            ]}
          >
            <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: '#ffffff' }}>
              ✂ Log Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* =========================================================
          MODAL 1: EDIT BIO & INFO
          ========================================================= */}
      <Modal
        visible={isBioEditVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBioEditVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderWidth: 3,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxHeight: '85%',
              position: 'relative',
            }}
          >
            <LinedPaperBackground colors={colors} />
            
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                ✒ EDIT JOURNAL INFO
              </Text>
              <Pressable onPress={() => setIsBioEditVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Inputs */}
              <Text style={styles.modalLabel(colors)}>Diarist Name</Text>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                placeholder="Name"
                placeholderTextColor={colors.dotColor}
                style={styles.modalInput(colors)}
              />

              <Text style={styles.modalLabel(colors)}>Bio Slogan</Text>
              <TextInput
                value={tempBio}
                onChangeText={setTempBio}
                placeholder="Bio Slogan"
                placeholderTextColor={colors.dotColor}
                style={styles.modalInput(colors)}
              />

              <Text style={styles.modalLabel(colors)}>Profile Image URL</Text>
              <TextInput
                value={tempProfilePic}
                onChangeText={setTempProfilePic}
                placeholder="Profile picture URL"
                placeholderTextColor={colors.dotColor}
                style={styles.modalInput(colors)}
              />

              <Text style={styles.modalLabel(colors)}>Cover Banner URL</Text>
              <TextInput
                value={tempBannerPic}
                onChangeText={setTempBannerPic}
                placeholder="Cover banner URL"
                placeholderTextColor={colors.dotColor}
                style={styles.modalInput(colors)}
              />

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <Pressable
                  onPress={() => setIsBioEditVisible(false)}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    marginRight: 10,
                    backgroundColor: colors.paperColor,
                  }}
                >
                  <Text style={{ fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>Cancel</Text>
                </Pressable>
                
                <Pressable
                  onPress={handleSaveBio}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>Save Changes</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================
          MODAL 2: MANAGE PERSONALS (Subpage Ecosystem)
          ========================================================= */}
      <Modal
        visible={isManagePersonalsVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsManagePersonalsVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
          <LinedPaperBackground colors={colors} />
          
          {/* Subpage custom scrapbook header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 3,
              borderColor: colors.border,
              backgroundColor: colors.paperColor,
            }}
          >
            <Text style={{ fontFamily: 'Courier', fontSize: 16, fontWeight: 'bold', color: colors.text }}>
              📁 MANAGE PERSONALS
            </Text>
            <Pressable
              onPress={() => setIsManagePersonalsVisible(false)}
              style={({ pressed }) => [
                {
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderRadius: 6,
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  backgroundColor: colors.primary,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text }}>
                DONE ✓
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hour display Section - Read-Only */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 13, fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', marginBottom: 10 }}>
                ⏱ TOTAL HOURS (AUTO-UPDATED)
              </Text>
              
              <ScrapbookCard colors={colors}>
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 32, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>
                    {totalHours}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Courier', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
                    Total Completed Hours
                  </Text>
                </View>
              </ScrapbookCard>
            </View>

            {/* Domains Selector (Checkbox style stickers) */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 13, fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', marginBottom: 10 }}>
                🌱 TOGGLE INTEREST DOMAINS
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                {[
                  'Environment 🌱',
                  'Education 🎓',
                  'Animal Welfare 🐶',
                  'Food Rescue 🍎',
                  'Elderly Care 👵',
                  'Youth Mentoring 👦',
                  'Disaster Relief 🚨',
                  'Homeless Shelter 🏠'
                ].map((item) => {
                  const isSelected = domains.includes(item);
                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        let nextDomains;
                        if (isSelected) {
                          nextDomains = domains.filter(d => d !== item);
                        } else {
                          nextDomains = [...domains, item];
                        }
                        setDomains(nextDomains);
                        Personalization.setBookmarkedDomains(nextDomains);
                      }}
                      style={({ pressed }) => [
                        {
                          borderWidth: 2,
                          borderColor: colors.border,
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          margin: 4,
                          backgroundColor: isSelected ? colors.primary : colors.paperColor,
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                        },
                      ]}
                    >
                      <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.text }}>
                        {item} {isSelected ? '✓' : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Certificates Showcase (Polaroid Frame grid) */}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 13, fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', marginBottom: 12 }}>
                🎖 MY MERIT CERTIFICATES (POLAROIDS)
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                {certificates.map((cert, index) => {
                  const rotations = ['-3deg', '4deg', '-1deg'];
                  const selectedRotation = rotations[index % rotations.length];
                  
                  return (
                    <View key={cert.title} style={{ width: (screenWidth - 48) / 3 }}>
                      <PolaroidFrame
                        imageUri="" // blank since badge renders an SVG ribbon
                        caption={cert.title}
                        size={(screenWidth - 100) / 3}
                        colors={colors}
                        rotation={selectedRotation}
                        isBadge={cert.badge}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* =========================================================
          MODAL 3: ADD TIMELINE NODE
          ========================================================= */}
      <Modal
        visible={isAddTimelineVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddTimelineVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderWidth: 3,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxHeight: '80%',
            }}
          >
            <LinedPaperBackground colors={colors} />
            
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Courier', fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                📌 ADD EXPERIENCE CARD
              </Text>
              <Pressable onPress={() => setIsAddTimelineVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel(colors)}>Campaign/Experience Title</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Tree Plantation Drive"
                placeholderTextColor={colors.dotColor}
                style={styles.modalInput(colors)}
              />

              <Text style={styles.modalLabel(colors)}>Date Tag</Text>
              <TextInput
                value={newDate}
                onChangeText={setNewDate}
                placeholder="e.g. June 2026"
                placeholderTextColor={colors.dotColor}
                style={styles.modalInput(colors)}
              />

              <Text style={styles.modalLabel(colors)}>Short Description</Text>
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="What did you accomplish?"
                placeholderTextColor={colors.dotColor}
                style={[styles.modalInput(colors), { height: 80, textAlignVertical: 'top' }]}
                multiline={true}
              />

              <Text style={styles.modalLabel(colors)}>Image URL (Optional)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  value={newImageUri}
                  onChangeText={setNewImageUri}
                  placeholder="https://example.com/photo.jpg"
                  placeholderTextColor={colors.dotColor}
                  style={[styles.modalInput(colors), { flex: 1 }]}
                />
                <TouchableOpacity
                  onPress={() => {
                    const samples = [
                      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1469571486040-af250788a3b0?auto=format&fit=crop&w=400&q=80',
                    ];
                    const rand = samples[Math.floor(Math.random() * samples.length)];
                    setNewImageUri(rand);
                  }}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: colors.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.text }}>
                    ✨ Auto-Fill
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <Pressable
                  onPress={() => setIsAddTimelineVisible(false)}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    marginRight: 10,
                    backgroundColor: colors.paperColor,
                  }}
                >
                  <Text style={{ fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>Cancel</Text>
                </Pressable>
                
                <Pressable
                  onPress={handleAddTimelineNode}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>Add Card</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================
          MODAL 4: DEVELOPER SANDBOX MODE
          ========================================================= */}
      <Modal
        visible={isSandboxVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsSandboxVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
          <SandboxCommunityView isDarkMode={isDarkMode} onBack={() => setIsSandboxVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

// ---------------------------------------------------------
// Styling Helpers
// ---------------------------------------------------------
const styles = {
  modalLabel: (colors: ScrapbookThemeColors) => ({
    fontFamily: 'Courier',
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  }),
  modalInput: (colors: ScrapbookThemeColors) => ({
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    backgroundColor: colors.paperColor,
    color: colors.text,
    fontFamily: 'Courier',
    fontSize: 13,
  }),
};
