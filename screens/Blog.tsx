import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Card } from '../components/Card';
import { Badge, BadgeIntent } from '../components/Badge';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BlogProps {
  isDarkMode?: boolean;
  setParentScrollEnabled?: (enabled: boolean) => void;
}

interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  summary: string;
  category: string;
  categoryIntent: BadgeIntent;
  contentBody?: string;
  bannerImage?: string;
}

interface Feedback {
  id: string;
  articleId: string;
  author: string;
  timestamp: string;
  content: string;
}

const { width: screenWidth } = Dimensions.get('window');

// General Domain Articles (Featured)
const INITIAL_FEATURED_ARTICLES: Article[] = [
  {
    id: 'f1',
    title: 'Empathy in Action: Advanced De-escalation Workflows',
    author: 'Dr. Evelyn Martinez',
    date: 'June 15, 2026',
    readTime: '8 min read',
    summary: 'Practical tactics and psychological triggers to de-escalate high-tension client situations in outpatient and domestic visits.',
    category: 'Best Practices',
    categoryIntent: 'Brand',
    bannerImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000',
    contentBody: 'De-escalation in social work is less about enforcing compliance and more about establishing safety. Under stressful circumstances, clients enter a fight-or-flight biological response, making rational conversation difficult. In this article, we outline a four-step framework: Active Empathy, Low-Stance Positioning, Verbal Mirroring, and De-escalated Redirection.\n\nEstablishing non-threatening body language and using a modulated, low pitch can calm tense encounters. Crucially, social workers should avoid cornering individuals or blocking physical exits. Incorporating micro-interventions such as offering a glass of water or introducing a calming subject change can reset client responses and lay the groundwork for safe resolution.',
  },
  {
    id: 'f2',
    title: 'Understanding Modern Substance Abuse Pathways',
    author: 'Marcus Vance, LCSW',
    date: 'June 10, 2026',
    readTime: '12 min read',
    summary: 'An analytical review of newly identified chemical compounds and corresponding treatment referral pipelines in urban sectors.',
    category: 'Clinical Research',
    categoryIntent: 'Important',
    bannerImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1000',
    contentBody: 'Chemical dependency pathways are evolving rapidly in urban centers. New synthetic compounds represent complex clinical profiles that require specific screening protocols. We investigate the pharmacological details of these substances and map out effective treatment pipelines.\n\nCase managers must coordinate closely with emergency clinics, detox facilities, and local housing coordinators to ensure seamless transition points. Decoupled recovery networks can lead to high attrition rates. By integrating digital tracking logs and establishing direct warm-handoff agreements, local clinics can significantly boost long-term recovery adherence among vulnerable residents.',
  },
  {
    id: 'f3',
    title: 'Digital Mental Health Services: Ethical Considerations',
    author: 'Dr. Aaron Stein',
    date: 'June 05, 2026',
    readTime: '10 min read',
    summary: 'Navigating boundary management, encryption standards, and client consent frameworks in virtual spaces.',
    category: 'Ethics & Law',
    categoryIntent: 'Danger',
    bannerImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000',
    contentBody: 'Conducting clinical services virtually introduces new ethical vectors that do not exist in traditional face-to-face setups. Foremost among these are end-to-end data encryption, data security compliance, and maintaining firm professional boundaries.\n\nClient data must be encrypted both in transit and at rest. Additionally, clear boundaries must be established around therapist availability; digital access can blur these structures. Providing detailed digital consent documents, clarifying message response windows, and securing communications via HIPAA-compliant protocols are foundational practices for modern telehealth operators.',
  },
  {
    id: 'f4',
    title: 'Urban Poverty Mapping: Data-Driven Resource Allocation',
    author: 'Elena Rostova, PhD',
    date: 'May 28, 2026',
    readTime: '9 min read',
    summary: 'Using spatial analysis and housing census data to design responsive emergency soup kitchen and clothing hubs.',
    category: 'Social Policy',
    categoryIntent: 'Success',
    bannerImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000',
    contentBody: 'Data-driven policy modeling allows nonprofits to deliver aid exactly where it is needed. By utilizing geographical information systems (GIS) alongside local housing registry census stats, researchers can identify low-resource pocket zones in outer suburbs.\n\nThese zones often have limited public transport access, making centralized community centers hard to reach. Launching mobile fresh pantries and distributing clothes packages directly to regional hubs addresses this disparity. Allocating funding and coordinator logistics based on geographical need maximizes the return of community resources.',
  },
];

// Volunteer Voices List (Category 1)
const VOLUNTEER_VOICES: Article[] = [
  {
    id: 'vv1',
    title: 'My First Clean-up at Green Valley Preserve',
    author: 'Lisa Chang',
    date: 'June 12, 2026',
    readTime: '4 min read',
    summary: 'An inspiring account of local residents clearing plastic trash, weeding invasive growth, and restoring trail path signs.',
    category: 'Environment',
    categoryIntent: 'Success',
    contentBody: 'My morning at Green Valley Nature Preserve was a powerful reminder of community collaboration. Thirty local residents met at the trailhead Picnic Area. Armed with heavy gloves, plastic bags, and trail cutters, we split into teams.\n\nOver four hours, we collected twelve bags of plastic waste, cleared encroaching weeds along two miles of trail paths, and re-anchored three damaged park markers. Seeing the visible difference on the forest trails was deeply satisfying. Getting muddy and working alongside neighbors created a shared bond that highlights why local action remains a vital pillar of environmental restoration.',
  },
  {
    id: 'vv2',
    title: 'Tutoring Kids in Underserved Districts',
    author: 'David K.',
    date: 'June 08, 2026',
    readTime: '5 min read',
    summary: 'Reflections on co-leading a classroom block coding Scratch circle for middle school students on weekends.',
    category: 'Education',
    categoryIntent: 'Brand',
    contentBody: 'Teaching block-based coding to middle schoolers at the youth lab has been a highlight of my summer. Many of these kids have never had access to coding workbooks. Under my guidance, they built simple games using Scratch and Python variables.\n\nTheir enthusiasm is contagious. Watching a student struggle with loop logic and then beam with pride when their sprite finally moves is a reward unlike any other. Supporting these programs builds the digital literacy skills children need to unlock tech education pathways and thrive in modern school systems.',
  },
  {
    id: 'vv3',
    title: 'Serving Hot Meals at Hope Kitchen',
    author: 'Brenda Miller',
    date: 'May 30, 2026',
    readTime: '6 min read',
    summary: 'What a single Saturday shift at the dinner serving line taught me about food security, dignity, and teamwork.',
    category: 'Shelter & Food',
    categoryIntent: 'Warning',
    contentBody: 'Serving dinner at the Hope Kitchen was an eye-opening look at local housing struggles. Our kitchen team prepared hot dinners for 150 guests. We chopped vegetables, served food on the hot buffet line, and wiped down dining tables.\n\nThe guests represented all walks of life. Chatting with them made me realize how easily someone can fall into shelter insecurity due to medical bills or layout downsizings. Delivering a meal with a smile and treating guests with absolute dignity is just as important as the food itself. I left with a renewed sense of purpose and commitment to help.',
  },
];

// NGO Behind the Scenes List (Category 2)
const NGO_SCENES: Article[] = [
  {
    id: 'ngo1',
    title: 'NGO Funding Shifts: Crowdfunding in 2026',
    author: 'Global Alliance Team',
    date: 'June 14, 2026',
    readTime: '7 min read',
    summary: 'How modern digital micro-donations are changing how local small charities secure emergency capital.',
    category: 'Operations',
    categoryIntent: 'Important',
    contentBody: 'Traditional nonprofit grants are slow, requiring detailed filings and long review cycles. In 2026, progressive NGOs are embracing digital micro-funding models to secure rapid capital during crisis situations.\n\nMicro-donations allow community members to fund specific projects—like purchasing direct pantry staples or funding local transport vouchers. This democratized giving model shortens the feedback loop, letting donors see exactly how their contributions are allocated. Transitioning to micro-funding requires robust, transparent tracking platforms to maintain absolute credibility.',
  },
  {
    id: 'ngo2',
    title: 'Logistics of Emergency Shelter Placement',
    author: 'Intake Depot Staff',
    date: 'June 07, 2026',
    readTime: '8 min read',
    summary: 'An inside look at tracking physical clothing sizes, sorting donations, and delivering meal boxes to families.',
    category: 'Logistics',
    categoryIntent: 'Informative',
    contentBody: 'Operating an intake shelter involves complex behind-the-scenes logistics. Incoming donations arrive daily in mixed assortments. Staff must sort clothing by size and quality, organize items on inventory racks, and deliver fresh bedding.\n\nProviding warm, clean materials to families during intake is critical to client safety and health. Behind every bed placement is a coordinate network of clothing drives, food shelfs, and case manager reviews. Streamlining this workflow ensures that incoming clients receive immediate assistance without delays or structural bottlenecks.',
  },
  {
    id: 'ngo3',
    title: 'Outpatient Coordination Systems',
    author: 'Clinic Coordinator',
    date: 'May 25, 2026',
    readTime: '11 min read',
    summary: 'Behind the desk: how we guide hundreds of patient check-ins and refer elderly visitors to medical offices daily.',
    category: 'Healthcare',
    categoryIntent: 'Brand',
    contentBody: 'Guiding outpatients and visitors through a busy medical center complex is a demanding operational puzzle. Clinic coordinators welcome arriving visitors, assist with intake questions, and coordinate wheelchair assistance.\n\nClear wayfinding, direct personal guidance, and reducing lobby wait times are vital to patient satisfaction. Coordinated outpatient check-ins minimize confusion and lower stress. Empathy and professional guidance at the front entrance set a positive clinical tone for patient care.',
  },
];

// Community Stories List (Category 3)
const COMMUNITY_STORIES: Article[] = [
  {
    id: 'cs1',
    title: 'Redesigning Neighborhood Recreation Centers',
    author: 'The Civic Association',
    date: 'June 11, 2026',
    readTime: '5 min read',
    summary: 'How community activists successfully transformed a vacant commercial lot into a multi-use garden park.',
    category: 'Neighborhood',
    categoryIntent: 'Brand',
    contentBody: 'The civic revitalization of the vacant lot on Metro Street shows the power of neighborhood collective action. Once an abandoned concrete dump, activists led a public campaign to clean the site, plant maples, and install wood picnic tables.\n\nThe new garden park has become a key community hub. Families gather in the afternoons, and seniors enjoy the garden walks. Transforming this urban zone into a green space has not only improved local aesthetics but has also fostered safety and neighborly connections throughout the street block.',
  },
  {
    id: 'cs2',
    title: 'A New Life for Local School Libraries',
    author: 'Friends of Library Org',
    date: 'June 02, 2026',
    readTime: '6 min read',
    summary: 'How volunteer weekend reading clinics boosted children comprehension levels by 20% in three short months.',
    category: 'Literacy',
    categoryIntent: 'Success',
    contentBody: 'Literacy is the foundation of future educational attainment. Recognizing a drop in local children reading scores, the Friends of Library organization launched a volunteer reading clinic on Saturday mornings.\n\nVolunteers pair with elementary school students for focused reading coaching. Using interactive stories and vocabulary workbooks, children build basic comprehension. In just three months, reading diagnostics showed a 20% average boost. This success highlights how targeted volunteer tutoring can bridge class gaps and assist children in achieving their goals.',
  },
  {
    id: 'cs3',
    title: 'Connecting Communities with Mobile Pantries',
    author: 'Food Shelf Network',
    date: 'May 18, 2026',
    readTime: '7 min read',
    summary: 'Bringing fresh farm vegetables and box pantry staples straight to housing sites in rural suburbs.',
    category: 'Food Security',
    categoryIntent: 'Warning',
    contentBody: 'Access to fresh, healthy produce is a challenge in outer suburban sectors lacking grocery outlets. To solve this, the Food Shelf Network introduced mobile farm pantries—specially equipped trucks loaded with fresh vegetables.\n\nThese trucks drive directly to senior housing complexes and low-resource residential zones weekly. Volunteers pack and distribute cardboard boxes containing eggs, milk, bread, and greens. Mobile delivery bridges the transport gap and ensures all neighborhood families have access to nutritious food.',
  },
];

// Personal Blogs (Mocked for My Blogs Tab)
const MY_PERSONAL_BLOGS: Article[] = [
  {
    id: 'my1',
    title: 'My Thoughts on Food Shelf Logistics',
    author: 'Nilap Saha',
    date: 'June 19, 2026',
    readTime: '3 min read',
    summary: 'A quick draft analyzing the sorting bottlenecks when packaging emergency fresh produce crates.',
    category: 'Personal Notes',
    categoryIntent: 'Important',
    contentBody: 'During my shifts sorting donations, I noticed key bottlenecks when packaging fresh produce. Items like apples and greens arrive in bulk crates. If the packing line lacks pre-sorted cardboard partitions, packing is delayed.\n\nTo resolve this, the intake depot should establish a dedicated prep zone where volunteers assemble boxes and partition inserts prior to fresh packing sessions. Streamlining the layout of the packing tables can cut packaging times in half, ensuring produce reaches distribution trucks quickly.',
  },
  {
    id: 'my2',
    title: 'First-hand Experience: Clearing Trail Paths',
    author: 'Nilap Saha',
    date: 'June 13, 2026',
    readTime: '5 min read',
    summary: 'Summarizing my three hours collecting plastic bottles and restoring hiking markers at Green Valley.',
    category: 'Activity Log',
    categoryIntent: 'Success',
    contentBody: 'Volunteering for the trail path cleanup at Green Valley Nature Preserve was a rewarding way to spend a Saturday morning. Our team cleared fallen tree branches along the primary trailhead and collected plastic litter.\n\nWe also installed fresh signs along the trail fork. Trail clearance is critical to ensure visitors do not wander off trails and harm native flora. Restoring public spaces is an excellent reminder of how small collective steps maintain nature paths for future hikers.',
  },
];

interface EditorBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
  caption?: string;
}

const CURATED_IMAGES = [
  { id: 'img1', name: 'Nature Cleanup', uri: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600', description: 'Volunteers cleaning the Green Valley forest trailhead.' },
  { id: 'img2', name: 'Youth Tutoring', uri: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600', description: 'A volunteer instructing coding basics to young students.' },
  { id: 'img3', name: 'Clinic Intake', uri: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600', description: 'Coordinating outpatient intake checklists at the NGO office.' },
  { id: 'img4', name: 'Food Pantry Distribution', uri: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600', description: 'Packing fresh farm organic crates for delivery.' },
];

const renderMarkdownContent = (text: string, themeColors: any) => {
  if (!text) return null;
  
  // Split into paragraphs by double newlines
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((paragraph, pIdx) => {
    const trimmed = paragraph.trim();
    if (trimmed.startsWith('[IMAGE:') && trimmed.endsWith(']')) {
      const imgUrl = trimmed.slice(7, -1).trim();
      return (
        <View key={pIdx} style={styles.editorImageBlockContainerInline}>
          <Image source={{ uri: imgUrl }} style={styles.inlineArticleImage} resizeMode="cover" />
        </View>
      );
    }

    const isBulletList = paragraph.trim().startsWith('- ');
    let cleanText = paragraph;
    if (isBulletList) {
      cleanText = paragraph.replace(/^\s*-\s+/, '');
    }

    // Split text by bold (**), italic (*), and underline (<u>) tags
    const regex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>)/g;
    const parts = cleanText.split(regex);

    const renderedParts = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={idx} style={{ fontWeight: 'bold' }}>
            {part.slice(2, -2)}
          </Text>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <Text key={idx} style={{ fontStyle: 'italic' }}>
            {part.slice(1, -1)}
          </Text>
        );
      } else if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return (
          <Text key={idx} style={{ textDecorationLine: 'underline' }}>
            {part.slice(3, -4)}
          </Text>
        );
      } else {
        return <Text key={idx}>{part}</Text>;
      }
    });

    if (isBulletList) {
      return (
        <View key={pIdx} style={{ flexDirection: 'row', marginLeft: Spacing.s, marginBottom: Spacing.s, width: '90%' }}>
          <Text style={{ color: themeColors.neutralForeground1, fontSize: 15, marginRight: 6 }}>•</Text>
          <Text style={[Typography.body, { color: themeColors.neutralForeground1, fontSize: 15, lineHeight: 22, flex: 1 }]}>
            {renderedParts}
          </Text>
        </View>
      );
    }

    return (
      <Text key={pIdx} style={[Typography.body, styles.fullArticleParagraphs, { color: themeColors.neutralForeground1 }]}>
        {renderedParts}
      </Text>
    );
  });
};


export const Blog: React.FC<BlogProps> = ({ isDarkMode = false, setParentScrollEnabled }) => {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  // 1. Tab States
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  // 2. Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchScope, setSearchScope] = useState<'title' | 'author'>('title');

  // 3. Feeds local states
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>(INITIAL_FEATURED_ARTICLES);
  const [volunteerVoices, setVolunteerVoices] = useState<Article[]>(VOLUNTEER_VOICES);
  const [ngoScenes, setNgoScenes] = useState<Article[]>(NGO_SCENES);
  const [communityStories, setCommunityStories] = useState<Article[]>(COMMUNITY_STORIES);
  const [myPersonalBlogs, setMyPersonalBlogs] = useState<Article[]>(MY_PERSONAL_BLOGS);

  // Dynamic unified list of all articles
  const allArticles = useMemo(() => [
    ...featuredArticles,
    ...volunteerVoices,
    ...ngoScenes,
    ...communityStories,
    ...myPersonalBlogs
  ], [featuredArticles, volunteerVoices, ngoScenes, communityStories, myPersonalBlogs]);

  // 4. Saved/Bookmarked articles state
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(['f1']);

  // 5. Navigation Details Modal state
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // 6. FAB modal state
  const [fabMenuVisible, setFabMenuVisible] = useState(false);

  // 7. Explore Similar Bottom Sheet Modal state
  const [exploreSheetVisible, setExploreSheetVisible] = useState(false);

  // 8. Direct-to-Author Feedback states
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 'f1',
      articleId: 'my1',
      author: 'Elena Rostova',
      timestamp: 'June 20, 2026, 2:15 PM',
      content: 'This is a fantastic suggestion on pre-sorting partitions! It will save us hours at the food bank.',
    },
    {
      id: 'f2',
      articleId: 'my1',
      author: 'Liam Chen',
      timestamp: 'June 21, 2026, 9:30 AM',
      content: 'We implemented this prep zone in our local kitchen and packing speed increased significantly.',
    },
    {
      id: 'f3',
      articleId: 'my2',
      author: 'Sophia Martinez',
      timestamp: 'June 14, 2026, 4:45 PM',
      content: 'Great log! Thanks for volunteering to clear the trail paths at Green Valley.',
    },
  ]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);

  const handleSendFeedback = (articleId: string) => {
    if (!feedbackInput.trim()) return;
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      articleId,
      author: 'Anonymous Reader',
      timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      content: feedbackInput.trim(),
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    setFeedbackInput('');
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
    }, 3000);
  };

  // Toggle saving bookmark
  const handleToggleSave = (articleId: string) => {
    if (savedArticleIds.includes(articleId)) {
      setSavedArticleIds(savedArticleIds.filter(id => id !== articleId));
    } else {
      setSavedArticleIds([...savedArticleIds, articleId]);
    }
  };

  // Shuffle Featured Articles
  const handleRefreshFeatured = () => {
    const shuffled = [...featuredArticles].sort(() => Math.random() - 0.5);
    setFeaturedArticles(shuffled);
  };

  // --- Blog Editor States ---
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorPostType, setEditorPostType] = useState<'thoughts' | 'short_blog' | 'article'>('thoughts');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [editorTitle, setEditorTitle] = useState('');
  const [editorBlocks, setEditorBlocks] = useState<EditorBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  const [imageSheetVisible, setImageSheetVisible] = useState(false);
  const [shortBlogCategory, setShortBlogCategory] = useState<'volunteer' | 'community'>('volunteer');

  // --- Block Serialization / Parsing Helpers ---
  const parseContentToBlocks = (content: string): EditorBlock[] => {
    if (!content) return [{ id: 'b-init', type: 'text', content: '' }];
    const blocks: EditorBlock[] = [];
    const lines = content.split('\n');
    let currentText = '';
    let blockIdCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('[IMAGE:') && line.endsWith(']')) {
        if (currentText.trim()) {
          blocks.push({ id: `b-${blockIdCounter++}`, type: 'text', content: currentText.trim() });
          currentText = '';
        }
        const imgUrl = line.slice(7, -1).trim();
        let caption = '';
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('*') && lines[i + 1].trim().endsWith('*')) {
          caption = lines[i + 1].trim().slice(1, -1);
          i++; // Skip the next line as it was consumed as a caption
        }
        blocks.push({ id: `b-${blockIdCounter++}`, type: 'image', content: imgUrl, caption });
      } else {
        currentText += (currentText ? '\n' : '') + lines[i];
      }
    }

    if (currentText.trim() || blocks.length === 0) {
      blocks.push({ id: `b-${blockIdCounter++}`, type: 'text', content: currentText });
    }

    return blocks;
  };

  const serializeBlocksToContent = (blocks: EditorBlock[]): string => {
    return blocks.map(block => {
      if (block.type === 'image') {
        return `[IMAGE: ${block.content}]` + (block.caption ? `\n*${block.caption}*` : '');
      }
      return block.content;
    }).join('\n\n');
  };

  // --- Editor Trigger Handlers ---
  const handleOpenCreator = (postType: 'thoughts' | 'short_blog' | 'article') => {
    setEditorMode('create');
    setEditorPostType(postType);
    setEditingArticle(null);
    setEditorTitle('');
    setEditorBlocks([{ id: 'b-init', type: 'text', content: '' }]);
    setActiveBlockId('b-init');
    setIsEditorVisible(true);
  };

  const handleOpenEditorForArticle = (article: Article) => {
    setEditorMode('edit');
    setEditingArticle(article);
    setEditorTitle(article.title);
    
    if (article.id.startsWith('user')) {
      if (article.category === 'Personal Notes') {
        setEditorPostType('thoughts');
      } else {
        setEditorPostType('short_blog');
        setShortBlogCategory(article.category === 'Environment' ? 'volunteer' : 'community');
      }
    } else if (article.id.startsWith('my')) {
      setEditorPostType('thoughts');
    } else if (article.id.startsWith('vv') || article.id.startsWith('cs')) {
      setEditorPostType('short_blog');
      setShortBlogCategory(article.id.startsWith('vv') ? 'volunteer' : 'community');
    } else if (article.id.startsWith('f')) {
      setEditorPostType('article');
    } else {
      setEditorPostType('thoughts');
    }

    const blocks = parseContentToBlocks(article.contentBody || article.summary);
    setEditorBlocks(blocks);
    setActiveBlockId(blocks[0]?.id || null);
    setIsEditorVisible(true);
  };

  // --- Block Editing Handlers ---
  const handleUpdateBlockContent = (blockId: string, text: string) => {
    setEditorBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content: text } : b));
  };

  const handleUpdateBlockCaption = (blockId: string, caption: string) => {
    setEditorBlocks(prev => prev.map(b => b.id === blockId ? { ...b, caption } : b));
  };

  const handleDeleteBlock = (blockId: string) => {
    if (editorBlocks.length === 1) return;
    setEditorBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const handleInsertImageBlock = (uri: string) => {
    setImageSheetVisible(false);
    const activeIndex = editorBlocks.findIndex(b => b.id === activeBlockId);
    
    const newImageBlock: EditorBlock = {
      id: `b-${Date.now()}-img`,
      type: 'image',
      content: uri,
      caption: '',
    };
    const newTextBlock: EditorBlock = {
      id: `b-${Date.now()}-txt`,
      type: 'text',
      content: '',
    };

    const nextBlocks = [...editorBlocks];
    if (activeIndex !== -1) {
      nextBlocks.splice(activeIndex + 1, 0, newImageBlock, newTextBlock);
    } else {
      nextBlocks.push(newImageBlock, newTextBlock);
    }

    setEditorBlocks(nextBlocks);
    setActiveBlockId(newTextBlock.id);
  };

  const handleFormatText = (tag: 'bold' | 'italic' | 'underline' | 'list') => {
    if (!activeBlockId) return;
    setEditorBlocks(prev => prev.map(block => {
      if (block.id !== activeBlockId) return block;
      
      const text = block.content;
      const { start, end } = selection;
      const selectedText = text.substring(start, end);
      
      let newText = '';
      if (tag === 'bold') {
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
      } else if (tag === 'italic') {
        newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
      } else if (tag === 'underline') {
        newText = text.substring(0, start) + `<u>${selectedText}</u>` + text.substring(end);
      } else if (tag === 'list') {
        newText = text.substring(0, start) + `\n- ${selectedText}` + text.substring(end);
      }
      
      return { ...block, content: newText };
    }));
  };

  const handleSave = (asDraft: boolean) => {
    if (!editorTitle.trim()) {
      alert('Please enter a title.');
      return;
    }

    const serializedContent = serializeBlocksToContent(editorBlocks);
    const isEdit = editorMode === 'edit' && editingArticle !== null;
    const articleId = isEdit ? editingArticle!.id : `user-${Date.now()}`;
    const authorName = isEdit ? editingArticle!.author : 'Nilap Saha';
    const postDate = isEdit ? editingArticle!.date : 'June 20, 2026';
    
    const wordCount = serializedContent.split(/\s+/).length;
    const readTime = `${Math.max(1, Math.round(wordCount / 150))} min read`;

    let category = 'Personal Notes';
    let intent: BadgeIntent = 'Warning';
    
    if (!asDraft) {
      if (editorPostType === 'thoughts') {
        category = 'Activity Log';
        intent = 'Success';
      } else if (editorPostType === 'short_blog') {
        if (shortBlogCategory === 'volunteer') {
          category = 'Environment';
          intent = 'Success';
        } else {
          category = 'Neighborhood';
          intent = 'Brand';
        }
      } else if (editorPostType === 'article') {
        category = 'Best Practices';
        intent = 'Brand';
      }
    }

    const newArticle: Article = {
      id: articleId,
      title: editorTitle.trim(),
      author: authorName,
      date: postDate,
      readTime,
      summary: editorBlocks.find(b => b.type === 'text' && b.content.trim())?.content.slice(0, 100) || 'Personal thoughts',
      category,
      categoryIntent: intent,
      contentBody: serializedContent,
      bannerImage: editorBlocks.find(b => b.type === 'image')?.content || ((editorPostType === 'article' && !asDraft) ? 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000' : undefined),
    };

    if (isEdit) {
      if (!asDraft) {
        if (editorPostType === 'short_blog') {
          if (shortBlogCategory === 'volunteer') {
            setVolunteerVoices(prev => prev.some(a => a.id === articleId) ? prev.map(a => a.id === articleId ? newArticle : a) : [newArticle, ...prev]);
            setCommunityStories(prev => prev.filter(a => a.id !== articleId));
          } else {
            setCommunityStories(prev => prev.some(a => a.id === articleId) ? prev.map(a => a.id === articleId ? newArticle : a) : [newArticle, ...prev]);
            setVolunteerVoices(prev => prev.filter(a => a.id !== articleId));
          }
          setFeaturedArticles(prev => prev.filter(a => a.id !== articleId));
        } else if (editorPostType === 'article') {
          setFeaturedArticles(prev => prev.some(a => a.id === articleId) ? prev.map(a => a.id === articleId ? newArticle : a) : [newArticle, ...prev]);
          setVolunteerVoices(prev => prev.filter(a => a.id !== articleId));
          setCommunityStories(prev => prev.filter(a => a.id !== articleId));
        } else {
          setVolunteerVoices(prev => prev.filter(a => a.id !== articleId));
          setCommunityStories(prev => prev.filter(a => a.id !== articleId));
          setFeaturedArticles(prev => prev.filter(a => a.id !== articleId));
        }
      } else {
        setFeaturedArticles(prev => prev.filter(a => a.id !== articleId));
        setVolunteerVoices(prev => prev.filter(a => a.id !== articleId));
        setCommunityStories(prev => prev.filter(a => a.id !== articleId));
      }
      
      setMyPersonalBlogs(prev => prev.map(a => a.id === articleId ? newArticle : a));
    } else {
      setMyPersonalBlogs(prev => [newArticle, ...prev]);

      if (!asDraft) {
        if (editorPostType === 'short_blog') {
          if (shortBlogCategory === 'volunteer') {
            setVolunteerVoices(prev => [newArticle, ...prev]);
          } else {
            setCommunityStories(prev => [newArticle, ...prev]);
          }
        } else if (editorPostType === 'article') {
          setFeaturedArticles(prev => [newArticle, ...prev]);
        }
      }
    }

    setIsEditorVisible(false);
  };

  // Filter Helper
  const filterList = (list: Article[]) => {
    if (!searchQuery) return list;
    return list.filter(item => {
      const matchText = searchScope === 'title' ? item.title : item.author;
      return matchText.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  // Filtered feeds memo
  const filteredFeatured = useMemo(() => filterList(featuredArticles), [featuredArticles, searchQuery, searchScope]);
  const filteredVV = useMemo(() => filterList(volunteerVoices), [volunteerVoices, searchQuery, searchScope]);
  const filteredNGO = useMemo(() => filterList(ngoScenes), [ngoScenes, searchQuery, searchScope]);
  const filteredCS = useMemo(() => filterList(communityStories), [communityStories, searchQuery, searchScope]);
  const filteredMy = useMemo(() => filterList(myPersonalBlogs), [myPersonalBlogs, searchQuery, searchScope]);

  // Bookmarked articles list
  const savedArticles = useMemo(() => {
    return allArticles.filter(item => savedArticleIds.includes(item.id));
  }, [allArticles, savedArticleIds]);

  const filteredSaved = useMemo(() => filterList(savedArticles), [savedArticles, searchQuery, searchScope]);

  // Check if search returned any result
  const hasSearchResults = useMemo(() => {
    if (activeTab === 'my') return filteredMy.length > 0 || filteredSaved.length > 0;
    return (
      filteredFeatured.length > 0 ||
      filteredVV.length > 0 ||
      filteredNGO.length > 0 ||
      filteredCS.length > 0
    );
  }, [activeTab, filteredFeatured, filteredVV, filteredNGO, filteredCS, filteredMy, filteredSaved]);

  return (
    <View style={[styles.mainWrapper, { backgroundColor: themeColors.neutralBackground2 }]}>
      
      {/* Scrollable Content Container */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: Spacing.s,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 96,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 1. Rebuilt Tab Header */}
        <View style={[styles.tabsHeaderContainer, { borderBottomColor: themeColors.neutralStroke2 }]}>
          <Pressable
            onPress={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            style={styles.tabHeaderItem}
          >
            <Text style={[
              Typography.bodyStrong,
              {
                color: activeTab === 'all' ? themeColors.brandForeground1 : themeColors.neutralForeground3,
                paddingVertical: Spacing.s,
                fontSize: 14,
              }
            ]}>
              All Blogs
            </Text>
            {activeTab === 'all' && (
              <View style={[styles.tabHeaderUnderline, { backgroundColor: themeColors.brandForeground1 }]} />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveTab('my');
              setSearchQuery('');
            }}
            style={styles.tabHeaderItem}
          >
            <Text style={[
              Typography.bodyStrong,
              {
                color: activeTab === 'my' ? themeColors.brandForeground1 : themeColors.neutralForeground3,
                paddingVertical: Spacing.s,
                fontSize: 14,
              }
            ]}>
              My Blogs
            </Text>
            {activeTab === 'my' && (
              <View style={[styles.tabHeaderUnderline, { backgroundColor: themeColors.brandForeground1 }]} />
            )}
          </Pressable>
        </View>

        {/* 2. Prominent Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2 }]}>
          <Ionicons name="search" size={18} color={themeColors.neutralForeground3} style={{ marginRight: Spacing.xs }} />
          <TextInput
            placeholder={searchScope === 'title' ? "Search articles by title..." : "Search by author..."}
            placeholderTextColor={themeColors.neutralForeground3}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            style={[styles.searchInput, { color: themeColors.neutralForeground1 }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: Spacing.xxs }}>
              <Ionicons name="close-circle" size={18} color={themeColors.neutralForeground3} />
            </Pressable>
          )}
        </View>

        {/* Search Filter Scope Chips (Expanded below input on Focus or Typing) */}
        {(isSearchFocused || searchQuery.length > 0) && (
          <View style={styles.searchScopeRow}>
            <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginRight: Spacing.s }]}>
              Search by:
            </Text>
            
            <Pressable
              onPress={() => setSearchScope('title')}
              style={[
                styles.scopeChip,
                {
                  backgroundColor: searchScope === 'title' ? themeColors.brandBackgroundSubtle : themeColors.neutralBackground3,
                  borderColor: searchScope === 'title' ? themeColors.brandForeground1 : 'transparent',
                  borderWidth: searchScope === 'title' ? 1 : 0,
                }
              ]}
            >
              <Text style={[
                Typography.captionStrong,
                { color: searchScope === 'title' ? themeColors.brandForeground1 : themeColors.neutralForeground3, fontSize: 11 }
              ]}>
                Title
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSearchScope('author')}
              style={[
                styles.scopeChip,
                {
                  backgroundColor: searchScope === 'author' ? themeColors.brandBackgroundSubtle : themeColors.neutralBackground3,
                  borderColor: searchScope === 'author' ? themeColors.brandForeground1 : 'transparent',
                  borderWidth: searchScope === 'author' ? 1 : 0,
                }
              ]}
            >
              <Text style={[
                Typography.captionStrong,
                { color: searchScope === 'author' ? themeColors.brandForeground1 : themeColors.neutralForeground3, fontSize: 11 }
              ]}>
                People
              </Text>
            </Pressable>

            {/* Clear/Dismiss Focus */}
            <Pressable
              onPress={() => setIsSearchFocused(false)}
              style={{ marginLeft: 'auto', paddingLeft: Spacing.s }}
            >
              <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1, fontSize: 11 }]}>
                Done
              </Text>
            </Pressable>
          </View>
        )}

        {/* Empty Search State */}
        {!hasSearchResults && (
          <View style={[styles.emptyStateContainer, { backgroundColor: themeColors.neutralBackground1, borderColor: themeColors.neutralStroke2 }]}>
            <Ionicons name="document-text-outline" size={48} color={themeColors.neutralForeground3} style={{ marginBottom: Spacing.s }} />
            <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, textAlign: 'center' }]}>
              No Articles Found
            </Text>
            <Text style={[Typography.caption, { color: themeColors.neutralForeground3, textAlign: 'center', marginTop: 4 }]}>
              We couldn't find matches for "{searchQuery}". Try editing your query or changing scopes.
            </Text>
          </View>
        )}

        {/* TAB A: ALL BLOGS */}
        {activeTab === 'all' && hasSearchResults && (
          <View>
            
            {/* 2. Featured Articles Header Row */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[Typography.bodyStrong, styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>
                Featured Articles
              </Text>
              <Pressable
                onPress={handleRefreshFeatured}
                style={({ pressed }) => [
                  styles.refreshButton,
                  { opacity: pressed ? 0.6 : 1, backgroundColor: themeColors.neutralBackground3 }
                ]}
              >
                <Ionicons name="refresh" size={14} color={themeColors.neutralForeground1} style={{ marginRight: 4 }} />
                <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground1, fontSize: 11 }]}>
                  Shuffle
                </Text>
              </Pressable>
            </View>

            {/* Featured Articles Horizontally scrolling Carousel with gesture handler locks */}
            {filteredFeatured.length > 0 ? (
              <GestureScrollView
                horizontal
                // @ts-ignore
                activeOffsetX={[-20, 20]}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={screenWidth * 0.82 + Spacing.m}
                snapToAlignment="start"
                contentContainerStyle={styles.carouselScrollPadding}
                onTouchStart={() => setParentScrollEnabled?.(false)}
                onTouchEnd={() => setParentScrollEnabled?.(true)}
                onTouchCancel={() => setParentScrollEnabled?.(true)}
              >
                {filteredFeatured.map(article => {
                  const cardAccentColor =
                    article.categoryIntent === 'Brand' ? '#1A73E8' :
                    article.categoryIntent === 'Success' ? '#137333' :
                    article.categoryIntent === 'Warning' ? '#B06000' :
                    article.categoryIntent === 'Danger' ? '#C5221F' : '#727272';

                  return (
                    <Card
                      key={article.id}
                      variant="Filled"
                      isDarkMode={isDarkMode}
                      style={[styles.featuredCard, { width: screenWidth * 0.82 }]}
                      size="Small"
                      onPress={() => setSelectedArticle(article)}
                    >
                      {/* Top 60% Image/Graphic Placeholder */}
                      <View style={[styles.featuredCardImageArea, { backgroundColor: themeColors.neutralBackground3 }]}>
                        {/* Whimsical organic abstract geometric pattern */}
                        <View style={[styles.abstractCircleShape, { backgroundColor: cardAccentColor, top: -25, left: -25, opacity: 0.16 }]} />
                        <View style={[styles.abstractCircleShape, { backgroundColor: themeColors.brandForeground1, bottom: -45, right: -15, opacity: 0.1 }]} />
                        <View style={[styles.abstractCircleShape, { backgroundColor: '#80D8FF', top: 20, right: 40, opacity: 0.15, width: 45, height: 45, borderRadius: 22.5 }]} />
                        
                        <View style={styles.badgeContainer}>
                          <Badge label={article.category} intent={article.categoryIntent} variant="Tint" size="Small" isDarkMode={isDarkMode} />
                        </View>
                      </View>

                      {/* Bottom 40% Metadata Area */}
                      <View style={styles.featuredCardTextContent}>
                        <Text style={[Typography.bodyStrong, styles.featuredCardTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={2}>
                          {article.title}
                        </Text>
                        <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginTop: 4 }]}>
                          {article.date} • {article.readTime}
                        </Text>
                      </View>
                    </Card>
                  );
                })}
              </GestureScrollView>
            ) : (
              <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginLeft: Spacing.m, marginBottom: Spacing.m }]}>
                No featured articles match.
              </Text>
            )}

            {/* 3. Categorized Horizontal Feeds */}

            {/* Category Section 1: Volunteer Voices */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[Typography.bodyStrong, styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>
                Volunteer Voices
              </Text>
            </View>
            
            {filteredVV.length > 0 ? (
              <GestureScrollView
                horizontal
                // @ts-ignore
                activeOffsetX={[-20, 20]}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselScrollPadding}
                onTouchStart={() => setParentScrollEnabled?.(false)}
                onTouchEnd={() => setParentScrollEnabled?.(true)}
                onTouchCancel={() => setParentScrollEnabled?.(true)}
              >
                {filteredVV.map(article => (
                  <Card
                    key={article.id}
                    variant="Filled"
                    isDarkMode={isDarkMode}
                    style={styles.compactCard}
                    size="Medium"
                    onPress={() => setSelectedArticle(article)}
                  >
                    <View style={styles.compactCardTop}>
                      <Badge label={article.category} intent={article.categoryIntent} variant="Subtle" size="Small" isDarkMode={isDarkMode} />
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                        {article.date}
                      </Text>
                    </View>
                    <Text style={[Typography.bodyStrong, styles.compactCardTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                      {article.title}
                    </Text>
                    <Text style={[Typography.caption, styles.compactCardSnippet, { color: themeColors.neutralForeground2 }]} numberOfLines={1}>
                      {article.summary}
                    </Text>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground3, marginTop: Spacing.xs }]}>
                      By {article.author}
                    </Text>
                  </Card>
                ))}
              </GestureScrollView>
            ) : (
              <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginLeft: Spacing.m, marginBottom: Spacing.m }]}>
                No entries match search.
              </Text>
            )}

            {/* Category Section 2: NGO Behind the Scenes */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[Typography.bodyStrong, styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>
                NGO Behind the Scenes
              </Text>
            </View>

            {filteredNGO.length > 0 ? (
              <GestureScrollView
                horizontal
                // @ts-ignore
                activeOffsetX={[-20, 20]}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselScrollPadding}
                onTouchStart={() => setParentScrollEnabled?.(false)}
                onTouchEnd={() => setParentScrollEnabled?.(true)}
                onTouchCancel={() => setParentScrollEnabled?.(true)}
              >
                {filteredNGO.map(article => (
                  <Card
                    key={article.id}
                    variant="Filled"
                    isDarkMode={isDarkMode}
                    style={styles.compactCard}
                    size="Medium"
                    onPress={() => setSelectedArticle(article)}
                  >
                    <View style={styles.compactCardTop}>
                      <Badge label={article.category} intent={article.categoryIntent} variant="Subtle" size="Small" isDarkMode={isDarkMode} />
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                        {article.date}
                      </Text>
                    </View>
                    <Text style={[Typography.bodyStrong, styles.compactCardTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                      {article.title}
                    </Text>
                    <Text style={[Typography.caption, styles.compactCardSnippet, { color: themeColors.neutralForeground2 }]} numberOfLines={1}>
                      {article.summary}
                    </Text>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground3, marginTop: Spacing.xs }]}>
                      By {article.author}
                    </Text>
                  </Card>
                ))}
              </GestureScrollView>
            ) : (
              <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginLeft: Spacing.m, marginBottom: Spacing.m }]}>
                No entries match search.
              </Text>
            )}

            {/* Category Section 3: Community Stories */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[Typography.bodyStrong, styles.sectionTitle, { color: themeColors.neutralForeground1 }]}>
                Community Stories
              </Text>
            </View>

            {filteredCS.length > 0 ? (
              <GestureScrollView
                horizontal
                // @ts-ignore
                activeOffsetX={[-20, 20]}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselScrollPadding}
                onTouchStart={() => setParentScrollEnabled?.(false)}
                onTouchEnd={() => setParentScrollEnabled?.(true)}
                onTouchCancel={() => setParentScrollEnabled?.(true)}
              >
                {filteredCS.map(article => (
                  <Card
                    key={article.id}
                    variant="Filled"
                    isDarkMode={isDarkMode}
                    style={styles.compactCard}
                    size="Medium"
                    onPress={() => setSelectedArticle(article)}
                  >
                    <View style={styles.compactCardTop}>
                      <Badge label={article.category} intent={article.categoryIntent} variant="Subtle" size="Small" isDarkMode={isDarkMode} />
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                        {article.date}
                      </Text>
                    </View>
                    <Text style={[Typography.bodyStrong, styles.compactCardTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
                      {article.title}
                    </Text>
                    <Text style={[Typography.caption, styles.compactCardSnippet, { color: themeColors.neutralForeground2 }]} numberOfLines={1}>
                      {article.summary}
                    </Text>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground3, marginTop: Spacing.xs }]}>
                      By {article.author}
                    </Text>
                  </Card>
                ))}
              </GestureScrollView>
            ) : (
              <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginLeft: Spacing.m, marginBottom: Spacing.m }]}>
                No entries match search.
              </Text>
            )}

          </View>
        )}

        {/* TAB B: MY BLOGS */}
        {activeTab === 'my' && hasSearchResults && (
          <View style={styles.myBlogsFeedContainer}>
            
            {/* Section: My Drafts & Published Blogs */}
            {filteredMy.length > 0 && (
              <View>
                <Text style={[Typography.bodyStrong, styles.sectionTitle, { color: themeColors.neutralForeground1, marginBottom: Spacing.m }]}>
                  My Drafts & Published Blogs
                </Text>

                {filteredMy.map(article => (
                  <Card
                    key={article.id}
                    variant="Filled"
                    isDarkMode={isDarkMode}
                    style={styles.myBlogCard}
                    onPress={() => setSelectedArticle(article)}
                  >
                    <View style={styles.compactCardTop}>
                      <Badge
                        label={article.category === 'Personal Notes' ? 'Draft' : 'Published'}
                        intent={article.category === 'Personal Notes' ? 'Warning' : 'Success'}
                        variant="Tint"
                        size="Small"
                        isDarkMode={isDarkMode}
                      />
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                        {article.date}
                      </Text>
                    </View>
                    
                    <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, marginVertical: Spacing.xxs }]}>
                      {article.title}
                    </Text>
                    <Text style={[Typography.caption, { color: themeColors.neutralForeground2, marginBottom: Spacing.s }]}>
                      {article.summary}
                    </Text>

                    <View style={styles.myCardFooter}>
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                        Author: {article.author} • {article.readTime}
                      </Text>
                      
                      <Pressable onPress={() => handleOpenEditorForArticle(article)}>
                        <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1 }]}>
                          Edit Entry →
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Section: Saved Articles */}
            <Text style={[
              Typography.bodyStrong,
              styles.sectionTitle,
              { color: themeColors.neutralForeground1, marginTop: Spacing.l, marginBottom: Spacing.m }
            ]}>
              Saved Articles
            </Text>

            {filteredSaved.length > 0 ? (
              filteredSaved.map(article => (
                <Card
                  key={article.id}
                  variant="Filled"
                  isDarkMode={isDarkMode}
                  style={styles.myBlogCard}
                  onPress={() => setSelectedArticle(article)}
                >
                  <View style={styles.compactCardTop}>
                    <Badge
                      label={article.category}
                      intent={article.categoryIntent}
                      variant="Tint"
                      size="Small"
                      isDarkMode={isDarkMode}
                    />
                    <Pressable
                      onPress={() => handleToggleSave(article.id)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="bookmark" size={18} color={themeColors.brandForeground1} />
                    </Pressable>
                  </View>
                  
                  <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, marginVertical: Spacing.xxs }]}>
                    {article.title}
                  </Text>
                  <Text style={[Typography.caption, { color: themeColors.neutralForeground2, marginBottom: Spacing.s }]} numberOfLines={2}>
                    {article.summary}
                  </Text>
                  
                  <View style={styles.myCardFooter}>
                    <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                      By {article.author} • {article.date}
                    </Text>
                    <Pressable onPress={() => setSelectedArticle(article)}>
                      <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1 }]}>
                        Read Now →
                      </Text>
                    </Pressable>
                  </View>
                </Card>
              ))
            ) : (
              <View style={[styles.emptySavedContainer, { borderColor: themeColors.neutralStroke2, backgroundColor: themeColors.neutralBackground1 }]}>
                <Ionicons name="bookmark-outline" size={24} color={themeColors.neutralForeground3} style={{ marginBottom: 4 }} />
                <Text style={[Typography.caption, { color: themeColors.neutralForeground2, textAlign: 'center' }]}>
                  No saved articles. Tap the Save bookmark icon inside details pages to read articles later!
                </Text>
              </View>
            )}

          </View>
        )}

      </ScrollView>

      {/* 4. Sticky Floating Action Button (FAB) */}
      <Pressable
        onPress={() => setFabMenuVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: themeColors.brandBackground,
            bottom: insets.bottom > 0 ? insets.bottom + 16 : 20,
            opacity: pressed ? 0.8 : 1,
            shadowColor: themeColors.brandBackground,
          }
        ]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {/* FAB Pop-up Menu Modal */}
      <Modal
        visible={fabMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFabMenuVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFabMenuVisible(false)}
        >
          <View
            style={[
              styles.fabMenuContainer,
              {
                bottom: insets.bottom > 0 ? insets.bottom + 84 : 88,
                backgroundColor: themeColors.neutralBackground1,
                borderColor: themeColors.neutralStroke2,
              }
            ]}
          >
            <Text style={[
              Typography.captionStrong,
              {
                color: themeColors.neutralForeground3,
                fontSize: 10,
                letterSpacing: 1,
                marginBottom: Spacing.xs,
                paddingHorizontal: Spacing.s,
              }
            ]}>
              CREATE NEW ENTRY
            </Text>

            <Pressable
              onPress={() => {
                setFabMenuVisible(false);
                handleOpenCreator('thoughts');
              }}
              style={({ pressed }) => [
                styles.fabMenuItem,
                { backgroundColor: pressed ? themeColors.neutralBackgroundPressed : 'transparent' }
              ]}
            >
              <Ionicons name="document-text-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: Spacing.s }} />
              <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 13.5 }]}>
                Write note down your thoughts
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setFabMenuVisible(false);
                handleOpenCreator('short_blog');
              }}
              style={({ pressed }) => [
                styles.fabMenuItem,
                { backgroundColor: pressed ? themeColors.neutralBackgroundPressed : 'transparent' }
              ]}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: Spacing.s }} />
              <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 13.5 }]}>
                Create short blogs
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setFabMenuVisible(false);
                handleOpenCreator('article');
              }}
              style={({ pressed }) => [
                styles.fabMenuItem,
                { backgroundColor: pressed ? themeColors.neutralBackgroundPressed : 'transparent' }
              ]}
            >
              <Ionicons name="create-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: Spacing.s }} />
              <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 13.5 }]}>
                Write articles
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 5. Rebuilt Full-Page Article Detail Screen Modal */}
      {selectedArticle && (
        <Modal
          visible={selectedArticle !== null}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setSelectedArticle(null)}
        >
          <SafeAreaView style={[styles.detailModal, { flex: 1, backgroundColor: themeColors.neutralBackground1 }]}>
            
            {/* Top Header Section */}
            <View style={[styles.detailHeader, { borderBottomColor: themeColors.neutralStroke2 }]}>
              <Pressable
                onPress={() => setSelectedArticle(null)}
                style={[styles.backBtn, { backgroundColor: themeColors.neutralBackground3 }]}
              >
                <Ionicons name="arrow-back" size={22} color={themeColors.neutralForeground1} />
              </Pressable>
              
              <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 16 }]} numberOfLines={1}>
                Article Details
              </Text>
              
              <View style={styles.detailHeaderActions}>
                <Pressable
                  onPress={() => handleToggleSave(selectedArticle.id)}
                  style={[styles.actionBtn, { backgroundColor: themeColors.neutralBackground3 }]}
                >
                  <Ionicons
                    name={savedArticleIds.includes(selectedArticle.id) ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={savedArticleIds.includes(selectedArticle.id) ? themeColors.brandForeground1 : themeColors.neutralForeground1}
                  />
                </Pressable>
                
                <Pressable
                  onPress={() => alert("Link shared to clipboard!")}
                  style={[styles.actionBtn, { backgroundColor: themeColors.neutralBackground3 }]}
                >
                  <Ionicons name="share-outline" size={20} color={themeColors.neutralForeground1} />
                </Pressable>
              </View>
            </View>

            {/* Scrollable Article Body */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: Spacing.xxl }}
              showsVerticalScrollIndicator={false}
            >
              
              {/* Conditional Banner Image (Featured Category Specific) */}
              {selectedArticle.bannerImage && (
                <View style={styles.bannerImageContainer}>
                  <Image
                    source={{ uri: selectedArticle.bannerImage }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.bannerOverlay} />
                </View>
              )}

              {/* Main Content Area */}
              <View style={styles.detailContentBody}>
                
                {/* Category Badge & Read Time */}
                <View style={styles.detailMetaRow}>
                  <Badge label={selectedArticle.category} intent={selectedArticle.categoryIntent} variant="Tint" size="Small" isDarkMode={isDarkMode} />
                  <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                    {selectedArticle.readTime}
                  </Text>
                </View>

                {/* Title */}
                <Text style={[Typography.title, styles.detailTitleText, { color: themeColors.neutralForeground1 }]}>
                  {selectedArticle.title}
                </Text>

                {/* Author Info */}
                <View style={[styles.authorRow, { borderColor: themeColors.neutralStroke2 }]}>
                  <View style={[styles.authorAvatarCircle, { backgroundColor: themeColors.brandBackgroundSubtle }]}>
                    <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1, fontSize: 13 }]}>
                      {selectedArticle.author.split(' ').pop()?.[0]?.toUpperCase() || 'A'}
                    </Text>
                  </View>
                  <View>
                    <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]}>
                      {selectedArticle.author}
                    </Text>
                    <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]}>
                      Published on {selectedArticle.date}
                    </Text>
                  </View>
                </View>

                {/* Full Article Text Block */}
                {renderMarkdownContent(
                  selectedArticle.contentBody || selectedArticle.summary + "\n\nVolunteering operations face key coordination demands across municipalities. Organizing physical supply lines, managing logistics files, and directing client intake require continuous local team syncs. Direct support activities establish community security. Actively guiding residents, checking on outpatients, and hosting neighborhood educational workshops build a stronger foundation for safety.\n\nProviding warm, empathetic outreach and resolving service obstacles create supportive settings. In the long term, case tracking grids and responsive volunteer circles ensure clients access recovery services and essential resources without delay.",
                  themeColors
                )}

                {/* Category-Specific Interactions (No Banner Categories) */}
                <View style={styles.detailFooterContainer}>
                  
                  {/* 1. Volunteer Voices Links */}
                  {selectedArticle.id.startsWith('vv') && (
                    <View style={styles.minimalistFooterRow}>
                      <Pressable
                        onPress={() => alert(`Navigating to ${selectedArticle.author}'s profile.`)}
                        style={({ pressed }) => [
                          styles.minimalistBtn,
                          { opacity: pressed ? 0.6 : 1 }
                        ]}
                      >
                        <Ionicons name="person-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: 6 }} />
                        <Text style={[Typography.bodyStrong, { color: themeColors.brandForeground1, fontSize: 14 }]}>
                          View Volunteer Profile
                        </Text>
                      </Pressable>
                      
                      <Pressable
                        onPress={() => alert(`Friend request sent to ${selectedArticle.author}!`)}
                        style={({ pressed }) => [
                          styles.minimalistBtn,
                          { opacity: pressed ? 0.6 : 1 }
                        ]}
                      >
                        <Ionicons name="person-add-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: 6 }} />
                        <Text style={[Typography.bodyStrong, { color: themeColors.brandForeground1, fontSize: 14 }]}>
                          Add Friend
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {/* 2. NGO Behind the Scenes Links */}
                  {selectedArticle.id.startsWith('ngo') && (
                    <View style={styles.minimalistFooterRow}>
                      <Pressable
                        onPress={() => alert(`Navigating to the NGO's official page.`)}
                        style={({ pressed }) => [
                          styles.minimalistBtn,
                          { opacity: pressed ? 0.6 : 1 }
                        ]}
                      >
                        <Ionicons name="business-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: 6 }} />
                        <Text style={[Typography.bodyStrong, { color: themeColors.brandForeground1, fontSize: 14 }]}>
                          View NGO Profile
                        </Text>
                      </Pressable>
                      
                      <Pressable
                        onPress={() => alert(`Subscribed to updates from this NGO!`)}
                        style={({ pressed }) => [
                          styles.minimalistBtn,
                          { opacity: pressed ? 0.6 : 1 }
                        ]}
                      >
                        <Ionicons name="notifications-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: 6 }} />
                        <Text style={[Typography.bodyStrong, { color: themeColors.brandForeground1, fontSize: 14 }]}>
                          Get Updates
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {/* 3. Community Stories Links */}
                  {selectedArticle.id.startsWith('cs') && (
                    <View style={styles.minimalistFooterRow}>
                      <Pressable
                        onPress={() => alert(`Opening community details page.`)}
                        style={({ pressed }) => [
                          styles.minimalistBtn,
                          { opacity: pressed ? 0.6 : 1 }
                        ]}
                      >
                        <Ionicons name="people-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: 6 }} />
                        <Text style={[Typography.bodyStrong, { color: themeColors.brandForeground1, fontSize: 14 }]}>
                          View Community
                        </Text>
                      </Pressable>
                      
                      <Pressable
                        onPress={() => alert(`Successfully joined the community!`)}
                        style={({ pressed }) => [
                          styles.minimalistBtn,
                          { opacity: pressed ? 0.6 : 1 }
                        ]}
                      >
                        <Ionicons name="add-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: 6 }} />
                        <Text style={[Typography.bodyStrong, { color: themeColors.brandForeground1, fontSize: 14 }]}>
                          Join Community
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {/* 4. Featured Articles - Explore Similar CTA */}
                  {selectedArticle.id.startsWith('f') && (
                    <Pressable
                      onPress={() => setExploreSheetVisible(true)}
                      style={({ pressed }) => [
                        styles.exploreCtaBtnMinimalist,
                        { opacity: pressed ? 0.6 : 1 }
                      ]}
                    >
                      <Ionicons name="compass-outline" size={18} color={themeColors.brandForeground1} style={{ marginRight: 6 }} />
                      <Text style={[Typography.bodyStrong, { color: themeColors.brandForeground1, fontSize: 14 }]}>
                        Explore Similar Articles
                      </Text>
                    </Pressable>
                  )}

                </View>

                {/* Direct-to-Author Feedback Section */}
                <View style={[styles.feedbackSectionContainer, { borderTopWidth: 1, borderTopColor: themeColors.neutralStroke2, marginTop: Spacing.xl, paddingTop: Spacing.l }]}>
                  {selectedArticle.author === 'Nilap Saha' ? (
                    /* Author View */
                    <View style={styles.feedbackAuthorContainer}>
                      <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, marginBottom: Spacing.s }]}>
                        Author Dashboard
                      </Text>
                      <Pressable
                        onPress={() => setCommentsModalVisible(true)}
                        style={({ pressed }) => [
                          styles.feedbackViewCommentsBtn,
                          {
                            backgroundColor: pressed ? themeColors.brandBackgroundPressed : themeColors.brandBackground,
                            padding: Spacing.m,
                            borderRadius: Shapes.rounded,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="mail-unread-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                          <Text style={[Typography.bodyStrong, { color: '#ffffff' }]}>
                            View Reader Comments ({feedbacks.filter(f => f.articleId === selectedArticle.id).length})
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  ) : (
                    /* Reader View */
                    <View style={styles.feedbackReaderContainer}>
                      <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, marginBottom: Spacing.xs }]}>
                        Send Feedback
                      </Text>
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginBottom: Spacing.s }]}>
                        Your comment will be sent privately to the author. Other readers cannot see it.
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.s }}>
                        <TextInput
                          value={feedbackInput}
                          onChangeText={setFeedbackInput}
                          placeholder="Send a comment to the author..."
                          placeholderTextColor={themeColors.neutralForegroundDisabled}
                          multiline
                          style={[
                            styles.feedbackTextInput,
                            {
                              flex: 1,
                              borderColor: themeColors.neutralStroke1,
                              backgroundColor: themeColors.neutralBackground2,
                              color: themeColors.neutralForeground1,
                            }
                          ]}
                        />
                        <Pressable
                          onPress={() => handleSendFeedback(selectedArticle.id)}
                          disabled={!feedbackInput.trim()}
                          style={({ pressed }) => [
                            styles.feedbackSendBtn,
                            {
                              backgroundColor: feedbackInput.trim() 
                                ? (pressed ? themeColors.brandBackgroundPressed : themeColors.brandBackground)
                                : themeColors.neutralBackgroundDisabled,
                            }
                          ]}
                        >
                          <Ionicons name="send" size={16} color="#ffffff" />
                        </Pressable>
                      </View>
                      {feedbackSuccess && (
                        <View style={[styles.feedbackSuccessBanner, { backgroundColor: themeColors.successBackgroundSubtle, borderColor: themeColors.successForeground1 }]}>
                          <Ionicons name="checkmark-circle" size={16} color={themeColors.successForeground1} style={{ marginRight: 6 }} />
                          <Text style={[Typography.caption, { color: themeColors.successForeground1 }]}>
                            Feedback sent to author!
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

              </View>
            </ScrollView>
          </SafeAreaView>

          {/* Explore Similar Pull-Up Bottom Sheet Modal */}
          <Modal
            visible={exploreSheetVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setExploreSheetVisible(false)}
          >
            <Pressable
              style={styles.sheetBackdrop}
              onPress={() => setExploreSheetVisible(false)}
            >
              {/* Card Container */}
              <View style={[
                styles.sheetContent,
                {
                  backgroundColor: themeColors.neutralBackground1,
                  borderColor: themeColors.neutralStroke2,
                  paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : Spacing.l,
                }
              ]}>
                
                {/* Drag Indicator handle */}
                <View style={[styles.sheetIndicator, { backgroundColor: themeColors.neutralStroke2 }]} />
                
                {/* Header */}
                <View style={styles.sheetHeader}>
                  <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 16 }]}>
                    Explore Similar Articles
                  </Text>
                  <Pressable onPress={() => setExploreSheetVisible(false)} style={{ padding: 4 }}>
                    <Ionicons name="close" size={22} color={themeColors.neutralForeground3} />
                  </Pressable>
                </View>

                {/* 2-Column Grid */}
                <View style={styles.gridContainer}>
                  {INITIAL_FEATURED_ARTICLES.filter(item => item.id !== selectedArticle.id).map(similar => (
                    <Pressable
                      key={similar.id}
                      onPress={() => {
                        setExploreSheetVisible(false);
                        setSelectedArticle(similar);
                      }}
                      style={[styles.gridCard, { backgroundColor: themeColors.neutralBackground2, borderColor: themeColors.neutralStroke2 }]}
                    >
                      <View style={{ marginBottom: 4 }}>
                        <Badge label={similar.category} intent={similar.categoryIntent} variant="Subtle" size="Small" isDarkMode={isDarkMode} />
                      </View>
                      <Text style={[Typography.bodyStrong, styles.gridCardTitle, { color: themeColors.neutralForeground1 }]} numberOfLines={2}>
                        {similar.title}
                      </Text>
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginTop: 'auto' }]}>
                        {similar.date}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Pressable>
          </Modal>
        </Modal>
      )}

      {/* 9. Direct-to-Author Feedback Inbox Modal (Author View) */}
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.neutralBackground1, paddingTop: Platform.OS === 'ios' ? 0 : 10 }}>
          {/* Modal Header */}
          <View style={[styles.feedbackInboxHeader, { borderBottomColor: themeColors.neutralStroke2, paddingBottom: Spacing.s, paddingHorizontal: Spacing.m, paddingTop: Spacing.m, borderBottomWidth: 1 }]}>
            <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 16 }]}>
              Reader Comments Inbox
            </Text>
            <Pressable
              onPress={() => setCommentsModalVisible(false)}
              style={[styles.feedbackInboxCloseBtn, { backgroundColor: themeColors.neutralBackground3 }]}
            >
              <Ionicons name="close" size={20} color={themeColors.neutralForeground1} />
            </Pressable>
          </View>

          {/* List of comments */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: Spacing.m }}
            showsVerticalScrollIndicator={false}
          >
            {selectedArticle && feedbacks.filter(f => f.articleId === selectedArticle.id).length === 0 ? (
              <View style={{ paddingVertical: Spacing.xxl, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="mail-outline" size={48} color={themeColors.neutralForeground3} style={{ marginBottom: 12 }} />
                <Text style={[Typography.body, { color: themeColors.neutralForeground3, textAlign: 'center' }]}>
                  No comments yet for this article.
                </Text>
              </View>
            ) : (
              selectedArticle && feedbacks.filter(f => f.articleId === selectedArticle.id).map(feedback => (
                <View
                  key={feedback.id}
                  style={[
                    styles.feedbackCard,
                    {
                      backgroundColor: themeColors.neutralBackground2,
                      borderColor: themeColors.neutralStroke1,
                    }
                  ]}
                >
                  <View style={styles.feedbackCardHeader}>
                    <View style={[styles.authorAvatarCircle, { width: 32, height: 32, backgroundColor: themeColors.brandBackgroundSubtle, marginRight: Spacing.s }]}>
                      <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1, fontSize: 11 }]}>
                        {feedback.author.split(' ').pop()?.[0]?.toUpperCase() || 'R'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 13 }]}>
                        {feedback.author}
                      </Text>
                      <Text style={[Typography.caption, { color: themeColors.neutralForeground3, fontSize: 10 }]}>
                        {feedback.timestamp}
                      </Text>
                    </View>
                  </View>
                  <Text style={[Typography.body, { color: themeColors.neutralForeground1, marginTop: Spacing.s, fontSize: 13, lineHeight: 18 }]}>
                    {feedback.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 6. Rich Text Editor Modal */}
      {isEditorVisible && (
        <Modal
          visible={isEditorVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsEditorVisible(false)}
        >
          <SafeAreaView style={[styles.detailModal, { flex: 1, backgroundColor: themeColors.neutralBackground1 }]}>
            
            {/* Editor Header */}
            <View style={[styles.detailHeader, { borderBottomColor: themeColors.neutralStroke2 }]}>
              <Pressable
                onPress={() => setIsEditorVisible(false)}
                style={[styles.backBtn, { backgroundColor: themeColors.neutralBackground3 }]}
              >
                <Ionicons name="close" size={22} color={themeColors.neutralForeground1} />
              </Pressable>
              
              <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 16 }]}>
                {editorMode === 'create' ? 'Create New Entry' : 'Edit Entry'}
              </Text>
              
              <View style={styles.detailHeaderActions}>
                <Pressable
                  onPress={() => handleSave(true)}
                  style={[styles.editorDraftBtn, { backgroundColor: themeColors.neutralBackground3 }]}
                >
                  <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground1 }]}>
                    Draft
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={() => handleSave(false)}
                  style={[styles.editorSaveBtn, { backgroundColor: themeColors.brandBackground }]}
                >
                  <Text style={[Typography.captionStrong, { color: '#FFFFFF' }]}>
                    Publish
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* KeyboardAvoidingView for Editor content */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: Spacing.m, paddingBottom: 120 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Display Editor Status Badge */}
                <View style={{ flexDirection: 'row', marginBottom: Spacing.s }}>
                  <Badge
                    label={
                      editorPostType === 'thoughts' ? 'Private Draft' :
                      editorPostType === 'short_blog' ? 'Public Blog' : 'Featured Article'
                    }
                    intent={
                      editorPostType === 'thoughts' ? 'Warning' :
                      editorPostType === 'short_blog' ? 'Brand' : 'Success'
                    }
                    variant="Tint"
                    size="Small"
                    isDarkMode={isDarkMode}
                  />
                </View>

                {/* Short Blog Category Destination Selector (Only for short blogs) */}
                {editorPostType === 'short_blog' && (
                  <View style={[styles.categorySelectorContainer, { borderColor: themeColors.neutralStroke2 }]}>
                    <Text style={[Typography.captionStrong, { color: themeColors.neutralForeground2, marginBottom: Spacing.xs }]}>
                      Publish Destination:
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Pressable
                        onPress={() => setShortBlogCategory('volunteer')}
                        style={[
                          styles.categorySelectTab,
                          {
                            backgroundColor: shortBlogCategory === 'volunteer' ? themeColors.brandBackgroundSubtle : themeColors.neutralBackground3,
                            borderColor: shortBlogCategory === 'volunteer' ? themeColors.brandForeground1 : 'transparent',
                            borderWidth: 1
                          }
                        ]}
                      >
                        <Text style={[
                          Typography.captionStrong,
                          { color: shortBlogCategory === 'volunteer' ? themeColors.brandForeground1 : themeColors.neutralForeground2 }
                        ]}>
                          Volunteer Voices
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setShortBlogCategory('community')}
                        style={[
                          styles.categorySelectTab,
                          {
                            backgroundColor: shortBlogCategory === 'community' ? themeColors.brandBackgroundSubtle : themeColors.neutralBackground3,
                            borderColor: shortBlogCategory === 'community' ? themeColors.brandForeground1 : 'transparent',
                            borderWidth: 1
                          }
                        ]}
                      >
                        <Text style={[
                          Typography.captionStrong,
                          { color: shortBlogCategory === 'community' ? themeColors.brandForeground1 : themeColors.neutralForeground2 }
                        ]}>
                          Community Stories
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Title Input */}
                <TextInput
                  placeholder="Enter Title..."
                  placeholderTextColor={themeColors.neutralForeground3}
                  value={editorTitle}
                  onChangeText={setEditorTitle}
                  style={[styles.editorTitleInput, { color: themeColors.neutralForeground1 }]}
                />

                {/* Blocks Rendering */}
                {editorBlocks.map((block) => {
                  if (block.type === 'image') {
                    return (
                      <View key={block.id} style={[styles.editorImageBlockContainer, { borderColor: themeColors.neutralStroke2 }]}>
                        <Image source={{ uri: block.content }} style={styles.editorImageBlock} />
                        
                        <TextInput
                          placeholder="Image caption..."
                          placeholderTextColor={themeColors.neutralForeground3}
                          value={block.caption || ''}
                          onChangeText={(newCaption) => handleUpdateBlockCaption(block.id, newCaption)}
                          style={[styles.editorImageCaptionInput, { color: themeColors.neutralForeground1 }]}
                        />

                        <Pressable
                          onPress={() => handleDeleteBlock(block.id)}
                          style={styles.editorDeleteBlockBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color="#C5221F" />
                        </Pressable>
                      </View>
                    );
                  }

                  return (
                    <View key={block.id} style={styles.editorTextBlockContainer}>
                      <TextInput
                        multiline
                        placeholder="Write your story here..."
                        placeholderTextColor={themeColors.neutralForeground3}
                        value={block.content}
                        onFocus={() => setActiveBlockId(block.id)}
                        onSelectionChange={(e) => {
                          if (activeBlockId === block.id) {
                            setSelection(e.nativeEvent.selection);
                          }
                        }}
                        onChangeText={(newText) => handleUpdateBlockContent(block.id, newText)}
                        style={[styles.editorTextInput, { color: themeColors.neutralForeground1 }]}
                      />
                      
                      {editorBlocks.length > 1 && (
                        <Pressable
                          onPress={() => handleDeleteBlock(block.id)}
                          style={styles.editorDeleteBlockBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color={themeColors.neutralForeground3} />
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </KeyboardAvoidingView>

            {/* Formatting Toolbar */}
            <View style={[styles.editorToolbar, { backgroundColor: themeColors.neutralBackground1, borderTopColor: themeColors.neutralStroke2 }]}>
              <Pressable onPress={() => handleFormatText('bold')} style={styles.toolbarIconBtn}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: themeColors.neutralForeground1, width: 20, textAlign: 'center' }}>B</Text>
              </Pressable>
              
              <Pressable onPress={() => handleFormatText('italic')} style={styles.toolbarIconBtn}>
                <Text style={{ fontStyle: 'italic', fontSize: 18, color: themeColors.neutralForeground1, width: 20, textAlign: 'center' }}>I</Text>
              </Pressable>

              <Pressable onPress={() => handleFormatText('underline')} style={styles.toolbarIconBtn}>
                <Text style={{ textDecorationLine: 'underline', fontSize: 18, color: themeColors.neutralForeground1, width: 20, textAlign: 'center' }}>U</Text>
              </Pressable>

              <Pressable onPress={() => handleFormatText('list')} style={styles.toolbarIconBtn}>
                <Ionicons name="list-outline" size={20} color={themeColors.neutralForeground1} />
              </Pressable>

              <View style={[styles.verticalDivider, { backgroundColor: themeColors.neutralStroke2, height: 24, marginHorizontal: 8 }]} />

              <Pressable onPress={() => setImageSheetVisible(true)} style={styles.toolbarIconBtn}>
                <Ionicons name="image-outline" size={20} color={themeColors.brandForeground1} />
                <Text style={[Typography.captionStrong, { color: themeColors.brandForeground1, marginLeft: 4, fontSize: 11 }]}>
                  Add Image
                </Text>
              </Pressable>
            </View>

          </SafeAreaView>

          {/* Curated Image Asset Picker Slide-up Sheet */}
          <Modal
            visible={imageSheetVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setImageSheetVisible(false)}
          >
            <Pressable
              style={styles.sheetBackdrop}
              onPress={() => setImageSheetVisible(false)}
            >
              <View style={[
                styles.sheetContent,
                {
                  backgroundColor: themeColors.neutralBackground1,
                  borderColor: themeColors.neutralStroke2,
                  paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : Spacing.l,
                }
              ]}>
                
                <View style={[styles.sheetIndicator, { backgroundColor: themeColors.neutralStroke2 }]} />
                
                <View style={styles.sheetHeader}>
                  <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 16 }]}>
                    Select Curated Image
                  </Text>
                  <Pressable onPress={() => setImageSheetVisible(false)} style={{ padding: 4 }}>
                    <Ionicons name="close" size={22} color={themeColors.neutralForeground3} />
                  </Pressable>
                </View>

                <ScrollView style={{ maxHeight: 350 }}>
                  <View style={{ gap: 12 }}>
                    {CURATED_IMAGES.map((img) => (
                      <Pressable
                        key={img.id}
                        onPress={() => handleInsertImageBlock(img.uri)}
                        style={[styles.curatedImagePickerRow, { borderColor: themeColors.neutralStroke2 }]}
                      >
                        <Image source={{ uri: img.uri }} style={styles.curatedPickerThumb} />
                        <View style={{ flex: 1, marginLeft: Spacing.s }}>
                          <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, fontSize: 14 }]}>
                            {img.name}
                          </Text>
                          <Text style={[Typography.caption, { color: themeColors.neutralForeground3 }]} numberOfLines={2}>
                            {img.description}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        </Modal>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: Spacing.s,
  },
  tabsHeaderContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: Spacing.m,
    paddingHorizontal: Spacing.m,
  },
  tabHeaderItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flex: 1,
  },
  tabHeaderUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.m,
    height: 40,
    width: '90%',
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchScopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: Spacing.m,
    paddingHorizontal: 4,
  },
  scopeChip: {
    paddingHorizontal: Spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: 5,
    borderRadius: 12,
  },
  carouselScrollPadding: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.s,
  },
  featuredCard: {
    marginRight: Spacing.m,
    borderRadius: 16,
    height: 220,
    padding: 0, // override padding to allow absolute image bleed
    overflow: 'hidden',
  },
  featuredCardImageArea: {
    height: 125,
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  abstractCircleShape: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  badgeContainer: {
    position: 'absolute',
    top: Spacing.s,
    left: Spacing.s,
    zIndex: 2,
  },
  featuredCardTextContent: {
    flex: 1,
    padding: Spacing.m,
    justifyContent: 'center',
  },
  featuredCardTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  compactCard: {
    width: 250,
    marginRight: Spacing.s,
    borderRadius: 12,
    padding: Spacing.m,
  },
  compactCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  compactCardTitle: {
    fontSize: 13,
    marginTop: Spacing.xxs,
  },
  compactCardSnippet: {
    fontSize: 11.5,
    marginTop: 2,
    opacity: 0.8,
  },
  myBlogsFeedContainer: {
    paddingHorizontal: Spacing.m,
  },
  myBlogCard: {
    marginBottom: Spacing.s,
    borderRadius: 12,
    padding: Spacing.m,
  },
  myCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingTop: Spacing.s,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 99,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fabMenuContainer: {
    width: '90%',
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.m,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.s,
    borderRadius: 8,
  },
  emptyStateContainer: {
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  
  // New Detail Modal & Layout Spacing Styles
  detailModal: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  detailContentBody: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
  },
  detailMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  detailTitleText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: Spacing.m,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.m,
    borderBottomWidth: 1,
    marginBottom: Spacing.m,
  },
  authorAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s,
  },
  fullArticleParagraphs: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: Spacing.l,
  },

  exploreCtaBtnMinimalist: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: Spacing.s,
  },
  detailFooterContainer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  minimalistFooterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  minimalistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  // Bottom Sheet Panel Styles
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.s,
  },
  sheetIndicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: Spacing.s,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.s,
    height: 120,
    justifyContent: 'space-between',
  },
  gridCardTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptySavedContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  editorTitleInput: {
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: Spacing.s,
    marginBottom: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  editorTextInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
    flex: 1,
    paddingRight: 32,
  },
  editorTextBlockContainer: {
    position: 'relative',
    flexDirection: 'row',
    marginBottom: Spacing.m,
  },
  editorDeleteBlockBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: Spacing.xxs,
  },
  editorImageBlockContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.s,
    marginBottom: Spacing.m,
    position: 'relative',
  },
  editorImageBlock: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: Spacing.s,
  },
  editorImageCaptionInput: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  editorToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    borderTopWidth: 1,
    elevation: 5,
  },
  toolbarIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
  },
  curatedImagePickerRow: {
    flexDirection: 'row',
    padding: Spacing.s,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  curatedPickerThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  categorySelectorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.s,
    marginBottom: Spacing.m,
  },
  categorySelectTab: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.s,
    borderRadius: 8,
  },
  editorDraftBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.m,
    borderRadius: 12,
    marginRight: Spacing.xs,
  },
  editorSaveBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.m,
    borderRadius: 12,
  },
  editorImageBlockContainerInline: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: Spacing.m,
    height: 200,
  },
  inlineArticleImage: {
    width: '100%',
    height: '100%',
  },
  verticalDivider: {
    width: 1,
    height: '100%',
  },
  feedbackSectionContainer: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.xl,
  },
  feedbackAuthorContainer: {
    width: '100%',
  },
  feedbackViewCommentsBtn: {
    width: '100%',
  },
  feedbackReaderContainer: {
    width: '100%',
  },
  feedbackTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.s,
    fontSize: 14,
    minHeight: 48,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  feedbackSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: Spacing.s,
  },
  feedbackInboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
  },
  feedbackInboxCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.m,
    marginBottom: Spacing.s,
  },
  feedbackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
