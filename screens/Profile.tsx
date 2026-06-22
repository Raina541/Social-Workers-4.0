import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Pattern, Circle, Rect, Path } from 'react-native-svg';
import { useScrapbookTheme, ScrapbookThemeColors, ScrapbookTheme } from '../context/ScrapbookThemeContext';
import { PresenceState } from '../components/Avatar';

const { width: screenWidth } = Dimensions.get('window');

// ---------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------
interface ProfileProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  presence: PresenceState;
  onChangePresence: (state: PresenceState) => void;
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

// Subtle Dot Grid Background using SVG Pattern
const DotGridBackground: React.FC<{ colors: ScrapbookThemeColors }> = ({ colors }) => (
  <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, zIndex: -10 }]}>
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="scrapbook-dot-grid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <Circle cx="11" cy="11" r="1.5" fill={colors.dotColor} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#scrapbook-dot-grid)" />
    </Svg>
  </View>
);

// Washi Tape Overlay with rotated border and jagged design
const WashiTape: React.FC<{ color: string; style?: any; text?: string }> = ({ color, style, text }) => (
  <View
    style={[
      {
        position: 'absolute',
        backgroundColor: color,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderStyle: 'dashed',
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 1,
        zIndex: 10,
      },
      style,
    ]}
  >
    {text && (
      <Text style={{ fontFamily: 'Courier', fontSize: 10, fontWeight: 'bold', color: 'rgba(0,0,0,0.6)', letterSpacing: 0.5 }}>
        {text}
      </Text>
    )}
  </View>
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

// Polaroid-style Image Frame with Caption and Rotation
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
        borderWidth: 2.5,
        borderColor: colors.border,
        shadowColor: colors.border,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
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
        borderWidth: 2,
        borderColor: colors.border,
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

// Double-border Card with Hard Solid Shadows to simulate custom papers
const ScrapbookCard: React.FC<{
  children: React.ReactNode;
  colors: ScrapbookThemeColors;
  style?: any;
  rotate?: string;
  isPrivate?: boolean;
  tapeColor?: string;
  tapeText?: string;
}> = ({ children, colors, style, rotate = '0deg', isPrivate = false, tapeColor, tapeText }) => {
  return (
    <View style={{ marginVertical: 12, transform: [{ rotate }] }}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.border,
            borderRadius: 8,
            top: 5,
            left: 5,
          },
        ]}
      />
      <View
        style={[
          {
            backgroundColor: colors.paperColor,
            borderWidth: 2.5,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 16,
            opacity: isPrivate ? 0.82 : 1,
            position: 'relative',
            overflow: 'hidden',
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
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <View
              style={{
                borderWidth: 2,
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
            text={tapeText}
            style={{ top: -8, left: '30%', width: 110, height: 18, transform: [{ rotate: '-3deg' }] }}
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

// ---------------------------------------------------------
// Main Profile Component
// ---------------------------------------------------------
export const Profile: React.FC<ProfileProps> = ({
  isDarkMode,
  onToggleDarkMode,
  presence,
  onChangePresence,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, setTheme, colors } = useScrapbookTheme();

  // User Profile States
  const [name, setName] = useState('Nilap Saha');
  const [bio, setBio] = useState('Senior Case Manager • East County Division');
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [bannerPic, setBannerPic] = useState('https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80');

  // Volunteering Stats States
  const [totalHours, setTotalHours] = useState(142);
  const [domains, setDomains] = useState<string[]>([
    'Environment 🌱',
    'Education 🎓',
    'Animal Welfare 🐶',
    'Food Rescue 🍎'
  ]);
  const [consistencyTag, setConsistencyTag] = useState('Bi-Monthly Volunteer');

  // Social Stats States
  const [friendsCount, setFriendsCount] = useState(48);
  const [followersCount, setFollowersCount] = useState(120);
  const [communitiesCount, setCommunitiesCount] = useState(6);

  // Volunteering Journey States
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>([
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
  ]);

  // Privacy Settings (Visibility)
  const [isBioPublic, setIsBioPublic] = useState(true);
  const [isStatsPublic, setIsStatsPublic] = useState(true);
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
      {/* Dynamic Dot Grid Background */}
      <DotGridBackground colors={colors} />

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

        {/* ---------------------------------------------------------
            HEADER & BIO SECTION (Rectangular banner + Polaroid profile pic)
           --------------------------------------------------------- */}
        <View style={{ marginBottom: 16 }}>
          <ScrapbookSectionHeader
            title="Header & Bio"
            onEdit={handleOpenBioEdit}
            isPublic={isBioPublic}
            onToggleVisibility={() => setIsBioPublic(!isBioPublic)}
            colors={colors}
          />
          
          <View style={{ marginTop: 8 }}>
            <View style={{ height: 160, position: 'relative', marginBottom: 60 }}>
              {/* Shadow for banner */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: colors.border,
                    borderRadius: 10,
                    top: 5,
                    left: 5,
                  },
                ]}
              />
              {/* Banner image */}
              <View
                style={{
                  flex: 1,
                  borderWidth: 3,
                  borderColor: colors.border,
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: colors.secondary,
                }}
              >
                <Image source={{ uri: bannerPic }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
              </View>
              
              {/* Diagonal tape on banner */}
              <WashiTape
                color={colors.tapePink}
                text="NGO DIARY"
                style={{ top: -6, left: 15, width: 90, height: 20, transform: [{ rotate: '-6deg' }] }}
              />
              <WashiTape
                color={colors.tapeBlue}
                text="CREATOR"
                style={{ bottom: 10, right: -15, width: 85, height: 20, transform: [{ rotate: '15deg' }] }}
              />

              {/* Polaroid Photo overlapping center bottom of the banner */}
              <View
                style={{
                  position: 'absolute',
                  bottom: -60,
                  left: '50%',
                  marginLeft: -60, // center 120px wide frame
                  width: 120,
                  zIndex: 20,
                }}
              >
                <PolaroidFrame
                  imageUri={profilePic}
                  caption="ME!"
                  size={95}
                  colors={colors}
                  rotation="1deg"
                />
              </View>
            </View>

            {/* Name & Bio Typography block */}
            <ScrapbookCard colors={colors} isPrivate={!isBioPublic} style={{ alignItems: 'center', paddingTop: 10 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'Courier',
                  fontWeight: 'bold',
                  color: colors.text,
                  textAlign: 'center',
                }}
              >
                {name}
              </Text>
              
              {/* Cute handdrawn accents surrounding bio */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingHorizontal: 12 }}>
                <HandDrawnHeart size={14} color={colors.accentStar} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'Courier',
                    color: colors.text,
                    textAlign: 'center',
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                >
                  {bio}
                </Text>
                <HandDrawnStar size={14} color={colors.accentStar} style={{ marginLeft: 6 }} />
              </View>
            </ScrapbookCard>
          </View>
        </View>

        {/* ---------------------------------------------------------
            THEME PICKER STAMP ROW
           --------------------------------------------------------- */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Courier', fontSize: 13, fontWeight: 'bold', color: colors.text, marginBottom: 8, letterSpacing: 0.8 }}>
            🎨 JOURNAL SKIN SELECTOR
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {(['Neon Pop', 'Kraft Paper', 'Pastel Dream', 'Monochrome Sketch'] as ScrapbookTheme[]).map((themeName) => {
              const isActive = theme === themeName;
              let stampBg = '#F4EBE1';
              let stampBorder = '#5C4033';
              
              if (themeName === 'Neon Pop') { stampBg = '#1e1e24'; stampBorder = '#000000'; }
              else if (themeName === 'Pastel Dream') { stampBg = '#FFF0F5'; stampBorder = '#4B0082'; }
              else if (themeName === 'Monochrome Sketch') { stampBg = '#FFFFFF'; stampBorder = '#000000'; }

              return (
                <Pressable
                  key={themeName}
                  onPress={() => setTheme(themeName)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      marginHorizontal: 3,
                      borderWidth: isActive ? 2.5 : 1.5,
                      borderColor: isActive ? colors.accentStar : stampBorder,
                      borderRadius: 6,
                      backgroundColor: stampBg,
                      paddingVertical: 8,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: isActive ? 1 : 0, height: isActive ? 2 : 1 },
                      shadowOpacity: 0.15,
                      shadowRadius: 1,
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: isActive ? 1.03 : 1 }],
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
            VOLUNTEERING STATS SECTION
           --------------------------------------------------------- */}
        <View style={{ marginBottom: 16 }}>
          <ScrapbookSectionHeader
            title="Volunteering Stats"
            isPublic={isStatsPublic}
            onToggleVisibility={() => setIsStatsPublic(!isStatsPublic)}
            colors={colors}
          />
          <View style={{ opacity: isStatsPublic ? 1 : 0.8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              {/* Total Hours Post-it */}
              <View style={{ flex: 1, marginRight: 8, transform: [{ rotate: '-2deg' }] }}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.border, borderRadius: 6, top: 4, left: 4 }]} />
                <View style={{ backgroundColor: colors.paperColor, borderWidth: 2, borderColor: colors.border, borderRadius: 6, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>
                    {totalHours}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Courier', color: colors.text, textAlign: 'center', marginTop: 2 }}>
                    Total Hours
                  </Text>
                </View>
                <WashiTape color={colors.tapePink} style={{ top: -8, left: 10, width: 45, height: 12 }} />
              </View>

              {/* Domains Post-it */}
              <View style={{ flex: 1, marginRight: 8, transform: [{ rotate: '2deg' }] }}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.border, borderRadius: 6, top: 4, left: 4 }]} />
                <View style={{ backgroundColor: colors.paperColor, borderWidth: 2, borderColor: colors.border, borderRadius: 6, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>
                    {domains.length}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Courier', color: colors.text, textAlign: 'center', marginTop: 2 }}>
                    Domains
                  </Text>
                </View>
                <WashiTape color={colors.tapeBlue} style={{ top: -8, right: 10, width: 45, height: 12 }} />
              </View>

              {/* Consistency Post-it */}
              <View style={{ flex: 1.2, transform: [{ rotate: '-1deg' }] }}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.border, borderRadius: 6, top: 4, left: 4 }]} />
                <View style={{ backgroundColor: colors.paperColor, borderWidth: 2, borderColor: colors.border, borderRadius: 6, padding: 10, alignItems: 'center', justifyContent: 'center', minHeight: 65 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>
                    {consistencyTag}
                  </Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Courier', color: colors.text, textAlign: 'center', marginTop: 4 }}>
                    Tier Status
                  </Text>
                </View>
                <WashiTape color={colors.tapeGreen} style={{ top: -8, left: '20%', width: 50, height: 12 }} />
              </View>
            </View>
            
            {!isStatsPublic && (
              <View style={{ position: 'absolute', top: 12, left: '30%', right: '30%', padding: 4, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.border, transform: [{ rotate: '-4deg' }], alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>🔒 PRIVATE STATS</Text>
              </View>
            )}
          </View>
        </View>

        {/* ---------------------------------------------------------
            DOMAINS OF INTEREST SECTION (Sticker tags list)
           --------------------------------------------------------- */}
        <View style={{ marginBottom: 16 }}>
          <ScrapbookSectionHeader
            title="Domains of Interest"
            onEdit={() => setIsManagePersonalsVisible(true)}
            isPublic={isInterestsPublic}
            onToggleVisibility={() => setIsInterestsPublic(!isInterestsPublic)}
            colors={colors}
          />

          <View style={{ opacity: isInterestsPublic ? 1 : 0.8, marginTop: 6 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12 }}>
              {domains.map((domain, index) => {
                // Alternate rotations for sticker pasting effect
                const rot = (index % 4 === 0) ? '-3deg' : (index % 4 === 1) ? '4deg' : (index % 4 === 2) ? '-2deg' : '2deg';
                const tapeHues = [colors.tapePink, colors.tapeBlue, colors.tapeGreen];
                const stickerTape = tapeHues[index % tapeHues.length];

                return (
                  <View
                    key={domain}
                    style={{
                      transform: [{ rotate: rot }],
                      marginVertical: 4,
                    }}
                  >
                    {/* Sticker shadow */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.border, borderRadius: 12, top: 3, left: 3 }]} />
                    <View
                      style={{
                        backgroundColor: colors.paperColor,
                        borderWidth: 2,
                        borderColor: colors.border,
                        borderRadius: 12,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Text style={{ fontFamily: 'Courier', fontWeight: 'bold', fontSize: 12, color: colors.text }}>
                        {domain}
                      </Text>
                    </View>
                    
                    {/* Small dot tape at corner */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -5,
                        left: 10,
                        width: 14,
                        height: 10,
                        backgroundColor: stickerTape,
                        transform: [{ rotate: '45deg' }],
                        opacity: 0.8,
                      }}
                    />
                  </View>
                );
              })}
            </View>
            
            {!isInterestsPublic && (
              <View style={{ position: 'absolute', top: 10, left: '30%', right: '30%', padding: 4, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.border, transform: [{ rotate: '3deg' }], alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontFamily: 'Courier', fontWeight: 'bold', color: colors.text }}>🔒 STICKERS SECRET</Text>
              </View>
            )}
          </View>
        </View>

        {/* ---------------------------------------------------------
            SOCIAL STATS SECTION
           --------------------------------------------------------- */}
        <View style={{ marginBottom: 16 }}>
          <ScrapbookSectionHeader
            title="Social Stats"
            isPublic={isSocialPublic}
            onToggleVisibility={() => setIsSocialPublic(!isSocialPublic)}
            colors={colors}
          />

          <View style={{ opacity: isSocialPublic ? 1 : 0.8, marginTop: 6 }}>
            <ScrapbookCard colors={colors} isPrivate={!isSocialPublic} rotate="1deg">
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text }}>
                    FRIENDS
                  </Text>
                  <Text style={{ fontFamily: 'Courier', fontSize: 20, fontWeight: 'bold', color: colors.secondary, marginTop: 4 }}>
                    {friendsCount}
                  </Text>
                </View>
                <View style={{ width: 2, height: 35, backgroundColor: colors.border, opacity: 0.3 }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text }}>
                    FOLLOWERS
                  </Text>
                  <Text style={{ fontFamily: 'Courier', fontSize: 20, fontWeight: 'bold', color: colors.secondary, marginTop: 4 }}>
                    {followersCount}
                  </Text>
                </View>
                <View style={{ width: 2, height: 35, backgroundColor: colors.border, opacity: 0.3 }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text }}>
                    GROUPS
                  </Text>
                  <Text style={{ fontFamily: 'Courier', fontSize: 20, fontWeight: 'bold', color: colors.secondary, marginTop: 4 }}>
                    {communitiesCount}
                  </Text>
                </View>
              </View>
            </ScrapbookCard>
          </View>
        </View>

        {/* ---------------------------------------------------------
            MANAGE PERSONALS BUTTON (CTAs to Full Modal Subpage)
           --------------------------------------------------------- */}
        <View style={{ marginVertical: 14 }}>
          {/* Shadow of Button */}
          <View
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              right: -4,
              bottom: -4,
              backgroundColor: colors.border,
              borderRadius: 8,
            }}
          />
          <Pressable
            onPress={() => setIsManagePersonalsVisible(true)}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                borderWidth: 2.5,
                borderColor: colors.border,
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ translateY: pressed ? 2 : 0 }, { translateX: pressed ? 2 : 0 }],
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="folder-open-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={{ fontFamily: 'Courier', fontSize: 14, fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Manage Personals & Merits
              </Text>
            </View>
          </Pressable>
        </View>

        {/* ---------------------------------------------------------
            VOLUNTEERING JOURNEY SECTION (Timeline)
           --------------------------------------------------------- */}
        <View style={{ marginBottom: 16 }}>
          <ScrapbookSectionHeader
            title="Volunteering Journey"
            onEdit={() => setIsJourneyEditing(!isJourneyEditing)}
            isPublic={isJourneyPublic}
            onToggleVisibility={() => setIsJourneyPublic(!isJourneyPublic)}
            colors={colors}
          />

          <View style={{ opacity: isJourneyPublic ? 1 : 0.8, marginTop: 6, position: 'relative' }}>
            {/* Timeline Vertical Axis Line (Pencil sketch style) */}
            <View
              style={{
                position: 'absolute',
                left: 14,
                top: 15,
                bottom: 15,
                width: 3,
                backgroundColor: colors.border,
                borderStyle: 'dashed',
                opacity: 0.6,
              }}
            />

            {/* List of journey cards */}
            {journeyNodes.map((node, index) => {
              const nodeRotation = index % 2 === 0 ? '-1deg' : '1deg';
              return (
                <View key={node.id} style={{ flexDirection: 'row', marginBottom: 20 }}>
                  {/* Timeline circle node */}
                  <View
                    style={{
                      width: 30,
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingTop: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: colors.primary,
                        borderWidth: 2,
                        borderColor: colors.border,
                        zIndex: 2,
                      }}
                    />
                  </View>

                  {/* Journey Content Card */}
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <ScrapbookCard colors={colors} rotate={nodeRotation} style={{ marginVertical: 0, padding: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.secondary }}>
                          {node.date}
                        </Text>
                        
                        {/* Delete button when Journey is in edit mode */}
                        {isJourneyEditing && (
                          <Pressable
                            onPress={() => handleDeleteTimelineNode(node.id)}
                            style={{ padding: 2 }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#c41818" />
                          </Pressable>
                        )}
                      </View>
                      <Text style={{ fontFamily: 'Courier', fontSize: 14, fontWeight: 'bold', color: colors.text, marginTop: 4 }}>
                        {node.title}
                      </Text>
                      <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'flex-start' }}>
                        {node.imageUri && (
                          <View style={{ marginRight: 10, marginTop: 2 }}>
                            <PolaroidFrame
                              imageUri={node.imageUri}
                              size={64}
                              colors={colors}
                              rotation="-1deg"
                            />
                          </View>
                        )}
                        {node.description ? (
                          <Text style={{ flex: 1, fontFamily: 'Courier', fontSize: 11, color: colors.text, lineHeight: 14 }}>
                            {node.description}
                          </Text>
                        ) : null}
                      </View>
                    </ScrapbookCard>
                  </View>
                </View>
              );
            })}

            {/* Journey Append Timeline Node Button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, marginTop: 8 }}>
              {/* Timeline circle */}
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.paperColor,
                  borderWidth: 2,
                  borderColor: colors.border,
                  marginRight: 16,
                }}
              />
              {/* Doodle Add Button */}
              <TouchableOpacity
                onPress={() => setIsAddTimelineVisible(true)}
                style={{
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderRadius: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: colors.secondary,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: colors.text }}>
                  ADD TO TIMELINE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ---------------------------------------------------------
            LOGOUT / TEAR PAGE BUTTON
           --------------------------------------------------------- */}
        <View style={{ marginTop: 24, marginBottom: 20 }}>
          <View
            style={{
              position: 'absolute',
              top: 3,
              left: 3,
              right: -3,
              bottom: -3,
              backgroundColor: colors.border,
              borderRadius: 6,
            }}
          />
          <Pressable
            onPress={() => Alert.alert('Log Out', 'Are you sure you want to tear out your diary page and log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', onPress: () => console.log('Log out confirmed') }])}
            style={({ pressed }) => [
              {
                backgroundColor: colors.paperColor,
                borderWidth: 2,
                borderColor: '#c41818',
                borderRadius: 6,
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ translateY: pressed ? 1.5 : 0 }],
              },
            ]}
          >
            <Text style={{ fontFamily: 'Courier', fontSize: 13, fontWeight: 'bold', color: '#c41818', letterSpacing: 1.5 }}>
              ✂ RIP OUT PAGE (LOGOUT)
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
            <DotGridBackground colors={colors} />
            
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
          <DotGridBackground colors={colors} />
          
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
                        if (isSelected) {
                          setDomains(domains.filter(d => d !== item));
                        } else {
                          setDomains([...domains, item]);
                        }
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
            <DotGridBackground colors={colors} />
            
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
