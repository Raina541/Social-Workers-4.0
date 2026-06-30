import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  Animated,
  Modal,
  Image,
  SafeAreaView,
  Platform,
  ViewToken,
  TextInput,
  ScrollView,
  Dimensions,
  Keyboard,
  PanResponder,
} from 'react-native';
import { Colors, Spacing, Typography, Shapes } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Defs,
  ClipPath,
  Path,
  Image as SvgImage,
  Circle,
  Rect,
  Line,
  G,
} from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { OpportunityDetail } from './OpportunityDetail';
import { Button } from '../components/Button';
import { OpportunityMapScreen } from './OpportunityMapScreen';

const { width: screenWidth } = Dimensions.get('window');

interface FeedProps {
  isDarkMode?: boolean;
  activeMode?: 'In-person' | 'Online' | 'Micro volunteering';
  onChangeActiveMode?: (mode: 'In-person' | 'Online' | 'Micro volunteering') => void;
  timeFilter?: number;
  onChangeTimeFilter?: (filter: number | undefined) => void;
  selectedOpportunity?: Opportunity | null;
  onSelectOpportunity?: (opp: Opportunity | null) => void;
  activeDomainId?: string;
  onChangeActiveDomainId?: (domainId: string | undefined) => void;
  onViewNgo?: (ngoName: string) => void;
}

export interface Opportunity {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  domainId: string;
  timeCommitment: string;
  durationAbbreviation: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // Jun 18, 2026
  location: string;
  impact: string;
  imageUri: string;
}

interface DomainConfig {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  lightBg: string;
  darkBg: string;
  lightAccent: string;
  darkAccent: string;
}

export const DOMAINS: DomainConfig[] = [
  {
    id: 'health',
    name: 'Health',
    icon: 'medical-outline',
    lightBg: '#EAF6EC', // Muted pastel green
    darkBg: '#0F2618', // Deep forest green
    lightAccent: '#2E7D32',
    darkAccent: '#81C784',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'school-outline',
    lightBg: '#ECF3FC', // Muted ice blue
    darkBg: '#0F1E36', // Deep navy blue
    lightAccent: '#1A73E8',
    darkAccent: '#8AB4F8',
  },
  {
    id: 'environment',
    name: 'Nature',
    icon: 'leaf-outline',
    lightBg: '#F3F8EC', // Muted lime
    darkBg: '#1C2E15', // Deep olive green
    lightAccent: '#558B2F',
    darkAccent: '#AED581',
  },
  {
    id: 'shelter',
    name: 'Shelter',
    icon: 'home-outline',
    lightBg: '#F6ECF9', // Muted light lavender
    darkBg: '#251630', // Deep rich purple
    lightAccent: '#8E24AA',
    darkAccent: '#CE93D8',
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'nutrition-outline',
    lightBg: '#FFF6EC', // Muted peach
    darkBg: '#2B1A0E', // Deep warm bronze
    lightAccent: '#E65100',
    darkAccent: '#FFB74D',
  },
];

export const MOCK_OPPORTUNITIES: Record<'In-person' | 'Online' | 'Micro volunteering', Opportunity[]> = {
  'In-person': [
    {
      id: 'ip-chennai-1',
      title: 'Marina Beach Cleanup',
      shortDescription: 'Clean plastic pollution along Marina Beach in Chennai.',
      description: 'Gather at Marina Lighthouse to collect waste, plastics, and debris from the shores of Chennai. Helps protect local marine life and maintain clean coastlines.',
      domainId: 'environment',
      timeCommitment: '3 hrs/week',
      durationAbbreviation: '3h',
      date: '2026-07-05',
      displayDate: 'Jul 5, 2026',
      location: 'Marina Beach, Chennai',
      impact: 'Cleans 500m coastline',
      imageUri: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    },
    {
      id: 'ip-gwalior-1',
      title: 'Gwalior Fort Tree Planting',
      shortDescription: 'Plant native saplings at Gwalior Fort foothills.',
      description: 'Join us in planting local shrubs and shade-giving trees near Gwalior Fort. Helps reduce soil erosion and improve green cover in the region.',
      domainId: 'environment',
      timeCommitment: '4 hrs/week',
      durationAbbreviation: '4h',
      date: '2026-07-06',
      displayDate: 'Jul 6, 2026',
      location: 'Fort Foothills Park, Gwalior',
      impact: 'Plants 150 saplings',
      imageUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    },
    {
      id: 'ip-bangalore-1',
      title: 'Tech Mentoring for Kids',
      shortDescription: 'Teach basic computer science to children in Bangalore.',
      description: 'Spend a weekend helping middle school students learn computational thinking and Scratch programming at our community lab in Bangalore.',
      domainId: 'education',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-07-07',
      displayDate: 'Jul 7, 2026',
      location: 'Indiranagar Youth Club, Bangalore',
      impact: 'Mentors 15 students',
      imageUri: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    },
    {
      id: 'ip-pune-1',
      title: 'Pune Food Rescue Drive',
      shortDescription: 'Distribute surplus food to Pune local shelters.',
      description: 'Help rescue excess cooked meals from partners in Pune and deliver them to shelter homes. Packing containers and delivery vehicle support provided.',
      domainId: 'food',
      timeCommitment: '3 hrs/week',
      durationAbbreviation: '3h',
      date: '2026-07-08',
      displayDate: 'Jul 8, 2026',
      location: 'Kothrud, Pune',
      impact: 'Feeds 100+ daily',
      imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    },
    {
      id: 'ip-varanasi-1',
      title: 'Ghat Literacy Circles',
      shortDescription: 'Conduct free reading lessons at Assi Ghat, Varanasi.',
      description: 'Support under-resourced local children by teaching basic Hindi and English reading, grammar, and sentence structures at Assi Ghat.',
      domainId: 'education',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-07-09',
      displayDate: 'Jul 9, 2026',
      location: 'Assi Ghat, Varanasi',
      impact: 'Teaches 20+ kids',
      imageUri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
    },
    // Health
    {
      id: 'ip-h1',
      title: 'Clinic Reception Guide',
      shortDescription: 'Help outpatients and elderly visitors navigate through the medical center complex.',
      description: 'As a Clinic Reception Guide, you will stand at key reception areas of the local hospital. Your primary role is to welcome arriving patients and visitors, assist them with locating different departments, and guide elderly or mobility-challenged individuals. Training and protective gear will be fully provided.',
      domainId: 'health',
      timeCommitment: '4 hrs/week',
      durationAbbreviation: '4h',
      date: '2026-06-18',
      displayDate: 'Jun 18, 2026',
      location: 'St. Jude Medical Center, Northwest Pavilion Entrance Room 402',
      impact: 'Assists 100+ visitors daily',
      imageUri: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800',
    },
    {
      id: 'ip-h2',
      title: 'Senior Recreation Assistant',
      shortDescription: 'Organize games, reading sessions, and activities for assisted living residents.',
      description: 'Spend time bringing joy to seniors! You will lead simple board games, read books aloud, and accompany seniors on walks within the facility garden. This is a high-impact role aimed at reducing isolation among our beloved elders.',
      domainId: 'health',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-06-19',
      displayDate: 'Jun 19, 2026',
      location: 'Silver Linings Facility, Garden Level Community Hall',
      impact: 'Brings joy to 30 residents',
      imageUri: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
    },
    // Education
    {
      id: 'ip-e1',
      title: 'Weekend Reading Coach',
      shortDescription: 'Help elementary school kids improve reading skills at the local public library.',
      description: 'Join our weekend literacy clinic. You will pair up with 1-2 kids who are struggling with basic reading comprehension. Using fun educational workbooks and children\'s stories, you\'ll help them build vocabulary and read confidently.',
      domainId: 'education',
      timeCommitment: '3 hrs/week',
      durationAbbreviation: '3h',
      date: '2026-06-20',
      displayDate: 'Jun 20, 2026',
      location: 'Downtown Public Library, Children\'s Annex Basement Area',
      impact: 'Boosts reading for 15 children',
      imageUri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
    },
    {
      id: 'ip-e2',
      title: 'Youth Coding Club Mentor',
      shortDescription: 'Teach block-based coding and Python basics to middle school students.',
      description: 'Inspire the next generation of engineers! You will co-lead a classroom-based coding circle for children from underserved communities. You will guide them through making basic games in Scratch or simple text exercises in Python.',
      domainId: 'education',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-06-21',
      displayDate: 'Jun 21, 2026',
      location: 'Youth Opportunity Center, Computer Lab Suite B',
      impact: 'Prepares 12 kids for tech pathways',
      imageUri: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    },
    // Environment
    {
      id: 'ip-v1',
      title: 'Urban Forest Cleanup',
      shortDescription: 'Remove litter and clear pathways at the state park nature preserve.',
      description: 'Help restore the local park! Volunteers will walk through woodland trails, collect plastic waste, clear invasive weeds, and restore footpaths. It is a fantastic opportunity to spend a morning outdoors giving back to nature.',
      domainId: 'environment',
      timeCommitment: '3 hrs (One-time)',
      durationAbbreviation: '3h',
      date: '2026-06-22',
      displayDate: 'Jun 22, 2026',
      location: 'Green Valley Preserve, Main Trailhead & Picnic Area 3',
      impact: 'Restores 2 acres of green space',
      imageUri: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
    },
    {
      id: 'ip-v2',
      title: 'Native Tree Planting',
      shortDescription: 'Plant native tree saplings to increase urban canopy coverage.',
      description: 'Join our reforestation efforts. We are planting native maples, oaks, and shrubs in an urban heat-island zone. You will dig soil holes, plant saplings, add mulch, and water them. Tools and gloves are provided.',
      domainId: 'environment',
      timeCommitment: '4 hrs (One-time)',
      durationAbbreviation: '4h',
      date: '2026-06-25',
      displayDate: 'Jun 25, 2026',
      location: 'Metro Park East, Community Reforestation Zone C',
      impact: 'Adds 50 new shade trees',
      imageUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    },
    // Shelter
    {
      id: 'ip-s1',
      title: 'Hope Kitchen Dinner Server',
      shortDescription: 'Prepare and serve hot dinners to families experiencing homelessness.',
      description: 'Work alongside professional chefs to prepare nutritious meals for shelter residents and drop-in guests. Tasks include chopping ingredients, serving meals on the dining line, and wiping down tables afterwards.',
      domainId: 'shelter',
      timeCommitment: '3 hrs/week',
      durationAbbreviation: '3h',
      date: '2026-06-18',
      displayDate: 'Jun 18, 2026',
      location: 'Hope Community Center, Central Dining Hall & Pantry Depot',
      impact: 'Feeds 150 individuals nightly',
      imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    },
    {
      id: 'ip-s2',
      title: 'Clothing Drive Organizer',
      shortDescription: 'Sort, organize, and distribute donated seasonal apparel to families.',
      description: 'Help organize our community clothing closet. You will sort incoming donations by size and quality, hang garments on racks, and assist shelter residents in finding outfits that fit them comfortably.',
      domainId: 'shelter',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-06-19',
      displayDate: 'Jun 19, 2026',
      location: 'Safe Haven Intake Depot, Storage Room 3A',
      impact: 'Clothes 40 families monthly',
      imageUri: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
    },
    // Food
    {
      id: 'ip-f1',
      title: 'Harvest Garden Farm Hand',
      shortDescription: 'Help water, harvest, and package organic vegetables for food banks.',
      description: 'Get your hands dirty at our community farm! You will harvest ripe vegetables, pull weeds, compost soil, and pack crates. All harvested produce is directly donated to families in need via the local food shelf.',
      domainId: 'food',
      timeCommitment: '3 hrs/week',
      durationAbbreviation: '3h',
      date: '2026-06-20',
      displayDate: 'Jun 20, 2026',
      location: 'Sunrise Community Garden, Greenhouses 1 & 2',
      impact: 'Produces 200 lbs of food/week',
      imageUri: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=800',
    },
    {
      id: 'ip-f2',
      title: 'Emergency Food Box Packer',
      shortDescription: 'Pack grocery boxes filled with shelf-stable food and fresh produce.',
      description: 'Work assembly-line style in our temperature-controlled warehouse. You will fill heavy-duty cardboard boxes with canned beans, rice, milk, bread, and apples to prepare them for contactless delivery to seniors.',
      domainId: 'food',
      timeCommitment: '4 hrs/week',
      durationAbbreviation: '4h',
      date: '2026-06-28',
      displayDate: 'Jun 28, 2026',
      location: 'Metro Harvest Food Bank, Loading Dock 14',
      impact: 'Prepares 500 emergency packs',
      imageUri: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    },
  ],
  'Online': [
    // Health
    {
      id: 'ol-h1',
      title: 'Crisis Text Responder',
      shortDescription: 'Provide empathetic text message support to individuals in distress.',
      description: 'Support people through critical moments. Working from home on our secure platform, you will receive text messages from people experiencing anxiety, loneliness, or depression. You will guide them toward safety and resources using active listening.',
      domainId: 'health',
      timeCommitment: '4 hrs/week',
      durationAbbreviation: '4h',
      date: '2026-06-18',
      displayDate: 'Jun 18, 2026',
      location: 'Remote (Home-based / Global)',
      impact: 'Supports 5 individuals in crisis',
      imageUri: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800',
    },
    {
      id: 'ol-h2',
      title: 'Senior Phone Companion',
      shortDescription: 'Conduct friendly weekly calls to check in on isolated seniors.',
      description: 'Bring companionship to seniors from the comfort of your home. You will be matched with 1-2 senior citizens who live alone. Call them once or twice a week to talk about hobbies, current events, and check on their wellness.',
      domainId: 'health',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-06-19',
      displayDate: 'Jun 19, 2026',
      location: 'Remote (Home-based)',
      impact: 'Reduces isolation for seniors',
      imageUri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    },
    // Education
    {
      id: 'ol-e1',
      title: 'Online Math Tutor',
      shortDescription: 'Help high schoolers master Algebra and Geometry via Zoom.',
      description: 'Support high school students struggling with math. You will conduct interactive 1-on-1 tutoring sessions on Tuesday and Thursday evenings. Math curriculum guides and digital whiteboards are provided.',
      domainId: 'education',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-06-20',
      displayDate: 'Jun 20, 2026',
      location: 'Remote (Zoom virtual sessions)',
      impact: 'Improves grades for 3 students',
      imageUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    },
    {
      id: 'ol-e2',
      title: 'ESL Conversation Guide',
      shortDescription: 'Help adult language learners practice speaking English.',
      description: 'Practice conversational English with adult immigrants looking to improve their language skills. You will talk about daily routines, work, and community living in structured weekly Zoom chat groups.',
      domainId: 'education',
      timeCommitment: '1.5 hrs/week',
      durationAbbreviation: '1.5h',
      date: '2026-06-21',
      displayDate: 'Jun 21, 2026',
      location: 'Remote (Home-based)',
      impact: 'Boosts language confidence',
      imageUri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    },
    // Environment
    {
      id: 'ol-v1',
      title: 'Green Policy Researcher',
      shortDescription: 'Research and draft summaries on local green energy ordinances.',
      description: 'Help our advocacy team stay informed. You will review local government meeting minutes and draft brief, 1-page summaries explaining proposed changes to zoning laws, solar panel regulations, or recycling programs.',
      domainId: 'environment',
      timeCommitment: '5 hrs/week',
      durationAbbreviation: '5h',
      date: '2026-06-22',
      displayDate: 'Jun 22, 2026',
      location: 'Remote (Online Research)',
      impact: 'Guides local clean energy campaigns',
      imageUri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    },
    {
      id: 'ol-v2',
      title: 'Eco-Tracker QA Tester',
      shortDescription: 'Test and report bugs on our community recycling tracking mobile app.',
      description: 'Help us debug the Eco-Tracker app! You will run through test scenarios, click around features, submit log reports of crashes, and share feedback on user-experience gaps before our major summer launch.',
      domainId: 'environment',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-06-25',
      displayDate: 'Jun 25, 2026',
      location: 'Remote (iOS/Android Simulator)',
      impact: 'Improves app for 5,000+ users',
      imageUri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    },
    // Shelter
    {
      id: 'ol-s1',
      title: 'Affordable Housing Database Admin',
      shortDescription: 'Research and input low-income housing details into our database.',
      description: 'Help caseworkers find housing fast. You will search housing directories, call apartment offices to confirm availability, and input rates, requirements, and contact details into our central Airtable registry.',
      domainId: 'shelter',
      timeCommitment: '3 hrs/week',
      durationAbbreviation: '3h',
      date: '2026-06-18',
      displayDate: 'Jun 18, 2026',
      location: 'Remote (Data Entry portal)',
      impact: 'Speeds up housing search for 200+ clients',
      imageUri: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    },
    {
      id: 'ol-s2',
      title: 'Hotline Technical Assistant',
      shortDescription: 'Help volunteer hotline operators troubleshoot software issues.',
      description: 'Ensure our hotline stays online. You will respond to technical help tickets from phone counselors regarding browser setups, audio settings, or database access problems. Basic training on our platform is provided.',
      domainId: 'shelter',
      timeCommitment: '3 hrs/week',
      durationAbbreviation: '3h',
      date: '2026-06-19',
      displayDate: 'Jun 19, 2026',
      location: 'Remote (Slack & Helpdesk)',
      impact: 'Ensures 100% helpline uptime',
      imageUri: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
    },
    // Food
    {
      id: 'ol-f1',
      title: 'Food Rescue Outreach Partner',
      shortDescription: 'Contact local restaurants to list surplus food on our rescue app.',
      description: 'Help fight food waste! You will send emails and place calls to bakeries, grocers, and diners to introduce our food donation app. You will assist interested store owners in setting up their donor profile.',
      domainId: 'food',
      timeCommitment: '4 hrs/week',
      durationAbbreviation: '4h',
      date: '2026-06-20',
      displayDate: 'Jun 20, 2026',
      location: 'Remote (Home-based)',
      impact: 'Saves 500 lbs of food weekly',
      imageUri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    },
    {
      id: 'ol-f2',
      title: 'Budget-Friendly Recipe Writer',
      shortDescription: 'Create easy, cheap recipes to distribute to food bank clients.',
      description: 'Write simple recipe cards based on common food bank offerings (canned beans, oats, canned tuna, carrots). You will detail nutrition tips, simple instructions, and package them into PDF sheets for printing.',
      domainId: 'food',
      timeCommitment: '2 hrs/week',
      durationAbbreviation: '2h',
      date: '2026-06-28',
      displayDate: 'Jun 28, 2026',
      location: 'Remote (Home-based)',
      impact: 'Educates 1,000+ struggling families',
      imageUri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    },
  ],
  'Micro volunteering': [
    // Health
    {
      id: 'mv-h1',
      title: 'Write Uplifting Hospital Cards',
      shortDescription: 'Write and submit digital cards to children undergoing surgery.',
      description: 'Banish fear with warm words! You will use our simple online portal to select templates and write 3 short, encouraging notes. The cards will be printed and handed to children in pediatric wards before surgeries.',
      domainId: 'health',
      timeCommitment: '45 mins (One-time)',
      durationAbbreviation: '45m',
      date: '2026-06-18',
      displayDate: 'Jun 18, 2026',
      location: 'Remote (Children\'s Hospital portal)',
      impact: 'Brings comfort to 10 hospitalized kids',
      imageUri: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
    },
    {
      id: 'mv-h2',
      title: 'Blood Drive Social Promoter',
      shortDescription: 'Share local blood drive times on your social media profiles.',
      description: 'Help solve the blood shortage. We will provide a graphics package and caption templates. You just need to share the info on your social channels, tag local groups, and answer update questions in comments.',
      domainId: 'health',
      timeCommitment: '15 mins (One-time)',
      durationAbbreviation: '15m',
      date: '2026-06-19',
      displayDate: 'Jun 19, 2026',
      location: 'Remote (Social channels)',
      impact: 'Reaches 200+ potential blood donors',
      imageUri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    },
    // Education
    {
      id: 'mv-e1',
      title: 'Record a Kids\' Audio Story',
      shortDescription: 'Record your voice reading a public-domain storybook aloud.',
      description: 'Create audio stories for blind or sight-impaired children. You will use your smartphone to record a 10-minute public-domain children\'s book. Our team will handle basic audio editing and publish the track.',
      domainId: 'education',
      timeCommitment: '30 mins (One-time)',
      durationAbbreviation: '30m',
      date: '2026-06-20',
      displayDate: 'Jun 20, 2026',
      location: 'Remote (Audio Recorder App)',
      impact: 'Creates audiobook for blind children',
      imageUri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
    },
    {
      id: 'mv-e2',
      title: 'Share Study Tips Infographics',
      shortDescription: 'Distribute study guides and tips to local student forums.',
      description: 'Help local students prepare for finals. Share our pre-designed graphic guides containing memory techniques, hydration tips, and exam strategies onto local community and student Facebook/Discord groups.',
      domainId: 'education',
      timeCommitment: '10 mins (One-time)',
      durationAbbreviation: '10m',
      date: '2026-06-21',
      displayDate: 'Jun 21, 2026',
      location: 'Remote (Social forums)',
      impact: 'Reaches 100+ local students',
      imageUri: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    },
    // Environment
    {
      id: 'mv-v1',
      title: 'Log Litter on Walking Paths',
      shortDescription: 'Photograph and upload trash locations on your daily walk.',
      description: 'Download our tracking tool and take photographs of plastic waste, dumped furniture, or debris on public walking trails. The city garbage collection crews use this data to map out sweep zones.',
      domainId: 'environment',
      timeCommitment: '30 mins (One-time)',
      durationAbbreviation: '30m',
      date: '2026-06-22',
      displayDate: 'Jun 22, 2026',
      location: 'Local Neighborhood (Walking paths)',
      impact: 'Helps crews clean up 10 park zones',
      imageUri: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800',
    },
    {
      id: 'mv-v2',
      title: 'Promote Water Saving Tips',
      shortDescription: 'Post simple domestic water conservation tips online.',
      description: 'Help combat drought. We will send you a text-only list of 5 easy household habits to save water (e.g. cold-washing clothes, tap turning). Post this to neighborhood apps like Nextdoor to encourage community adoption.',
      domainId: 'environment',
      timeCommitment: '10 mins (One-time)',
      durationAbbreviation: '10m',
      date: '2026-06-25',
      displayDate: 'Jun 25, 2026',
      location: 'Remote (Nextdoor application)',
      impact: 'Helps 50+ neighbors reduce water waste',
      imageUri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    },
    // Shelter
    {
      id: 'mv-s1',
      title: 'Assemble a Hygiene Pouch',
      shortDescription: 'Put soap, toothbrush, and socks in a bag for donations.',
      description: 'Make a direct difference! Purchase a travel-size toothbrush, paste, soap, and a clean pair of socks, pack them into a zip bag, and drop it off at our community shelter box in the grocery lobby.',
      domainId: 'shelter',
      timeCommitment: '30 mins (One-time)',
      durationAbbreviation: '30m',
      date: '2026-06-18',
      displayDate: 'Jun 18, 2026',
      location: 'Home / Local Grocery Bin Depot',
      impact: 'Immediate aid for 1 shelter guest',
      imageUri: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    },
    {
      id: 'mv-s2',
      title: 'Share Shelter Wishlist Link',
      shortDescription: 'Post the shelter\'s emergency blanket needs page to your network.',
      description: 'Help the shelter stay warm during cold winter spells. Share our official wishlist link for emergency thermal blankets with your family, friends, or work Slack channels to boost donations.',
      domainId: 'shelter',
      timeCommitment: '10 mins (One-time)',
      durationAbbreviation: '10m',
      date: '2026-06-19',
      displayDate: 'Jun 19, 2026',
      location: 'Remote (Home-based)',
      impact: 'Boosts emergency thermal blanket pool',
      imageUri: 'https://images.unsplash.com/photo-1583307265400-e17f8b057237?w=800',
    },
    // Food
    {
      id: 'mv-f1',
      title: 'Donate Pantry Surplus',
      shortDescription: 'Check and drop off unexpired canned food at a food pantry.',
      description: 'Go through your kitchen cupboards and pull out canned vegetables, fruit, soup, or pasta that you won\'t eat but are still months away from expiry. Drive and drop them off in our donation bin.',
      domainId: 'food',
      timeCommitment: '30 mins (One-time)',
      durationAbbreviation: '30m',
      date: '2026-06-20',
      displayDate: 'Jun 20, 2026',
      location: 'Home / Community Food Closet Bin',
      impact: 'Feeds a family of four for a night',
      imageUri: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800',
    },
    {
      id: 'mv-f2',
      title: 'Share Grocery Coupon Codes',
      shortDescription: 'Post discount coupons on local food-rescue boards.',
      description: 'Help low-income families save on staple groceries. Scan coupon circulars, take high-quality snapshots of barcode coupons for milk, bread, or baby formula, and upload them onto our public bulletin boards.',
      domainId: 'food',
      timeCommitment: '15 mins (One-time)',
      durationAbbreviation: '15m',
      date: '2026-06-28',
      displayDate: 'Jun 28, 2026',
      location: 'Remote (Home-based)',
      impact: 'Saves families up to 25% on groceries',
      imageUri: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    },
    {
      id: 'mv-e3',
      title: 'Verify OpenStreetMap School Locations',
      shortDescription: 'Check and verify school coordinates in rural areas.',
      description: 'Use satellite imagery on your phone to confirm if flagged locations in rural India match school structures. Helps map educational access.',
      domainId: 'education',
      timeCommitment: '10 mins (One-time)',
      durationAbbreviation: '10m',
      date: '2026-06-21',
      displayDate: 'Jun 21, 2026',
      location: 'Remote (OpenStreetMap App)',
      impact: 'Validates 5 school coordinates',
      imageUri: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    },
    {
      id: 'mv-v3',
      title: 'Report Local Potholes',
      shortDescription: 'Submit road damage photos to the municipal portal.',
      description: 'Help improve pedestrian safety. Snap a photo of potholes or broken pavements on your street and upload them to the city portal in under 10 minutes.',
      domainId: 'environment',
      timeCommitment: '10 mins (One-time)',
      durationAbbreviation: '10m',
      date: '2026-06-25',
      displayDate: 'Jun 25, 2026',
      location: 'Local Neighborhood',
      impact: 'Flags road hazards for fixing',
      imageUri: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
    },
    {
      id: 'mv-h3',
      title: 'Share COVID/Flu Vaccine Clinic Info',
      shortDescription: 'Post free local vaccine clinic dates on community boards.',
      description: 'Help boost community health. Take our pre-made local vaccine clinic flyer and post it to local neighborhood chats or apartment WhatsApp groups.',
      domainId: 'health',
      timeCommitment: '15 mins (One-time)',
      durationAbbreviation: '15m',
      date: '2026-06-19',
      displayDate: 'Jun 19, 2026',
      location: 'Remote (WhatsApp/Telegram)',
      impact: 'Reaches 150+ neighbors',
      imageUri: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
    },
    {
      id: 'mv-f3',
      title: 'Log Food Expiry in Shared Fridge',
      shortDescription: 'Help audit items in the community fridge.',
      description: 'Visit the community fridge in your neighborhood, check the expiration dates of the items inside, and log them on our shared spreadsheet.',
      domainId: 'food',
      timeCommitment: '15 mins (One-time)',
      durationAbbreviation: '15m',
      date: '2026-06-28',
      displayDate: 'Jun 28, 2026',
      location: 'Community Fridge Center',
      impact: 'Prevents food wastage',
      imageUri: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=800',
    },
    {
      id: 'mv-s3',
      title: 'Transcribe Shelter Intake Forms',
      shortDescription: 'Transcribe scanned paper forms into digital records.',
      description: 'Help our local shelter go paperless. Transcribe 3 handwritten intake forms into our secure database from the comfort of your home.',
      domainId: 'shelter',
      timeCommitment: '30 mins (One-time)',
      durationAbbreviation: '30m',
      date: '2026-06-18',
      displayDate: 'Jun 18, 2026',
      location: 'Remote (Web Portal)',
      impact: 'Processes 3 resident records',
      imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    },
    {
      id: 'mv-f4',
      title: 'Sort Non-Perishables at Food Bank',
      shortDescription: 'Quickly sort donated cans by category.',
      description: 'Stop by the community food bank for a quick 30-minute session to sort incoming canned food into beans, vegetables, and soups.',
      domainId: 'food',
      timeCommitment: '30 mins (One-time)',
      durationAbbreviation: '30m',
      date: '2026-06-20',
      displayDate: 'Jun 20, 2026',
      location: 'Local Food Bank',
      impact: 'Sorts 50+ food items',
      imageUri: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800',
    },
  ],
};

const MODE_OPTIONS = ['In-person', 'Online', 'Micro volunteering'] as const;
type ModeType = typeof MODE_OPTIONS[number];

const getNext14Days = () => {
  const dates = [];
  const start = new Date(2026, 5, 18); // June 18, 2026
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = weekdays[d.getDay()];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[d.getMonth()];

    dates.push({
      dateString: dateStr,
      dayNumber: d.getDate(),
      dayName: weekday,
      monthName: monthName,
    });
  }
  return dates;
};

// Generates dynamic narrative issue hooks based on opportunity domain
const getNarrativeHook = (domainId: string): string => {
  switch (domainId) {
    case 'health':
      return 'Right now, families are struggling to find basic health navigation. Your presence and assistance bring clarity to someone during their darkest medical journey.';
    case 'education':
      return 'Every child deserves a guiding hand. Local students from underserved communities are falling behind in school, and a few hours of mentoring can rewrite a child\'s future.';
    case 'environment':
      return 'Urban pollution and climate erosion are threatening our local paths and green preserves. Restoring our local forests today ensures clean air and nature for tomorrow.';
    case 'shelter':
      return 'Hundreds of individuals are currently experiencing shelter and seasonal apparel shortages in our district. A warm meal and sorted clothing restore essential dignity in times of crisis.';
    case 'food':
      return 'Tonnes of fresh organic farm surplus goes to waste daily while children in our local neighborhoods go hungry. Harvesting ensures nutrition directly reaches local pantries.';
    default:
      return 'Community connection is the foundation of progress. By dedicating your time, you are building a stronger, more supportive local network for those who need it most.';
  }
};

// Clipped Hero Image using a whimsical 5-petal flower/cloud SVG mask
export const ClippedHeroImage: React.FC<{ imageUri: string; size: number }> = ({ imageUri, size }) => {
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', marginTop: 0, marginBottom: Spacing.s, zIndex: 10 }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id="organicShape">
            <Path d="M50 15 C60 10 75 20 78 32 C85 36 93 48 88 58 C90 70 78 82 66 82 C56 88 44 88 34 82 C22 82 10 70 12 58 C7 48 15 36 22 32 C25 20 40 10 50 15 Z" />
          </ClipPath>
        </Defs>
        <SvgImage
          href={{ uri: imageUri }}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#organicShape)"
        />
      </Svg>
    </View>
  );
};

// Whimsical Floating Background Elements (Blobs, Stars, Circles)
export const FloatingBackground: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const primaryColor = isDarkMode ? '#81C784' : '#2E7D32';
  const secondaryColor = isDarkMode ? '#64B5F6' : '#1A73E8';
  const purpleColor = isDarkMode ? '#BA68C8' : '#7B1FA2';
  const yellowColor = isDarkMode ? '#FFD54F' : '#F57F17';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Soft blob top-left */}
      <View style={{ position: 'absolute', top: 120, left: -40, opacity: 0.04 }}>
        <Svg width={130} height={130} viewBox="0 0 100 100">
          <Path d="M30 20 C50 10 70 30 80 50 C90 70 60 90 40 80 C20 70 10 30 30 20 Z" fill={primaryColor} />
        </Svg>
      </View>
      {/* Mini star top-right */}
      <View style={{ position: 'absolute', top: 70, right: 30, opacity: 0.08 }}>
        <Svg width={30} height={30} viewBox="0 0 24 24">
          <Path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill={yellowColor} />
        </Svg>
      </View>
      {/* Mini star mid-left */}
      <View style={{ position: 'absolute', top: 400, left: 20, opacity: 0.08 }}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill={purpleColor} />
        </Svg>
      </View>
      {/* Soft blob mid-right */}
      <View style={{ position: 'absolute', top: 620, right: -30, opacity: 0.04 }}>
        <Svg width={150} height={150} viewBox="0 0 100 100">
          <Path d="M20 30 C40 10 80 20 90 45 C100 70 70 95 50 85 C30 75 10 50 20 30 Z" fill={secondaryColor} />
        </Svg>
      </View>
      {/* Floating dots */}
      <View style={{ position: 'absolute', top: 220, right: 90, opacity: 0.06 }}>
        <Svg width={15} height={15}><Circle cx={7.5} cy={7.5} r={4} fill={isDarkMode ? '#FFFFFF' : '#000000'} /></Svg>
      </View>
      <View style={{ position: 'absolute', top: 520, left: 80, opacity: 0.06 }}>
        <Svg width={10} height={10}><Circle cx={5} cy={5} r={3} fill={isDarkMode ? '#FFFFFF' : '#000000'} /></Svg>
      </View>
    </View>
  );
};

// Hand-drawn/Vector Stylized Mock Map View using Svg
export const MockMapView: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const mapBg = isDarkMode ? '#1E2522' : '#F0F4F1';
  const streetColor = isDarkMode ? '#2B332F' : '#FFFFFF';
  const riverColor = isDarkMode ? '#1B2F42' : '#E0ECF8';
  const parkColor = isDarkMode ? '#152E1E' : '#E6F4EA';

  return (
    <View style={styles.mapContainer}>
      <Svg width="100%" height={150} style={{ borderRadius: 12 }}>
        {/* Background land */}
        <Rect width="100%" height={150} fill={mapBg} />
        
        {/* Park area */}
        <Path d="M10,10 H120 V80 Q90,90 60,70 T10,80 Z" fill={parkColor} />
        
        {/* River winding across */}
        <Path d="M -10,120 Q 80,100 150,130 T 400,100" stroke={riverColor} strokeWidth={12} fill="none" />

        {/* Streets grid */}
        <Line x1={150} y1={0} x2={150} y2={150} stroke={streetColor} strokeWidth={8} />
        <Line x1={280} y1={0} x2={280} y2={150} stroke={streetColor} strokeWidth={6} />
        <Line x1={0} y1={50} x2={400} y2={50} stroke={streetColor} strokeWidth={8} />
        <Line x1={0} y1={110} x2={400} y2={110} stroke={streetColor} strokeWidth={5} />

        {/* Glowing location pin */}
        <G x={200} y={75}>
          <Circle r={12} fill="rgba(216, 59, 1, 0.25)" />
          <Circle r={5} fill="#D83B01" />
        </G>
      </Svg>
      {/* Zoom / Navigation overlay indicators */}
      <View style={styles.mapControls}>
        <View style={styles.mapControlBtn}><Text style={styles.mapControlText}>+</Text></View>
        <View style={styles.mapControlBtn}><Text style={styles.mapControlText}>-</Text></View>
      </View>
    </View>
  );
};

// Continuous background winding path weaving left and right down the full scroll height
export const generateWindingPath = (w: number, h: number) => {
  const mid = w / 2;
  const startY = 480; // Starts below greeting and shifted-up hero image (approx 480px)
  
  // If h is smaller than startY + 100, fallback to safe height
  const safeH = Math.max(h, startY + 300);
  const pathH = safeH - startY;

  return `M ${mid} ${startY} ` +
         `C ${mid + 120} ${startY + pathH * 0.12}, ${w * 0.05} ${startY + pathH * 0.18}, ${w * 0.18} ${startY + pathH * 0.28} ` +
         `C ${w * 0.38} ${startY + pathH * 0.38}, ${w * 0.98} ${startY + pathH * 0.42}, ${w * 0.82} ${startY + pathH * 0.50} ` +
         `C ${w * 0.62} ${startY + pathH * 0.58}, ${w * 0.02} ${startY + pathH * 0.62}, ${w * 0.18} ${startY + pathH * 0.70} ` +
         `C ${w * 0.32} ${startY + pathH * 0.78}, ${w * 0.98} ${startY + pathH * 0.82}, ${w * 0.82} ${startY + pathH * 0.90} ` +
         `C ${w * 0.62} ${startY + pathH * 0.95}, ${mid} ${startY + pathH * 0.98}, ${mid} ${safeH - 50}`;
};

interface WizardOpportunity extends Opportunity {
  hours: number;
  isHighPriority?: boolean;
  badgeLabel?: 'Recommended for you' | 'Similar Opportunity' | null;
}

const WIZARD_MOCK_OPPORTUNITIES: WizardOpportunity[] = [
  {
    id: 'wiz-opp-1',
    title: 'Hospital Support Specialist',
    shortDescription: 'Support clinical staff in outpatient checkups and comfort patients.',
    description: 'Help coordinate patient flows and provide compassionate support to family members in outpatient waiting areas.',
    domainId: 'health',
    timeCommitment: '3 hrs per week',
    durationAbbreviation: '3h',
    hours: 3,
    date: '2026-06-29', // Monday
    displayDate: 'Jun 29, 2026',
    location: 'Community Health Clinic, Gwalior',
    impact: 'Helps 12 Patients/day',
    imageUri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80',
    isHighPriority: true,
  },
  {
    id: 'wiz-opp-2',
    title: 'Youth Reading Tutor',
    shortDescription: 'Mentor elementary kids in reading and writing after school.',
    description: 'Work one-on-one with local kids to build reading fluency, literacy confidence, and positive school habits.',
    domainId: 'education',
    timeCommitment: '2 hrs per week',
    durationAbbreviation: '2h',
    hours: 2,
    date: '2026-06-30', // Tuesday
    displayDate: 'Jun 30, 2026',
    location: 'Gwalior Public Library',
    impact: 'Empowers 3 Students',
    imageUri: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80',
    isHighPriority: true,
  },
  {
    id: 'wiz-opp-3',
    title: 'Community Garden Planting',
    shortDescription: 'Help plant community vegetable beds and organize compost.',
    description: 'Support local neighborhood planting, water vegetables, sift compost, and maintain urban green zones.',
    domainId: 'nature',
    timeCommitment: '4 hrs per week',
    durationAbbreviation: '4h',
    hours: 4,
    date: '2026-07-01', // Wednesday
    displayDate: 'Jul 1, 2026',
    location: 'Kampoo Botanical Park',
    impact: 'Greens 1 Neighborhood',
    imageUri: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=400&q=80',
    isHighPriority: false,
  },
  {
    id: 'wiz-opp-4',
    title: 'Art Gallery Docent',
    shortDescription: 'Guide guests through galleries during local arts exhibitions.',
    description: 'Introduce visitors to historical details, monitor collections, and assist art facilitators during public openings.',
    domainId: 'arts',
    timeCommitment: '6 hrs per week',
    durationAbbreviation: '6h',
    hours: 6,
    date: '2026-07-02', // Thursday
    displayDate: 'Jul 2, 2026',
    location: 'Bada Gallery of Fine Arts',
    impact: 'Inspires 50+ Visitors',
    imageUri: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80',
    isHighPriority: false,
  },
  {
    id: 'wiz-opp-5',
    title: 'Clinic Administration Assistant',
    shortDescription: 'Organize files and help patients complete check-in forms.',
    description: 'Ensure smooth operations by logging patient entries, updating digital files, and verifying scheduling records.',
    domainId: 'health',
    timeCommitment: '1 hr per week',
    durationAbbreviation: '1h',
    hours: 1,
    date: '2026-07-03', // Friday
    displayDate: 'Jul 3, 2026',
    location: 'Kampoo Outpatient Center',
    impact: 'Saves 3 hrs paperwork',
    imageUri: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    isHighPriority: false,
  },
  {
    id: 'wiz-opp-6',
    title: 'Saturday Math Club Mentor',
    shortDescription: 'Assist children with math homework and interactive games.',
    description: 'Volunteer at our weekly math circle. Guide elementary students through algebra and geometry exercises in groups.',
    domainId: 'education',
    timeCommitment: '5 hrs per week',
    durationAbbreviation: '5h',
    hours: 5,
    date: '2026-07-04', // Saturday
    displayDate: 'Jul 4, 2026',
    location: 'Bada Youth Center',
    impact: 'Inspires Math Confidence',
    imageUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
    isHighPriority: true,
  },
  {
    id: 'wiz-opp-7',
    title: 'River Cleanup Volunteer',
    shortDescription: 'Collect waste and restore banks along historical riverbanks.',
    description: 'Help remove plastic debris and clean up shorelines to protect regional ecology and support water systems.',
    domainId: 'nature',
    timeCommitment: '8 hrs per week',
    durationAbbreviation: '8h',
    hours: 8,
    date: '2026-07-05', // Sunday
    displayDate: 'Jul 5, 2026',
    location: 'Chhawani River Bank',
    impact: 'Removes 100kg Waste',
    imageUri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    isHighPriority: false,
  },
  {
    id: 'wiz-opp-8',
    title: 'Youth Mural Art Facilitator',
    shortDescription: 'Lead kids in painting a colorful neighborhood mural.',
    description: 'Teach kids simple color blocking and help them paint a positive community message on outdoor fences.',
    domainId: 'arts',
    timeCommitment: '4 hrs per week',
    durationAbbreviation: '4h',
    hours: 4,
    date: '2026-06-29', // Monday
    displayDate: 'Jun 29, 2026',
    location: 'Bada Gaon Community Center',
    impact: 'Greens 1 Concrete Wall',
    imageUri: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    isHighPriority: false,
  },
  {
    id: 'wiz-opp-9',
    title: 'Nutrition Class Assistant',
    shortDescription: 'Assist cooking instructors and organize recipe handouts.',
    description: 'Help setup prep ingredients and deliver dietary health worksheets to low-income senior citizens.',
    domainId: 'health',
    timeCommitment: '3 hrs per week',
    durationAbbreviation: '3h',
    hours: 3,
    date: '2026-06-30', // Tuesday
    displayDate: 'Jun 30, 2026',
    location: 'Chhawani Senior Care Clinic',
    impact: 'Nourishes 20 Elders',
    imageUri: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
    isHighPriority: false,
  },
  {
    id: 'wiz-opp-10',
    title: 'Digital Literacy Assistant',
    shortDescription: 'Support adults in learning basic computer skills.',
    description: 'Help adult learners navigate typing software, create email addresses, and use online search engines safely.',
    domainId: 'education',
    timeCommitment: '2 hrs per week',
    durationAbbreviation: '2h',
    hours: 2,
    date: '2026-07-01', // Wednesday
    displayDate: 'Jul 1, 2026',
    location: 'Gwalior Literacy Center',
    impact: 'Links 15 Adults Online',
    imageUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    isHighPriority: false,
  }
];

const SmartDialerWizard: React.FC<{
  isDarkMode: boolean;
  onBack: () => void;
  onSelectOpportunity: (opp: Opportunity | null) => void;
}> = ({ isDarkMode, onBack, onSelectOpportunity }) => {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  // Wizard flow stage: 1, 2, 3, or 4 (Curated Feed)
  const [currentStage, setCurrentStage] = useState(1);
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');

  // Stage 1 selections: date strings "YYYY-MM-DD"
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  // Month navigation offset: 0 = June 2026
  const [monthOffset, setMonthOffset] = useState(0);

  // Stage 2: Radial slider hours (1 to 12)
  const [selectedHours, setSelectedHours] = useState(4);
  const [isDragging, setIsDragging] = useState(false);

  // Stage 3: Selected causes (domain IDs)
  const [selectedCauses, setSelectedCauses] = useState<Set<string>>(new Set());

  // Layout center coordinates tracking for the dialer radial touch math
  const [dialCenter, setDialCenter] = useState({ x: 0, y: 0 });

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Horizontal slide animation for stages
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: -(currentStage - 1) * SCREEN_WIDTH,
      tension: 30,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [currentStage]);

  // Helper: Month name calculator
  const getMonthData = (offset: number) => {
    const baseYear = 2026;
    const baseMonth = 5; // June (0-indexed)
    const targetDate = new Date(baseYear, baseMonth + offset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    return { year, month, monthName, daysInMonth, firstDayIndex };
  };

  const { year, month, monthName, daysInMonth, firstDayIndex } = getMonthData(monthOffset);

  // Dynamic date creation function
  const generateUpcomingWeek = () => {
    return Array.from({ length: 7 }).map((_, index) => {
      const d = new Date();
      d.setDate(d.getDate() + index);
      const daysMap = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return {
        dayLabel: daysMap[d.getDay()],
        dateNum: d.getDate(),
        fullDate: d
      };
    });
  };

  // Multi-select toggle helper
  const toggleDate = (dateStr: string) => {
    const newDates = new Set(selectedDates);
    if (newDates.has(dateStr)) {
      newDates.delete(dateStr);
    } else {
      newDates.add(dateStr);
    }
    setSelectedDates(newDates);
  };

  const toggleCause = (domainId: string) => {
    const newCauses = new Set(selectedCauses);
    if (newCauses.has(domainId)) {
      newCauses.delete(domainId);
    } else {
      newCauses.add(domainId);
    }
    setSelectedCauses(newCauses);
  };

  // Radial touch responders
  const handleRadialTouch = (gestureState: any) => {
    const angle = Math.atan2(gestureState.moveY - dialCenter.y, gestureState.moveX - dialCenter.x) + Math.PI / 2;
    let adjustedAngle = angle;
    if (adjustedAngle < 0) {
      adjustedAngle += 2 * Math.PI;
    }
    const hours = Math.round((adjustedAngle / (2 * Math.PI)) * 12);
    const clampedHours = Math.max(1, Math.min(12, hours));
    setSelectedHours(clampedHours);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        setIsDragging(true);
        handleRadialTouch(gestureState);
      },
      onPanResponderMove: (evt, gestureState) => {
        handleRadialTouch(gestureState);
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
    })
  ).current;

  // Filter logic for Curated Feed (Primary, Secondary, Tertiary matches)
  let matchedOpps = WIZARD_MOCK_OPPORTUNITIES.filter(opp => {
    // 1. Filter by Cause selected
    if (selectedCauses.size > 0 && !selectedCauses.has(opp.domainId)) {
      return false;
    }
    // 2. Filter by Date selected
    if (selectedDates.size > 0 && !selectedDates.has(opp.date)) {
      return false;
    }
    // 3. Filter by Allocated Hours
    if (opp.hours > selectedHours) {
      return false;
    }
    return true;
  }).map(opp => ({ ...opp, badgeLabel: null as (null | 'Recommended for you' | 'Similar Opportunity') }));

  let isFallback = false;

  // Secondary Fallback: If exact matches are fewer than 2, lift days/hours constraints and filter by Causes
  if (matchedOpps.length < 2) {
    const secondaryMatches = WIZARD_MOCK_OPPORTUNITIES.filter(opp => {
      if (selectedCauses.size > 0 && !selectedCauses.has(opp.domainId)) {
        return false;
      }
      return true;
    }).map(opp => ({ ...opp, badgeLabel: 'Similar Opportunity' as const }));

    if (secondaryMatches.length > 0) {
      matchedOpps = secondaryMatches;
      isFallback = true;
    }
  }

  // Tertiary Fallback: If zero matches exist, bypass filters and display 3 High Priority featured cards
  if (matchedOpps.length === 0) {
    matchedOpps = WIZARD_MOCK_OPPORTUNITIES.filter(opp => opp.isHighPriority)
      .slice(0, 3)
      .map(opp => ({ ...opp, badgeLabel: 'Recommended for you' as const }));
  }

  const filteredOpps = matchedOpps;

  // Render sub-stages
  const renderStage1 = () => {
    return (
      <View style={[styles.stageCard, { width: SCREEN_WIDTH }]}>
        <Text style={[styles.stageHeaderTitle, { color: '#ffffff' }]}>For what dates are you available?</Text>
        
        {/* Toggle selector switcher */}
        <View style={styles.tabSelectorRow}>
          <Pressable
            onPress={() => setActiveTab('week')}
            style={[styles.tabSelectorBtn, activeTab === 'week' && styles.tabSelectorActive]}
          >
            <Text style={[styles.tabSelectorText, activeTab === 'week' ? { color: '#ffffff', fontWeight: 'bold' } : { color: '#888' }]}>
              Upcoming week
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('month')}
            style={[styles.tabSelectorBtn, activeTab === 'month' && styles.tabSelectorActive]}
          >
            <Text style={[styles.tabSelectorText, activeTab === 'month' ? { color: '#ffffff', fontWeight: 'bold' } : { color: '#888' }]}>
              Upcoming month
            </Text>
          </Pressable>
        </View>

        {activeTab === 'week' ? (
          /* Tab A: Upcoming week horizontal strip */
          <View style={styles.daysStripContainer}>
            {generateUpcomingWeek().map((day) => {
              const dateStr = day.fullDate.toISOString().split('T')[0];
              const isSelected = selectedDates.has(dateStr);
              return (
                <Pressable
                  key={dateStr}
                  onPress={() => toggleDate(dateStr)}
                  style={[
                    styles.weekDayColumn,
                    isSelected ? { backgroundColor: '#0f6cbd' } : { backgroundColor: '#202230' }
                  ]}
                >
                  <Text style={[styles.weekDayLabel, isSelected ? { color: '#ffffff' } : { color: '#888' }]}>
                    {day.dayLabel}
                  </Text>
                  <Text style={[styles.weekDayNumber, isSelected ? { color: '#ffffff', fontWeight: 'bold' } : { color: '#ffffff' }]}>
                    {day.dateNum}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          /* Tab B: Upcoming month monthly grid view */
          <View style={styles.calendarCard}>
            <View style={styles.calendarMonthHeader}>
              <Pressable onPress={() => setMonthOffset(monthOffset - 1)} style={styles.calendarNavBtn}>
                <Ionicons name="chevron-back" size={16} color="#ffffff" />
              </Pressable>
              <Text style={styles.calendarMonthName}>{monthName} {year}</Text>
              <Pressable onPress={() => setMonthOffset(monthOffset + 1)} style={styles.calendarNavBtn}>
                <Ionicons name="chevron-forward" size={16} color="#ffffff" />
              </Pressable>
            </View>

            {/* Calendar header row */}
            <View style={styles.calendarDaysHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={i} style={styles.calendarDaysHeaderText}>{d}</Text>
              ))}
            </View>

            {/* Monthly grid */}
            <View style={styles.calendarGrid}>
              {(() => {
                const cells = [];
                // Pad first days
                for (let i = 0; i < firstDayIndex; i++) {
                  cells.push(<View key={`empty-${i}`} style={styles.calendarCellEmpty} />);
                }
                // Days list
                for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                  const dayDate = new Date(year, month, dayNum);
                  const dateStr = dayDate.toISOString().split('T')[0];
                  const isSelected = selectedDates.has(dateStr);
                  cells.push(
                    <Pressable
                      key={dateStr}
                      onPress={() => toggleDate(dateStr)}
                      style={[
                        styles.calendarCell,
                        isSelected && { backgroundColor: 'rgba(255, 170, 68, 0.25)', borderColor: '#ffaa44', borderWidth: 1 }
                      ]}
                    >
                      <Text style={[styles.calendarCellText, isSelected ? { color: '#ffaa44', fontWeight: 'bold' } : { color: '#ffffff' }]}>
                        {dayNum}
                      </Text>
                    </Pressable>
                  );
                }
                return cells;
              })()}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderStage2 = () => {
    // Coordinate maps for handle
    const radius = 80;
    const center = 110;
    const angle = (selectedHours / 12) * 2 * Math.PI;
    // Radial offset from top center going clockwise
    const handAngle = angle - Math.PI / 2;
    const handleX = center + radius * Math.cos(handAngle);
    const handleY = center + radius * Math.sin(handAngle);
    
    // Large arc flag
    const largeArc = selectedHours > 6 ? 1 : 0;
    
    // SVG path string for arc
    // End collision fallback: if 12, push slightly back
    const endX = selectedHours === 12 ? center + radius * Math.cos(-Math.PI/2 - 0.01) : handleX;
    const endY = selectedHours === 12 ? center + radius * Math.sin(-Math.PI/2 - 0.01) : handleY;
    const arcPath = `M 110,30 A 80,80 0 ${largeArc} 1 ${endX},${endY}`;

    return (
      <View style={[styles.stageCard, { width: SCREEN_WIDTH }]}>
        <Text style={[styles.stageHeaderTitle, { color: '#ffffff' }]}>Hours I am willing to contribute</Text>
        
        {/* Responsive Custom Circular Dial */}
        <View style={styles.dialerSliderWrapper}>
          <View
            style={styles.dialerBackgroundCircle}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              setDialCenter({ x: x + width / 2, y: y + height / 2 });
            }}
          >
            <Svg width={220} height={220} {...panResponder.panHandlers}>
              {/* Thin Outer Gray Path */}
              <Circle cx={110} cy={110} r={80} stroke="#333547" strokeWidth={6} fill="none" />
              {/* Vibrant Accent Progress Arc */}
              <Path d={arcPath} stroke="#479ef5" strokeWidth={8} fill="none" strokeLinecap="round" />
              {/* Glowing circular handle knob node */}
              <Circle cx={handleX} cy={handleY} r={12} fill="#479ef5" stroke="#ffffff" strokeWidth={2} />
            </Svg>
            
            {/* Core numerical display readout inside center ring */}
            <View style={styles.dialerCenterValueBox}>
              <Text style={styles.dialerCenterValueText}>{selectedHours}</Text>
              <Text style={styles.dialerCenterUnitText}>{selectedHours === 1 ? 'HOUR' : 'HOURS'}</Text>
              <Text style={styles.dialerCenterSubtext}>per session</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStage3 = () => {
    return (
      <View style={[styles.stageCard, { width: SCREEN_WIDTH }]}>
        <Text style={[styles.stageHeaderTitle, { color: '#ffffff' }]}>Choose your causes</Text>
        
        {/* Multi-Select Icon Grid */}
        <View style={styles.causeGridContainer}>
          {DOMAINS.map((dom) => {
            const isSelected = selectedCauses.has(dom.id);
            return (
              <Pressable
                key={dom.id}
                onPress={() => toggleCause(dom.id)}
                style={[
                  styles.causeGridItem,
                  isSelected ? { borderColor: '#479ef5', backgroundColor: '#202336' } : { borderColor: 'rgba(255,255,255,0.06)', backgroundColor: '#171821' }
                ]}
              >
                <View style={[styles.causeIconWrapper, isSelected ? { backgroundColor: '#0f6cbd' } : { backgroundColor: '#333547' }]}>
                  <Ionicons name={dom.icon} size={24} color="#ffffff" />
                </View>
                <Text style={styles.causeItemLabel}>{dom.name}</Text>
                
                {/* Active checkmark glow */}
                {isSelected && (
                  <View style={styles.causeCheckmarkGlow}>
                    <Ionicons name="checkmark-circle" size={16} color="#479ef5" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  // Render Curated Feed view (Stage 4)
  const renderCuratedFeed = () => {
    // Generate dates summary chip label
    const formatDatesChip = () => {
      if (selectedDates.size === 0) return 'Any Dates';
      const arr = Array.from(selectedDates).map(dateStr => {
        const d = new Date(dateStr);
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      });
      const unique = Array.from(new Set(arr));
      return unique.join(' • ');
    };

    // Cause names labels mapping
    const formatCausesChip = () => {
      if (selectedCauses.size === 0) return 'Any Causes';
      return Array.from(selectedCauses).map(id => {
        return (DOMAINS.find(d => d.id === id) || { name: '' }).name;
      }).join(' • ');
    };

    return (
      <SafeAreaView style={[styles.wizardContainer, { backgroundColor: '#171821' }]}>
        {/* Top Header */}
        <View style={styles.curatedHeader}>
          <Pressable onPress={() => setCurrentStage(3)} style={styles.curatedBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.curatedBackBtnText}>Back</Text>
          </Pressable>
          <Text style={styles.curatedHeaderTitle}>Curated for you</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Dynamic dismissible chip filter row */}
        <View style={styles.filterChipRowWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipRow}>
            {selectedDates.size > 0 && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>[{formatDatesChip()}]</Text>
                <Pressable onPress={() => setSelectedDates(new Set())} style={styles.chipCloseBtn}>
                  <Ionicons name="close-circle" size={14} color="#a0a5c0" />
                </Pressable>
              </View>
            )}

            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>[{selectedHours} hrs]</Text>
              <Pressable onPress={() => setSelectedHours(12)} style={styles.chipCloseBtn}>
                <Ionicons name="close-circle" size={14} color="#a0a5c0" />
              </Pressable>
            </View>

            {selectedCauses.size > 0 && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>[{formatCausesChip()}]</Text>
                <Pressable onPress={() => setSelectedCauses(new Set())} style={styles.chipCloseBtn}>
                  <Ionicons name="close-circle" size={14} color="#a0a5c0" />
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Dynamic listing of matched opportunity cards */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.m }}>
          {filteredOpps.length === 0 ? (
            <View style={styles.emptyFeedBox}>
              <Ionicons name="sad-outline" size={48} color="#a0a5c0" />
              <Text style={styles.emptyFeedText}>No curated opportunities match your dialer filters.</Text>
            </View>
          ) : (
            filteredOpps.map(opp => {
              const domainConfig = DOMAINS.find(d => d.id === opp.domainId) || DOMAINS[0];
              return (
                <Pressable
                  key={opp.id}
                  onPress={() => onSelectOpportunity(opp)}
                  style={({ pressed }) => [
                    styles.curatedOppCard,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] }
                  ]}
                >
                  <Image source={{ uri: opp.imageUri }} style={styles.curatedCardImg} />
                  <View style={styles.curatedCardDetails}>
                    {opp.badgeLabel && (
                      <View style={styles.fallbackBadge}>
                        <Ionicons name="sparkles" size={10} color="#479ef5" style={{ marginRight: 3 }} />
                        <Text style={styles.fallbackBadgeText}>{opp.badgeLabel}</Text>
                      </View>
                    )}
                    <Text style={styles.curatedCardTitle} numberOfLines={1}>{opp.title}</Text>
                    <Text style={styles.curatedCardDesc} numberOfLines={2}>{opp.shortDescription}</Text>
                    <View style={styles.curatedCardMeta}>
                      <View style={[styles.curatedCategoryBadge, { backgroundColor: domainConfig.lightBg }]}>
                        <Text style={styles.curatedBadgeText}>{domainConfig.name}</Text>
                      </View>
                      <Text style={styles.curatedCardDuration}>{opp.durationAbbreviation}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

  // If curated feed is triggered, load it
  if (currentStage === 4) {
    return renderCuratedFeed();
  }

  return (
    <SafeAreaView style={[styles.wizardContainer, { backgroundColor: '#171821' }]}>
      {/* Persistent Header */}
      <View style={styles.wizardHeader}>
        <Pressable
          onPress={() => {
            if (currentStage > 1) {
              setCurrentStage(currentStage - 1);
            } else {
              onBack();
            }
          }}
          style={styles.headerBackBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#479ef5" />
          <Text style={[styles.headerBackText, { color: '#479ef5' }]}>Back</Text>
        </Pressable>
        <Text style={styles.wizardHeaderTitle}>Smart Dialer Search</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Pages Container Row */}
      <View style={styles.stagesViewport}>
        <Animated.View style={[{ flexDirection: 'row', width: SCREEN_WIDTH * 3 }, { transform: [{ translateX: slideAnim }] }]}>
          {renderStage1()}
          {renderStage2()}
          {renderStage3()}
        </Animated.View>
      </View>

      {/* Persistent Footer Controls */}
      <View style={styles.wizardFooter}>
        <Pressable
          onPress={() => {
            if (currentStage > 1) {
              setCurrentStage(currentStage - 1);
            } else {
              onBack();
            }
          }}
          style={styles.footerSecondaryBtn}
        >
          <Text style={styles.footerSecondaryBtnText}>← Back</Text>
        </Pressable>

        {/* Progress dots indicator */}
        <View style={styles.progressDotsRow}>
          {[1, 2, 3].map(stg => (
            <View
              key={stg}
              style={[
                styles.progressDot,
                currentStage === stg ? { backgroundColor: '#479ef5' } : { backgroundColor: '#333547' }
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={() => {
            if (currentStage < 3) {
              setCurrentStage(currentStage + 1);
            } else {
              // Trigger Stage 4 Curated Feed
              setCurrentStage(4);
            }
          }}
          style={styles.footerPrimaryBtn}
        >
          <Text style={styles.footerPrimaryBtnText}>
            {currentStage === 3 ? 'Show Curated Feed' : 'Next >'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export const Feed: React.FC<FeedProps> = ({
  isDarkMode = false,
  activeMode: propActiveMode,
  onChangeActiveMode,
  timeFilter,
  onChangeTimeFilter,
  selectedOpportunity: propSelectedOpportunity,
  onSelectOpportunity,
  activeDomainId: propActiveDomainId,
  onChangeActiveDomainId,
  onViewNgo,
}) => {
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  const [localActiveMode, setLocalActiveMode] = useState<ModeType>('In-person');
  const activeMode = propActiveMode !== undefined ? propActiveMode : localActiveMode;
  const setActiveMode = (mode: ModeType) => {
    if (onChangeActiveMode) {
      onChangeActiveMode(mode);
    } else {
      setLocalActiveMode(mode);
    }
  };

  const [activeDomainIndex, setActiveDomainIndex] = useState(0);

  const [localSelectedOpportunity, setLocalSelectedOpportunity] = useState<Opportunity | null>(null);
  const selectedOpportunity = propSelectedOpportunity !== undefined ? propSelectedOpportunity : localSelectedOpportunity;
  const setSelectedOpportunity = (opp: Opportunity | null) => {
    if (onSelectOpportunity) {
      onSelectOpportunity(opp);
    } else {
      setLocalSelectedOpportunity(opp);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeView, setActiveView] = useState<'feed' | 'map' | 'dialer_wizard'>('feed');

  // Animation values for Search interaction
  const searchBlurAnim = useRef(new Animated.Value(0)).current;
  const searchPanelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSearchFocused) {
      Animated.parallel([
        Animated.timing(searchBlurAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(searchPanelAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(searchBlurAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(searchPanelAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSearchFocused]);

  // Date Filter States
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<'all' | 'today' | 'tomorrow' | 'weekend' | 'week' | 'customDate'>('all');
  const [selectedCustomDate, setSelectedCustomDate] = useState('');

  // Details Modal Scroll height tracking
  const [detailContentHeight, setDetailContentHeight] = useState(1500);

  const sectionListRef = useRef<SectionList<Opportunity>>(null);
  const isProgrammaticScroll = useRef(false);

  // Background color animation variables (fade direct transition)
  const defaultColor = isDarkMode ? DOMAINS[0].darkBg : DOMAINS[0].lightBg;
  const [colors, setColors] = useState({ prev: defaultColor, curr: defaultColor });
  const colorAnim = useRef(new Animated.Value(1)).current;

  // Track active domain change and trigger background color transition
  useEffect(() => {
    const newColor = isDarkMode
      ? DOMAINS[activeDomainIndex].darkBg
      : DOMAINS[activeDomainIndex].lightBg;

    if (newColor !== colors.curr) {
      setColors({
        prev: colors.curr,
        curr: newColor,
      });
      colorAnim.setValue(0);
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start();
    }
  }, [activeDomainIndex, isDarkMode]);

  // Synchronize domain index and list scroll positioning when activeDomainId prop changes from parent
  useEffect(() => {
    if (propActiveDomainId) {
      const idx = DOMAINS.findIndex(d => d.id === propActiveDomainId);
      if (idx !== -1 && idx !== activeDomainIndex) {
        setActiveDomainIndex(idx);
        
        // Find section index dynamically
        const allSecs = getFilteredSections(activeMode, searchQuery);
        const visSecs = allSecs.filter(s => s.data.length > 0);
        const sIndex = visSecs.findIndex(s => s.domainId === propActiveDomainId);
        if (sIndex !== -1) {
          try {
            sectionListRef.current?.scrollToLocation({
              sectionIndex: sIndex,
              itemIndex: 0,
              viewOffset: 0,
              viewPosition: 0,
              animated: true,
            });
          } catch (e) {
            // Catch potential layout-not-ready issues
          }
        }
      }
    }
  }, [propActiveDomainId]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.prev, colors.curr],
  });

  // Check if an opportunity matches the selected date filter
  const matchesDateFilter = (opp: Opportunity) => {
    if (selectedFilterType === 'all') return true;
    if (selectedFilterType === 'today') return opp.date === '2026-06-18';
    if (selectedFilterType === 'tomorrow') return opp.date === '2026-06-19';
    if (selectedFilterType === 'weekend') return opp.date === '2026-06-20' || opp.date === '2026-06-21';
    if (selectedFilterType === 'week') {
      const oppDateStr = opp.date;
      return oppDateStr >= '2026-06-18' && oppDateStr <= '2026-06-25';
    }
    if (selectedFilterType === 'customDate') return opp.date === selectedCustomDate;
    return true;
  };

  // Filter and generate sections for SectionList based on activeMode, searchQuery, and date filters
  const getFilteredSections = (mode: ModeType, query: string) => {
    const opps = MOCK_OPPORTUNITIES[mode] || [];
    const cleanQuery = query.trim().toLowerCase();

    return DOMAINS.map(domain => {
      const filteredOpps = opps.filter(o => {
        if (o.domainId !== domain.id) return false;
        
        // Apply date-wise filter
        if (!matchesDateFilter(o)) return false;

        // Apply time-wise filter if specified
        if (timeFilter !== undefined) {
          const commitmentMins = parseInt(o.durationAbbreviation.replace(/[^0-9]/g, ''), 10);
          if (isNaN(commitmentMins) || commitmentMins !== timeFilter) {
            return false;
          }
        }

        // Apply text search filter
        if (!cleanQuery) return true;
        return (
          o.title.toLowerCase().includes(cleanQuery) ||
          o.shortDescription.toLowerCase().includes(cleanQuery) ||
          o.location.toLowerCase().includes(cleanQuery) ||
          o.description.toLowerCase().includes(cleanQuery) ||
          domain.name.toLowerCase().includes(cleanQuery)
        );
      });
      return {
        title: domain.name,
        domainId: domain.id,
        data: filteredOpps,
      };
    });
  };

  const allFilteredSections = getFilteredSections(activeMode, searchQuery);
  const visibleSections = allFilteredSections.filter(s => s.data.length > 0);

  // Checks if a domain is currently visible in the filtered results
  const isDomainVisible = (domainId: string) => {
    return visibleSections.some(s => s.domainId === domainId);
  };

  // Reset all filters (text & date)
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFilterType('all');
    setSelectedCustomDate('');
    if (onChangeTimeFilter) {
      onChangeTimeFilter(undefined);
    }
  };

  // Handle tab mode selection
  const handleModeChange = (mode: ModeType) => {
    setActiveMode(mode);
    setSearchQuery('');
    setSelectedFilterType('all');
    setSelectedCustomDate('');
    setActiveDomainIndex(0);
    isProgrammaticScroll.current = true;

    const targetColor = isDarkMode ? DOMAINS[0].darkBg : DOMAINS[0].lightBg;
    setColors({ prev: targetColor, curr: targetColor });
    colorAnim.setValue(1);

    try {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        viewOffset: 0,
        viewPosition: 0,
        animated: false,
      });
    } catch (error) {
      // Catch potential missing layout errors
    }

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 200);
  };

  // Scroll to section when a sidebar item is tapped (only if visible)
  const handleDomainPress = (domainId: string) => {
    const sectionIndex = visibleSections.findIndex(s => s.domainId === domainId);
    const domainIndex = DOMAINS.findIndex(d => d.id === domainId);
    if (sectionIndex === -1 || domainIndex === -1) return;

    isProgrammaticScroll.current = true;
    setActiveDomainIndex(domainIndex);
    if (onChangeActiveDomainId) {
      onChangeActiveDomainId(domainId);
    }

    const newColor = isDarkMode ? DOMAINS[domainIndex].darkBg : DOMAINS[domainIndex].lightBg;
    if (newColor !== colors.curr) {
      setColors({
        prev: colors.curr,
        curr: newColor,
      });
      colorAnim.setValue(0);
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start();
    }

    try {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: sectionIndex,
        itemIndex: 0,
        viewOffset: 0,
        viewPosition: 0,
        animated: true,
      });
    } catch (error) {
      console.warn('Scroll failed:', error);
    }

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600);
  };

  // Sync scroll positioning with active sidebar element
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (isProgrammaticScroll.current) return;

    if (viewableItems && viewableItems.length > 0) {
      const firstVisible = viewableItems.find(item => item.isViewable && item.section !== undefined);
      if (firstVisible && firstVisible.section) {
        const sectionId = firstVisible.section.domainId;
        const index = DOMAINS.findIndex(d => d.id === sectionId);
        if (index !== -1 && index !== activeDomainIndex) {
          setActiveDomainIndex(index);
          if (onChangeActiveDomainId) {
            onChangeActiveDomainId(sectionId);
          }
        }
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 35,
    minimumViewTime: 10,
  }).current;

  // Render opportunities items
  const renderItem = ({ item }: { item: Opportunity }) => {
    const domainConfig = DOMAINS.find(d => d.id === item.domainId) || DOMAINS[0];
    const cardBgColor = isDarkMode ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.9)';
    const cardBorderColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const iconContainerBg = isDarkMode ? domainConfig.darkBg : domainConfig.lightBg;
    const iconColor = isDarkMode ? domainConfig.darkAccent : domainConfig.lightAccent;

    return (
      <Pressable
        onPress={() => setSelectedOpportunity(item)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: cardBgColor,
            borderColor: cardBorderColor,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {/* Redesigned Card Left Side: prominent Duration Circle Badge */}
        <View style={[styles.cardDurationContainer, { backgroundColor: iconContainerBg }]}>
          <Text style={[Typography.captionStrong, { color: iconColor, fontSize: 13, fontWeight: '700' }]}>
            {item.durationAbbreviation}
          </Text>
        </View>

        {/* Right Details */}
        <View style={styles.cardTextContainer}>
          <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1 }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[Typography.caption, { color: themeColors.neutralForeground2, marginTop: 2 }]} numberOfLines={2}>
            {item.shortDescription}
          </Text>

          {/* Quick Info Tags: Date swapped in place of commitment duration */}
          <View style={styles.cardMetaRow}>
            <View style={styles.cardMetaItem}>
              <Ionicons name="calendar-outline" size={12} color={themeColors.neutralForeground3} />
              <Text style={[Typography.caption, styles.cardMetaText, { color: themeColors.neutralForeground3 }]}>
                {item.displayDate}
              </Text>
            </View>
            {/* Wrap-safe Location Tag with flexbox fix to prevent vertical squishing */}
            <View style={[styles.cardMetaItem, { flex: 1, minWidth: 120, flexShrink: 1 }]}>
              <Ionicons name="location-outline" size={12} color={themeColors.neutralForeground3} style={{ flexShrink: 0 }} />
              <Text style={[Typography.caption, styles.cardMetaText, { color: themeColors.neutralForeground3, flex: 1 }]}>
                {item.location}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // Get active domain colors inside modal context
  const modalDomain = selectedOpportunity
    ? (DOMAINS.find(d => d.id === selectedOpportunity.domainId) || DOMAINS[0])
    : DOMAINS[0];
  const modalAccentColor = isDarkMode ? modalDomain.darkAccent : modalDomain.lightAccent;

  if (activeView === 'map') {
    return (
      <OpportunityMapScreen
        isDarkMode={isDarkMode}
        onBack={() => setActiveView('feed')}
        onSelectOpportunity={setSelectedOpportunity}
      />
    );
  }

  if (activeView === 'dialer_wizard') {
    return (
      <SmartDialerWizard
        isDarkMode={isDarkMode}
        onBack={() => setActiveView('feed')}
        onSelectOpportunity={setSelectedOpportunity}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.neutralBackground2 }]}>
      {/* 1. Local Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: themeColors.neutralBackground1 },
          isSearchFocused && { zIndex: 50, elevation: 6 }
        ]}
      >
        <View
          style={[
            styles.searchBar,
            {
              borderColor: isSearchFocused ? themeColors.brandForeground1 : themeColors.neutralStroke2,
              backgroundColor: themeColors.neutralBackground1,
            },
          ]}
        >
          {isSearchFocused ? (
            <Pressable
              onPress={() => {
                setIsSearchFocused(false);
                Keyboard.dismiss();
              }}
              style={{ marginRight: Spacing.xs }}
            >
              <Ionicons name="arrow-back" size={20} color={themeColors.brandForeground1} />
            </Pressable>
          ) : (
            <Ionicons
              name="search-outline"
              size={18}
              color={themeColors.neutralForeground3}
              style={{ marginRight: Spacing.xs }}
            />
          )}
          <TextInput
            placeholder="Search opportunities..."
            placeholderTextColor={themeColors.neutralForeground3}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: themeColors.neutralForeground1 }]}
            onFocus={() => setIsSearchFocused(true)}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={{ padding: Spacing.xxs }}
            >
              <Ionicons name="close-circle" size={18} color={themeColors.neutralForeground3} />
            </Pressable>
          ) : (
            isSearchFocused && (
              <Pressable
                onPress={() => {
                  setIsSearchFocused(false);
                  Keyboard.dismiss();
                }}
                style={{ padding: Spacing.xxs }}
              >
                <Ionicons name="close" size={18} color={themeColors.neutralForeground3} />
              </Pressable>
            )
          )}
        </View>
      </View>

      {/* 2. Top Header Row: Filter settings icon (Left) & Minimalist Right-Aligned Underline Tabs (Right) */}
      <View style={[styles.headerRow, { backgroundColor: themeColors.neutralBackground1, borderBottomColor: themeColors.neutralStroke2 }]}>
        {/* Left Area (Filter Icon) - sits exactly above the 76px sidebar */}
        <View style={styles.filterIconContainer}>
          <Pressable
            onPress={() => setFilterModalVisible(true)}
            style={({ pressed }) => [
              styles.filterButton,
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: selectedFilterType !== 'all' ? themeColors.brandBackgroundSubtle : 'transparent',
                borderRadius: 8,
              }
            ]}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={selectedFilterType !== 'all' ? themeColors.brandForeground1 : themeColors.neutralForeground1}
            />
            {selectedFilterType !== 'all' && (
              <View style={[styles.filterIndicatorDot, { backgroundColor: themeColors.brandForeground1 }]} />
            )}
          </Pressable>
        </View>

        {/* Right Area (Tabs) - sits exactly above the main feed */}
        <View style={styles.tabsContainer}>
          {MODE_OPTIONS.map(mode => {
            const isSelected = activeMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => handleModeChange(mode)}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    Typography.bodyStrong,
                    {
                      color: isSelected ? themeColors.brandForeground1 : themeColors.neutralForeground3,
                      paddingVertical: Spacing.s,
                      fontSize: 12,
                    },
                  ]}
                >
                  {mode}
                </Text>
                {isSelected && (
                  <View style={[styles.tabUnderline, { backgroundColor: themeColors.brandForeground1 }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3. Core Layout (Two-Column with Seamless Color Flow) */}
      <Animated.View style={[styles.contentLayout, { backgroundColor }]}>
        {/* Left Sidebar - Transparent (Color Bleeds Through) */}
        <View style={styles.sidebar}>
          {DOMAINS.map((domain, index) => {
            const isActive = activeDomainIndex === index;
            const isVisible = isDomainVisible(domain.id);

            // Active domain is transparent to let dynamic color bleed, inactive ones are solid cards
            const sidebarItemBg = isActive
              ? 'transparent'
              : (isDarkMode ? '#222222' : '#FFFFFF');

            let iconColor = isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.35)';
            let textColor = isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.35)';

            if (!isVisible) {
              iconColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
              textColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
            } else if (isActive) {
              iconColor = isDarkMode ? domain.darkAccent : domain.lightAccent;
              textColor = isDarkMode ? '#FFFFFF' : '#000000';
            }

            return (
              <Pressable
                key={domain.id}
                onPress={() => handleDomainPress(domain.id)}
                style={[
                  styles.sidebarItem,
                  {
                    backgroundColor: sidebarItemBg,
                    opacity: isVisible ? 1 : 0.4,
                  },
                  !isActive && styles.inactiveSidebarItemShadow,
                ]}
                disabled={!isVisible}
              >
                <View style={styles.sidebarIconWrapper}>
                  <Ionicons name={domain.icon} size={22} color={iconColor} />
                </View>
                <Text
                  style={[
                    isActive ? Typography.captionStrong : Typography.caption,
                    { color: textColor, fontSize: 10, marginTop: 4, fontWeight: isActive ? '700' : '400' },
                  ]}
                  numberOfLines={1}
                >
                  {domain.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Right Main Feed Area - Transparent Container */}
        <View style={styles.mainFeed}>
          {visibleSections.length > 0 ? (
            <SectionList
              ref={sectionListRef}
              sections={visibleSections}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              renderSectionHeader={({ section: { title, domainId } }) => {
                const domain = DOMAINS.find(d => d.id === domainId) || DOMAINS[0];
                const headerTextColor = isDarkMode ? domain.darkAccent : domain.lightAccent;
                return (
                  <View style={styles.sectionHeader}>
                    <Text style={[Typography.bodyStrong, { color: headerTextColor, fontSize: 12, letterSpacing: 1 }]}>
                      {title.toUpperCase()}
                    </Text>
                    <View style={[styles.sectionHeaderLine, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} />
                  </View>
                );
              }}
              contentContainerStyle={styles.listContent}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              showsVerticalScrollIndicator={false}
              bounces={true}
              stickySectionHeadersEnabled={false}
              onScrollToIndexFailed={({ index }) => {
                sectionListRef.current?.scrollToLocation({
                  sectionIndex: index,
                  itemIndex: 0,
                  animated: false,
                });
              }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={themeColors.neutralForegroundDisabled} style={{ opacity: 0.6 }} />
              <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground2, marginTop: Spacing.s }]}>
                No opportunities match filters
              </Text>
              <Text style={[Typography.caption, { color: themeColors.neutralForeground3, marginTop: Spacing.xxs, textAlign: 'center', marginHorizontal: Spacing.l }]}>
                Try adjusting your search terms or selecting a different date range.
              </Text>
              <Button
                label="Reset All Filters"
                onPress={handleResetFilters}
                appearance="Primary"
                isDarkMode={isDarkMode}
                style={{ marginTop: Spacing.s }}
              />
            </View>
          )}
        </View>
      </Animated.View>

      {/* 4. Custom Date Filter Bottom Sheet Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={[styles.filterSheetContainer, { backgroundColor: themeColors.neutralBackground1 }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheetHandle, { backgroundColor: themeColors.neutralStroke2 }]} />

            <View style={styles.filterSheetHeader}>
              <Text style={[Typography.subtitle, { color: themeColors.neutralForeground1 }]}>
                Filter by Date
              </Text>
              <Pressable onPress={() => setFilterModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={themeColors.neutralForeground1} />
              </Pressable>
            </View>

            {/* Quick Ranges */}
            <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, marginHorizontal: Spacing.m, marginTop: Spacing.s }]}>
              Quick Ranges
            </Text>
            <View style={styles.quickRangesContainer}>
              {[
                { label: 'All Dates', type: 'all' },
                { label: 'Today (Jun 18)', type: 'today' },
                { label: 'Tomorrow (Jun 19)', type: 'tomorrow' },
                { label: 'This Weekend (Jun 20-21)', type: 'weekend' },
                { label: 'Next 7 Days', type: 'week' },
              ].map(range => {
                const isSelected = selectedFilterType === range.type;
                return (
                  <Pressable
                    key={range.type}
                    onPress={() => {
                      setSelectedFilterType(range.type as any);
                      setSelectedCustomDate('');
                    }}
                    style={[
                      styles.quickRangeItem,
                      {
                        backgroundColor: isSelected ? themeColors.brandBackground : themeColors.neutralBackground3,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.captionStrong,
                        { color: isSelected ? '#FFFFFF' : themeColors.neutralForeground2 },
                      ]}
                    >
                      {range.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Date Strip */}
            <Text style={[Typography.bodyStrong, { color: themeColors.neutralForeground1, marginHorizontal: Spacing.m, marginTop: Spacing.m }]}>
              Select Specific Date
            </Text>
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateCarousel}
                contentContainerStyle={styles.dateCarouselContent}
              >
                {getNext14Days().map(day => {
                  const isSelected = selectedFilterType === 'customDate' && selectedCustomDate === day.dateString;
                  return (
                    <Pressable
                      key={day.dateString}
                      onPress={() => {
                        setSelectedFilterType('customDate');
                        setSelectedCustomDate(day.dateString);
                      }}
                      style={[
                        styles.dateCarouselItem,
                        {
                          backgroundColor: isSelected ? themeColors.brandBackground : themeColors.neutralBackground3,
                          borderColor: isSelected ? themeColors.brandForeground1 : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[Typography.caption, { color: isSelected ? '#FFFFFF' : themeColors.neutralForeground3, fontSize: 8 }]}>
                        {day.dayName.toUpperCase()}
                      </Text>
                      <Text style={[Typography.bodyStrong, { color: isSelected ? '#FFFFFF' : themeColors.neutralForeground1, fontSize: 15, marginVertical: 1 }]}>
                        {day.dayNumber}
                      </Text>
                      <Text style={[Typography.caption, { color: isSelected ? '#FFFFFF' : themeColors.neutralForeground3, fontSize: 8 }]}>
                        {day.monthName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.sheetActionContainer}>
              <Button
                label="Clear Filter"
                onPress={() => {
                  setSelectedFilterType('all');
                  setSelectedCustomDate('');
                  setFilterModalVisible(false);
                }}
                appearance="Secondary"
                isDarkMode={isDarkMode}
                style={{ flex: 1 }}
              />

              <Button
                label="Apply Filter"
                onPress={() => setFilterModalVisible(false)}
                appearance="Primary"
                isDarkMode={isDarkMode}
                style={{ flex: 2 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Search Overlay & Options Panel */}
      {isSearchFocused && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 40 }]}
          onPress={() => {
            setIsSearchFocused(false);
            Keyboard.dismiss();
          }}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: searchBlurAnim,
                backgroundColor: 'rgba(10, 15, 30, 0.65)',
              },
            ]}
          >
            {Platform.OS !== 'web' ? (
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backdropFilter: 'blur(10px)' } as any]} />
            )}
          </Animated.View>

          <View style={styles.overlayContentContainer} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.optionsPanel,
                {
                  opacity: searchPanelAnim,
                  transform: [
                    {
                      translateY: searchPanelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents="box-none"
            >
              <Pressable
                style={styles.optionsCard}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent dismissing when card is tapped
                }}
              >
                <Text style={styles.optionsHeaderTitle}>Where would you like to search?</Text>
                
                {/* Tab Option 1: Find What is Nearby */}
                <Pressable
                  onPress={() => {
                    setActiveView('map');
                    setIsSearchFocused(false);
                    Keyboard.dismiss();
                  }}
                  style={({ pressed }) => [
                    styles.tabOptionButton,
                    {
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.tabOptionIconWrapper, { backgroundColor: '#112b4d' }]}>
                    <Ionicons name="location" size={22} color="#479ef5" />
                  </View>
                  <View style={styles.tabOptionTextGroup}>
                    <Text style={styles.tabOptionTitle}>Find What is Nearby</Text>
                    <Text style={styles.tabOptionSubtext}>See localized opportunities on a live map</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#616161" style={styles.tabOptionArrow} />
                </Pressable>

                {/* Tab Option 2: Use Smart Dialer Search */}
                <Pressable
                  onPress={() => {
                    setActiveView('dialer_wizard');
                    setIsSearchFocused(false);
                    Keyboard.dismiss();
                  }}
                  style={({ pressed }) => [
                    styles.tabOptionButton,
                    {
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.tabOptionIconWrapper, { backgroundColor: '#432918' }]}>
                    <Ionicons name="options" size={22} color="#ffaa44" />
                  </View>
                  <View style={styles.tabOptionTextGroup}>
                    <Text style={styles.tabOptionTitle}>Use Smart Dialer Search</Text>
                    <Text style={styles.tabOptionSubtext}>Dial in day, time & domain with a rotary tool</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#616161" style={styles.tabOptionArrow} />
                </Pressable>
              </Pressable>
            </Animated.View>
          </View>
        </Pressable>
      )}

      {/* 5. Overhauled Opportunity Detail View Modal */}
      {selectedOpportunity && (
        <Modal
          visible={selectedOpportunity !== null}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setSelectedOpportunity(null)}
        >
          <OpportunityDetail
            opportunityId={selectedOpportunity.id}
            opportunityData={selectedOpportunity}
            isDarkMode={isDarkMode}
            onBack={() => setSelectedOpportunity(null)}
            onViewNgo={onViewNgo || (() => {})}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.s,
    paddingBottom: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Shapes.circular,
    paddingHorizontal: Spacing.s,
    height: 42,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  filterIconContainer: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  filterIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  contentLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 76,
    alignItems: 'center',
    paddingTop: Spacing.m,
  },
  sidebarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  inactiveSidebarItemShadow: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  sidebarIconWrapper: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainFeed: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.l,
    marginBottom: Spacing.s,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    marginLeft: Spacing.s,
  },
  card: {
    flexDirection: 'row',
    borderRadius: Shapes.rounded + 2,
    borderWidth: 1,
    padding: Spacing.s,
    marginBottom: Spacing.s,
    alignItems: 'center',
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  cardDurationContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: Spacing.s,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.m,
    marginTop: 2,
  },
  cardMetaText: {
    marginLeft: 4,
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  resetCtaButton: {
    marginTop: Spacing.m,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.rounded,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  filterSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: Spacing.xs,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 8,
  },
  filterSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButton: {
    padding: 4,
  },
  quickRangesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.m,
    marginTop: Spacing.s,
    gap: 8,
  },
  quickRangeItem: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Shapes.rounded,
  },
  dateCarousel: {
    marginTop: Spacing.s,
    maxHeight: 80,
  },
  dateCarouselContent: {
    paddingHorizontal: Spacing.m,
    gap: 8,
  },
  dateCarouselItem: {
    width: 48,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetActionContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.m,
    marginTop: Spacing.xl,
    gap: Spacing.s,
  },
  resetButton: {
    flex: 1,
    height: 44,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonSheet: {
    flex: 2,
    height: 44,
    borderRadius: Shapes.rounded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Whimsical Storytelling Detail View Styles
  detailModalWrapper: {
    flex: 1,
  },
  detailHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailRoundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailScrollContent: {
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.m,
    position: 'relative',
  },
  centeredChunk: {
    alignItems: 'center',
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.s,
  },
  heroImageContainer: {
    marginBottom: 60,
  },
  floatingCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.m,
    marginBottom: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  alignLeft: {
    alignSelf: 'flex-start',
    width: '86%',
  },
  alignRight: {
    alignSelf: 'flex-end',
    width: '86%',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.s,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s,
    paddingVertical: 4,
    borderRadius: Shapes.circular,
  },
  detailGreeting: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  detailHookText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    fontStyle: 'italic',
    marginBottom: Spacing.s,
  },
  scannableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xxs,
  },
  scannableGridCell: {
    width: '48%',
    borderRadius: 12,
    padding: Spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailFullDesc: {
    lineHeight: 22,
  },
  socialProofContainer: {
    marginTop: Spacing.xxs,
  },
  socialProofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  socialProofBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  avatarStackCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStackText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  avatarStackCountCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialProofText: {
    flex: 1,
    lineHeight: 15,
  },
  mapContainer: {
    position: 'relative',
    marginTop: Spacing.xxs,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    gap: 4,
  },
  mapControlBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  mapControlText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  incentivesList: {
    marginTop: Spacing.xxs,
  },
  incentiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.m,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: Shapes.rounded,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: Shapes.rounded,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Search overlay & Options Panel styles
  overlayContentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 65,
    alignItems: 'center',
  },
  optionsPanel: {
    width: '100%',
    paddingHorizontal: Spacing.m,
  },
  optionsCard: {
    backgroundColor: '#171821',
    borderRadius: 16,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  optionsHeaderTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tabOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202230',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  tabOptionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabOptionTextGroup: {
    flex: 1,
    marginLeft: 12,
  },
  tabOptionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  tabOptionSubtext: {
    color: '#a0a5c0',
    fontSize: 11,
    marginTop: 2,
  },
  tabOptionArrow: {
    marginLeft: 8,
  },
  // Smart Dialer Wizard styles
  wizardContainer: {
    flex: 1,
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  wizardHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
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
  stagesViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  stagesRow: {
    flexDirection: 'row',
    height: '100%',
  },
  stageCard: {
    height: '100%',
    padding: Spacing.m,
  },
  stageHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.l,
  },
  tabSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#202230',
    borderRadius: 8,
    padding: 3,
    marginBottom: Spacing.xl,
  },
  tabSelectorBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabSelectorActive: {
    backgroundColor: '#333547',
  },
  tabSelectorText: {
    fontSize: 13,
  },
  daysStripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.s,
  },
  weekDayColumn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 14,
  },
  calendarCard: {
    backgroundColor: '#202230',
    borderRadius: 12,
    padding: Spacing.m,
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  calendarMonthName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  calendarNavBtn: {
    padding: 6,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  calendarDaysHeaderText: {
    color: '#888',
    width: '14.2%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.2%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    marginVertical: 2,
  },
  calendarCellText: {
    fontSize: 12,
  },
  calendarCellEmpty: {
    width: '14.2%',
    height: 36,
  },
  dialerSliderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  dialerBackgroundCircle: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dialerCenterValueBox: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#202230',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dialerCenterValueText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#479ef5',
    lineHeight: 36,
  },
  dialerCenterUnitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.0,
    marginTop: 2,
  },
  dialerCenterSubtext: {
    fontSize: 9,
    color: '#888',
    marginTop: 1,
  },
  causeGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.s,
  },
  causeGridItem: {
    width: '48%',
    borderRadius: 12,
    padding: Spacing.m,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.s,
    position: 'relative',
    height: 110,
  },
  causeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  causeItemLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  causeCheckmarkGlow: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  wizardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.m,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#171821',
  },
  footerSecondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  footerSecondaryBtnText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  footerPrimaryBtn: {
    backgroundColor: '#0f6cbd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  footerPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  progressDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  curatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  curatedHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  curatedBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  curatedBackBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipRowWrapper: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  filterChipRow: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202230',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  filterChipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
  chipCloseBtn: {
    padding: 1,
  },
  curatedOppCard: {
    flexDirection: 'row',
    backgroundColor: '#202230',
    borderRadius: 12,
    padding: Spacing.s,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  curatedCardImg: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },
  curatedCardDetails: {
    flex: 1,
    marginLeft: Spacing.s,
    justifyContent: 'center',
  },
  curatedCardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  curatedCardDesc: {
    color: '#a0a5c0',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  curatedCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  curatedCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  curatedBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  curatedCardDuration: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
  },
  emptyFeedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyFeedText: {
    color: '#a0a5c0',
    fontSize: 12,
    marginTop: Spacing.m,
    textAlign: 'center',
    paddingHorizontal: Spacing.l,
  },
  fallbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(71, 158, 245, 0.12)',
    borderColor: 'rgba(71, 158, 245, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  fallbackBadgeText: {
    color: '#479ef5',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
