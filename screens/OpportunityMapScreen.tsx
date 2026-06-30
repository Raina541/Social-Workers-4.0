import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
  Image,
  PanResponder,
  Animated,
  ImageStyle,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Opportunity as FeedOpportunity, DOMAINS, MOCK_OPPORTUNITIES } from './Feed';
import Svg, { Defs, ClipPath, Path, G, Circle as CircleSvg, Rect, Line, Text as TextSvg } from 'react-native-svg';

import MapView, { Marker, Circle } from './MapModules';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const drawerHeight = screenHeight - 110;

// Coordinate center helper (Defaulting to Gwalior MP)
const GWALIOR_COORDS = { latitude: 26.2183, longitude: 78.1828 };
const EARTH_RADIUS_KM = 6371;
const MAGENTA_RED = '#d8246c';
const maxRadiusKm = 20;

interface GeoCoords {
  latitude: number;
  longitude: number;
}

interface MappedOpportunity extends FeedOpportunity {
  latOffset: number;
  lngOffset: number;
  distance: number;
  latitude: number;
  longitude: number;
}

interface OpportunityMapScreenProps {
  isDarkMode?: boolean;
  onBack: () => void;
  onSelectOpportunity?: (opp: FeedOpportunity | null) => void;
}

// Distance helper using Haversine formula
const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

// Calculate coordinates for circle edge (east point)
const getEdgeCoordinate = (center: GeoCoords, radiusKm: number): GeoCoords => {
  const latRad = (center.latitude * Math.PI) / 180;
  const lngOffset = radiusKm / (111.32 * Math.cos(latRad));
  return {
    latitude: center.latitude,
    longitude: center.longitude + lngOffset,
  };
};

// Calculate required latitudeDelta and longitudeDelta to fit circular search radius
const getRegionForRadius = (center: GeoCoords, radiusKm: number) => {
  const latRad = (center.latitude * Math.PI) / 180; 
  const padding = 1.35; // margin factor
  const latDelta = (2 * radiusKm / 111.32) * padding;
  const lngDelta = (2 * radiusKm / (111.32 * Math.cos(latRad))) * padding;
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: Math.max(0.005, latDelta),
    longitudeDelta: Math.max(0.005, lngDelta),
  };
};

// Deterministic coordinate offsets generator using String hashing
const hashStringToOffsets = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate lat offset in range [-0.08, 0.08]
  const latOffset = ((Math.abs(hash) % 100) / 100) * 0.16 - 0.08;
  // Generate lng offset in range [-0.08, 0.08]
  const lngOffset = (((Math.abs(hash) >> 8) % 100) / 100) * 0.16 - 0.08;
  return { latOffset, lngOffset };
};

export const OpportunityMapScreen: React.FC<OpportunityMapScreenProps> = ({
  isDarkMode = false,
  onBack,
  onSelectOpportunity,
}) => {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<GeoCoords>(GWALIOR_COORDS);
  const [radius, setRadius] = useState<number>(5.0); // radius in km (default: 5.0)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedOpp, setSelectedOpp] = useState<MappedOpportunity | null>(null);

  const [showZipBanner, setShowZipBanner] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [resolvedLocationName, setResolvedLocationName] = useState('Gwalior, MP');

  const ZIP_COORDS: Record<string, { latitude: number, longitude: number, name: string }> = {
    '474001': { latitude: 26.2183, longitude: 78.1828, name: 'Gwalior, MP' },
    '600001': { latitude: 13.0827, longitude: 80.2707, name: 'Chennai, TN' },
    '110001': { latitude: 28.6139, longitude: 77.2090, name: 'New Delhi, DL' },
    '400001': { latitude: 18.9220, longitude: 72.8347, name: 'Mumbai, MH' },
    '94102': { latitude: 37.7749, longitude: -122.4194, name: 'San Francisco, CA' },
  };

  const handleZipSearch = (zip: string) => {
    const cleanZip = zip.trim();
    if (ZIP_COORDS[cleanZip]) {
      const coords = ZIP_COORDS[cleanZip];
      setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
      setResolvedLocationName(`${coords.name} (${cleanZip})`);
      setShowZipBanner(false);
      
      if (mapRef.current) {
        const region = getRegionForRadius({ latitude: coords.latitude, longitude: coords.longitude }, radius);
        mapRef.current.animateToRegion(region, 800);
      }
    } else if (cleanZip.length >= 5) {
      let hash = 0;
      for (let i = 0; i < cleanZip.length; i++) {
        hash = cleanZip.charCodeAt(i) + ((hash << 5) - hash);
      }
      const latOffset = ((Math.abs(hash) % 100) / 100) * 0.1 - 0.05;
      const lngOffset = (((Math.abs(hash) >> 8) % 100) / 100) * 0.1 - 0.05;
      const latitude = 26.2183 + latOffset;
      const longitude = 78.1828 + lngOffset;
      
      setUserLocation({ latitude, longitude });
      setResolvedLocationName(`Area ${cleanZip}`);
      setShowZipBanner(false);

      if (mapRef.current) {
        const region = getRegionForRadius({ latitude, longitude }, radius);
        mapRef.current.animateToRegion(region, 800);
      }
    } else {
      Alert.alert("Invalid Zip Code", "Please enter a valid 5 or 6 digit ZIP code.");
    }
  };

  // Pulsing user location dot animation
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = () => {
      pulseAnim.setValue(0);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }).start(() => pulseLoop());
    };
    pulseLoop();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 2.5],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.75, 1],
    outputRange: [0.5, 0.2, 0],
  });

  // Draggable snap drawer state management
  const [drawerState, setDrawerState] = useState<'closed' | 'collapsed' | 'expanded'>('collapsed');
  const drawerY = useRef(new Animated.Value(drawerHeight - 70)).current;
  const startY = useRef(drawerHeight - 70);

  // Effect to automatically animate drawer to collapsed state when a pin selection changes
  useEffect(() => {
    animateDrawer('collapsed');
  }, [selectedOpp]);

  const animateDrawer = (state: 'closed' | 'collapsed' | 'expanded') => {
    setDrawerState(state);
    let toValue = drawerHeight; // default closed/hidden
    if (state === 'collapsed') {
      toValue = selectedOpp ? (drawerHeight - 260) : (drawerHeight - 70);
    } else if (state === 'expanded') {
      toValue = 0;
    }

    Animated.spring(drawerY, {
      toValue,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  // PanResponder to handle swipe gestures on the bottom sheet handle
  const drawerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        let currentPos = drawerHeight;
        if (drawerState === 'collapsed') {
          currentPos = selectedOpp ? (drawerHeight - 260) : (drawerHeight - 70);
        } else if (drawerState === 'expanded') {
          currentPos = 0;
        }
        startY.current = currentPos;
      },
      onPanResponderMove: (_, gestureState) => {
        const nextY = startY.current + gestureState.dy;
        // Keep it clamped so the user cannot drag above 0px offset (drawer top limit)
        if (nextY >= 0) {
          drawerY.setValue(nextY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalY = startY.current + gestureState.dy;

        const thresholdCollapsed = selectedOpp ? (drawerHeight - 260) : (drawerHeight - 70);
        const thresholdExpanded = 0;

        let targetState: 'closed' | 'collapsed' | 'expanded' = 'collapsed';

        // Check vertical velocity for quick swipe gestures
        if (gestureState.vy < -0.5) {
          targetState = 'expanded';
        } else if (gestureState.vy > 0.5) {
          // If in single pin view and swiping down, return to macro view collapsed bar
          if (selectedOpp && startY.current === (drawerHeight - 260)) {
            setSelectedOpp(null);
            targetState = 'collapsed';
          } else {
            targetState = 'collapsed';
          }
        } else {
          // Snap based on closest distance
          const distCollapsed = Math.abs(finalY - thresholdCollapsed);
          const distExpanded = Math.abs(finalY - thresholdExpanded);

          if (distExpanded < distCollapsed) {
            targetState = 'expanded';
          } else {
            targetState = 'collapsed';
          }
        }

        animateDrawer(targetState);
      },
    })
  ).current;

  // Request location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          setResolvedLocationName("Current Location");
          setShowZipBanner(false);
        } else {
          setShowZipBanner(true);
        }
      } catch (err) {
        console.log('Permission to access location was denied, using fallback coordinate.');
        setShowZipBanner(true);
      }
    })();
  }, []);

  // Center map on user location when coordinates load (5km default radius)
  useEffect(() => {
    if (mapRef.current && userLocation) {
      const region = getRegionForRadius(userLocation, 5.0);
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [userLocation]);

  // Combine Feed opportunities (In-person & Micro volunteering are geographic)
  const combinedOpps = [
    ...(MOCK_OPPORTUNITIES['In-person'] || []),
    ...(MOCK_OPPORTUNITIES['Micro volunteering'] || []),
  ];

  // Compute opportunity coordinates and distances
  const mappedOpps: MappedOpportunity[] = combinedOpps.map((opp) => {
    const { latOffset, lngOffset } = hashStringToOffsets(opp.id);
    const lat = userLocation.latitude + latOffset;
    const lng = userLocation.longitude + lngOffset;
    const dist = getDistanceInKm(userLocation.latitude, userLocation.longitude, lat, lng);
    return {
      ...opp,
      latOffset,
      lngOffset,
      latitude: lat,
      longitude: lng,
      distance: dist,
    };
  });

  // Filter based on active selected radius
  const filteredOpps = mappedOpps.filter((opp) => opp.distance <= radius);

  // Handle drawer animation opening (Micro View)
  const openDrawer = (opp: MappedOpportunity) => {
    setSelectedOpp(opp);
    
    // Focus/Center map on marker coordinate (slightly offset to account for bottom sheet height)
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: opp.latitude - (radius * 0.003),
          longitude: opp.longitude,
          latitudeDelta: Math.max(0.015, radius * 0.012),
          longitudeDelta: Math.max(0.015, radius * 0.012),
        },
        600
      );
    }
  };

  // Web Radar Map Drag gesture setup
  // Web scale: center is (centerX=175, centerY=175), max 20km = 150px (7.5px/km)
  const radarScale = 7.5;
  const webCenter = 175;

  const webPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        const touchY = evt.nativeEvent.locationY;
        const dx = touchX - webCenter;
        const dy = touchY - webCenter;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        const calculatedRadius = distPx / radarScale;
        setRadius(Math.min(maxRadiusKm, Math.max(1.0, calculatedRadius)));
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
    })
  ).current;

  // Render bottom details drawer overlay (Macro vs Micro view)
  const renderExpandableDrawer = () => {
    const isMicro = selectedOpp !== null;
    const collapsedVisibleHeight = isMicro ? 260 : 70;

    const translateY = drawerY.interpolate({
      inputRange: [0, drawerHeight - collapsedVisibleHeight, drawerHeight],
      outputRange: [0, drawerHeight - collapsedVisibleHeight, drawerHeight],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.bottomDrawer,
          {
            backgroundColor: themeColors.neutralBackground1,
            transform: [{ translateY }],
            borderColor: themeColors.neutralStroke2,
            height: drawerHeight,
          },
        ]}
      >
        {/* Top Draggable Handle Area */}
        <View {...drawerPanResponder.panHandlers} style={styles.drawerDragHandleContainer}>
          <View style={[styles.drawerCloseLine, { backgroundColor: themeColors.neutralStroke1 }]} />
        </View>

        {isMicro ? (
          /* ================= MICRO VIEW (SINGLE OPPORTUNITY PEEK) ================= */
          <View style={{ flex: 1 }}>
            <ScrollView
              style={styles.drawerScrollView}
              contentContainerStyle={styles.drawerScrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={drawerState === 'expanded'}
            >
              {/* Summary Row */}
              {(() => {
                const membersCount = Math.abs(selectedOpp.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 250 + 150;
                const onlineCount = Math.floor(membersCount * 0.13) + 3;
                const domainConfig = DOMAINS.find(d => d.id === selectedOpp.domainId) || DOMAINS[0];
                return (
                  <>
                    <View style={styles.drawerHeaderRow}>
                      <Image source={{ uri: selectedOpp.imageUri }} style={styles.drawerImage as ImageStyle} />
                      <View style={styles.drawerHeaderDetails}>
                        <Text style={[styles.drawerTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                          {selectedOpp.title}
                        </Text>
                        <Text style={[Typography.body, { color: themeColors.neutralForeground3, fontSize: 13, marginTop: 2 }]}>
                          {membersCount} members • {onlineCount} online
                        </Text>
                        <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1, marginTop: 4, fontSize: 12 }]}>
                          {(selectedOpp.distance ?? 0).toFixed(1)} km away
                        </Text>
                      </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.drawerTagsRow}>
                      <View style={[styles.drawerTagChip, { backgroundColor: isDarkMode ? '#243454' : '#e0ecfa' }]}>
                        <Text style={[styles.drawerTagText, { color: themeColors.brandForeground1 }]}>
                          {domainConfig.name}
                        </Text>
                      </View>
                      <View style={[styles.drawerTagChip, { backgroundColor: themeColors.neutralBackground3 }]}>
                        <Text style={[styles.drawerTagText, { color: themeColors.neutralForeground2 }]}>
                          {selectedOpp.durationAbbreviation.toUpperCase()}
                        </Text>
                      </View>
                      <View style={[styles.drawerTagChip, { backgroundColor: themeColors.neutralBackground3 }]}>
                        <Text style={[styles.drawerTagText, { color: themeColors.neutralForeground2 }]}>
                          {selectedOpp.displayDate}
                        </Text>
                      </View>
                    </View>
                  </>
                );
              })()}

              {/* Description Block */}
              {drawerState === 'collapsed' ? (
                <Text
                  style={[styles.drawerDescription, Typography.body, { color: themeColors.neutralForeground2 }]}
                  numberOfLines={3}
                >
                  {selectedOpp.shortDescription || selectedOpp.description}
                </Text>
              ) : (
                <View style={styles.expandedAboutSection}>
                  <View style={[styles.dividerLineItem, { backgroundColor: themeColors.neutralStroke2 }]} />
                  
                  {/* Domain Category Badge */}
                  <View style={styles.infoSection}>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground2, marginBottom: Spacing.xxs, fontSize: 11 }]}>
                      CAUSE CATEGORY
                    </Text>
                    <View style={[styles.customBadge, { backgroundColor: (DOMAINS.find(d => d.id === selectedOpp.domainId) || DOMAINS[0]).lightBg }]}>
                      <Text style={styles.customBadgeText}>
                        {(DOMAINS.find(d => d.id === selectedOpp.domainId) || DOMAINS[0]).name}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.infoSection}>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground2, marginBottom: Spacing.xxs, fontSize: 11 }]}>
                      PROJECT DESCRIPTION
                    </Text>
                    <Text style={[Typography.body, { color: themeColors.neutralForeground1, lineHeight: 20 }]}>
                      {selectedOpp.description || selectedOpp.shortDescription}
                    </Text>
                  </View>

                  {/* Location Info */}
                  <View style={styles.infoSection}>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground2, marginBottom: Spacing.xxs, fontSize: 11 }]}>
                      MEETING PLACE
                    </Text>
                    <Text style={[Typography.body, { color: themeColors.neutralForeground1, lineHeight: 20 }]}>
                      {selectedOpp.location}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Action buttons row (Sticky at the base) */}
            <View style={[styles.drawerButtonRow, { borderTopColor: themeColors.neutralStroke2, backgroundColor: themeColors.neutralBackground1 }]}>
              <Pressable
                onPress={() => setSelectedOpp(null)}
                style={[styles.drawerCancelButton, { borderColor: themeColors.neutralStroke1 }]}
              >
                <Text style={{ color: themeColors.neutralForeground1, fontWeight: '600' }}>Back</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  if (onSelectOpportunity) {
                    onSelectOpportunity(selectedOpp);
                    onBack();
                  } else {
                    Alert.alert('Details', 'Opening opportunity details...');
                  }
                }}
                style={[styles.drawerJoinButton, { backgroundColor: themeColors.brandForeground1 }]}
              >
                <Text style={styles.drawerJoinButtonText}>View Details</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* ================= MACRO VIEW (MULTI-OPPORTUNITY LIST) ================= */
          <View style={{ flex: 1 }}>
            {drawerState === 'collapsed' ? (
              <Pressable onPress={() => animateDrawer('expanded')} style={styles.macroCollapsedHandleContent}>
                <Ionicons name="chevron-up" size={16} color={themeColors.neutralForeground3} style={{ marginRight: 6 }} />
                <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground2, fontSize: 13 }]}>
                  Swipe up to view {filteredOpps.length} {filteredOpps.length === 1 ? 'opportunity' : 'opportunities'} in range
                </Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={[styles.macroExpandedTitle, { color: themeColors.neutralForeground1 }]}>
                  Opportunities in Range ({filteredOpps.length})
                </Text>
                
                <ScrollView
                  style={styles.drawerScrollView}
                  contentContainerStyle={styles.macroListScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredOpps.length === 0 ? (
                    <View style={styles.emptyListContainer}>
                      <Ionicons name="compass-outline" size={48} color={themeColors.neutralForegroundDisabled} />
                      <Text style={[Typography.body, { color: themeColors.neutralForeground3, marginTop: Spacing.s, textAlign: 'center', paddingHorizontal: Spacing.l }]}>
                        No opportunities found in this range. Drag the handle to expand your search area.
                      </Text>
                    </View>
                  ) : (
                    filteredOpps.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => openDrawer(item)}
                        style={[
                          styles.macroListItemCard,
                          {
                            backgroundColor: themeColors.neutralBackground2,
                            borderColor: themeColors.neutralStroke1,
                          },
                        ]}
                      >
                        <Image source={{ uri: item.imageUri }} style={styles.macroListImage as ImageStyle} />
                        <View style={styles.macroListDetails}>
                          <Text style={[styles.macroListTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginTop: 2 }]}>
                            {item.timeCommitment} • {(item.distance ?? 0).toFixed(1)} km away
                          </Text>
                          <View style={styles.macroListTags}>
                            <View style={[styles.macroListTagChip, { backgroundColor: isDarkMode ? '#243454' : '#e0ecfa' }]}>
                              <Text style={[styles.macroListTagText, { color: themeColors.brandForeground1 }]}>
                                {item.durationAbbreviation}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={themeColors.neutralForeground3} />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  // Render Web platform visualization
  const renderWebRadarMap = () => {
    const radiusPx = radius * radarScale;
    return (
      <View style={[styles.screenContainer, { backgroundColor: themeColors.neutralBackground2 }]}>
        {/* Top Header Navigation Bar */}
        <View style={[styles.screenHeader, { backgroundColor: themeColors.neutralBackground1, borderBottomColor: themeColors.neutralStroke2 }]}>
          <Pressable onPress={onBack} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={20} color={themeColors.brandForeground1} />
            <Text style={[styles.headerBackText, { color: themeColors.brandForeground1 }]}>Back</Text>
          </Pressable>
          <Text style={[styles.screenHeaderTitle, { color: themeColors.neutralForeground1 }]}>Nearby opportunities</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.mapContainer}>
          {/* Combined Floating Status Pill Overlay */}
          <View style={styles.floatingPillContainer}>
            <View style={[styles.leftPillSegment, { backgroundColor: themeColors.brandBackground }]}>
              <Text style={styles.leftPillText}>
                {radius.toFixed(1)} km Radius • {filteredOpps.length} communities
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setUserLocation(GWALIOR_COORDS);
                setResolvedLocationName('Gwalior, MP');
              }}
              style={[styles.rightPillSegment, { backgroundColor: '#ffffff', borderColor: themeColors.neutralStroke1 }]}
            >
              <Ionicons name="locate" size={12} color="#000000" style={{ marginRight: 4 }} />
              <Text style={styles.rightPillText}>Current Location</Text>
            </Pressable>
          </View>

          {/* Zip Code search banner */}
          {showZipBanner && (
            <View style={[styles.zipBanner, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2, zIndex: 101 }]}>
              <Text style={[styles.zipBannerText, { color: themeColors.neutralForeground2 }]}>
                Enter ZIP Code:
              </Text>
              <TextInput
                style={[styles.zipInput, { color: themeColors.neutralForeground1, borderColor: themeColors.neutralStroke1 }]}
                value={zipCode}
                onChangeText={(val) => {
                  setZipCode(val);
                  if (val.length === 5 || val.length === 6) {
                    handleZipSearch(val);
                  }
                }}
                placeholder="e.g. 474001"
                placeholderTextColor={themeColors.neutralForegroundDisabled}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Pressable onPress={() => handleZipSearch(zipCode)} style={[styles.zipButton, { backgroundColor: themeColors.brandBackground }]}>
                <Text style={styles.zipButtonText}>Search</Text>
              </Pressable>
            </View>
          )}

          {/* Interactive Radar Screen */}
          <Pressable
            style={styles.radarLayout}
            onPress={() => {
              if (selectedOpp) {
                setSelectedOpp(null);
              }
            }}
          >
            <View
              style={[
                styles.radarScreen,
                {
                  borderColor: isDarkMode ? '#1f2937' : '#d2d6dc',
                  backgroundColor: isDarkMode ? '#1E2522' : '#F0F4F1',
                },
              ]}
            >
              {/* SVG Gwalior Vector Map */}
              <Svg width={350} height={350} style={StyleSheet.absoluteFillObject}>
                {/* Background land */}
                <Rect width={350} height={350} fill={isDarkMode ? '#1E2522' : '#F0F4F1'} />
                
                {/* River winding across */}
                <Path d="M -10,120 Q 80,100 150,130 T 400,100" stroke={isDarkMode ? '#1B2F42' : '#cbdff7'} strokeWidth={12} fill="none" />
                
                {/* Streets Grid */}
                <Line x1={150} y1={0} x2={150} y2={350} stroke={isDarkMode ? '#2D3532' : '#ffffff'} strokeWidth={5} />
                <Line x1={280} y1={0} x2={280} y2={350} stroke={isDarkMode ? '#2D3532' : '#ffffff'} strokeWidth={4} />
                <Line x1={0} y1={100} x2={350} y2={100} stroke={isDarkMode ? '#2D3532' : '#ffffff'} strokeWidth={5} />
                <Line x1={0} y1={220} x2={350} y2={220} stroke={isDarkMode ? '#2D3532' : '#ffffff'} strokeWidth={3} />
                <Line x1={0} y1={300} x2={350} y2={300} stroke={isDarkMode ? '#2D3532' : '#ffffff'} strokeWidth={2} />

                {/* Neighborhood Labels */}
                <TextSvg x={160} y={115} fill={isDarkMode ? '#888' : '#777'} fontSize={9} fontWeight="bold">CHHAWANI</TextSvg>
                <TextSvg x={160} y={125} fill={isDarkMode ? '#555' : '#999'} fontSize={8}>पुरानी छावनी</TextSvg>
                
                <TextSvg x={120} y={285} fill={isDarkMode ? '#888' : '#777'} fontSize={9} fontWeight="bold">KAMPOO</TextSvg>
                <TextSvg x={120} y={295} fill={isDarkMode ? '#555' : '#999'} fontSize={8}>कम्पू</TextSvg>

                <TextSvg x={205} y={245} fill={isDarkMode ? '#fff' : '#111'} fontSize={12} fontWeight="bold">Gwalior</TextSvg>
                <TextSvg x={205} y={258} fill={isDarkMode ? '#aaa' : '#444'} fontSize={9}>ग्वालियर</TextSvg>

                <TextSvg x={285} y={240} fill={isDarkMode ? '#888' : '#777'} fontSize={9} fontWeight="bold">BADA GAON</TextSvg>
                <TextSvg x={285} y={250} fill={isDarkMode ? '#555' : '#999'} fontSize={8}>बड़ा गांव</TextSvg>

                {/* AH47 Route Badge */}
                <G x={115} y={160}>
                  <Rect width={28} height={14} rx={3} fill="#4caf50" />
                  <TextSvg x={4} y={10} fill="#ffffff" fontSize={8} fontWeight="bold">AH47</TextSvg>
                </G>
              </Svg>

              {/* Concentric grid lines background */}
              <View style={[styles.radarGridRing, { width: 50, height: 50, borderRadius: 25, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
              <View style={[styles.radarGridRing, { width: 100, height: 100, borderRadius: 50, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
              <View style={[styles.radarGridRing, { width: 200, height: 200, borderRadius: 100, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
              <View style={[styles.radarGridRing, { width: 300, height: 300, borderRadius: 150, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

              {/* Sweep radar animation line simulation */}
              <View style={[styles.radarSweepLine, { borderColor: isDarkMode ? 'rgba(71, 158, 245, 0.08)' : 'rgba(15, 108, 189, 0.04)' }]} />

              {/* Active Range Circle Overlay */}
              <View
                style={[
                  styles.radarRangeCircle,
                  {
                    width: radiusPx * 2,
                    height: radiusPx * 2,
                    borderRadius: radiusPx,
                    borderColor: themeColors.brandForeground1,
                    backgroundColor: isDarkMode ? 'rgba(71, 158, 245, 0.05)' : 'rgba(15, 108, 189, 0.03)',
                  },
                ]}
              />

              {/* Concentric rings drawn when released */}
              {!isDragging && (
                <>
                  <View
                    style={[
                      styles.radarRangeCircle,
                      {
                        width: radiusPx * 2 * 0.75,
                        height: radiusPx * 2 * 0.75,
                        borderRadius: radiusPx * 0.75,
                        borderColor: isDarkMode ? 'rgba(71,158,245,0.18)' : 'rgba(15,108,189,0.18)',
                        borderStyle: 'dashed',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.radarRangeCircle,
                      {
                        width: radiusPx * 2 * 0.5,
                        height: radiusPx * 2 * 0.5,
                        borderRadius: radiusPx * 0.5,
                        borderColor: isDarkMode ? 'rgba(71,158,245,0.18)' : 'rgba(15,108,189,0.18)',
                        borderStyle: 'dashed',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.radarRangeCircle,
                      {
                        width: radiusPx * 2 * 0.25,
                        height: radiusPx * 2 * 0.25,
                        borderRadius: radiusPx * 0.25,
                        borderColor: isDarkMode ? 'rgba(71,158,245,0.18)' : 'rgba(15,108,189,0.18)',
                        borderStyle: 'dashed',
                      },
                    ]}
                  />
                </>
              )}

              {/* Draggable Circle Edge Handle */}
              <View
                {...webPanResponder.panHandlers}
                style={[
                  styles.radarDragHandle,
                  {
                    left: webCenter + radiusPx - 14,
                    top: webCenter - 14,
                    backgroundColor: themeColors.brandForeground1,
                    shadowColor: '#000',
                  },
                ]}
              >
                <Ionicons name="resize-outline" size={14} color="#ffffff" />
              </View>

              {/* User Center Pulsing Dot */}
              <View style={[styles.radarUserDot, { backgroundColor: themeColors.brandForeground1 }]}>
                <Animated.View
                  style={[
                    styles.radarUserPulse,
                    {
                      backgroundColor: themeColors.brandForeground1,
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
              </View>

              {/* Spatially Anchored Pins */}
              {mappedOpps.map((opp) => {
                const scaleDegree = 820; 
                const markerX = webCenter + opp.lngOffset * scaleDegree;
                const markerY = webCenter - opp.latOffset * scaleDegree;
                const domainConfig = DOMAINS.find((d) => d.id === opp.domainId) || DOMAINS[0];
                const isInRange = opp.distance <= radius;

                return (
                  <Pressable
                    key={opp.id}
                    onPress={(e) => {
                      if (!isInRange) return;
                      e.stopPropagation();
                      openDrawer(opp);
                    }}
                    style={[
                      styles.radarMarker,
                      {
                        left: markerX - 16,
                        top: markerY - 24,
                        opacity: isInRange ? 1 : 0.0, // Dynamic filter visibility
                        pointerEvents: isInRange ? 'auto' : 'none',
                      }
                    ]}
                  >
                    <View style={styles.webMarkerWrapper}>
                      <View style={[styles.markerBubble, { backgroundColor: themeColors.neutralBackground1, borderColor: domainConfig.lightBg }]}>
                        <Image source={{ uri: opp.imageUri }} style={styles.markerImage as ImageStyle} />
                      </View>
                      <View style={styles.horizontalTagLabel}>
                        <Text style={styles.horizontalTagText} numberOfLines={1}>
                          {opp.title.split(' ')[0]} - {opp.distance.toFixed(1)} km
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>

          {/* Expandable Bottom Drawer */}
          {renderExpandableDrawer()}
        </View>
      </View>
    );
  };

  // Render Native react-native-maps Layout
  const renderNativeMap = () => {
    const handleCoordinate = getEdgeCoordinate(userLocation, radius);

    return (
      <View style={[styles.screenContainer, { backgroundColor: themeColors.neutralBackground2 }]}>
        {/* Top Header Navigation Bar */}
        <View style={[styles.screenHeader, { backgroundColor: themeColors.neutralBackground1, borderBottomColor: themeColors.neutralStroke2 }]}>
          <Pressable onPress={onBack} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={20} color={themeColors.brandForeground1} />
            <Text style={[styles.headerBackText, { color: themeColors.brandForeground1 }]}>Back</Text>
          </Pressable>
          <Text style={[styles.screenHeaderTitle, { color: themeColors.neutralForeground1 }]}>Nearby opportunities</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.mapContainer}>
          {/* Combined Floating Status Pill Overlay */}
          <View style={styles.floatingPillContainer}>
            <View style={[styles.leftPillSegment, { backgroundColor: themeColors.brandBackground }]}>
              <Text style={styles.leftPillText}>
                {radius.toFixed(1)} km Radius • {filteredOpps.length} communities
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setUserLocation(GWALIOR_COORDS);
                setResolvedLocationName('Gwalior, MP');
              }}
              style={[styles.rightPillSegment, { backgroundColor: '#ffffff', borderColor: themeColors.neutralStroke1 }]}
            >
              <Ionicons name="locate" size={12} color="#000000" style={{ marginRight: 4 }} />
              <Text style={styles.rightPillText}>Current Location</Text>
            </Pressable>
          </View>

          {/* Zip Code search banner */}
          {showZipBanner && (
            <View style={[styles.zipBanner, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2, zIndex: 101 }]}>
              <Text style={[styles.zipBannerText, { color: themeColors.neutralForeground2 }]}>
                Enter ZIP Code:
              </Text>
              <TextInput
                style={[styles.zipInput, { color: themeColors.neutralForeground1, borderColor: themeColors.neutralStroke1 }]}
                value={zipCode}
                onChangeText={(val) => {
                  setZipCode(val);
                  if (val.length === 5 || val.length === 6) {
                    handleZipSearch(val);
                  }
                }}
                placeholder="e.g. 474001"
                placeholderTextColor={themeColors.neutralForegroundDisabled}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Pressable onPress={() => handleZipSearch(zipCode)} style={[styles.zipButton, { backgroundColor: themeColors.brandBackground }]}>
                <Text style={styles.zipButtonText}>Search</Text>
              </Pressable>
            </View>
          )}

          <MapView
            ref={mapRef}
            style={styles.nativeMap}
            initialRegion={getRegionForRadius(userLocation, 5.0)}
            customMapStyle={isDarkMode ? darkMapStyle : lightMapStyle}
            showsUserLocation={false}
            onPress={(e: any) => {
              if (e.nativeEvent.action !== 'marker-press') {
                if (selectedOpp) {
                  setSelectedOpp(null);
                }
              }
            }}
          >
            {/* User Location Pulsing Marker */}
            <Marker coordinate={userLocation} key="user-location-marker">
              <View style={[styles.radarUserDot, { backgroundColor: themeColors.brandForeground1 }]}>
                <Animated.View
                  style={[
                    styles.radarUserPulse,
                    {
                      backgroundColor: themeColors.brandForeground1,
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
              </View>
            </Marker>

            {/* Active search radius Circle */}
            <Circle
              center={userLocation}
              radius={radius * 1000}
              strokeWidth={1.5}
              strokeColor={themeColors.brandForeground1}
              fillColor={isDarkMode ? 'rgba(71, 158, 245, 0.05)' : 'rgba(15, 108, 189, 0.03)'}
            />

            {/* Concentric rings */}
            {!isDragging && (
              <>
                <Circle
                  center={userLocation}
                  radius={radius * 1000 * 0.75}
                  strokeWidth={1}
                  strokeColor={isDarkMode ? 'rgba(71,158,245,0.18)' : 'rgba(15,108,189,0.18)'}
                  lineDashPattern={[4, 4]}
                />
                <Circle
                  center={userLocation}
                  radius={radius * 1000 * 0.50}
                  strokeWidth={1}
                  strokeColor={isDarkMode ? 'rgba(71,158,245,0.18)' : 'rgba(15,108,189,0.18)'}
                  lineDashPattern={[4, 4]}
                />
                <Circle
                  center={userLocation}
                  radius={radius * 1000 * 0.25}
                  strokeWidth={1}
                  strokeColor={isDarkMode ? 'rgba(71,158,245,0.18)' : 'rgba(15,108,189,0.18)'}
                  lineDashPattern={[4, 4]}
                />
              </>
            )}

            {/* Draggable Circle Edge Handle Marker */}
            <Marker
              coordinate={handleCoordinate}
              draggable
              onDragStart={() => setIsDragging(true)}
              onDrag={(e: any) => {
                const dragCoords = e.nativeEvent.coordinate;
                const newRadius = getDistanceInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  dragCoords.latitude,
                  dragCoords.longitude
                );
                const boundedRadius = Math.min(maxRadiusKm, Math.max(1.0, newRadius));
                setRadius(boundedRadius);
              }}
              onDragEnd={(e: any) => {
                setIsDragging(false);
                const dragCoords = e.nativeEvent.coordinate;
                const newRadius = getDistanceInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  dragCoords.latitude,
                  dragCoords.longitude
                );
                const boundedRadius = Math.min(maxRadiusKm, Math.max(1.0, newRadius));
                setRadius(boundedRadius);
                if (mapRef.current) {
                  const nextRegion = getRegionForRadius(userLocation, boundedRadius);
                  mapRef.current.animateToRegion(nextRegion, 300);
                }
              }}
              key="circle-drag-handle"
            >
              <View style={[styles.nativeDragHandle, { backgroundColor: themeColors.brandForeground1, borderColor: '#ffffff' }]}>
                <Ionicons name="resize-outline" size={14} color="#ffffff" />
              </View>
            </Marker>

            {/* Spatially Anchored Pins */}
            {mappedOpps.map((opp) => {
              const domainConfig = DOMAINS.find((d) => d.id === opp.domainId) || DOMAINS[0];
              const isInRange = opp.distance <= radius;

              return (
                <Marker
                  key={opp.id}
                  coordinate={{ latitude: opp.latitude, longitude: opp.longitude }}
                  onPress={(e: any) => {
                    if (!isInRange) return;
                    e.stopPropagation();
                    openDrawer(opp);
                  }}
                  opacity={isInRange ? 1 : 0.0} // Dynamic filter visibility
                >
                  <View style={styles.nativeMarkerContainer}>
                    <View style={styles.horizontalPinWrapper}>
                      <View style={[styles.markerBubble, { backgroundColor: themeColors.neutralBackground1, borderColor: domainConfig.lightBg }]}>
                        <Image source={{ uri: opp.imageUri }} style={styles.markerImage as ImageStyle} />
                      </View>
                      <View style={styles.horizontalTagLabel}>
                        <Text style={styles.horizontalTagText} numberOfLines={1}>
                          {opp.title.split(' ')[0]} - {opp.distance.toFixed(1)} km
                        </Text>
                      </View>
                    </View>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Expandable Bottom Drawer */}
          {renderExpandableDrawer()}
        </View>
      </View>
    );
  };

  // Render check
  if (Platform.OS === 'web' || !MapView) {
    return renderWebRadarMap();
  } else {
    return renderNativeMap();
  }
};

// Styling definitions
const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  zipBanner: {
    position: 'absolute',
    top: Spacing.s + 36,
    left: Spacing.m,
    right: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 101,
  },
  zipBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  zipInput: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    width: 70,
    marginRight: Spacing.xs,
    backgroundColor: '#ffffff',
  },
  zipButton: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zipButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  changeLocationBtn: {
    position: 'absolute',
    top: Spacing.s,
    right: Spacing.m,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  changeLocationText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  nativeMap: {
    width: '100%',
    height: '100%',
  },
  floatingBox: {
    position: 'absolute',
    top: Spacing.s,
    alignSelf: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingBoxText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  backButtonContainer: {
    position: 'absolute',
    top: Spacing.s,
    left: Spacing.m,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
  },
  bottomDrawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 100,
  },
  drawerDragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  drawerCloseLine: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  drawerScrollView: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingHorizontal: Spacing.m,
    paddingBottom: 90, // room for bottom button row
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xxs,
  },
  drawerImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  drawerHeaderDetails: {
    flex: 1,
    marginLeft: Spacing.s,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  drawerTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginVertical: Spacing.m,
  },
  drawerTagChip: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  drawerTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  drawerDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: Spacing.xxs,
  },
  expandedAboutSection: {
    marginTop: Spacing.xs,
  },
  dividerLineItem: {
    height: 1,
    marginVertical: Spacing.m,
  },
  infoSection: {
    marginBottom: Spacing.m,
  },
  customBadge: {
    alignSelf: 'flex-start',
    borderRadius: Shapes.rounded,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xxs,
  },
  customBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  drawerButtonRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.m,
    gap: Spacing.s,
    borderTopWidth: 1,
  },
  drawerCancelButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerJoinButton: {
    flex: 2,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerJoinButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  nativeMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeDragHandle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  radarLayout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.l,
  },
  radarTitle: {
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: Spacing.xxs,
  },
  radarScreen: {
    width: 350,
    height: 350,
    borderRadius: 175,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  radarGridRing: {
    position: 'absolute',
    borderWidth: 1.2,
    borderStyle: 'dashed',
  },
  radarSweepLine: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 175,
    borderWidth: 4,
  },
  radarRangeCircle: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  radarDragHandle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 20,
  },
  radarUserDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarUserPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
  },
  radarMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerLabelContainer: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  macroCollapsedHandleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: Spacing.m,
  },
  macroExpandedTitle: {
    ...Typography.subtitle,
    fontSize: 16,
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.s,
    fontWeight: 'bold',
  },
  macroListScrollContent: {
    paddingHorizontal: Spacing.m,
    paddingBottom: 40,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  macroListItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    marginBottom: Spacing.s,
  },
  macroListImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  macroListDetails: {
    flex: 1,
    marginLeft: Spacing.s,
  },
  macroListTitle: {
    ...Typography.bodyStrong,
    fontSize: 14,
  },
  macroListTags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  macroListTagChip: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  macroListTagText: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: 1,
  },
  screenHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerBackText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  floatingPillContainer: {
    position: 'absolute',
    top: Spacing.s,
    left: Spacing.m,
    right: Spacing.m,
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  leftPillSegment: {
    flex: 1.2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  rightPillSegment: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
  },
  rightPillText: {
    color: '#242424',
    fontSize: 11,
    fontWeight: '700',
  },
  horizontalPinWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#479ef5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  webMarkerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#479ef5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  horizontalTagLabel: {
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  horizontalTagText: {
    color: '#242424',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

// Map custom styles
const lightMapStyle = [
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.medical',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.government',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#cbdff7' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e2eedd' }, { visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e0e0e0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fcdcb6' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f8c58c' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f0f0f0' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
];

const darkMapStyle = [
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.medical',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.government',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#1f1f1f' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f1c2e' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#15241b' }, { visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#242424' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3f301b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#332615' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#282828' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5c5c5c' }],
  },
];
