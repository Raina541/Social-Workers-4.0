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
  Switch,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import opportunitiesData from '../services/opportunities.json';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? Spacing.xxxl + Spacing.xs + 36 : Spacing.l + 36;

// Dynamic dynamic IP resolver for local simulation/expo go runs
const getBackendUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const ip = hostUri ? hostUri.split(':')[0] : 'localhost';
  return `http://${ip}:5000`;
};

interface QuestionItem {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  replies: Array<{ author: string; content: string; time: string }>;
}

interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
  status: 'uploaded' | 'pending' | 'not_connected';
  lastUpdated: string | null;
  description?: string;
}

const renderAccessibilityTagIcon = (label: string, color: string) => {
  const l = label.toLowerCase();
  if (l.includes('wheelchair')) {
    return <MaterialIcons name="accessible" size={14} color={color} style={{ marginRight: Spacing.xxs }} />;
  } else if (l.includes('asl') || l.includes('signing') || l.includes('interpreter')) {
    return <MaterialCommunityIcons name="sign-language" size={14} color={color} style={{ marginRight: Spacing.xxs }} />;
  } else if (l.includes('sensory') || l.includes('ear') || l.includes('leaf') || l.includes('pace')) {
    return <Ionicons name="leaf-outline" size={14} color={color} style={{ marginRight: Spacing.xxs }} />;
  } else if (l.includes('seating') || l.includes('chair')) {
    return <MaterialIcons name="event-seat" size={14} color={color} style={{ marginRight: Spacing.xxs }} />;
  } else if (l.includes('quiet') || l.includes('rest') || l.includes('moon') || l.includes('shield')) {
    return <Ionicons name="moon-outline" size={14} color={color} style={{ marginRight: Spacing.xxs }} />;
  } else if (l.includes('large-print') || l.includes('magnifying') || l.includes('font')) {
    return <Ionicons name="text-outline" size={14} color={color} style={{ marginRight: Spacing.xxs }} />;
  }
  return <Ionicons name="help-circle-outline" size={14} color={color} style={{ marginRight: Spacing.xxs }} />;
};

const getCombinedHeading = (title: string, desc: string) => {
  if (!desc) return title;
  let cleanDesc = desc.trim();
  if (cleanDesc.endsWith('.')) {
    cleanDesc = cleanDesc.slice(0, -1);
  }

  // Overrides mapping array to ensure clean combined natural headings without repetitive wording
  const overrides = [
    {
      titleKey: "upload shelter donation receipts",
      combined: "Scan and upload community transit shelter food donation receipts for audit"
    },
    {
      titleKey: "build a thriving community garden",
      combined: "Build a thriving community garden to turn a neglected corner lot into a flourishing food source"
    },
    {
      titleKey: "mentoring students",
      combined: "Mentoring students to help them build confidence through reading"
    },
    {
      titleKey: "sort and pack medical supplies",
      combined: "Sort and package medical supplies for rural clinics"
    }
  ];

  const matched = overrides.find(o => title.toLowerCase().includes(o.titleKey));
  if (matched) {
    return matched.combined;
  }

  const titleLower = title.toLowerCase();
  const descLower = cleanDesc.toLowerCase();

  if (descLower.startsWith(titleLower)) {
    return cleanDesc;
  }

  // Strip generic introductory time commitments that repeat the title's action
  const spendActionPrefix = `spend a few hours ${titleLower} and `;
  const spendToPrefix = `spend a few hours to ${titleLower} and `;
  const spendGenericPrefix = `spend a few hours `;
  
  if (descLower.startsWith(spendActionPrefix)) {
    cleanDesc = cleanDesc.substring(spendActionPrefix.length);
  } else if (descLower.startsWith(spendToPrefix)) {
    cleanDesc = cleanDesc.substring(spendToPrefix.length);
  } else if (descLower.startsWith(spendGenericPrefix)) {
    cleanDesc = cleanDesc.substring(spendGenericPrefix.length);
  }

  // Strip repetitive verbs if description repeats the action of the title
  // E.g. Title is "Sort and Pack...", description starts with "Help sort and pack..."
  const titleWords = title.split(' ').map(w => w.toLowerCase());
  if (titleWords.length > 0) {
    const firstVerb = titleWords[0];
    if (descLower.startsWith(`help ${firstVerb} and `)) {
      cleanDesc = cleanDesc.substring(`help ${firstVerb} and `.length);
    } else if (descLower.startsWith(`help ${firstVerb} `)) {
      cleanDesc = cleanDesc.substring(`help ${firstVerb} `.length);
    } else if (descLower.startsWith(`${firstVerb} and `)) {
      cleanDesc = cleanDesc.substring(`${firstVerb} and `.length);
    } else if (descLower.startsWith(`${firstVerb} `)) {
      cleanDesc = cleanDesc.substring(`${firstVerb} `.length);
    }
  }

  // Dynamic stitching helper based on prefix verb of description
  if (cleanDesc.toLowerCase().startsWith('helping ')) {
    return `${title} to help ${cleanDesc.substring(8)}`;
  }
  if (cleanDesc.toLowerCase().startsWith('help ')) {
    return `${title} to help ${cleanDesc.substring(5)}`;
  }

  const firstChar = cleanDesc.charAt(0).toLowerCase();
  return `${title} to ${firstChar}${cleanDesc.slice(1)}`;
};

interface OpportunityDetailProps {
  opportunityId: string;
  isDarkMode?: boolean;
  onBack: () => void;
  onViewNgo: (ngoName: string) => void;
}

export function OpportunityDetail({
  opportunityId = 'opp_garden',
  isDarkMode = false,
  onBack,
  onViewNgo,
}: OpportunityDetailProps) {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const backendUrl = getBackendUrl();

  const formatLogisticsDate = (dateStr: string) => {
    if (!dateStr) return '';
    let formatted = dateStr.replace('Saturday', 'Sat')
                           .replace('Sunday', 'Sun')
                           .replace('Monday', 'Mon')
                           .replace('Tuesday', 'Tue')
                           .replace('Wednesday', 'Wed')
                           .replace('Thursday', 'Thu')
                           .replace('Friday', 'Fri');
    formatted = formatted.replace(', 2026', '');
    return formatted;
  };

  const formatLogisticsVenue = (locName: string) => {
    if (!locName) return 'Venue';
    const parts = locName.split(',');
    if (parts.length > 1) {
      return `${parts[0].trim()}\n${parts[1].trim()}`;
    }
    return parts[0].trim();
  };

  const formatLogisticsDuration = (durationHrs: number) => {
    if (!durationHrs) return 'One-time';
    if (durationHrs === 0.25) return '15 mins';
    if (durationHrs === 0.5) return '30 mins';
    if (durationHrs === 0.75) return '45 mins';
    return `${durationHrs} hours`;
  };

  const getRequirementIcon = (req: string): any => {
    const text = req.toLowerCase();
    if (
      text.includes('empathetic') ||
      text.includes('respectful') ||
      text.includes('friendly') ||
      text.includes('demeanor') ||
      text.includes('patience') ||
      text.includes('respect')
    ) {
      return 'heart-outline';
    }
    if (
      text.includes('outdoor') ||
      text.includes('outdoors') ||
      text.includes('evening') ||
      text.includes('night') ||
      text.includes('stand') ||
      text.includes('walk') ||
      text.includes('physical')
    ) {
      return 'body-outline';
    }
    if (
      text.includes('transport') ||
      text.includes('team') ||
      text.includes('logistics') ||
      text.includes('bus') ||
      text.includes('coordinate')
    ) {
      return 'bus-outline';
    }
    if (
      text.includes('language') ||
      text.includes('speak') ||
      text.includes('english') ||
      text.includes('hindi')
    ) {
      return 'language-outline';
    }
    return 'alert-circle-outline';
  };

  // Dynamic icon resolver for task/duty line items
  const getDutyIcon = (duty: string): any => {
    const text = duty.toLowerCase();
    if (text.includes('assemble') || text.includes('packet') || text.includes('pack') || text.includes('container') || text.includes('thermal')) {
      return 'cube-outline';
    }
    if (text.includes('distribute') || text.includes('transit') || text.includes('deliver') || text.includes('meal') || text.includes('dispatch')) {
      return 'car-outline';
    }
    if (text.includes('verify') || text.includes('log') || text.includes('count') || text.includes('check') || text.includes('inventory') || text.includes('audit')) {
      return 'clipboard-outline';
    }
    if (text.includes('collect') || text.includes('recycle') || text.includes('clean') || text.includes('waste') || text.includes('packaging')) {
      return 'refresh-circle-outline';
    }
    if (text.includes('build') || text.includes('timber') || text.includes('structure') || text.includes('construct') || text.includes('install')) {
      return 'hammer-outline';
    }
    if (text.includes('garden') || text.includes('plant') || text.includes('sapling') || text.includes('soil') || text.includes('mulch') || text.includes('water') || text.includes('seed') || text.includes('manure') || text.includes('compost')) {
      return 'leaf-outline';
    }
    if (text.includes('sort') || text.includes('organize') || text.includes('categorize') || text.includes('arrange') || text.includes('bundle')) {
      return 'funnel-outline';
    }
    if (text.includes('read') || text.includes('listen') || text.includes('book') || text.includes('mentor') || text.includes('teach') || text.includes('encourage') || text.includes('feedback') || text.includes('tutor')) {
      return 'book-outline';
    }
    if (text.includes('design') || text.includes('graphic') || text.includes('poster') || text.includes('draft') || text.includes('creative')) {
      return 'color-palette-outline';
    }
    if (text.includes('translate') || text.includes('language') || text.includes('hindi') || text.includes('flyer')) {
      return 'language-outline';
    }
    if (text.includes('share') || text.includes('submit') || text.includes('upload') || text.includes('send') || text.includes('approve')) {
      return 'cloud-upload-outline';
    }
    if (text.includes('access') || text.includes('portal') || text.includes('dashboard') || text.includes('console') || text.includes('online')) {
      return 'desktop-outline';
    }
    if (text.includes('cross-reference') || text.includes('compare') || text.includes('survey') || text.includes('coordinate') || text.includes('map') || text.includes('pin')) {
      return 'navigate-outline';
    }
    if (text.includes('collaborate') || text.includes('team') || text.includes('group') || text.includes('volunteer')) {
      return 'people-outline';
    }
    if (text.includes('dig') || text.includes('shovel') || text.includes('hole')) {
      return 'construct-outline';
    }
    if (text.includes('edit') || text.includes('spelling') || text.includes('pronunciation') || text.includes('transcription')) {
      return 'create-outline';
    }
    if (text.includes('medical') || text.includes('diagnostic') || text.includes('bandage') || text.includes('medicine') || text.includes('supply') || text.includes('supplies')) {
      return 'medkit-outline';
    }
    return 'checkmark-circle-outline';
  };

  // Core Data State
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Interactive UI States
  const [isSaved, setIsSaved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [backstoryExpanded, setBackstoryExpanded] = useState(false);
  
  // Registration Flow
  const [showSignupSheet, setShowSignupSheet] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;
  const messageInputRef = useRef<TextInput>(null);

  // Star Rating feedback state (Post attendance loopback)
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [activePrepTab, setActivePrepTab] = useState<'onboarding' | 'messages' | 'documents'>('messages');
  const [qaExpanded, setQaExpanded] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Community Peers Bottom Drawer
  const [showPeersDrawer, setShowPeersDrawer] = useState(false);
  const peersDrawerAnim = useRef(new Animated.Value(0)).current;
  const attendees = opportunity?.socialProof?.friendsSignedUpNames || [];

  const openPeersDrawer = () => {
    setShowPeersDrawer(true);
    peersDrawerAnim.setValue(0);
    Animated.timing(peersDrawerAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closePeersDrawer = () => {
    Animated.timing(peersDrawerAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setShowPeersDrawer(false);
    });
  };

  // Granular Privacy Controls
  const [privacySettings, setPrivacySettings] = useState({
    shareProfile: true,
    proximityLoop: true,
    allowPhotos: false,
    publicLeaderboard: false,
  });

  // Document Upload States
  const [syncingFromProfile, setSyncingFromProfile] = useState(false);
  const [addToProfileFuture, setAddToProfileFuture] = useState(true);

  // Message template
  const messageTemplates = [
    "Hi! I'd love to join — is the July 12 date still open?",
    "Can I bring my teenager (16) as a co-volunteer?",
    "Is there parking or transit nearby for the site?"
  ];

  // Toast Notification states
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const accentColor = themeColors.brandForeground1;

  // Scroll-driven footer animation state
  const footerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const footerHidden = useRef(false);

  // Scroll-driven header animation state
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const headerHidden = useRef(false);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    // Check if scrolling down or up
    if (currentOffset <= 0) {
      // At the top, make sure it is shown
      if (footerHidden.current) {
        footerHidden.current = false;
        Animated.timing(footerTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
      if (headerHidden.current) {
        headerHidden.current = false;
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    } else if (currentOffset > lastScrollY.current && currentOffset > 50) {
      // Scrolling down - hide footer & header
      if (!footerHidden.current) {
        footerHidden.current = true;
        Animated.timing(footerTranslateY, {
          toValue: 120, // push it off screen
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
      if (!headerHidden.current) {
        headerHidden.current = true;
        Animated.timing(headerTranslateY, {
          toValue: -HEADER_HEIGHT, // push it off screen
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    } else if (currentOffset < lastScrollY.current) {
      // Scrolling up - show footer & header
      if (footerHidden.current) {
        footerHidden.current = false;
        Animated.timing(footerTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
      if (headerHidden.current) {
        headerHidden.current = false;
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
    lastScrollY.current = currentOffset;
  };

  // Load Data on Mount
  useEffect(() => {
    fetchOpportunityDetails();
    fetchComments();
  }, [opportunityId]);

  const fetchOpportunityDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/opportunities/${opportunityId}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunity(data);
        if (data.slots && data.slots.length > 0) {
          setSelectedSlot(data.slots[0]);
        }
        // Initialize documents from opportunity config
        if (data.requiredDocuments) {
          setDocuments(data.requiredDocuments.map((doc: any) => ({
            ...doc,
            status: 'pending',
            lastUpdated: null
          })));
        }
      } else {
        throw new Error('Failed to fetch from server');
      }
    } catch (error) {
      console.warn('Backend fetch failed, loading local mock fallback...', error);
      // Find the opportunity in the exported opportunities.json database
      const baseOpp = (opportunitiesData as any[]).find((o: any) => o.id === opportunityId) || (opportunitiesData as any[]).find((o: any) => o.id === 'opp_garden');
      
      if (baseOpp) {
        // Build mockData fully from baseOpp
        const mockData = {
          ...baseOpp,
          // Fallbacks for any missing arrays/nested objects
          tags: baseOpp.tags || [baseOpp.isRemote ? "Remote" : "In-Person", baseOpp.cause, baseOpp.categoryTag || "General"],
          bannerImage: baseOpp.bannerImage || "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1000",
          organizationLogo: baseOpp.organizationLogo || "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=80",
          organizerBackstory: baseOpp.organizerBackstory || `This project supports critical community needs in ${baseOpp.cause.toLowerCase()} by coordinating volunteer efforts to work directly with ${baseOpp.organizationName}. Your involvement ensures that essential services are consistently delivered to our community members.`,
          backstoryBlueprintUri: baseOpp.backstoryBlueprintUri !== undefined ? baseOpp.backstoryBlueprintUri : "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800",
          impactQuoteText: baseOpp.impactQuoteText || `"Volunteering for this project allowed me to give back in a way that felt highly meaningful and tangible. I highly recommend taking part!"`,
          impactQuoteAuthor: baseOpp.impactQuoteAuthor || "A. Patel, regular volunteer coordinator",
          impactQuoteAvatar: baseOpp.impactQuoteAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
          roleName: baseOpp.roleName || `${baseOpp.categoryTag || 'General'} Volunteer`,
          roleDescription: baseOpp.roleDescription || `Help with ${baseOpp.title.toLowerCase()}. Collaborate with coordinator leads and volunteer members.`,
          roleDetails: baseOpp.roleDetails || {
            interactionLevel: baseOpp.isRemote ? "Low - self-directed work" : "High - team-based collaboration",
            natureOfWork: baseOpp.isRemote ? "Digital - online task" : "Physical - hands-on activity",
            skillAlignment: ["Communication", "Teamwork", baseOpp.categoryTag || "General Care"]
          },
          requirements: baseOpp.requirements || [
            baseOpp.isRemote ? "Requires a smartphone or computer" : "Able to stand and walk during the shift",
            "No specialized skills needed — coordinator will guide you"
          ],
          perks: baseOpp.perks !== undefined ? baseOpp.perks : [
            { title: "Community service hours", description: "Verified on completion", icon: "ribbon-outline" },
            { title: "Completion Certificate", description: "Signed completion certificate", icon: "document-text-outline" }
          ],
          socialProof: baseOpp.socialProof || {
            friendsSignedUpCount: baseOpp.friendsSignedUpCount || 0,
            friendsSignedUpNames: baseOpp.friendsSignedUpNames || [],
            communityText: baseOpp.friendsSignedUpNames && baseOpp.friendsSignedUpNames.length > 0 
              ? `${baseOpp.friendsSignedUpNames.join(', ')} and ${(baseOpp.friendsSignedUpCount || 0) - baseOpp.friendsSignedUpNames.length} others from your community`
              : "Be the first from your community to sign up"
          },
          coordinators: baseOpp.coordinators !== undefined ? baseOpp.coordinators : [
            {
              name: "Sofia Ramirez",
              role: "Volunteer Coordinator",
              bio: "Your day-of point of contact for questions, breaks, and accommodations.",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            }
          ],
          backedTrusted: baseOpp.backedTrusted || {
            financedBy: "Local Community Foundation",
            partnershipWith: baseOpp.organizationName,
            taxStatus: "Registered Non-Profit Organisation",
            verifiedStatus: `${baseOpp.organizationName} · verified organizer`
          },
          slots: baseOpp.slots || [
            "Saturday, July 12, 2026 (9:00 AM - 1:00 PM)",
            "Sunday, July 13, 2026 (9:00 AM - 1:00 PM)"
          ],
          requiredDocuments: baseOpp.requiredDocuments || [
            {
              id: "doc_photo_id",
              name: "Government photo ID",
              required: true,
              description: "Required before arrival"
            }
          ]
        };
        setOpportunity(mockData);
        setSelectedSlot(mockData.slots[0]);
        setDocuments(mockData.requiredDocuments.map((doc: any) => ({
          ...doc,
          status: 'pending',
          lastUpdated: null
        })));
      } else {
        console.error("Opportunity fallback item not found");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/opportunities/${opportunityId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        throw new Error('Failed comments fetch');
      }
    } catch (error) {
      // Fallback comments
      setQuestions([
        {
          id: 'q_1',
          author: 'Devansh K.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
          content: 'Do we need to bring our own writing materials or will Pratham provide everything?',
          time: '3 hours ago',
          replies: [
            {
              author: 'Pratham MP Admin',
              content: 'We will provide all books, stationary, and instruction sheets. Just bring your energy!',
              time: '2 hours ago',
            }
          ]
        },
        {
          id: 'q_2',
          author: 'Ritika M.',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
          content: 'Is there parking available near the Gudi guda ka naka branch?',
          time: 'Yesterday',
          replies: []
        }
      ]);
    }
  };

  // Toast System Trigger
  const triggerToast = (msg: string) => {
    try {
      Vibration.vibrate(15);
    } catch (err) {}
    setToastMessage(msg);
    toastAnim.setValue(0);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      dismissToast();
    }, 4500);
  };

  const dismissToast = () => {
    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToastMessage(null);
    });
  };

  // Bookmark Toggle
  const handleToggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    triggerToast(nextSaved ? 'Saved to bookmarks' : 'Removed from bookmarks');
  };

  // Share link copy Simulation
  const handleShare = () => {
    triggerToast('Copied shareable registration link to clipboard!');
  };

  // Flag opportunity report alert
  const handleFlagOpportunity = () => {
    Alert.alert(
      "Report Opportunity",
      "Are you sure you want to flag this listing for investigation by our community team?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => triggerToast("Opportunity reported. Thank you for keeping our community safe.")
        }
      ]
    );
  };

  // Profile Documents synchronization
  const handleFetchFromProfile = async () => {
    setSyncingFromProfile(true);
    triggerToast("Accessing volunteer credential vault...");
    try {
      const response = await fetch(`${backendUrl}/api/users/profile/documents?username=volunteer_user`);
      setTimeout(async () => {
        if (response.ok) {
          const profileDocs = await response.json();
          // Update documents state showing green checks for verified items
          setDocuments(prev => prev.map(doc => {
            const matched = profileDocs.find((d: any) => d.id === doc.id);
            return matched ? { ...doc, status: 'uploaded', lastUpdated: matched.lastUpdated || 'Just now' } : doc;
          }));
          triggerToast("Successfully synced compliance documentation!");
        } else {
          // Fake local success state mapping
          setDocuments(prev => prev.map(doc => {
            if (doc.required) {
              return { ...doc, status: 'uploaded', lastUpdated: 'Synced 1m ago' };
            }
            return doc;
          }));
          triggerToast("Documents synced from local volunteer profile.");
        }
        setSyncingFromProfile(false);
      }, 1000);
    } catch (e) {
      setSyncingFromProfile(false);
      triggerToast("Sync error. Checked profiles locally.");
    }
  };

  // Manual File upload simulation
  const handleManualUpload = (docId: string) => {
    Alert.prompt(
      "Manual Document Upload",
      `Choose file path or drag-and-drop file configuration for document ID: ${docId}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upload",
          onPress: () => {
            setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'uploaded', lastUpdated: 'Uploaded manual file' } : d));
            triggerToast(addToProfileFuture ? "Uploaded & saved to profile!" : "Uploaded for this registration only.");
          }
        }
      ]
    );
  };

  // Post dynamic QA comment thread
  const handlePostQuestion = async () => {
    if (!newQuestionText.trim()) return;
    const commentBody = {
      author: 'You (Volunteer)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      content: newQuestionText.trim()
    };

    try {
      const response = await fetch(`${backendUrl}/api/opportunities/${opportunityId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentBody)
      });
      if (response.ok) {
        const added = await response.json();
        setQuestions(prev => [added, ...prev]);
      } else {
        throw new Error("Posting failed");
      }
    } catch (e) {
      // Local state update
      const newComment: QuestionItem = {
        id: `q_${Date.now()}`,
        author: 'You (Volunteer)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        content: newQuestionText.trim(),
        time: 'Just now',
        replies: []
      };
      setQuestions(prev => [newComment, ...prev]);
    }
    setNewQuestionText('');
    triggerToast('Question posted successfully!');
  };

  // Post attendance review submission
  const handleSubmitReview = () => {
    if (userRating === 0) {
      Alert.alert("Rating Required", "Please tap stars to provide a rating.");
      return;
    }
    setReviewSubmitted(true);
    triggerToast("Thank you for sharing your volunteering experience!");
  };

  // Open registration modal sheet
  const handleOpenSignup = () => {
    if (isRegistered) {
      Alert.alert(
        "Already Registered",
        "You have already signed up for this volunteer drive. Would you like to cancel your registration?",
        [
          { text: "Keep Signup", style: "cancel" },
          {
            text: "Cancel Registration",
            style: "destructive",
            onPress: () => {
              setIsRegistered(false);
              triggerToast("Registration cancelled");
            }
          }
        ]
      );
    } else {
      setShowSignupSheet(true);
      setWaiverAccepted(false);
      setSignupSuccess(false);
      setSignupLoading(false);
    }
  };

  // Confirm registration submission
  const handleConfirmRegistration = async () => {
    if (!waiverAccepted) {
      Alert.alert("Agreement Required", "Please accept the volunteering terms to register.");
      return;
    }

    setSignupLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/opportunities/${opportunityId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'volunteer_user',
          slot: selectedSlot,
          waiverAccepted,
          documents: documents.map(d => ({ id: d.id, status: d.status }))
        })
      });

      setTimeout(async () => {
        if (response.ok) {
          const resData = await response.json();
          setSignupSuccess(true);
          successScale.setValue(0);
          Animated.spring(successScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            setIsRegistered(true);
            setShowSignupSheet(false);
            setShowSnackbar(true);
            triggerToast("Booking confirmed! Add to calendar prompt loaded.");
          }, 1800);
        } else {
          // Fake local success mapping if backend not fully up
          setSignupSuccess(true);
          successScale.setValue(0);
          Animated.spring(successScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
          setTimeout(() => {
            setIsRegistered(true);
            setShowSignupSheet(false);
            setShowSnackbar(true);
            triggerToast("Booking registered successfully (Offline Mode).");
          }, 1800);
        }
        setSignupLoading(false);
      }, 1000);

    } catch (e) {
      setSignupLoading(false);
      triggerToast("Error processing reservation submission.");
    }
  };

  // Mock Calendar system Integration trigger
  const handleAddToCalendar = () => {
    Alert.alert(
      "Add to Calendar",
      "Would you like to sync this slot to Google Calendar or Apple Calendar?",
      [
        { text: "Google Calendar", onPress: () => triggerToast("Syncing with Google Calendar API...") },
        { text: "Apple Calendar (.ics)", onPress: () => triggerToast("Downloaded calendar event file successfully.") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingWrapper, { backgroundColor: themeColors.neutralBackground1 }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={{ marginTop: Spacing.s, color: themeColors.neutralForeground2 }}>Loading details...</Text>
      </View>
    );
  }
  return (
    <View style={[styles.mainContainer, { backgroundColor: themeColors.neutralBackground1 }]}>
      
      {/* 1. FLOATING RESPONSIVE HEADER */}
      <Animated.View 
        style={[
          styles.floatingHeader, 
          { 
            backgroundColor: themeColors.neutralBackground1, 
            borderBottomColor: themeColors.neutralStroke2,
            transform: [{ translateY: headerTranslateY }] 
          }
        ]}
      >
        <Pressable onPress={onBack} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={20} color={themeColors.neutralForeground1} />
          <Text style={[styles.headerBackText, { color: themeColors.neutralForeground1 }]}>Back</Text>
        </Pressable>
        <Pressable onPress={handleShare} style={styles.headerIconBtn}>
          <Ionicons name="share-social-outline" size={20} color={themeColors.neutralForeground1} />
        </Pressable>
      </Animated.View>

      {/* 2. SCROLLABLE LAYOUT */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 220 }]} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* TRANSPARENT SPACER FOR FLOATING HEADER */}
        <View style={{ height: HEADER_HEIGHT }} />
        
        {/* HERO IMAGE ISOLATION */}
        <View style={styles.heroCardContainer}>
          <Image
            source={{ uri: opportunity.bannerImage }}
            style={styles.heroImage}
          />
        </View>

        {/* UNIFIED CAMPAIGN STORY BLOCK */}
        <View style={[styles.campaignHeaderBlock, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2 }]}>
          {/* Story Title / Long Heading */}
          <Text style={[styles.unifiedTitleText, { color: themeColors.neutralForeground1, marginBottom: Spacing.m }]}>
            {getCombinedHeading(opportunity.title, opportunity.description)}
          </Text>

          {/* Category Pills with Empathy Mapping */}
          <View style={styles.categoryPillsWrap}>
            {opportunity.tags && opportunity.tags.map((tag: string) => {
              let displayTag = tag;
              let iconName: any = 'help-circle-outline';
              const tagLower = tag.toLowerCase();
              
              if (tagLower.includes('food') || tagLower.includes('security') || tagLower.includes('hunger')) {
                displayTag = "bridging food security";
                iconName = "restaurant-outline";
              } else if (tagLower.includes('community')) {
                displayTag = "helping build community";
                iconName = "people-outline";
              } else if (tagLower.includes('environment') || tagLower.includes('green') || tagLower.includes('sustainability')) {
                displayTag = "nurturing local ecosystems";
                iconName = "leaf-outline";
              } else if (tagLower.includes('physical')) {
                displayTag = "active physical work";
                iconName = "body-outline";
              } else if (tagLower.includes('poverty') || tagLower.includes('livelihood') || tagLower.includes('welfare')) {
                displayTag = "alleviating poverty";
                iconName = "hand-left-outline";
              } else if (tagLower.includes('data') || tagLower.includes('entry') || tagLower.includes('admin')) {
                displayTag = "data entry support";
                iconName = "document-text-outline";
              } else if (tagLower.includes('in-person')) {
                displayTag = "in-person service";
                iconName = "people-outline";
              } else if (tagLower.includes('remote')) {
                displayTag = "remote work";
                iconName = "laptop-outline";
              } else if (tagLower.includes('education') || tagLower.includes('mentor') || tagLower.includes('student')) {
                displayTag = "education & mentoring";
                iconName = "book-outline";
              } else {
                displayTag = `supporting ${tagLower}`;
                iconName = "information-circle-outline";
              }
              
              return (
                <View key={tag} style={[styles.categoryPill, { borderColor: themeColors.neutralStroke1, borderWidth: 1, backgroundColor: themeColors.neutralBackground2, borderRadius: Shapes.circular }]}>
                  <Ionicons name={iconName} size={12} color={themeColors.neutralForeground3} style={{ marginRight: Spacing.xxs }} />
                  <Text style={[Typography.caption, { color: themeColors.neutralForeground2, fontWeight: '600' }]}>{displayTag}</Text>
                </View>
              );
            })}
          </View>

          {/* Stacked Logistics Overview */}
          <View style={[styles.logisticsContainerVertical, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1 }]}>
            {/* Row 1: Venue */}
            <View style={styles.logisticsRow}>
              <View style={[styles.logisticsIconCircle, { backgroundColor: themeColors.neutralBackground3 }]}>
                <Ionicons name="location-outline" size={16} color={accentColor} />
              </View>
              <View style={styles.logisticsTextCol}>
                <Text style={[styles.logisticsLabel, { color: themeColors.neutralForeground3 }]}>VENUE</Text>
                <Text style={[styles.logisticsValue, { color: themeColors.neutralForeground1 }]}>
                  {opportunity.id === 'opp_garden' ? 'Eastside Commons' : opportunity.locationName}
                </Text>
              </View>
            </View>

            {/* Row 2: Date & Time */}
            <View style={styles.logisticsRow}>
              <View style={[styles.logisticsIconCircle, { backgroundColor: themeColors.neutralBackground3 }]}>
                <Ionicons name="calendar-outline" size={16} color={accentColor} />
              </View>
              <View style={styles.logisticsTextCol}>
                <Text style={[styles.logisticsLabel, { color: themeColors.neutralForeground3 }]}>DATE & TIME</Text>
                <Text style={[styles.logisticsValue, { color: themeColors.neutralForeground1 }]}>
                  {formatLogisticsDate(opportunity.dateString || 'Sat, July 12')} · {opportunity.timeString || '9:00 AM - 1:00 PM'}
                </Text>
              </View>
            </View>

            {/* Row 3: Duration */}
            <View style={styles.logisticsRow}>
              <View style={[styles.logisticsIconCircle, { backgroundColor: themeColors.neutralBackground3 }]}>
                <Ionicons name="timer-outline" size={16} color={accentColor} />
              </View>
              <View style={styles.logisticsTextCol}>
                <Text style={[styles.logisticsLabel, { color: themeColors.neutralForeground3 }]}>DURATION</Text>
                <Text style={[styles.logisticsValue, { color: themeColors.neutralForeground1 }]}>
                  {formatLogisticsDuration(opportunity.durationHrs)} (One-time)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* TANGIBLE IMPACT & STORYTELLING */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1, marginBottom: Spacing.s }]}>Why this matters</Text>

          {/* TANGIBLE IMPACT (TESTIMONIAL CARD STYLE) */}
          <View style={[styles.premiumQuoteCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1, marginTop: Spacing.s }]}>
            {opportunity.backstoryBlueprintUri ? (
              <Image 
                source={{ uri: opportunity.backstoryBlueprintUri }} 
                style={styles.quoteBannerImage} 
              />
            ) : null}
            <View style={styles.quoteContentWrap}>
              <Pressable onPress={() => setBackstoryExpanded(!backstoryExpanded)}>
                <Text style={[Typography.body, { color: themeColors.neutralForeground2, lineHeight: 20, marginBottom: Spacing.s }]} numberOfLines={backstoryExpanded ? undefined : 5} ellipsizeMode="tail">
                  {opportunity.organizerBackstory || opportunity.impactQuoteText}
                </Text>
              </Pressable>
              <Text style={[styles.quoteSignature, { color: themeColors.neutralForeground3 }]}>
                — <Text style={Typography.bodyStrong}>
                  {opportunity.impactQuoteAuthor ? opportunity.impactQuoteAuthor.split(',')[0].trim() : 'Manoj S.'}
                </Text>
                <Text style={{ color: themeColors.neutralForeground3 }}>
                  {opportunity.impactQuoteAuthor && opportunity.impactQuoteAuthor.toLowerCase().includes('worker')
                    ? ', Founder & Drive Director'
                    : (opportunity.impactQuoteAuthor && opportunity.impactQuoteAuthor.split(',')[1] 
                       ? `, ${opportunity.impactQuoteAuthor.split(',')[1].trim()}` 
                       : ', Founder & Drive Director')}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* WHAT WILL YOU BE DOING SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>What will you be doing</Text>
          
          <View style={[styles.roleParentCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1, padding: Spacing.m }]}>
            {(opportunity.duties || [
              "Building raised timber garden beds for community planting",
              "Gardening and planting over 20 organic saplings & greens",
              "Spreading nutrient-rich soil and organic wood mulch layers",
              "Collaborating in volunteer teams to complete layout structures"
            ]).map((duty: string, idx: number) => (
              <View key={idx} style={styles.dutyItemRow}>
                <Text style={[Typography.body, { color: themeColors.neutralForeground3 }]}>•</Text>
                <Text style={[Typography.body, { color: themeColors.neutralForeground2, flex: 1, paddingLeft: Spacing.s }]}>
                  {duty}
                </Text>
              </View>
            ))}
          </View>

          {/* Critical Requirements Card Separation */}
          <View style={[styles.requirementsCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1 }]}>
            <View style={styles.requirementsHeaderRow}>
              <Text style={[styles.requirementsCardTitle, { color: themeColors.neutralForeground1 }]}>Critical requirements & restrictions</Text>
            </View>
            
            {opportunity.requirements && opportunity.requirements
              .filter((req: string) => !req.toLowerCase().includes("no specialized skills needed"))
              .map((req: string, index: number) => {
                const iconName = getRequirementIcon(req);
                
                return (
                  <View key={index} style={styles.requirementItemRow}>
                    <Ionicons name={iconName} size={16} color={themeColors.neutralForeground2} style={{ marginRight: Spacing.s }} />
                    <Text style={[styles.requirementItemText, Typography.body, { color: themeColors.neutralForeground1 }]}>
                      {req}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>

        {/* INCLUSIVE ACCESSIBILITY — ORG-PROVIDED ACCOMMODATIONS */}
        {opportunity.accommodationsOffered && opportunity.accommodationsOffered.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Inclusive Accessibility</Text>
            <View style={[styles.accessibilityCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1 }]}>
              <Text style={[Typography.body, { color: themeColors.neutralForeground2, marginBottom: Spacing.s }]}>
                Accommodations offered by the organizer for this event.
              </Text>
              
              <View style={styles.accommodationsRow}>
                {(() => {
                  const accommodations = opportunity.accommodationsOffered || [];
                  const limit = Math.min(Math.max(accommodations.length, 2), 5);
                  return accommodations.slice(0, limit);
                })().map((label: string, idx: number) => {
                  const iconColor = themeColors.neutralForeground3;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.accessibilityPillProvided,
                        {
                          borderColor: themeColors.neutralStroke1,
                          backgroundColor: themeColors.neutralBackground2,
                        }
                      ]}
                    >
                      {renderAccessibilityTagIcon(label, iconColor)}
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground2, fontWeight: '600' }]}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* PERKS GRID (WHAT'S IN IT FOR YOU) */}
        {opportunity.perks && opportunity.perks.filter((perk: any) => perk.title.toLowerCase() !== 'networking').length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>We've got you covered</Text>
            
            <View style={styles.perksGrid2x2}>
              {opportunity.perks
                .filter((perk: any) => perk.title.toLowerCase() !== 'networking')
                .map((perk: any, index: number) => (
                <View key={index} style={[styles.perkCardInner, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1 }]}>
                  <View style={[styles.perkIconCircle, { backgroundColor: isDarkMode ? `${accentColor}2d` : `${accentColor}1a` }]}>
                    <Ionicons name={perk.icon} size={20} color={accentColor} />
                  </View>
                  <Text style={[styles.perkCardTitleInner, { color: themeColors.neutralForeground1 }]}>{perk.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SOCIAL & COORDINATION HUB */}
        {attendees.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Who else signed up</Text>
            
            <Pressable
              onPress={openPeersDrawer}
              style={({ pressed }) => [
                styles.socialProofAvatarsCard,
                {
                  backgroundColor: themeColors.neutralBackground1,
                  borderColor: themeColors.neutralStroke1,
                  opacity: pressed ? 0.9 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s }}>
                  {attendees.slice(0, 4).map((name: string, idx: number) => {
                    const avatarUrls = [
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
                    ];
                    const uri = avatarUrls[idx % avatarUrls.length];
                    return (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={[styles.socialAv, { marginLeft: idx === 0 ? Spacing.none : -Spacing.xs, zIndex: 10 - idx, borderColor: themeColors.neutralBackground1 }]}
                      />
                    );
                  })}
                  {attendees.length > 4 && (
                    <View style={[styles.socialBadgePill, { backgroundColor: themeColors.successBackgroundSubtle, marginLeft: -Spacing.xs, zIndex: 5, borderColor: themeColors.neutralBackground1 }]}>
                      <Text style={[styles.socialBadgePillText, { color: themeColors.successForeground1 }]}>
                        +{attendees.length - 4}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.socialTextBelow, Typography.body, { color: themeColors.neutralForeground1 }]}>
                  {(() => {
                    if (attendees.length === 1) {
                      return (
                        <Text>
                          <Text style={Typography.bodyStrong}>{attendees[0]}</Text> from your community.
                        </Text>
                      );
                    } else if (attendees.length === 2) {
                      return (
                        <Text>
                          <Text style={Typography.bodyStrong}>{attendees[0]}</Text> and <Text style={Typography.bodyStrong}>{attendees[1]}</Text> from your community.
                        </Text>
                      );
                    } else {
                      return (
                        <Text>
                          <Text style={Typography.bodyStrong}>{attendees[0]}</Text> and <Text style={Typography.bodyStrong}>{attendees.length - 1} others</Text> from your community.
                        </Text>
                      );
                    }
                  })()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={themeColors.neutralForeground3} style={{ marginLeft: Spacing.s }} />
            </Pressable>
          </View>
        )}

        {/* MEET YOUR GUIDE — COORDINATOR SECTION */}
        {opportunity.coordinators && opportunity.coordinators.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Meet your Guide</Text>
            {opportunity.coordinators[0] && (
              <View style={[styles.guideCardHorizontal, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1 }]}>
                <Image source={{ uri: opportunity.coordinators[0].avatar }} style={styles.guideAvatarLarge} />
                <View style={styles.guideContentCol}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs, width: '100%' }}>
                    <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, flexShrink: 1 }]}>
                      Hi, I'm {opportunity.coordinators[0].name.split(' ')[0]}!
                    </Text>
                    <View style={[styles.guideRoleBadge, { backgroundColor: isDarkMode ? `${accentColor}2d` : `${accentColor}1a`, alignSelf: 'auto' }]}>
                      <Ionicons name="shield-checkmark-outline" size={12} color={accentColor} style={{ marginRight: Spacing.xxs }} />
                      <Text style={[styles.guideRoleBadgeText, { color: accentColor }]}>
                        {opportunity.coordinators[0].role}
                      </Text>
                    </View>
                  </View>
                  <Text style={[Typography.body, { color: themeColors.neutralForeground2, marginBottom: Spacing.s }]}>
                    I'm here to guide you through this drive. {opportunity.coordinators[0].bio}
                  </Text>
                  <Pressable
                    onPress={() => setShowMessageModal(true)}
                    style={({ pressed }) => [
                      styles.guideChatBtn,
                      {
                        backgroundColor: 'transparent',
                        borderColor: themeColors.neutralStroke1,
                        borderWidth: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.8 : 1,
                      }
                    ]}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={themeColors.brandForeground1} style={{ marginRight: Spacing.xs }} />
                    <Text style={[styles.guideChatBtnText, { color: themeColors.brandForeground1 }]}>
                      Message
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.sectionContainer}>

          {/* Card 2: Documents Card */}
          <View style={[styles.complianceCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke1 }]}>
            <Text style={[styles.prepHeaderTitle, { color: themeColors.neutralForeground1, marginBottom: Spacing.xs }]}>
              Security & documents verification
            </Text>
            <Text style={[Typography.body, { color: themeColors.neutralForeground2, marginBottom: Spacing.m }]}>
              This will be used for screening to help organizers coordinate better.
            </Text>

            {/* Static Checklist Criteria */}
            {documents.map((doc) => {
              let docLabel = doc.name;
              if (doc.id === 'doc_resume') {
                docLabel = "Résumé / experience (Optional)";
              } else if (doc.id === 'doc_photo_id') {
                docLabel = "Government photo ID (Required)";
              } else if (doc.id === 'doc_credential_sync') {
                docLabel = "Partner credential sync (Optional)";
              }
              return (
                <View key={doc.id} style={{ marginBottom: Spacing.s, flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={[Typography.body, { color: themeColors.neutralForeground3, marginRight: Spacing.s }]}>•</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>
                      {docLabel}
                    </Text>
                    {doc.description ? (
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginTop: Spacing.xxs }]}>
                        {doc.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* BACKED & TRUSTED FOOTNOTE */}
        <View style={styles.sectionContainer}>
          <View style={[styles.trustedBox, { backgroundColor: themeColors.neutralBackground3, borderColor: themeColors.neutralStroke2 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s }}>
              <Ionicons name="shield-checkmark-outline" size={16} color={themeColors.successForeground1} style={{ marginRight: Spacing.xxs }} />
              <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground1 }]}>Backed & Trusted</Text>
            </View>
            <View style={styles.trustedRowStacked}>
              <Text style={[styles.trustedLabel, { color: themeColors.neutralForeground3 }]}>FINANCED BY</Text>
              <Text style={[styles.trustedValue, { color: themeColors.neutralForeground1 }]}>{opportunity.backedTrusted?.financedBy}</Text>
            </View>
            <View style={styles.trustedRowStacked}>
              <Text style={[styles.trustedLabel, { color: themeColors.neutralForeground3 }]}>IN PARTNERSHIP WITH</Text>
              <Text style={[styles.trustedValue, { color: themeColors.neutralForeground1 }]}>{opportunity.backedTrusted?.partnershipWith}</Text>
            </View>
            <View style={styles.trustedRowStacked}>
              <Text style={[styles.trustedLabel, { color: themeColors.neutralForeground3 }]}>TAX STATUS</Text>
              <Text style={[styles.trustedValue, { color: themeColors.neutralForeground1 }]}>{opportunity.backedTrusted?.taxStatus}</Text>
            </View>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.neutralStroke1, marginBottom: Spacing.none }]} />
          </View>
        </View>

        {/* PUBLIC Q&A LIVE MESSAGE BOARD */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>Public Q&A Feed</Text>
          
          {/* Comments list display */}
          {(qaExpanded ? questions : questions.slice(0, 2)).map((q) => {
            return (
              <View 
                key={q.id} 
                style={[
                  styles.qaCardWrapper, 
                  { 
                    backgroundColor: themeColors.neutralBackground1, 
                    borderColor: themeColors.neutralStroke1,
                    marginBottom: Spacing.s 
                  }
                ]}
              >
                {/* Question bubble */}
                <View style={styles.questionBubbleWrap}>
                  <View style={styles.commentHeaderRow}>
                    <Image source={{ uri: q.avatar }} style={styles.userCommentAvatar} />
                    <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text style={[styles.commentAuthorName, Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>
                          {q.author}
                        </Text>
                        <View style={[styles.roleBadgeCapsule, { backgroundColor: themeColors.neutralBackground3 }]}>
                          <Text style={[styles.roleBadgeText, Typography.caption, { color: themeColors.neutralForeground2 }]}>
                            Attendee
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.commentTime, Typography.caption, { color: themeColors.neutralForeground3 }]}>
                        {q.time}
                      </Text>
                    </View>
                  </View>
                  <Text style={[Typography.body, { color: themeColors.neutralForeground1, marginTop: Spacing.xs }]}>
                    {q.content}
                  </Text>
                </View>

                {/* Replies / Threaded Responses */}
                {q.replies && q.replies.length > 0 && (
                  <View style={styles.repliesListWrap}>
                    {q.replies.map((r, idx) => {
                      const isCoordinator = r.author.toLowerCase().includes('admin') || r.author.toLowerCase().includes('coordinator') || r.author.toLowerCase().includes('pratham') || r.author.toLowerCase().includes('collective');
                      const roleBadgeBg = isCoordinator
                        ? (isDarkMode ? `${accentColor}2d` : `${accentColor}1a`)
                        : themeColors.neutralBackground3;
                      const roleBadgeTextColor = isCoordinator ? accentColor : themeColors.neutralForeground2;
                      const roleBadgeLabel = isCoordinator ? 'POC' : 'Attendee';

                      return (
                        <View 
                          key={idx} 
                          style={[
                            styles.replyBubbleCard, 
                            { 
                              backgroundColor: themeColors.neutralBackground1,
                              borderColor: themeColors.neutralStroke2,
                              marginTop: Spacing.xs
                            }
                          ]}
                        >
                          <View style={styles.commentHeaderRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                              <Ionicons name="arrow-undo-outline" size={12} color={accentColor} style={{ marginRight: Spacing.xxs }} />
                              <Text style={[styles.commentAuthorName, Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 13 }]}>
                                {r.author}
                              </Text>
                              <View style={[styles.roleBadgeCapsule, { backgroundColor: roleBadgeBg }]}>
                                <Text style={[styles.roleBadgeText, Typography.caption, { color: roleBadgeTextColor }]}>
                                  {roleBadgeLabel}
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.commentTime, Typography.caption, { color: themeColors.neutralForeground3, marginLeft: Spacing.s }]}>
                              {r.time}
                            </Text>
                          </View>
                          <Text style={[Typography.body, { color: themeColors.neutralForeground2, marginTop: Spacing.xxs, marginLeft: Spacing.m }]}>
                            {r.content}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}

          {/* Expand/Collapse Trigger */}
          {questions.length > 2 && (
            <Pressable
              onPress={() => setQaExpanded(!qaExpanded)}
              style={styles.qaExpandBtn}
            >
              <Text style={[styles.qaExpandBtnText, { color: accentColor }]}>
                {qaExpanded ? "Show less" : "View all queries"}
              </Text>
              <Ionicons
                name={qaExpanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={accentColor}
                style={{ marginLeft: Spacing.xxs }}
              />
            </Pressable>
          )}

          {/* Ask public question input */}
          <View style={[styles.postQuestionRow, { marginTop: Spacing.s }]}>
            <TextInput
              value={newQuestionText}
              onChangeText={setNewQuestionText}
              placeholder="Ask a question about this drive..."
              placeholderTextColor={themeColors.neutralForeground3}
              style={[styles.questionInput, {
                color: themeColors.neutralForeground1,
                borderColor: themeColors.neutralStroke1,
                backgroundColor: themeColors.neutralBackground1
              }]}
            />
            <Pressable
              onPress={handlePostQuestion}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor: newQuestionText.trim() ? accentColor : themeColors.neutralBackgroundDisabled,
                  opacity: pressed ? 0.8 : 1,
                }
              ]}
              disabled={!newQuestionText.trim()}
            >
              <Ionicons name="send" size={16} color={themeColors.neutralForegroundOnBrand} />
            </Pressable>
          </View>
        </View>

        {/* FLAG/REPORT SECURITY LINK - baseline bottom stack */}
        <View style={styles.flagBtnContainer}>
          <Pressable onPress={handleFlagOpportunity} style={styles.flagBtnPressable}>
            <Ionicons name="alert-circle-outline" size={14} color={themeColors.neutralForeground3} style={{ marginRight: Spacing.xxs }} />
            <Text style={[styles.flagText, { color: themeColors.neutralForeground3 }]}>
              Is there a problem with this listing? Flag as suspicious.
            </Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* 2. FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>
          <View style={[styles.toastCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2 }]}>
            <Text style={[styles.toastText, { color: themeColors.neutralForeground1 }]}>{toastMessage}</Text>
            <Pressable onPress={dismissToast} style={{ padding: Spacing.xxs }}>
              <Ionicons name="close-circle" size={18} color={accentColor} />
            </Pressable>
          </View>
        </Animated.View>
      )}
 
      {/* FLOATING SUCCESS SNACKBAR OVERLAY */}
      {showSnackbar && (
        <View style={styles.snackbarContainer}>
          <View style={[styles.snackbarCard, { backgroundColor: isDarkMode ? themeColors.neutralBackground2 : themeColors.neutralForeground1, borderColor: themeColors.neutralStroke1 }]}>
            <Ionicons name="checkmark-circle" size={20} color={themeColors.successForeground1} style={{ marginRight: Spacing.s }} />
            <Text style={[styles.snackbarText, { color: themeColors.neutralForegroundOnBrand }]}>
              Booking confirmed!
            </Text>
            <Pressable
              onPress={() => {
                setShowSnackbar(false);
                handleAddToCalendar();
              }}
              style={[styles.snackbarActionBtn, { backgroundColor: themeColors.brandBackground }]}
            >
              <Text style={[styles.snackbarActionText, { color: themeColors.neutralForegroundOnBrand }]}>Add to Calendar</Text>
            </Pressable>
            <Pressable onPress={() => setShowSnackbar(false)} style={{ padding: Spacing.xxs, marginLeft: Spacing.xs }}>
              <Ionicons name="close" size={18} color={themeColors.neutralForeground3} />
            </Pressable>
          </View>
        </View>
      )}

      {/* 3. FIXED STICKY ACTION FOOTER BAR */}
      <Animated.View style={[styles.stickyFooter, {
        backgroundColor: themeColors.neutralBackground1,
        borderTopColor: themeColors.neutralStroke2,
        paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.m,
        transform: [{ translateY: footerTranslateY }]
      }]}>
        <View style={{ flexDirection: 'column', flex: 1, marginRight: Spacing.s }}>
          <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontWeight: '600' }]} numberOfLines={1}>
            {isRegistered 
              ? 'Registration confirmed'
              : (opportunity?.slots && opportunity.slots.length > 0
                ? `${opportunity.slots.length} slot${opportunity.slots.length > 1 ? 's' : ''} left`
                : '3 slots left')}
          </Text>
          <Text style={[Typography.caption, { color: themeColors.neutralForeground2 }]} numberOfLines={1}>
            {isRegistered ? 'See you there!' : 'Registration closing soon'}
          </Text>
        </View>
        
        {isRegistered ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Button
              label="Add to Cal"
              onPress={handleAddToCalendar}
              appearance="Outline"
              size="Small"
              shape="Rounded"
              style={{ borderColor: themeColors.successForeground1, marginRight: Spacing.xs }}
              isDarkMode={isDarkMode}
            />
            <Button
              label="Registered ✓"
              onPress={() => triggerToast("You are registered! Check your calendar sync.")}
              appearance="Primary"
              shape="Rounded"
              style={{ backgroundColor: themeColors.successForeground1 }}
              isDarkMode={isDarkMode}
            />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Button
              label="Sign Up Now"
              onPress={handleOpenSignup}
              appearance="Primary"
              shape="Rounded"
              style={{ minWidth: 150, backgroundColor: accentColor }}
              isDarkMode={isDarkMode}
            />
          </View>
        )}
      </Animated.View>

      {/* 4. VOLUNTEER COMMITMENT BOTTOM SHEET (MODAL OVERLAY) */}
      <Modal
        visible={showSignupSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSignupSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.dismissOverlayArea} onPress={() => !signupLoading && setShowSignupSheet(false)} />
          
          <View style={[styles.sheetContent, { backgroundColor: themeColors.neutralBackground1 }]}>
            {/* Sheet Handle Accent */}
            <View style={[styles.sheetHandle, { backgroundColor: themeColors.neutralStroke1 }]} />
            
            {signupSuccess ? (
              /* Success Screen view */
              <View style={styles.successWrapper}>
                <Animated.View style={{ transform: [{ scale: successScale }], marginBottom: Spacing.m }}>
                  <Ionicons name="checkmark-circle" size={80} color={themeColors.successForeground1} />
                </Animated.View>
                <Text style={[styles.successTitle, { color: themeColors.neutralForeground1 }]}>Registered Successfully!</Text>
                <Text style={[styles.successSubtitle, { color: themeColors.neutralForeground3 }]}>
                  We notified your mutual contacts. Your coordinates are logged under the {opportunity.cause} cause dashboard.
                </Text>
              </View>
            ) : (
              /* Shift selection options */
              <ScrollView contentContainerStyle={{ paddingBottom: Spacing.l }}>
                <Text style={[styles.sheetTitle, { color: themeColors.neutralForeground1 }]}>Sign Up Commitment</Text>
                <Text style={[styles.sheetSubtitle, { color: themeColors.neutralForeground3 }]}>
                  Complete registration details to confirm your volunteer booking.
                </Text>

                {/* Shift Selector */}
                <Text style={[styles.labelHeader, { color: themeColors.neutralForeground2 }]}>Select Date & Shift</Text>
                {opportunity.slots && opportunity.slots.map((slot: string) => {
                  const isActive = selectedSlot === slot;
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => setSelectedSlot(slot)}
                      style={[
                        styles.slotSelectPill,
                        {
                          borderColor: isActive ? accentColor : themeColors.neutralStroke1,
                          backgroundColor: isActive ? themeColors.brandBackgroundSubtle : 'transparent',
                        }
                      ]}
                    >
                      <Ionicons
                        name={isActive ? "radio-button-on" : "radio-button-off"}
                        size={18}
                        color={isActive ? accentColor : themeColors.neutralForeground3}
                        style={{ marginRight: Spacing.s }}
                      />
                      <Text style={[styles.slotPillText, { color: themeColors.neutralForeground1, fontWeight: isActive ? '600' : '400' }]}>
                        {slot}
                      </Text>
                    </Pressable>
                  );
                })}

                {/* Security & documents verification checklist */}
                <Text style={[styles.labelHeader, { color: themeColors.neutralForeground2, marginTop: Spacing.m }]}>
                  Required Credentials
                </Text>
                
                {documents.map((doc) => {
                  const isVerified = doc.status === 'uploaded';
                  
                  let displayTitleNode = null;
                  let displaySubtext = doc.description;
                  
                  if (doc.id === 'doc_resume') {
                    displayTitleNode = (
                      <View>
                        <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>Résumé / experience</Text>
                        <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>(optional)</Text>
                      </View>
                    );
                    displaySubtext = "Optional";
                  } else if (doc.id === 'doc_photo_id') {
                    displayTitleNode = (
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, marginRight: Spacing.xs }]}>
                          Government{"\n"}photo ID
                        </Text>
                        <View style={[styles.requiredDocLabel, { backgroundColor: themeColors.dangerBackgroundSubtle }]}>
                          <Text style={[styles.requiredDocLabelText, { color: themeColors.dangerForeground1 }]}>Required</Text>
                        </View>
                      </View>
                    );
                    displaySubtext = "Required before arrival";
                  } else if (doc.id === 'doc_credential_sync') {
                    displayTitleNode = (
                      <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>Partner credential sync</Text>
                    );
                    displaySubtext = "Optional";
                  } else {
                    displayTitleNode = (
                      <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>{doc.name}</Text>
                    );
                  }

                  const iconName = isVerified
                    ? "checkmark-circle"
                    : (doc.id === 'doc_photo_id'
                      ? "card-outline"
                      : (doc.id === 'doc_credential_sync' ? "link-outline" : "document-text-outline"));

                  const isSync = doc.id === 'doc_credential_sync';
                  const buttonIcon = isSync ? "link-outline" : "arrow-up-outline";
                  const buttonText = isSync ? "Connect" : "Upload";

                  return (
                    <View key={doc.id} style={[styles.documentFileRow, { backgroundColor: themeColors.neutralBackground2, borderColor: themeColors.neutralStroke1 }]}>
                      {/* Circular icon container */}
                      <View style={[styles.docIconContainer, { backgroundColor: themeColors.neutralBackground3 }]}>
                        <Ionicons
                          name={iconName}
                          size={18}
                          color={isVerified ? themeColors.successForeground1 : themeColors.neutralForeground2}
                        />
                      </View>

                      {/* Content column */}
                      <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                        {displayTitleNode}
                        <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginTop: Spacing.xxs }]}>
                          {isVerified ? `Synced ${doc.lastUpdated}` : displaySubtext}
                        </Text>
                      </View>

                      {/* Action state */}
                      {isVerified ? (
                        <View style={[styles.badgeDone, { backgroundColor: themeColors.successBackgroundSubtle }]}>
                          <Text style={{ color: themeColors.successForeground1, fontSize: 10, fontWeight: 'bold' }}>VERIFIED</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => handleManualUpload(doc.id)}
                          style={[styles.documentRowBtn, { backgroundColor: themeColors.neutralBackground3, borderColor: themeColors.neutralStroke1 }]}
                        >
                          <Ionicons name={buttonIcon} size={12} color={themeColors.neutralForeground1} style={{ marginRight: Spacing.xxs }} />
                          <Text style={[styles.documentRowBtnText, { color: themeColors.neutralForeground1 }]}>{buttonText}</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}

                {/* Volunteering Terms Waiver check */}
                <View style={styles.waiverCheckboxRow}>
                  <Pressable
                    onPress={() => setWaiverAccepted(!waiverAccepted)}
                    style={[styles.checkboxSquare, { borderColor: waiverAccepted ? accentColor : themeColors.neutralStroke1 }]}
                  >
                    {waiverAccepted && <Ionicons name="checkmark" size={14} color={accentColor} />}
                  </Pressable>
                  <Text style={[styles.checkboxLabel, { color: themeColors.neutralForeground2 }]}>
                    I agree to follow the safety guidelines, show up on time, and communicate 24 hours in advance if I need to cancel.
                  </Text>
                </View>

                {/* Submit button */}
                <Button
                  label="Confirm Registration"
                  onPress={handleConfirmRegistration}
                  appearance="Primary"
                  loading={signupLoading}
                  disabled={!waiverAccepted || signupLoading}
                  style={{ marginTop: Spacing.m, backgroundColor: accentColor }}
                  isDarkMode={isDarkMode}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 5. MESSAGE THE ORGANIZATION BOTTOM SHEET (MODAL OVERLAY) */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
        onShow={() => {
          setTimeout(() => {
            messageInputRef.current?.focus();
          }, 100);
        }}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.dismissOverlayArea} onPress={() => setShowMessageModal(false)} />
          
          <View style={[styles.sheetContent, { backgroundColor: themeColors.neutralBackground1, paddingBottom: Spacing.xl }]}>
            {/* Sheet Handle Accent */}
            <View style={[styles.sheetHandle, { backgroundColor: themeColors.neutralStroke1 }]} />
            
            <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s }}>
                <Text style={[styles.sheetTitle, { color: themeColors.neutralForeground1 }]}>Message the organization</Text>
                <Pressable onPress={() => setShowMessageModal(false)} style={{ padding: Spacing.xxs }}>
                  <Ionicons name="close" size={24} color={themeColors.neutralForeground1} />
                </Pressable>
              </View>

              {/* Organization Profile Card inside Modal */}
              <Pressable 
                onPress={() => {
                  setShowMessageModal(false);
                  onViewNgo(opportunity.organizationName);
                }}
                style={({ pressed }) => [
                  styles.flatOrgCard,
                  { 
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: themeColors.neutralBackground2,
                    borderColor: themeColors.neutralStroke1,
                    borderWidth: 1,
                    borderRadius: Shapes.rounded,
                    padding: Spacing.s,
                    marginBottom: Spacing.s,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderTopWidth: 1
                  }
                ]}
              >
                <Image source={{ uri: opportunity.organizationLogo }} style={styles.flatOrgLogo} />
                <View style={{ flex: 1, marginLeft: Spacing.s }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.flatOrgName, { color: themeColors.neutralForeground1 }]}>
                      {opportunity.organizationName}
                    </Text>
                    <Ionicons name="checkmark-circle" size={14} color={accentColor} style={{ marginLeft: Spacing.xxs }} />
                  </View>
                  <Text style={[styles.flatOrgStats, { color: themeColors.neutralForeground3, fontSize: 11, marginTop: 1 }]}>
                    ★ 4.9 · 312 reviews · 48 drives
                  </Text>
                  
                  {/* Verified Organizer Badge inside Modal */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xxs }}>
                    <Ionicons name="shield-checkmark-outline" size={11} color={accentColor} style={{ marginRight: Spacing.xxs }} />
                    <Text style={[styles.flatOrgVerifiedText, { color: themeColors.neutralForeground2, fontSize: 10 }]}>
                      Verified organizer · 6 yrs active
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* Response Metrics Card */}
              <View style={[styles.responseMetricsBox, { backgroundColor: themeColors.successBackgroundSubtle, borderColor: themeColors.successForeground1 }]}>
                <View style={[styles.responseMetricChip, { backgroundColor: themeColors.successForeground1 }]}>
                  <Ionicons name="time-outline" size={11} color={themeColors.neutralForegroundOnBrand} style={{ marginRight: Spacing.xxs }} />
                  <Text style={[styles.responseMetricChipText, { color: themeColors.neutralForegroundOnBrand }]}>2-hour average response</Text>
                </View>
                <Text style={[styles.responseMetricDesc, { color: themeColors.neutralForeground2 }]}>
                  The {opportunity.organizationName || 'organizer'} team typically replies fast — usually before lunch.
                </Text>
              </View>

              {/* Pre-filled Message Suggestions */}
              <Text style={[styles.prepHeaderTitle, { color: themeColors.neutralForeground1, marginTop: Spacing.s, marginBottom: Spacing.s }]}>
                Pre-filled message templates
              </Text>
              
              {messageTemplates.map((template) => (
                <Pressable
                  key={template}
                  onPress={() => setCustomMessage(template)}
                  style={[styles.fullWidthTemplatePill, { borderColor: themeColors.neutralStroke1 }]}
                >
                  <Text style={[styles.fullWidthTemplatePillText, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                    {template}
                  </Text>
                </Pressable>
              ))}

              {/* Unified Input Block */}
              <View style={[styles.composerInputWrapper, { backgroundColor: themeColors.neutralBackground2, borderColor: themeColors.neutralStroke1 }]}>
                <TextInput
                  ref={messageInputRef}
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  placeholder="Write a message to the organizer..."
                  placeholderTextColor={themeColors.neutralForeground3}
                  style={[styles.composerTextInput, { color: themeColors.neutralForeground1 }]}
                  multiline
                />
              </View>

              {/* Footer Row */}
              <View style={styles.composerFooterRow}>
                <Text style={[styles.composerFooterText, { color: themeColors.neutralForeground3 }]}>
                  Responses arrive in your inbox & email.
                </Text>
                <Pressable
                  onPress={() => {
                    if (!customMessage.trim()) return;
                    setCustomMessage('');
                    setShowMessageModal(false);
                    triggerToast("Message sent to volunteer coordinator!");
                  }}
                  disabled={!customMessage.trim()}
                  style={({ pressed }) => [
                    styles.sendActionBtn,
                    {
                      backgroundColor: customMessage.trim() ? themeColors.successForeground1 : themeColors.neutralBackgroundDisabled,
                      opacity: pressed ? 0.8 : 1,
                    }
                  ]}
                >
                  <Ionicons name="send-outline" size={13} color={themeColors.neutralForegroundOnBrand} style={{ marginRight: Spacing.xxs }} />
                  <Text style={[styles.sendActionBtnText, { color: themeColors.neutralForegroundOnBrand }]}>Send</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* COMMUNITY PEERS BOTTOM DRAWER */}
      {showPeersDrawer && (
        <View style={styles.drawerOverlayContainer}>
          <Pressable style={styles.drawerBackdrop} onPress={closePeersDrawer}>
            <Animated.View style={[styles.drawerBackdrop, { opacity: peersDrawerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]}>
              <View style={{ flex: 1, backgroundColor: themeColors.neutralBackgroundOverlay }} />
            </Animated.View>
          </Pressable>
          <Animated.View style={[
            styles.drawerSheet,
            {
              backgroundColor: themeColors.neutralBackground1,
              transform: [{
                translateY: peersDrawerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight * 0.6, 0],
                })
              }]
            }
          ]}>
            {/* Drawer Handle */}
            <View style={styles.drawerHandleWrap}>
              <View style={[styles.drawerHandle, { backgroundColor: themeColors.neutralStroke1 }]} />
            </View>
            {/* Drawer Header */}
            <View style={styles.drawerHeaderRow}>
              <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 16 }]}>
                Community Peers
              </Text>
              <Pressable onPress={closePeersDrawer} style={styles.drawerCloseBtn}>
                <Ionicons name="close" size={20} color={themeColors.neutralForeground2} />
              </Pressable>
            </View>
            <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginBottom: Spacing.m, paddingHorizontal: Spacing.m }]}>
              {attendees.length} {attendees.length === 1 ? 'volunteer' : 'volunteers'} from your community signed up
            </Text>
            {/* Peer List */}
            <ScrollView style={styles.drawerScrollContent} showsVerticalScrollIndicator={false}>
              {attendees.map((name: string, idx: number) => (
                <View key={idx} style={[styles.drawerPeerRow, { borderBottomColor: themeColors.neutralStroke2, borderBottomWidth: idx === attendees.length - 1 ? 0 : 1 }]}>
                  <Image
                    source={{ uri: [
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
                    ][idx % 5] }}
                    style={styles.drawerPeerAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Text>
                    <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                      Registered · Community member
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={16} color={themeColors.successForeground1} />
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingTop: Platform.OS === 'ios' ? Spacing.xxxl + Spacing.xs : Spacing.l,
    paddingBottom: Spacing.s,
    borderBottomWidth: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingTop: Platform.OS === 'ios' ? Spacing.xxxl + Spacing.xs : Spacing.l,
    paddingBottom: Spacing.s,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.xxs,
  },
  headerIconBtn: {
    padding: Spacing.xs,
  },
  heroCardContainer: {
    marginHorizontal: Spacing.m,
    marginTop: Spacing.m,
    height: 220,
    borderRadius: Shapes.rounded,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingLocationBadge: {
    position: 'absolute',
    bottom: Spacing.s,
    left: Spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.rounded,
  },
  floatingLocationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  campaignHeaderBlock: {
    marginHorizontal: Spacing.m,
    marginTop: Spacing.xl,
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
  },
  categoryPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.s,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  unifiedTitleText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: Spacing.s,
  },
  unifiedDescText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.m,
  },
  flatOrgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.m,
    borderTopWidth: 1,
  },
  flatOrgLogo: {
    width: 40,
    height: 40,
    borderRadius: Shapes.circular,
  },
  flatOrgName: {
    fontSize: 14,
    fontWeight: '700',
  },
  flatOrgStats: {
    fontSize: 11,
    marginTop: Spacing.xxs,
  },
  flatOrgVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
    marginTop: Spacing.s,
  },
  flatOrgVerifiedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  logisticsContainerCard: {
    marginHorizontal: Spacing.m,
    marginTop: Spacing.m,
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
  },
  logisticsHeaderTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: Spacing.xxs,
  },
  logisticsSubTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.m,
  },
  logisticsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  logisticsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  logisticsBoxLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logisticsBoxVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingHorizontal: Spacing.m,
    marginTop: Spacing.xl,
  },
  categoryHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: Spacing.xxs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: Spacing.s,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  metricCard: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginTop: Spacing.s,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xxs,
  },
  metricDisplayNumber: {
    fontSize: 26,
    fontWeight: '700',
  },
  metricGoalNumber: {
    fontSize: 13,
    marginLeft: Spacing.xxs,
  },
  metricCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.s,
  },
  metricProgressBarBg: {
    height: 6,
    borderRadius: Shapes.circular,
    width: '100%',
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  metricProgressBarFill: {
    height: '100%',
    borderRadius: Shapes.circular,
  },
  metricCardPercentText: {
    fontSize: 11,
    textAlign: 'left',
  },
  premiumQuoteCard: {
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginTop: Spacing.l,
    overflow: 'hidden',
  },
  quoteBannerImage: {
    width: '100%',
    height: 160,
  },
  quoteContentWrap: {
    padding: Spacing.m,
  },
  quoteTextSerif: {
    fontSize: 15,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 22,
    marginBottom: Spacing.s,
  },
  quoteSignature: {
    fontSize: 12,
  },
  quoteAuthorBold: {
    fontWeight: 'bold',
  },
  roleParentCard: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  dutyItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.s,
  },
  dutyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
    marginTop: -2,
  },
  roleParentCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: Spacing.xxs,
  },
  roleParentTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: Spacing.s,
  },
  roleTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.m,
  },
  roleTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
  },
  roleTagPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleSubMetricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  roleSubMetricIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  jobDetailHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  jobDetailVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  skillsPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.m,
  },
  skillPillOutline: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
    borderWidth: 1,
  },
  skillPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  requirementsCard: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginTop: Spacing.none,
    marginBottom: Spacing.m,
  },
  requirementsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  requirementsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  requirementItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  requirementItemText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  accommodationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accessibilityCard: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  accessibilityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  accessibilityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  accessibilityTitleText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  accessibilityPillOutline: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.circular,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  accessibilityPillOutlineActive: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.circular,
    borderWidth: 1.5,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  accessibilityPillTextOutline: {
    fontSize: 12,
    fontWeight: '600',
  },
  accessibilityPillTextOutlineActive: {
    fontSize: 12,
    fontWeight: '700',
  },
  accessibilityPillProvided: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.circular,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  accessibilityPillTextProvided: {
    fontSize: 12,
    fontWeight: '600',
  },
  perksParentCard: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.none,
  },
  perksGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.s,
  },
  perkCardInner: {
    width: '48%',
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkCard: {
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
  },
  perkIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  perkCardTitleInner: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.xxs,
    textAlign: 'center',
  },
  perkCardDescInner: {
    ...Typography.caption,
    lineHeight: 20,
    textAlign: 'center',
  },
  socialProofCard: {
    marginVertical: Spacing.none,
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
  },
  socialProofAvatarsCard: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.s,
  },
  socialAv: {
    width: 28,
    height: 28,
    borderRadius: Shapes.circular,
    borderWidth: 1.5,
  },
  socialBadgePill: {
    width: 28,
    height: 28,
    borderRadius: Shapes.circular,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  socialTextBelow: {
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: Spacing.xxs,
  },
  socialBadgeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  socialBadgeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBadgeItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  socialBadgeItemSub: {
    fontSize: 11.5,
    marginTop: Spacing.xxs,
  },
  coordCardVertical: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordAvatarCenter: {
    width: 56,
    height: 56,
    borderRadius: Shapes.circular,
    marginBottom: Spacing.s,
  },
  coordNameCenter: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  coordBadgeCenter: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
    marginBottom: Spacing.s,
  },
  coordBadgeTextCenter: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  coordBioCenter: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  coordActionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.s,
    paddingVertical: Spacing.xxs,
  },
  coordActionPromptText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Horizontal Guide Card
  guideCardHorizontal: {
    flexDirection: 'row',
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.s,
    alignItems: 'flex-start',
  },
  guideAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: Shapes.circular,
    marginRight: Spacing.s,
  },
  guideContentCol: {
    flex: 1,
  },
  guideRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
  },
  guideRoleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  guideChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  guideChatBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Bottom Drawer
  drawerOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: screenHeight * 0.6,
    borderTopLeftRadius: Spacing.m,
    borderTopRightRadius: Spacing.m,
    paddingBottom: Spacing.xxl,
    zIndex: 101,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  drawerHandleWrap: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.s,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    borderRadius: Shapes.circular,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.xxs,
  },
  drawerCloseBtn: {
    padding: Spacing.xs,
  },
  drawerScrollContent: {
    paddingHorizontal: Spacing.m,
  },
  drawerPeerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
  },
  drawerPeerAvatar: {
    width: 36,
    height: 36,
    borderRadius: Shapes.circular,
    marginRight: Spacing.s,
  },
  drawerAnonymousCircle: {
    width: 36,
    height: 36,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  mediaBlockTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  audioPlayerSimulator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Shapes.rounded,
    padding: Spacing.xs,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  waveBar: {
    width: 3,
    borderRadius: Shapes.circular,
  },
  sketchTape: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginVertical: Spacing.xs,
  },
  sceneCard: {
    alignItems: 'center',
    width: 100,
  },
  sceneImg: {
    width: 100,
    height: 70,
    borderRadius: Shapes.rounded,
  },
  sceneLabel: {
    fontSize: 10.5,
    fontWeight: 'bold',
    marginTop: Spacing.xxs,
    textAlign: 'center',
  },
  prepCardBlock: {
    marginVertical: Spacing.xs,
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
  },
  prepHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: Spacing.s,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  stepNumCircle: {
    width: 22,
    height: 22,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  prepMainCardContainer: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.m,
  },
  complianceCard: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
  },
  segmentedTabBar: {
    flexDirection: 'row',
    padding: Spacing.xxs,
    borderRadius: Shapes.circular,
    marginBottom: Spacing.m,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.circular,
  },
  tabButtonActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.circular,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    fontSize: 13,
    fontWeight: '700',
  },
  responseMetricsBox: {
    borderWidth: 1,
    borderRadius: Shapes.rounded,
    padding: Spacing.s,
    marginBottom: Spacing.m,
  },
  responseMetricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
    marginBottom: Spacing.xs,
  },
  responseMetricChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  responseMetricDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  fullWidthTemplatePill: {
    borderWidth: 1,
    borderRadius: Shapes.circular,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.xs,
    width: '100%',
    alignItems: 'flex-start',
  },
  fullWidthTemplatePillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  composerInputWrapper: {
    borderWidth: 1,
    borderRadius: Shapes.rounded,
    padding: Spacing.s,
    marginTop: Spacing.m,
    height: 80,
  },
  composerTextInput: {
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    height: '100%',
    padding: 0,
  },
  composerFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.s,
    marginBottom: Spacing.s,
  },
  composerFooterText: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.s,
  },
  sendActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.circular,
  },
  sendActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  customMsgInput: {
    borderWidth: 1,
    borderRadius: Shapes.rounded,
    padding: Spacing.s,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: Spacing.s,
  },
  documentFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.s,
  },
  requiredDocLabel: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
    marginLeft: Spacing.xxs,
  },
  requiredDocLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeDone: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.rounded,
  },
  docIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Shapes.circular,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  documentRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.circular,
    borderWidth: 1,
  },
  documentRowBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addProfileCheckboxRow: {
    flexDirection: 'row',
    marginTop: Spacing.m,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.s,
  },
  privacyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  trustedBox: {
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
  },
  dividerLine: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.s,
  },
  postQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  questionInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: Shapes.rounded,
    paddingHorizontal: Spacing.s,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Shapes.rounded,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  qaCardWrapper: {
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
  },
  questionBubbleWrap: {
    padding: Spacing.xs,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadgeCapsule: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Shapes.circular,
    marginLeft: Spacing.xs,
    alignSelf: 'center',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  repliesListWrap: {
    marginLeft: Spacing.m,
    marginTop: Spacing.s,
  },
  replyBubbleCard: {
    padding: Spacing.xs,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
  },
  userCommentAvatar: {
    width: 24,
    height: 24,
    borderRadius: Shapes.circular,
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  commentTime: {
    fontSize: 11,
    marginTop: 1,
  },
  flagBtnContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  flagBtnPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  logisticsContainerVertical: {
    marginTop: Spacing.m,
    padding: Spacing.m,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    gap: Spacing.s,
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logisticsTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  logisticsLabel: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  logisticsValue: {
    ...Typography.bodyStrong,
    fontSize: 14,
    marginTop: 2,
  },
  footerShareBtn: {
    width: 40,
    height: 40,
    borderRadius: Shapes.circular,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: Spacing.xxl * 3,
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 100,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    zIndex: 90,
  },
  footerCostLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerPointsValue: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissOverlayArea: {
    flex: 1,
  },
  sheetContent: {
    borderTopLeftRadius: Shapes.rounded,
    borderTopRightRadius: Shapes.rounded,
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.s,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: Shapes.circular,
    alignSelf: 'center',
    marginBottom: Spacing.m,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  labelHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  slotSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1.5,
    marginBottom: Spacing.xs,
  },
  slotPillText: {
    fontSize: 13,
  },
  waiverCheckboxRow: {
    flexDirection: 'row',
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
    alignItems: 'flex-start',
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: Shapes.rounded,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
    marginTop: Spacing.xxs,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
  },
  successWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.m,
    lineHeight: 18,
  },
  qaExpandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.s,
    marginTop: Spacing.s,
  },
  qaExpandBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  snackbarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? Spacing.xxl * 3 : Spacing.xxxl * 2,
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 150,
  },
  snackbarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  snackbarText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  snackbarActionBtn: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xxs,
    borderRadius: Shapes.rounded,
    marginLeft: Spacing.xs,
  },
  snackbarActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trustedRowStacked: {
    marginBottom: Spacing.s,
  },
  trustedLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trustedValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
