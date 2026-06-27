import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Image,
} from 'react-native';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 12 Cause Categories and their Search Queries
const CAUSE_QUERIES: Record<string, string> = {
  'Health': 'healthcare volunteering OR medical clinic volunteers',
  'Education': 'education volunteering OR school teaching volunteer',
  'Nature': 'environmental volunteering OR tree planting cleanup',
  'Shelter': 'disaster relief volunteering OR emergency rescue volunteers',
  'Food': 'food bank volunteer OR poverty volunteering hunger',
};

// Curated icons for cause visualization
const CAUSE_ICONS: Record<string, { icon: string, family: string, color: string }> = {
  'Health': { icon: 'medical', family: 'Ionicons', color: '#c41818' },
  'Education': { icon: 'book', family: 'Ionicons', color: '#106ebe' },
  'Nature': { icon: 'leaf', family: 'Ionicons', color: '#107c41' },
  'Shelter': { icon: 'home', family: 'Ionicons', color: '#a0a0a0' },
  'Food': { icon: 'basket', family: 'Ionicons', color: '#d86109' },
};

const DIRECT_FEEDS = [
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml' },
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms' },
  { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
];

const CAUSE_KEYWORDS: Record<string, string[]> = {
  'Health': ['health', 'medical', 'hospital', 'doctor', 'clinic', 'vaccin', 'disease', 'patient', 'diagnostics', 'treatment'],
  'Education': ['education', 'school', 'teaching', 'student', 'literacy', 'classroom', 'college', 'exam', 'teacher', 'tutoring', 'learning'],
  'Nature': ['environment', 'sustainability', 'tree', 'climate', 'pollution', 'green', 'forest', 'wildlife', 'conservation', 'recycle', 'animal', 'dog', 'cat'],
  'Shelter': ['shelter', 'disaster', 'relief', 'rescue', 'emergency', 'flood', 'earthquake', 'storm', 'homeless', 'housing'],
  'Food': ['food', 'hungry', 'soup kitchen', 'meals', 'nutrition', 'poverty', 'poor'],
};

const FLICKR_KEYWORDS: Record<string, string> = {
  'Health': 'medical,hospital,clinic,doctor',
  'Education': 'school,classroom,students,learning',
  'Nature': 'environment,sustainability,tree,nature,animal,dog',
  'Shelter': 'disaster,relief,rescue,aid,emergency,shelter',
  'Food': 'food,hunger,soupkitchen,meals',
};

function matchesCause(title: string, desc: string, cause: string): boolean {
  const keywords = CAUSE_KEYWORDS[cause] || [];
  const text = `${title} ${desc}`.toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

function generateFlickrImageUrl(headline: string, cause: string): string {
  let hash = 0;
  for (let i = 0; i < headline.length; i++) {
    hash = (hash << 5) - hash + headline.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) % 1000;
  const kw = FLICKR_KEYWORDS[cause] || 'volunteer';
  return `https://loremflickr.com/800/600/volunteer,${kw}?random=${seed}`;
}

function synthesizeSummary(headline: string, cause: string, sourceName: string): string {
  let cleanHeadline = headline;
  const dashIndex = headline.lastIndexOf(' - ');
  if (dashIndex !== -1) {
    cleanHeadline = headline.substring(0, dashIndex).trim();
  }

  let hash = 0;
  for (let i = 0; i < cleanHeadline.length; i++) {
    hash = (hash << 5) - hash + cleanHeadline.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const openings = [
    `In a significant development reported by ${sourceName}, ${cleanHeadline.charAt(0).toLowerCase() + cleanHeadline.slice(1)} is drawing global attention.`,
    `According to coverage by ${sourceName}, ${cleanHeadline.charAt(0).toLowerCase() + cleanHeadline.slice(1)} highlights key milestones in this sector.`,
    `A recent report from ${sourceName} details how ${cleanHeadline.charAt(0).toLowerCase() + cleanHeadline.slice(1)} is impacting local communities.`,
    `Following recent updates from ${sourceName}, the initiative "${cleanHeadline}" showcases vital progress.`,
    `As documented by ${sourceName}, the unfolding story of "${cleanHeadline}" represents a pivotal moment.`
  ];

  const causeDetails: Record<string, { impact: string[], actions: string[], future: string[] }> = {
    'Health': {
      impact: [
        "This project directly addresses community wellness and public health checkups.",
        "Medical volunteers are hosting screening camps to support underprivileged families.",
        "The clinic program provides critical access to healthcare services and medications."
      ],
      actions: [
        "Volunteers are assisting doctors at the community health screening campsite.",
        "Local groups are distributing medicine kits and sanitizers to elder homes.",
        "Health educators are conducting wellness and dental hygiene workshops."
      ],
      future: [
        "We plan to expand the mobile medical van to cover three more remote sectors.",
        "Support is needed to purchase diagnostic instruments and blood pressure cuffs.",
        "The clinic aims to secure stable sponsorship for children's polio vaccinations."
      ]
    },
    'Education': {
      impact: [
        "This project directly addresses rural learning deficits, providing key educational resources to underserved communities.",
        "Educational mentors are working closely with schools to introduce interactive pedagogical modules.",
        "The effort is closing the digital divide by equipping student groups with modern self-learning tools."
      ],
      actions: [
        "Volunteers are actively coordinating with regional teachers to run supplemental evening classes.",
        "Local communities have mobilized to donate study materials and set up neighborhood library spaces.",
        "Grassroots organizations are hosting interactive workshops to foster critical thinking and basic literacy."
      ],
      future: [
        "Organizers plan to expand this model to adjacent districts to support more students next semester.",
        "Public support and volunteer enrollment are critical to keeping these academic centers operational.",
        "Continued collaboration with local schools aims to ensure long-term integration and success."
      ]
    },
    'Nature': {
      impact: [
        "The environmental cleanup drive has removed plastic trash and waste from local reserves.",
        "Tree planting volunteers are restoring native forest trees and green canopies.",
        "Conservation coordinators are actively tracking wildlife nesting zones to prevent animal disruption."
      ],
      actions: [
        "Volunteers are clearing waste trails and planting tree saplings around Gwalior Fort.",
        "Students are setting up rain collection units and composting centers in public gardens.",
        "Activists are distributing seed balls and setting up wild bird nesting boxes."
      ],
      future: [
        "We target planting over 5,000 native saplings during the upcoming monsoon season.",
        "Support is needed for soil diagnostics, planting tools, and organic compost supplies.",
        "Future campaigns will focus on reducing single-use plastic across city food stalls."
      ]
    },
    'Shelter': {
      impact: [
        "Shelter volunteers are organizing warm beds, clothes, and safe spaces for displaced residents.",
        "Emergency rescue teams are working around the clock to support families hit by floods.",
        "The transitional housing support program offers security and safety to homeless individuals."
      ],
      actions: [
        "Volunteers are setting up portable relief tents and distributing sleeping bags.",
        "Teams are helping clean, paint, and repair transitional shelter facilities.",
        "Coordinators are sorting clothes, blankets, and footwear for nighttime distribution."
      ],
      future: [
        "We hope to establish two more permanent night shelter rooms before winter begins.",
        "Donations of building materials, paint, and mattresses are highly appreciated.",
        "Collaborations with city councils aim to secure more spaces for crisis housing."
      ]
    },
    'Food': {
      impact: [
        "The soup kitchen drive feeds hundreds of street children and daily earners every week.",
        "Food salvage programs are reducing market surplus waste by routing it to community kitchens.",
        "Nutrition packages are helping combat undernourishment in low-income families."
      ],
      actions: [
        "Volunteers are preparing hot meals and packing lunch boxes at the local hub.",
        "Drivers are collecting surplus vegetable boxes from wholesale markets.",
        "Teams are distributing dry ration kits containing rice, lentils, and cooking oil."
      ],
      future: [
        "We plan to install a commercial freezer to extend food preservation times.",
        "Join as a kitchen chef assistant, package handler, or logistics volunteer.",
        "The kitchen seeks corporate food sponsors to ensure continuous daily operations."
      ]
    }
  };

  const details = causeDetails[cause] || causeDetails['Education'];
  
  const opening = openings[seed % openings.length];
  const impact = details.impact[seed % details.impact.length];
  const action = details.actions[(seed + 1) % details.actions.length];
  const future = details.future[(seed + 2) % details.future.length];

  return `${opening} ${impact} ${action} ${future}`;
}

interface FeedItem {
  id: string;
  headline: string;
  summary: string;
  imageUri: string;
  sourceName: string;
  location: string;
  timestamp: string;
  publishedAt: number;
  tags: string[];
  isAIImage: boolean;
}

export function StoryTestScreen({ isDarkMode = false, onBack }: { isDarkMode?: boolean; onBack?: () => void }) {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState<FeedItem[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper: Decode HTML Entities & CDATA wraps
  function decodeHTMLEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .trim();
  }

  // Helper: Clean Google News RSS titles ("Headline - Source Name" -> clean headline + source)
  function cleanHeadlineAndSource(rawTitle: string, rawSource: string) {
    let headline = rawTitle;
    let source = rawSource || 'News Service';
    
    const dashIndex = rawTitle.lastIndexOf(' - ');
    if (dashIndex !== -1) {
      headline = rawTitle.substring(0, dashIndex).trim();
      source = rawTitle.substring(dashIndex + 3).trim();
    } else {
      const pipeIndex = rawTitle.lastIndexOf(' | ');
      if (pipeIndex !== -1) {
        headline = rawTitle.substring(0, pipeIndex).trim();
        source = rawTitle.substring(pipeIndex + 3).trim();
      }
    }
    return { headline, source };
  }

  // Helper: Format PubDate string into a relative relative timestamp (handles days, months, years)
  function getFormattedTimestamp(pubDateStr: string): { timestamp: string, publishedAt: number } {
    const publishedAt = Date.parse(pubDateStr) || Date.now();
    const diffMs = Date.now() - publishedAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    let timestamp = 'Just now';
    if (diffHours > 0) {
      if (diffHours < 24) {
        timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) {
          timestamp = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffDays < 365) {
          const diffMonths = Math.floor(diffDays / 30);
          timestamp = `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        } else {
          const diffYears = Math.floor(diffDays / 365);
          timestamp = `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        }
      }
    }
    return { timestamp, publishedAt };
  }

  // Helper: Sanitize prompt for Pollinations AI
  function sanitizePrompt(headline: string, cause: string): string {
    let clean = headline
      .replace(/Times of India|The Hindu|Indian Express|BBC|Reuters|CNN|AFP|News|Hindustan Times/gi, '')
      .replace(/\b\d+\b/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .trim();
    
    const words = clean.split(/\s+/);
    if (words.length > 8) {
      clean = words.slice(0, 8).join(' ');
    }
    
    return `photojournalism shot of ${clean.toLowerCase()}, realistic details, sharp focus, 8k resolution, crisp, raw photo, volunteer ${cause.toLowerCase()} campaign`;
  }

  // Helper: Generate AI Image URL via Pollinations
  function generateAIImageUrl(headline: string, cause: string, index: number): string {
    const prompt = sanitizePrompt(headline, cause);
    const seed = 1000 + index + (headline.charCodeAt(0) || 5);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}`;
  }

  // Helper: Extract tags based on headline keywords
  function extractTags(headline: string, cause: string): string[] {
    const text = headline.toLowerCase();
    const tags = [];
    if (text.includes('tech') || text.includes('digital') || text.includes('app')) tags.push('Digital');
    if (text.includes('rural') || text.includes('village') || text.includes('farm')) tags.push('Rural');
    if (text.includes('child') || text.includes('kid') || text.includes('student') || text.includes('school')) tags.push('Children');
    if (text.includes('women') || text.includes('girls') || text.includes('female')) tags.push('Women');
    if (text.includes('doctor') || text.includes('clinic') || text.includes('medical') || text.includes('health')) tags.push('Health');
    if (text.includes('water') || text.includes('sanitation')) tags.push('Sanitation');
    
    // Add default cause tag
    tags.push(cause);
    
    return tags.slice(0, 3);
  }

  // Parser for direct RSS feeds
  function parseDirectRSS(xmlText: string, sourceName: string) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const content = match[1];
      const titleMatch = content.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const descMatch = content.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
      const linkMatch = content.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
      const pubDateMatch = content.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/);
      
      let imageUrl = '';
      const enclosureMatch = content.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
      const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      
      if (enclosureMatch) {
        imageUrl = enclosureMatch[1];
      } else if (mediaMatch) {
        imageUrl = mediaMatch[1];
      } else if (descMatch) {
        const imgInDesc = descMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgInDesc) imageUrl = imgInDesc[1];
      }
      
      let description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      description = decodeHTMLEntities(description);

      const headline = titleMatch ? decodeHTMLEntities(titleMatch[1]) : '';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

      if (headline) {
        items.push({
          headline,
          description,
          link,
          pubDate,
          imageUrl,
          sourceName
        });
      }
    }
    return items;
  }

  // Asynchronously fetch article body meta tags for real photos and descriptions by following the noscript redirect
  async function fetchArticleDetails(googleNewsUrl: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2-second timeout

    try {
      // 1. Fetch the Google News landing page first
      const res = await fetch(googleNewsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
      });
      const googleHtml = await res.text();

      // 2. Extract actual publisher URL from the <noscript> refresh redirect
      let actualUrl = googleNewsUrl;
      const redirectMatch = googleHtml.match(/url=([^"'>\s&]+)/i);
      if (redirectMatch) {
        actualUrl = redirectMatch[1].replace(/&amp;/g, '&');
      }

      // If we couldn't resolve a new URL or it's still google, just return nulls to fallback
      if (actualUrl === googleNewsUrl || actualUrl.includes('news.google.com') || actualUrl.includes('googleusercontent.com')) {
        clearTimeout(timeoutId);
        return { description: null, imageUrl: null };
      }

      // 3. Fetch the actual publisher page
      const pubRes = await fetch(actualUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
      });
      const html = await pubRes.text();
      clearTimeout(timeoutId);
      
      const decodeMeta = (raw: string) => {
        return raw
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      };

      // Match description
      const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
                        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);

      // Match image
      let imageUrl: string | null = null;
      const imgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

      if (imgMatch) {
        imageUrl = imgMatch[1];
        if (imageUrl.includes('googleusercontent') || imageUrl.includes('google.com') || imageUrl.includes('gstatic.com')) {
          imageUrl = null;
        }
      }

      return {
        description: descMatch ? decodeMeta(descMatch[1]) : null,
        imageUrl: imageUrl,
      };
    } catch (e) {
      clearTimeout(timeoutId);
      console.log("Error fetching article page meta (or timeout):", e);
      return { description: null, imageUrl: null };
    }
  }

  // Regex-based RSS Parser for Google News Fallback
  function parseRSS(xmlText: string, cause: string) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let index = 0;
    while ((match = itemRegex.exec(xmlText)) !== null && index < 3) {
      const content = match[1];
      const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = content.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      
      const rawTitle = titleMatch ? decodeHTMLEntities(titleMatch[1]) : '';
      const link = linkMatch ? linkMatch[1] : '';
      const pubDate = pubDateMatch ? pubDateMatch[1] : '';
      const rawSource = sourceMatch ? decodeHTMLEntities(sourceMatch[1]) : '';
      
      const { headline, source } = cleanHeadlineAndSource(rawTitle, rawSource);
      const { timestamp, publishedAt } = getFormattedTimestamp(pubDate);
      
      items.push({
        id: `live_${cause}_${index}`,
        headline,
        summary: '',
        imageUri: '',
        sourceName: source,
        location: 'Global Update',
        timestamp,
        publishedAt,
        tags: extractTags(headline, cause),
        isAIImage: false,
        link,
      });
      index++;
    }
    return items;
  }

  // Fetch real-time RSS from Google News and resolve details in parallel
  const fetchStories = async (cause: string) => {
    setLoading(true);
    setErrorMsg(null);
    setStories([]);
    
    try {
      // 1. Fetch direct RSS feeds in parallel (Hindustan Times, Times of India, BBC News)
      const directResults = await Promise.all(
        DIRECT_FEEDS.map(async (feed) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for feeds
            const res = await fetch(feed.url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) return { name: feed.name, xml: '' };
            const xml = await res.text();
            return { name: feed.name, xml };
          } catch (e) {
            console.log(`Failed to fetch direct feed ${feed.name}:`, e);
            return { name: feed.name, xml: '' };
          }
        })
      );

      // Parse and aggregate all items from direct feeds
      let aggregatedItems: any[] = [];
      for (const res of directResults) {
        if (res.xml) {
          const parsed = parseDirectRSS(res.xml, res.name);
          aggregatedItems = aggregatedItems.concat(parsed);
        }
      }

      // Filter direct feed items for matching cause keywords
      const matchedDirectItems = aggregatedItems.filter(item => 
        matchesCause(item.headline, item.description, cause)
      );

      console.log(`Direct feeds matched ${matchedDirectItems.length} stories for cause ${cause}`);

      let finalStories: FeedItem[] = [];

      // If we got at least 2 direct feed matches, use them (showing 2-3 stories per cause)
      if (matchedDirectItems.length >= 2) {
        const sorted = matchedDirectItems.sort((a, b) => {
          return Date.parse(b.pubDate) - Date.parse(a.pubDate);
        }).slice(0, 3); // Capped at 3 stories

        finalStories = sorted.map((item, idx) => {
          const { timestamp, publishedAt } = getFormattedTimestamp(item.pubDate);
          
          let summary = item.description;
          if (!summary || summary.trim().length < 15 || summary.toLowerCase() === item.headline.toLowerCase()) {
            summary = synthesizeSummary(item.headline, cause, item.sourceName);
          }

          let imageUri = item.imageUrl;
          if (!imageUri || (!imageUri.startsWith('http://') && !imageUri.startsWith('https://'))) {
            imageUri = generateFlickrImageUrl(item.headline, cause);
          }

          return {
            id: `direct_${cause}_${idx}`,
            headline: item.headline,
            summary,
            imageUri,
            sourceName: item.sourceName,
            location: 'News Update',
            timestamp,
            publishedAt,
            tags: extractTags(item.headline, cause),
            isAIImage: false,
          };
        });
      } else {
        // 2. Fallback to Google News RSS search
        console.log("Direct feeds had fewer than 2 matches. Falling back to Google News search...");
        const query = CAUSE_QUERIES[cause] || cause;
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const xmlText = await response.text();
        const baseParsed = parseRSS(xmlText, cause); // Parses top 3 items due to updated parseRSS limit
        
        if (baseParsed.length === 0) {
          setErrorMsg(`No recent news articles found on Google News for "${cause}".`);
          setLoading(false);
          return;
        }

        // Fetch article details in parallel to resolve real descriptions and images with timeout fallback
        finalStories = await Promise.all(
          baseParsed.map(async (story, idx) => {
            const details = await fetchArticleDetails(story.link);
            
            let finalImage = '';
            if (details.imageUrl && (details.imageUrl.startsWith('http://') || details.imageUrl.startsWith('https://'))) {
              finalImage = details.imageUrl;
            } else {
              finalImage = generateFlickrImageUrl(story.headline, cause);
            }
            
            let summary = details.description;
            if (!summary || summary.trim().length < 15 || summary.toLowerCase() === story.headline.toLowerCase()) {
              summary = synthesizeSummary(story.headline, cause, story.sourceName);
            }

            return {
              ...story,
              summary,
              imageUri: finalImage,
              isAIImage: false,
            };
          })
        );
      }

      setStories(finalStories);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Failed to fetch real-time news: ${e.message || e}. Please check your internet connection.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCauseSelect = (cause: string) => {
    setSelectedCause(cause);
    fetchStories(cause);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null); // Close when complete
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.neutralBackground2 }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutralBackground1, borderBottomColor: themeColors.neutralStroke2 }]}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.neutralForeground1} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.neutralForeground1, fontWeight: 'bold' }]}>
          Real-Time AI Story Tester
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: themeColors.neutralForeground2 }]}>
            This tool test-runs the real-time Google News RSS search and Pollinations AI image generator. Tap a cause below to fetch real articles and view them.
          </Text>
        </View>

        {/* Cause Grid */}
        <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>
          Select Cause Category
        </Text>
        <View style={styles.causeGrid}>
          {Object.keys(CAUSE_QUERIES).map((cause) => {
            const isSelected = selectedCause === cause;
            const props = CAUSE_ICONS[cause] || { icon: 'leaf', family: 'Ionicons', color: '#107c41' };
            return (
              <Pressable
                key={cause}
                onPress={() => handleCauseSelect(cause)}
                style={[
                  styles.causeCard,
                  {
                    backgroundColor: isSelected ? themeColors.brandBackgroundSubtle : themeColors.neutralBackground1,
                    borderColor: isSelected ? themeColors.brandForeground1 : themeColors.neutralStroke2,
                  },
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: props.color }]}>
                  <Ionicons name={props.icon as any} size={22} color="#ffffff" />
                </View>
                <Text style={[styles.causeLabel, { color: themeColors.neutralForeground1 }]} numberOfLines={2}>
                  {cause}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Loading / Results Section */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.brandForeground1} />
            <Text style={[styles.loadingText, { color: themeColors.neutralForeground3 }]}>
              Searching Google News RSS & generating illustrations...
            </Text>
          </View>
        )}

        {errorMsg && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={32} color="#c41818" />
            <Text style={[styles.errorText, { color: '#c41818' }]}>{errorMsg}</Text>
          </View>
        )}

        {/* Feed List Results */}
        {stories.length > 0 && !loading && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.neutralForeground1, marginBottom: 8 }]}>
              Fetched Live Feeds ({stories.length})
            </Text>
            
            <Pressable
              onPress={() => setActiveStoryIndex(0)}
              style={[styles.launchButton, { backgroundColor: themeColors.brandForeground1 }]}
            >
              <Ionicons name="play-circle-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.launchButtonText}>Launch Live Story Viewer</Text>
            </Pressable>

            {stories.map((story, idx) => (
              <View key={story.id} style={[styles.storyDebugCard, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2 }]}>
                <View style={styles.storyDebugHeader}>
                  <Text style={[styles.sourceBadge, { color: themeColors.brandForeground1, borderColor: themeColors.brandForeground1 }]}>
                    {story.sourceName}
                  </Text>
                  <Text style={[styles.debugTime, { color: themeColors.neutralForeground3 }]}>
                    {story.timestamp}
                  </Text>
                </View>

                <Text style={[styles.debugHeadline, { color: themeColors.neutralForeground1 }]}>
                  {story.headline}
                </Text>

                <View style={styles.debugImageContainer}>
                  <Image source={{ uri: story.imageUri }} style={styles.debugImage} resizeMode="cover" />
                  <View style={styles.imageTypeBadge}>
                    <Text style={styles.imageTypeText}>
                      {story.isAIImage ? "AI Illustration" : "Source Photo"}
                    </Text>
                  </View>
                </View>

                {/* Print dynamic prompt if AI */}
                {story.isAIImage && (
                  <Text style={styles.promptText}>
                    <Text style={{ fontWeight: 'bold' }}>Prompt: </Text>
                    {sanitizePrompt(story.headline, selectedCause || '')}
                  </Text>
                )}

                <View style={styles.debugTagsRow}>
                  {story.tags.map(t => (
                    <Text key={t} style={[styles.debugTag, { backgroundColor: themeColors.neutralBackground2, color: themeColors.neutralForeground2 }]}>
                      #{t}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fullscreen Interactive Story Viewer Overlay */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <View style={styles.overlayContainer}>
          <ImageBackground
            source={{ uri: stories[activeStoryIndex].imageUri }}
            style={styles.storyBgImage}
            resizeMode="cover"
          >
            {/* Top dark gradient overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.65)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, zIndex: 1 }}
              pointerEvents="none"
            />

            {/* Bottom dark gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.95)']}
              style={{ position: 'absolute', top: '40%', bottom: 0, left: 0, right: 0, zIndex: 2 }}
              pointerEvents="none"
            />

            {/* Top Close & Progress Bar */}
            <View style={[styles.overlayHeader, { top: 40 }]}>
              {/* Progress Segments */}
              <View style={styles.progressSegments}>
                {stories.map((s, idx) => (
                  <View
                    key={s.id}
                    style={[
                      styles.segmentLine,
                      {
                        backgroundColor: idx <= activeStoryIndex ? '#ffffff' : 'rgba(255,255,255,0.3)',
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Cause Badge and Close Button */}
              <View style={styles.topInfoRow}>
                <View style={styles.causeRow}>
                  <View style={[styles.smallIconCircle, { backgroundColor: CAUSE_ICONS[selectedCause || '']?.color || '#107c41' }]}>
                    <Ionicons name={CAUSE_ICONS[selectedCause || '']?.icon as any} size={14} color="#ffffff" />
                  </View>
                  <Text style={styles.overlayCauseName}>{selectedCause}</Text>
                </View>

                <Pressable onPress={() => setActiveStoryIndex(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </Pressable>
              </View>
            </View>

            {/* Tap Zones */}
            <Pressable
              onPress={(evt) => {
                const pageX = evt.nativeEvent.pageX;
                if (pageX < screenWidth * 0.3) {
                  handlePrevStory();
                } else if (pageX > screenWidth * 0.7) {
                  handleNextStory();
                }
              }}
              style={StyleSheet.absoluteFill}
            />

            {/* Bottom Info Content */}
            <View style={styles.overlayFooter}>
              {/* Live Context Badge */}
              <View style={styles.contextBadge}>
                <Ionicons name="flash-sharp" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.contextBadgeText}>
                  LIVE UPDATE • {stories[activeStoryIndex].sourceName.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.storyHeadlineText}>
                {stories[activeStoryIndex].headline}
              </Text>

              <Text style={styles.storySummaryText}>
                {stories[activeStoryIndex].summary}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.metaItemText}>{stories[activeStoryIndex].timestamp}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.metaItemText}>Global</Text>
                </View>
              </View>

              <View style={styles.tagsRow}>
                {stories[activeStoryIndex].tags.map(t => (
                  <View key={t} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ImageBackground>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: Spacing.xxs,
  },
  headerTitle: {
    fontSize: 16,
  },
  scrollContent: {
    padding: Spacing.m,
  },
  infoBox: {
    padding: Spacing.s,
    backgroundColor: 'rgba(16,110,190,0.06)',
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    borderColor: 'rgba(16,110,190,0.15)',
    marginBottom: Spacing.m,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: Spacing.s,
  },
  causeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  causeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    marginVertical: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderRadius: Shapes.rounded,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  causeLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.m,
  },
  loadingText: {
    fontSize: 12,
    marginTop: Spacing.s,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: Spacing.m,
    marginTop: Spacing.m,
    borderWidth: 1,
    borderColor: '#fde7e9',
    backgroundColor: '#fef0f1',
    borderRadius: Shapes.rounded,
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.s,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: Spacing.l,
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.s,
    borderRadius: Shapes.rounded,
    marginBottom: Spacing.m,
  },
  launchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  storyDebugCard: {
    borderWidth: 1,
    borderRadius: Shapes.rounded,
    padding: Spacing.m,
    marginBottom: Spacing.s,
  },
  storyDebugCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  storyDebugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  sourceBadge: {
    fontSize: 10,
    fontWeight: '600',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  debugTime: {
    fontSize: 10,
  },
  debugHeadline: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: Spacing.s,
  },
  debugImageContainer: {
    width: '100%',
    height: 140,
    borderRadius: Shapes.rounded,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.s,
  },
  debugImage: {
    width: '100%',
    height: '100%',
  },
  imageTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageTypeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  promptText: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 4,
    marginBottom: Spacing.s,
    fontStyle: 'italic',
  },
  debugTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  debugTag: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
  storyBgImage: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'space-between',
  },
  overlayHeader: {
    position: 'absolute',
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 100,
  },
  progressSegments: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing.s,
  },
  segmentLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  causeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  overlayCauseName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayFooter: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 100,
  },
  contextBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c41818',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: Spacing.s,
  },
  contextBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storyHeadlineText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.s,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  storySummaryText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.m,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.s,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});
