export interface ActiveListing {
  id: string;
  title: string;
  cause: string;
  locationName: string;
  isRemote: boolean;
  distanceKm: number;
  durationHrs: number;
  categoryTag: string;
  friendsSignedUpCount: number;
  friendsSignedUpNames: string[];
  organizationName: string;
  organizationLogo: string;
  description?: string;
}

export interface PastEvent {
  id: string;
  title: string;
  participantsCount: number;
  impactText: string;
  imageUri: string;
  pastPhotos: string[];
  date?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatarUri: string;
  volunteeredCount: number;
  reviewText: string;
}

export interface IdeaThread {
  id: string;
  description: string;
  creatorName: string;
  creatorLogo: string;
  initialSupports: number;
  taggedFriends: string[];
  mentionsCount: number;
  isMentionedBadge?: boolean;
}

export interface NGOProfile {
  name: string;
  logoUri: string;
  bannerUri: string;
  established: string;
  location: string;
  causes: string[];
  verifiedChannels: ('WhatsApp' | 'LinkedIn' | 'Instagram' | 'Website')[];
  bio: string;
  contact: {
    email: string;
    phone: string;
    pocName: string;
    pocPosition: string;
  };
  activeListings: ActiveListing[];
  pastEvents: PastEvent[];
  touchpointClassmatesCount: number;
  touchpointClassmatesNames: string[];
  touchpointFriendAvatars: string[];
  testimonials: Testimonial[];
  ideas: IdeaThread[];
}

export const MOCK_NGO_PROFILES: Record<string, NGOProfile> = {
  'Gwalior Green Canopy Foundation': {
    name: 'Gwalior Green Canopy Foundation',
    logoUri: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    established: '2018',
    location: 'Gwalior, MP',
    causes: ['Environment & Sustainability', 'Elderly Care', 'Education'],
    verifiedChannels: ['WhatsApp', 'LinkedIn', 'Instagram', 'Website'],
    bio: 'We plant urban canopies, restore lakes, and run weekend literacy circles with retired teachers across Gwalior. Every Sunday, somewhere green grows because a volunteer showed up.',
    contact: {
      email: 'hello@greencanopy.org',
      phone: '+91 98260 11422',
      pocName: 'Ananya Sharma',
      pocPosition: 'Volunteer Lead'
    },
    activeListings: [
      {
        id: 'greencanopy_active_1',
        title: 'Mentoring Students',
        cause: 'Education',
        locationName: 'Gudi guda ka naka, Gwalior',
        isRemote: false,
        distanceKm: 3.2,
        durationHrs: 1.5,
        categoryTag: 'Reading Club',
        friendsSignedUpCount: 9,
        friendsSignedUpNames: ['anita', 'sunita', 'rahul', 'vivek'],
        organizationName: 'Gwalior Green Canopy Foundation',
        organizationLogo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=80',
        description: 'Spend a few hours helping local students build confidence and discover the joy of reading.'
      },
      {
        id: 'greencanopy_active_2',
        title: 'Verify WASH Pin Coordinates',
        cause: 'Water, Sanitation, and Hygiene (WASH)',
        locationName: 'Morar, Gwalior',
        isRemote: false,
        distanceKm: 1.2,
        durationHrs: 0.08,
        categoryTag: 'Mapping',
        friendsSignedUpCount: 9,
        friendsSignedUpNames: ['anita', 'sunita', 'rahul'],
        organizationName: 'Gwalior Green Canopy Foundation',
        organizationLogo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=80',
        description: 'Verify water dispenser pin coordinates on the map for summer drinking points.'
      }
    ],
    pastEvents: [
      {
        id: 'greencanopy_past_1',
        title: 'Phool Bagh Plantation drive',
        participantsCount: 45,
        impactText: 'Planted 250 native saplings in urban park zones',
        imageUri: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=500',
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500',
          'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500'
        ]
      },
      {
        id: 'greencanopy_past_2',
        title: 'Lakeside Restoration Campaign',
        participantsCount: 30,
        impactText: 'Cleared 2 tons of plastic waste from Sagar lake banks',
        imageUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
          'https://images.unsplash.com/photo-1472214222555-d404758b1c42?w=500'
        ]
      },
      {
        id: 'greencanopy_past_3',
        title: 'Community Green Nursery Meet',
        participantsCount: 22,
        impactText: 'Distributed 150 free home-nursery starter kits',
        imageUri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 3,
    touchpointClassmatesNames: ['Priya', 'Rahul', 'Vivek'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80'
    ],
    testimonials: [
      {
        id: 'greencanopy_review_1',
        name: 'Ritika M.',
        avatarUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80',
        volunteeredCount: 4,
        reviewText: 'Volunteering here is an incredibly fulfilling experience. The community nursery meet was very well organized, and we got to interact directly with retired teachers who shared amazing composting tips.'
      },
      {
        id: 'greencanopy_review_2',
        name: 'Siddharth S.',
        avatarUri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80',
        volunteeredCount: 6,
        reviewText: 'Green Canopy has done phenomenal work cleaning up Sarsaiya Kund. Seeing the lake clear of plastic because of our collective efforts was absolutely worth the weekend sweat.'
      }
    ],
    ideas: [
      {
        id: 'greencanopy_idea_1',
        description: 'Should we set up a rooftop community garden at a local shelter to teach sustainable urban farming?',
        creatorName: 'Gwalior Green Canopy Foundation',
        creatorLogo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=80',
        initialSupports: 32,
        taggedFriends: ['priya', 'rahul'],
        mentionsCount: 2,
        isMentionedBadge: false
      },
      {
        id: 'greencanopy_idea_2',
        description: 'Host a seedball-making workshop at Phool Bagh to prepare for the monsoon plantation drive.',
        creatorName: 'Ayush G.',
        creatorLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
        initialSupports: 18,
        taggedFriends: ['vivek'],
        mentionsCount: 1,
        isMentionedBadge: false
      }
    ]
  },
  'Pratham MP Education Group': {
    name: 'Pratham MP Education Group',
    logoUri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    established: '2012',
    location: 'Inderganj, Gwalior',
    causes: ['Education', 'Child Welfare'],
    verifiedChannels: ['LinkedIn', 'Website'],
    bio: 'Providing quality primary education and fundamental reading skills to children in underprivileged regions of Madhya Pradesh.',
    contact: {
      email: 'info@prathammp.org',
      phone: '+91 751 2445890',
      pocName: 'Rajesh Mishra',
      pocPosition: 'Regional Coordinator'
    },
    activeListings: [
      {
        id: 'opp_1',
        title: 'Mentoring Students',
        cause: 'Education',
        locationName: 'Gudi guda ka naka, Gwalior',
        isRemote: false,
        distanceKm: 3.2,
        durationHrs: 1.5,
        categoryTag: 'Reading Club',
        friendsSignedUpCount: 4,
        friendsSignedUpNames: ['anita', 'sunita', 'rahul', 'vivek'],
        organizationName: 'Pratham MP Education Group',
        organizationLogo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=80',
        description: 'Spend a few hours helping local students build confidence and discover the joy of reading.'
      },
      {
        id: 'opp_11',
        title: 'Proofread Literacy Handbook',
        cause: 'Education',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 0.5,
        categoryTag: 'Proofreading',
        friendsSignedUpCount: 1,
        friendsSignedUpNames: ['sunita'],
        organizationName: 'Pratham MP Education Group',
        organizationLogo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=80',
        description: 'Proofread our digital literacy handbook to ensure clarity and grammatical accuracy for underprivileged children.'
      }
    ],
    pastEvents: [
      {
        id: 'pratham_past_1',
        title: 'Rural Reading Carnival',
        participantsCount: 50,
        impactText: 'Helped raise 4,000 for a kids educational library book set',
        imageUri: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500'
        ]
      },
      {
        id: 'pratham_past_2',
        title: 'Digital Literacy Workshop',
        participantsCount: 35,
        impactText: 'Trained 35 local children in basic computer operations and digital tools',
        imageUri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 3,
    touchpointClassmatesNames: ['Anita', 'Sunita', 'Rahul'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
    ],
    testimonials: [
      {
        id: 'pratham_review_1',
        name: 'Amit K.',
        avatarUri: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80',
        volunteeredCount: 5,
        reviewText: 'Teaching children basic reading skills on weekends has been life-changing. Highly structured organization!'
      },
      {
        id: 'pratham_review_2',
        name: 'Sunita D.',
        avatarUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80',
        volunteeredCount: 8,
        reviewText: 'Incredible coordination. The literacy handbook proofreading task was straightforward and the feedback was very encouraging!'
      }
    ],
    ideas: [
      {
        id: 'pratham_idea_1',
        description: 'Should we set up a book donation drive box at local shopping centers to collect children books?',
        creatorName: 'Pratham MP Education Group',
        creatorLogo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=80',
        initialSupports: 48,
        taggedFriends: ['anita', 'sunita'],
        mentionsCount: 25,
        isMentionedBadge: false
      },
      {
        id: 'pratham_idea_2',
        description: 'A mobile library van on Sundays for far-flung rural slums around Gwalior bypass road.',
        creatorName: 'Sunita D.',
        creatorLogo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80',
        initialSupports: 92,
        taggedFriends: ['rahul', 'anita'],
        mentionsCount: 13,
        isMentionedBadge: false
      }
    ]
  },
  'Red Cross Gwalior': {
    name: 'Red Cross Gwalior',
    logoUri: 'https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
    established: '1995',
    location: 'City Center, Gwalior',
    causes: ['Healthcare', 'Disaster Relief'],
    verifiedChannels: ['WhatsApp', 'Website'],
    bio: 'Promoting human care, emergency medical support, and disaster relief management across central India.',
    contact: {
      email: 'help@redcrossgwalior.org',
      phone: '+91 751 2233445',
      pocName: 'Dr. Alok Verma',
      pocPosition: 'Medical Coordinator'
    },
    activeListings: [
      {
        id: 'opp_2',
        title: 'Sort and Pack Medical Supplies',
        cause: 'Healthcare',
        locationName: 'Red Cross Hall, Gwalior',
        isRemote: false,
        distanceKm: 1.5,
        durationHrs: 3.0,
        categoryTag: 'Inventory Management',
        friendsSignedUpCount: 1,
        friendsSignedUpNames: ['anita'],
        organizationName: 'Red Cross Gwalior',
        organizationLogo: 'https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?w=80'
      },
      {
        id: 'opp_10',
        title: 'Translate Health Clinic Flyer',
        cause: 'Healthcare',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 0.25,
        categoryTag: 'Translation',
        friendsSignedUpCount: 2,
        friendsSignedUpNames: ['sneha', 'priya'],
        organizationName: 'Red Cross Gwalior',
        organizationLogo: 'https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?w=80'
      }
    ],
    pastEvents: [
      {
        id: 'redcross_past_1',
        title: 'Emergency First Aid Seminar',
        participantsCount: 60,
        impactText: 'Trained 60 college students in CPR and basic emergency care',
        imageUri: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500',
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500'
        ]
      },
      {
        id: 'redcross_past_2',
        title: 'District Blood Donation Drive',
        participantsCount: 110,
        impactText: 'Collected 95 units of blood for local civil hospital blood bank',
        imageUri: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 1,
    touchpointClassmatesNames: ['Anita'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
    ],
    testimonials: [
      {
        id: 'redcross_review_1',
        name: 'Dr. Neha G.',
        avatarUri: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=80',
        volunteeredCount: 8,
        reviewText: 'Volunteering with the Red Cross blood donation camps is always structured and extremely professional. Essential medical supplies inventory sorting is highly impactful!'
      },
      {
        id: 'redcross_review_2',
        name: 'Vikram A.',
        avatarUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
        volunteeredCount: 3,
        reviewText: 'Excellent experience sorting diagnostic kits. The team is friendly and we really felt like we made a difference.'
      }
    ],
    ideas: [
      {
        id: 'redcross_idea_1',
        description: 'Should we establish regular weekend health checkup desks at local transit shelters?',
        creatorName: 'Red Cross Gwalior',
        creatorLogo: 'https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?w=80',
        initialSupports: 45,
        taggedFriends: ['anita'],
        mentionsCount: 4,
        isMentionedBadge: false
      }
    ]
  },
  'Robin Hood Army Gwalior': {
    name: 'Robin Hood Army Gwalior',
    logoUri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    established: '2016',
    location: 'Maharaj Bada, Gwalior',
    causes: ['Poverty Alleviation & Livelihoods', 'Child Welfare'],
    verifiedChannels: ['WhatsApp', 'LinkedIn', 'Instagram', 'Website'],
    bio: 'Zero-funds volunteer organization that redistributes surplus food from restaurants and weddings to less fortunate families.',
    contact: {
      email: 'gwalior@robinhoodarmy.com',
      phone: '+91 99999 11223',
      pocName: 'Varun Singhal',
      pocPosition: 'Chapter Lead'
    },
    activeListings: [
      {
        id: 'opp_3',
        title: 'Surplus Food Redistribution Drive',
        cause: 'Poverty Alleviation & Livelihoods',
        locationName: 'Bada Market Footpaths, Gwalior',
        isRemote: false,
        distanceKm: 5.5,
        durationHrs: 2.5,
        categoryTag: 'Food Distribution',
        friendsSignedUpCount: 3,
        friendsSignedUpNames: ['rahul', 'vivek', 'priya'],
        organizationName: 'Robin Hood Army Gwalior',
        organizationLogo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'
      },
      {
        id: 'opp_12',
        title: 'Upload Shelter Donation Receipts',
        cause: 'Poverty Alleviation & Livelihoods',
        locationName: 'Hazira, Gwalior',
        isRemote: false,
        distanceKm: 2.4,
        durationHrs: 0.25,
        categoryTag: 'Data Entry',
        friendsSignedUpCount: 0,
        friendsSignedUpNames: [],
        organizationName: 'Robin Hood Army Gwalior',
        organizationLogo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'
      }
    ],
    pastEvents: [
      {
        id: 'rha_past_1',
        title: 'Bada Food Distribution Drive',
        participantsCount: 35,
        impactText: 'Served warm meal to 20 orphaned kids and 100 poor families',
        imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500'
        ]
      },
      {
        id: 'rha_past_2',
        title: 'Winter Blanket Distribution',
        participantsCount: 28,
        impactText: 'Distributed 150 heavy wool blankets to homeless people near Gwalior Station',
        imageUri: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 3,
    touchpointClassmatesNames: ['Rahul', 'Vivek', 'Priya'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80'
    ],
    testimonials: [
      {
        id: 'rha_review_1',
        name: 'Rahul S.',
        avatarUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        volunteeredCount: 12,
        reviewText: 'No money collected, just pure service. Spreading happiness to Bada street kids is the best way to spend a Sunday night.'
      },
      {
        id: 'rha_review_2',
        name: 'Sanjay J.',
        avatarUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
        volunteeredCount: 6,
        reviewText: 'Participated in the Station blanket drive. Very well structured logistics and a humble group of citizens.'
      }
    ],
    ideas: [
      {
        id: 'rha_idea_1',
        description: 'Can we partner with local wedding halls to collect surplus food directly after events end?',
        creatorName: 'Robin Hood Army Gwalior',
        creatorLogo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80',
        initialSupports: 58,
        taggedFriends: ['priya', 'vivek'],
        mentionsCount: 5,
        isMentionedBadge: true
      },
      {
        id: 'rha_idea_2',
        description: 'Launch a local awareness drive about food waste at colleges in City Center Gwalior.',
        creatorName: 'Rahul S.',
        creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        initialSupports: 27,
        taggedFriends: ['priya'],
        mentionsCount: 2,
        isMentionedBadge: false
      }
    ]
  },
  'Green Gwalior Initiative': {
    name: 'Green Gwalior Initiative',
    logoUri: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800',
    established: '2019',
    location: 'Phool Bagh, Gwalior',
    causes: ['Environment & Sustainability'],
    verifiedChannels: ['Instagram', 'Website'],
    bio: 'Working to increase Gwalior\'s green cover via community Miyawaki forests, clean air advocacy campaigns, and native tree planting drives.',
    contact: {
      email: 'contact@greengwalior.org',
      phone: '+91 98262 33445',
      pocName: 'Rohan Gupta',
      pocPosition: 'Field Director'
    },
    activeListings: [
      {
        id: 'opp_4',
        title: 'Miyawaki Plantation drive',
        cause: 'Environment & Sustainability',
        locationName: 'Ghatigaon Forest Block',
        isRemote: false,
        distanceKm: 28.0,
        durationHrs: 4.0,
        categoryTag: 'Afforestation',
        friendsSignedUpCount: 0,
        friendsSignedUpNames: [],
        organizationName: 'Green Gwalior Initiative',
        organizationLogo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=80'
      },
      {
        id: 'opp_9',
        title: 'Sign Clean Air Petition',
        cause: 'Environment & Sustainability',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 0.08,
        categoryTag: 'Advocacy',
        friendsSignedUpCount: 12,
        friendsSignedUpNames: ['vivek', 'rohan'],
        organizationName: 'Green Gwalior Initiative',
        organizationLogo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=80'
      }
    ],
    pastEvents: [
      {
        id: 'greengwalior_past_1',
        title: 'Miyawaki Forest Setup Phase 1',
        participantsCount: 80,
        impactText: 'Planted 1,200 native saplings in a high-density urban plot',
        imageUri: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500',
          'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 1,
    touchpointClassmatesNames: ['Vivek'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80'
    ],
    testimonials: [
      {
        id: 'greengwalior_review_1',
        name: 'Sanjay V.',
        avatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
        volunteeredCount: 5,
        reviewText: 'Amazing energy during the Miyawaki forest plantation. The soil preparation was super scientific, learned a lot!'
      }
    ],
    ideas: [
      {
        id: 'greengwalior_idea_1',
        description: 'Should we introduce school-level composting bins in municipal schools across Gwalior?',
        creatorName: 'Green Gwalior Initiative',
        creatorLogo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=80',
        initialSupports: 41,
        taggedFriends: ['vivek'],
        mentionsCount: 3,
        isMentionedBadge: false
      }
    ]
  },
  'MP Disaster Management Authority': {
    name: 'MP Disaster Management Authority',
    logoUri: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=800',
    established: '2005',
    location: 'Arera Hills, Bhopal',
    causes: ['Disaster Relief'],
    verifiedChannels: ['Website'],
    bio: 'State agency dedicated to disaster mitigation, early warning response, hailstorm relief verification, and community resilience building.',
    contact: {
      email: 'hailstorm-support@mp.gov.in',
      phone: '+91 755 2773344',
      pocName: 'Major S. K. Singh',
      pocPosition: 'District Disaster Officer'
    },
    activeListings: [
      {
        id: 'opp_5',
        title: 'Review Crop Hailstorm Relief Requests',
        cause: 'Disaster Relief',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 1.0,
        categoryTag: 'Data Verification',
        friendsSignedUpCount: 2,
        friendsSignedUpNames: ['anita', 'sneha'],
        organizationName: 'MP Disaster Management Authority',
        organizationLogo: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=80'
      }
    ],
    pastEvents: [
      {
        id: 'mpdisaster_past_1',
        title: 'Flood Rescue Simulation Mock Drill',
        participantsCount: 150,
        impactText: 'Trained 150 community volunteers in quick water rescue methods',
        imageUri: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 2,
    touchpointClassmatesNames: ['Anita', 'Sneha'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80'
    ],
    testimonials: [
      {
        id: 'mpdisaster_review_1',
        name: 'Sneha P.',
        avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
        volunteeredCount: 2,
        reviewText: 'Extremely rigorous and valuable mock drills. The remote verification system for crop damage is very fast.'
      }
    ],
    ideas: [
      {
        id: 'mpdisaster_idea_1',
        description: 'Develop a simple offline translation toolkit for remote disaster updates in local Gondi and Bhili dialects.',
        creatorName: 'MP Disaster Management Authority',
        creatorLogo: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=80',
        initialSupports: 62,
        taggedFriends: ['sneha', 'anita'],
        mentionsCount: 4,
        isMentionedBadge: true
      }
    ]
  },
  'NAB India Digitization Unit': {
    name: 'NAB India Digitization Unit',
    logoUri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800',
    established: '1952',
    location: 'Lashkar, Gwalior',
    causes: ['Support for Persons with Disabilities'],
    verifiedChannels: ['LinkedIn', 'Website'],
    bio: 'National Association for the Blind (NAB) Gwalior unit, digitizing textbooks, creating audiobooks, and providing tech training for visually impaired individuals.',
    contact: {
      email: 'digitization@nabindia.org',
      phone: '+91 751 2334990',
      pocName: 'Meenakshi Iyer',
      pocPosition: 'Center Coordinator'
    },
    activeListings: [
      {
        id: 'opp_6',
        title: 'Digitize Textbooks for Visually Impaired',
        cause: 'Support for Persons with Disabilities',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 2.0,
        categoryTag: 'Audio Recording',
        friendsSignedUpCount: 5,
        friendsSignedUpNames: ['rahul', 'priya', 'mohit', 'neha', 'sanjay'],
        organizationName: 'NAB India Digitization Unit',
        organizationLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80'
      },
      {
        id: 'opp_13',
        title: 'Review Disability Transcript',
        cause: 'Support for Persons with Disabilities',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 0.5,
        categoryTag: 'Verification',
        friendsSignedUpCount: 4,
        friendsSignedUpNames: ['rahul', 'priya'],
        organizationName: 'NAB India Digitization Unit',
        organizationLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80'
      }
    ],
    pastEvents: [
      {
        id: 'nab_past_1',
        title: 'Audiobook Library Expansion',
        participantsCount: 40,
        impactText: 'Successfully recorded and digitized 120 school textbooks into clear audiobooks',
        imageUri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
          'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 3,
    touchpointClassmatesNames: ['Rahul', 'Priya', 'Sanjay'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80'
    ],
    testimonials: [
      {
        id: 'nab_review_1',
        name: 'Mohit S.',
        avatarUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        volunteeredCount: 7,
        reviewText: 'Perfect organization for remote volunteering. The guidelines for audiobook recording are very clear and helpful!'
      }
    ],
    ideas: [
      {
        id: 'nab_idea_1',
        description: 'Should we run a community drive to donate old working smartphones to blind students for their audio study?',
        creatorName: 'NAB India Digitization Unit',
        creatorLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80',
        initialSupports: 78,
        taggedFriends: ['rahul', 'priya'],
        mentionsCount: 6,
        isMentionedBadge: true
      }
    ]
  },
  'PFA Gwalior Unit': {
    name: 'PFA Gwalior Unit',
    logoUri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
    established: '2010',
    location: 'Pinto Park, Gwalior',
    causes: ['Animal Welfare'],
    verifiedChannels: ['Instagram', 'WhatsApp'],
    bio: 'People For Animals (PFA) Gwalior unit works to rescue stray animals, install reflective collars, run sterilization programs, and raise awareness.',
    contact: {
      email: 'pfa@gwalioranimalwelfare.org',
      phone: '+91 99990 22331',
      pocName: 'Dr. Shruti Sen',
      pocPosition: 'Veterinary Lead'
    },
    activeListings: [
      {
        id: 'opp_7',
        title: 'Vaccination Campaign Social Media Design',
        cause: 'Animal Welfare',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 1.5,
        categoryTag: 'Creative Design',
        friendsSignedUpCount: 0,
        friendsSignedUpNames: [],
        organizationName: 'PFA Gwalior Unit',
        organizationLogo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80'
      },
      {
        id: 'opp_14',
        title: 'Categorize Stray Animal Reports',
        cause: 'Animal Welfare',
        locationName: 'Remote / Online',
        isRemote: true,
        distanceKm: 0,
        durationHrs: 0.25,
        categoryTag: 'Database',
        friendsSignedUpCount: 1,
        friendsSignedUpNames: ['anita'],
        organizationName: 'PFA Gwalior Unit',
        organizationLogo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80'
      }
    ],
    pastEvents: [
      {
        id: 'pfa_past_1',
        title: 'Reflective Collar Campaign',
        participantsCount: 30,
        impactText: 'Collared 300 stray dogs to prevent nighttime road accidents',
        imageUri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500',
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 1,
    touchpointClassmatesNames: ['Anita'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
    ],
    testimonials: [
      {
        id: 'pfa_review_1',
        name: 'Karan B.',
        avatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
        volunteeredCount: 4,
        reviewText: 'Great experience helping sort the reflection collar requests. It directly saves stray animal lives at night!'
      }
    ],
    ideas: [
      {
        id: 'pfa_idea_1',
        description: 'Let\'s design a weekend bird feeder hanging drive in Phool Bagh park during early summer.',
        creatorName: 'PFA Gwalior Unit',
        creatorLogo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80',
        initialSupports: 29,
        taggedFriends: [],
        mentionsCount: 1,
        isMentionedBadge: false
      }
    ]
  },
  'WASH Coalition Gwalior': {
    name: 'WASH Coalition Gwalior',
    logoUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1527137341206-1d22227d88fb?w=800',
    established: '2021',
    location: 'Morar, Gwalior',
    causes: ['Water, Sanitation, and Hygiene (WASH)'],
    verifiedChannels: ['Website', 'WhatsApp'],
    bio: 'Promoting clean drinking water availability, public sanitation map logs, and hygiene awareness among underprivileged Gwalior neighborhoods.',
    contact: {
      email: 'cleanwater@washgwalior.org',
      phone: '+91 751 2445588',
      pocName: 'Naveen Saxena',
      pocPosition: 'WASH Lead'
    },
    activeListings: [
      {
        id: 'opp_8',
        title: 'Verify WASH Pin Coordinates',
        cause: 'Water, Sanitation, and Hygiene (WASH)',
        locationName: 'Morar, Gwalior',
        isRemote: false,
        distanceKm: 1.2,
        durationHrs: 0.08,
        categoryTag: 'Mapping',
        friendsSignedUpCount: 3,
        friendsSignedUpNames: ['anita', 'sunita', 'rahul'],
        organizationName: 'WASH Coalition Gwalior',
        organizationLogo: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=80'
      }
    ],
    pastEvents: [
      {
        id: 'wash_past_1',
        title: 'Clean Drinking Water Booth Setup',
        participantsCount: 25,
        impactText: 'Set up 10 drinking water booths in Morar market for intense summer months',
        imageUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 3,
    touchpointClassmatesNames: ['Anita', 'Sunita', 'Rahul'],
    touchpointFriendAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
    ],
    testimonials: [
      {
        id: 'wash_review_1',
        name: 'Sunita D.',
        avatarUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80',
        volunteeredCount: 5,
        reviewText: 'Mapping clean water dispensers was quick and easy. Very helpful coordinator and direct impact!'
      }
    ],
    ideas: [
      {
        id: 'wash_idea_1',
        description: 'Should we organize hygiene awareness workshops at local slum schools with free soap kit distribution?',
        creatorName: 'WASH Coalition Gwalior',
        creatorLogo: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=80',
        initialSupports: 35,
        taggedFriends: ['anita', 'sunita'],
        mentionsCount: 2,
        isMentionedBadge: false
      }
    ]
  }
};

// Fallback profile if NGO not found in mock records
export function getOrCreateNgoProfile(ngoName: string): NGOProfile {
  if (MOCK_NGO_PROFILES[ngoName]) {
    return MOCK_NGO_PROFILES[ngoName];
  }

  const safeId = ngoName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Generate generic profile
  return {
    name: ngoName,
    logoUri: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150',
    bannerUri: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
    established: '2020',
    location: 'Gwalior, MP',
    causes: ['General Welfare'],
    verifiedChannels: ['Website'],
    bio: `Dedicated volunteer group operating under the name ${ngoName} promoting community support in local regions of Gwalior, Madhya Pradesh.`,
    contact: {
      email: `contact@${safeId || 'ngo'}.org`,
      phone: '+91 99999 99999',
      pocName: 'Volunteer Incharge',
      pocPosition: 'Contact Representative'
    },
    activeListings: [],
    pastEvents: [
      {
        id: `${safeId}_past_1`,
        title: 'Community Outreach Drive',
        participantsCount: 35,
        impactText: 'Helped 150 local residents with direct relief and aid support',
        imageUri: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=500'
        ]
      },
      {
        id: `${safeId}_past_2`,
        title: 'Volunteer Training Meetup',
        participantsCount: 20,
        impactText: 'Onboarded 20 new active members for weekly projects',
        imageUri: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=300',
        pastPhotos: [
          'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500'
        ]
      }
    ],
    touchpointClassmatesCount: 0,
    touchpointClassmatesNames: [],
    touchpointFriendAvatars: [],
    testimonials: [
      {
        id: `${safeId}_review_1`,
        name: 'Aditya P.',
        avatarUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        volunteeredCount: 3,
        reviewText: 'Great experience volunteering with this team! They are well organized and highly committed.'
      },
      {
        id: `${safeId}_review_2`,
        name: 'Pooja R.',
        avatarUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
        volunteeredCount: 2,
        reviewText: 'I participated in their weekend program. Loved the coordination and direct connection to the community!'
      }
    ],
    ideas: [
      {
        id: `${safeId}_idea_1`,
        description: 'Host a community interactive planning forum next month to design new volunteer projects.',
        creatorName: ngoName,
        creatorLogo: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=80',
        initialSupports: 12,
        taggedFriends: [],
        mentionsCount: 1,
        isMentionedBadge: false
      }
    ]
  };
}
