export type CauseType =
  | 'Health'
  | 'Education'
  | 'Nature'
  | 'Shelter'
  | 'Food';

export interface CommunityItem {
  id: string;
  name: string;
  members: number;
  activeMembers: number;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  imageUri: string;
  tags: string[];
  cause?: string;
  joined?: boolean;
}

export interface Friend {
  username: string;
  displayName: string;
  avatar: string;
  recentInteraction?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: string;
  timestamp: Date;
  timeLabel: string;
  unread: boolean;
  senderName: string;
  senderLogo: string;
  ideaId?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  cause: CauseType;
  isRemote: boolean;
  distanceKm: number;
  locationName: string;
  durationHrs: number;
  description?: string;
  spotsLeft?: number;
  tags?: string[];
  organizationName?: string;
  imageUri?: string;
}

export interface Idea {
  id: string;
  description: string;
  initialSupports: number;
  taggedFriends: string[];
  mentionsCount: number;
  cause?: CauseType;
  isMentionedBadge?: boolean;
  creatorLogo?: string;
  creatorName?: string;
}

export const MOCK_FRIENDS: Friend[] = [
  { username: 'anita', displayName: 'Anita', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80', recentInteraction: true },
  { username: 'sunita', displayName: 'Sunita', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', recentInteraction: true },
  { username: 'rohit', displayName: 'Rohit', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', recentInteraction: false },
  { username: 'deepak', displayName: 'Deepak', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', recentInteraction: false },
];

class PersonalizationService {
  private supportTapsCount = 0;
  private reduceMotion = false;
  private bookmarkedDomains: string[] = [
    'Environment 🌱',
    'Education 🎓',
    'Animal Welfare 🐶',
    'Food Rescue 🍎'
  ];
  private notifications: NotificationItem[] = [
    {
      id: 'n_1',
      title: 'New Opportunity',
      body: 'Spend a few hours mentoring students and helping them build confidence through reading at Gudi guda ka naka.',
      category: 'Opportunity Update',
      timestamp: new Date(),
      timeLabel: '5m ago',
      unread: true,
      senderName: 'Pratham MP Education',
      senderLogo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=80',
    },
    {
      id: 'n_2',
      title: 'Account Alert',
      body: 'Your account was accessed from a new device in Lashkar, Gwalior.',
      category: 'System Alert',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      timeLabel: '2h ago',
      unread: false,
      senderName: 'System Security',
      senderLogo: '',
    },
    {
      id: 'n_3',
      title: 'Connection Tagged You',
      body: 'Anita tagged you in the WASH Bio-Sand Well Rejuvenation Idea Thread. Review and show your interest.',
      category: 'New Message',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
      timeLabel: 'Yesterday, 4:30 PM',
      unread: true,
      senderName: 'anita (Friend)',
      senderLogo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
      ideaId: 'idea_1',
    },
    {
      id: 'n_4',
      title: 'Weekly Assembly Meeting',
      body: 'Weekly Gwalior environmental coalition meeting starts Sunday 10 AM at City Centre municipal hall.',
      category: 'Event Reminder',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28),
      timeLabel: 'Yesterday, 10:15 AM',
      unread: false,
      senderName: 'Green Gwalior Group',
      senderLogo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=80',
    },
    {
      id: 'n_5',
      title: 'Community Announcements',
      body: 'CWS Taskforce has approved 4 new rural caseworkers. Welcome them in the community forum.',
      category: 'Community Announcement',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      timeLabel: '12 Sept, 2:10 PM',
      unread: false,
      senderName: 'Child Welfare Service',
      senderLogo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=80',
    },
    {
      id: 'n_6',
      title: 'New Achievement Earned',
      body: 'Congratulations! You unlocked the "Active Responder" badge for completing 3 micro-volunteering opportunities.',
      category: 'Achievement Badge',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      timeLabel: '10 Sept, 9:00 AM',
      unread: false,
      senderName: 'Achievement Portal',
      senderLogo: '',
    },
  ];

  private ideas: Idea[] = [
    {
      id: 'idea_1',
      description: 'WASH Bio-Sand Well Rejuvenation Project in rural communities.',
      initialSupports: 15,
      taggedFriends: ['anita', 'sunita'],
      mentionsCount: 2,
    },
    {
      id: 'idea_2',
      description: 'Mobile health clinic for street children.',
      initialSupports: 8,
      taggedFriends: ['rohit'],
      mentionsCount: 1,
    },
  ];

  private rawOpportunities: Opportunity[] = [
    {
      id: 'ip-gw-e1',
      title: 'Underprivileged Children Tutoring',
      cause: 'Education',
      isRemote: false,
      distanceKm: 3.2,
      locationName: 'Gudi Guda Ka Naka, Gwalior Center',
      durationHrs: 3.0,
      description: 'Join our learning center in Gwalior to help children from under-resourced communities with mathematics, science, and languages.',
      spotsLeft: 5,
      tags: ['Tutoring', 'Education'],
    },
    {
      id: 'ip-gw-n1',
      title: 'Gwalior Fort Cleanliness Drive',
      cause: 'Nature',
      isRemote: false,
      distanceKm: 5.0,
      locationName: 'Fort Road, Lashkar, Gwalior',
      durationHrs: 4.0,
      description: 'Join other environment enthusiasts in cleaning the historic heritage walkways and surrounding areas of the Gwalior Fort.',
      spotsLeft: 10,
      tags: ['Cleanup', 'Environment'],
    },
    {
      id: 'ip-ch-f1',
      title: 'Chennai Soup Kitchen Food Packing',
      cause: 'Food',
      isRemote: false,
      distanceKm: 5.0,
      locationName: 'T. Nagar Food Hub, Chennai',
      durationHrs: 2.0,
      description: 'Assist in preparing, packing, and loading warm, nutritious lunch packets for daily wage earners and street dwellers in Chennai.',
      spotsLeft: 8,
      tags: ['Food Packing', 'Poverty'],
    },
    {
      id: 'ip-ch-h1',
      title: 'Chennai Medical Camp Assistant',
      cause: 'Health',
      isRemote: false,
      distanceKm: 5.0,
      locationName: 'Adyar Community Health Pavilion, Chennai',
      durationHrs: 5.0,
      description: 'Help organize visitor registration, seat patient families, and manage queues at our weekend free health screening camp in Chennai.',
      spotsLeft: 6,
      tags: ['Healthcare', 'Medical Camp'],
    },
    {
      id: 'opp_1',
      title: 'Mentor public school children in Gwalior',
      cause: 'Education',
      isRemote: false,
      distanceKm: 3.2,
      locationName: 'Gwalior Center',
      durationHrs: 2.0,
      description: 'Help children learn to read and gain confidence.',
      spotsLeft: 5,
      tags: ['Mentorship', 'Teaching'],
    },
    {
      id: 'opp_2',
      title: 'Water filter installation drive',
      cause: 'Health',
      isRemote: false,
      distanceKm: 6.5,
      locationName: 'Morar, Gwalior',
      durationHrs: 1.5,
      description: 'Install clean bio-sand water filters in local communities.',
      spotsLeft: 3,
      tags: ['Sanitation', 'WASH'],
    },
    {
      id: 'opp_3',
      title: 'Remote translation of education materials',
      cause: 'Education',
      isRemote: true,
      distanceKm: 0,
      locationName: 'Remote',
      durationHrs: 1.0,
      description: 'Translate textbooks to regional languages.',
      spotsLeft: 10,
      tags: ['Translation', 'Education'],
    },
  ];

  private communities: CommunityItem[] = [
    {
      id: 'c1',
      name: 'Child Welfare Services Taskforce',
      members: 86,
      activeMembers: 12,
      lastMessage: 'Aman: Let know if there are active cases in the North sector.',
      time: '9:02 AM',
      unreadCount: 4,
      isPinned: true,
      isMuted: false,
      imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150',
      tags: ['Child Welfare', 'Education'],
      joined: true,
    },
    {
      id: 'c2',
      name: 'Mental Health Support Group',
      members: 54,
      activeMembers: 5,
      lastMessage: 'Bob: Shared resources for rehabilitation clinics.',
      time: 'Yesterday',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      imageUri: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=150',
      tags: ['Mental Health', 'Support'],
      joined: true,
    },
    {
      id: 'c3',
      name: 'Housing & Emergency Relocations',
      members: 110,
      activeMembers: 18,
      lastMessage: 'Diana: Hotel vouchers have been updated in the room status list.',
      time: '2 days ago',
      unreadCount: 0,
      isPinned: false,
      isMuted: true,
      imageUri: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=150',
      tags: ['Housing', 'Emergency Relief'],
      joined: true,
    },
  ];

  getCommunities() {
    return this.communities;
  }

  setCommunities(comms: CommunityItem[]) {
    this.communities = comms;
  }

  joinCommunity(name: string, cause: string) {
    const exists = this.communities.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.communities = this.communities.map(c =>
        c.name.toLowerCase() === name.toLowerCase() ? { ...c, joined: true } : c
      );
      return;
    }

    const newComm: CommunityItem = {
      id: `c_${Date.now()}`,
      name: name,
      members: 12,
      activeMembers: 3,
      lastMessage: 'System: You joined this community.',
      time: 'Just now',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      imageUri: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150',
      tags: [cause],
      cause: cause,
      joined: true,
    };
    this.communities = [...this.communities, newComm];
  }

  getSupportTapsCount() {
    return this.supportTapsCount;
  }

  incrementSupportTapsCount() {
    this.supportTapsCount++;
  }

  getReduceMotion() {
    return this.reduceMotion;
  }

  setReduceMotion(val: boolean) {
    this.reduceMotion = val;
  }

  getNotifications() {
    return this.notifications;
  }

  setNotifications(notifs: NotificationItem[]) {
    this.notifications = notifs;
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'timeLabel' | 'unread'> & Partial<NotificationItem>) {
    const fullNotif: NotificationItem = {
      id: notif.id || `n_${Date.now()}`,
      title: notif.title || '',
      body: notif.body || '',
      category: notif.category || 'System Alert',
      timestamp: notif.timestamp || new Date(),
      timeLabel: notif.timeLabel || 'Just now',
      unread: notif.unread !== undefined ? notif.unread : true,
      senderName: notif.senderName || 'System',
      senderLogo: notif.senderLogo || '',
      ideaId: notif.ideaId,
    };
    this.notifications = [fullNotif, ...this.notifications];
  }

  getRawOpportunities() {
    return this.rawOpportunities;
  }

  getIdeas() {
    return this.ideas;
  }

  updateIdea(id: string, updates: Partial<Idea>) {
    this.ideas = this.ideas.map(i => {
      if (i.id === id) {
        const merged = { ...i, ...updates };
        if (updates.taggedFriends) {
          merged.mentionsCount = updates.taggedFriends.length;
        }
        return merged;
      }
      return i;
    });
  }

  getSortedCauses(): CauseType[] {
    return ['Health', 'Education', 'Nature', 'Shelter', 'Food'];
  }

  rankOpportunities(opps: Opportunity[]) {
    return opps;
  }

  recordSignal(cause: CauseType, signal: string) {
    console.log(`Signal recorded: Cause=${cause}, Signal=${signal}`);
  }

  getBookmarkedDomains() {
    return this.bookmarkedDomains;
  }

  setBookmarkedDomains(domains: string[]) {
    this.bookmarkedDomains = domains;
  }
}

export const DOMAIN_TO_CAUSES_MAP: Record<string, CauseType[]> = {
  'Environment 🌱': ['Nature'],
  'Education 🎓': ['Education'],
  'Animal Welfare 🐶': ['Nature'],
  'Food Rescue 🍎': ['Food'],
  'Elderly Care 👵': ['Health'],
  'Youth Mentoring 👦': ['Education'],
  'Disaster Relief 🚨': ['Shelter'],
  'Homeless Shelter 🏠': ['Shelter']
};

export const Personalization = new PersonalizationService();
