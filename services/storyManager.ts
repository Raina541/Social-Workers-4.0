import { CauseType } from './personalization';

export interface Story {
  id: string;
  headline: string;
  imageUri: string;
  summary: string;
  timestamp: string;
  tags: string[];
  sourceName: string;
  isAIImage?: boolean;
  link?: string;
  cause?: CauseType;
  contributorsCount?: number;
  contributorsAvatars?: string[];
}

class StoryManagerService {
  private bookmarkedCauses: Record<string, boolean> = {};
  private seenCauses: Record<string, boolean> = {};
  private lastReadIndices: Record<string, number> = {};
  private tagWeights: Record<string, number> = {};
  private seenStories: Set<string> = new Set();

  private stories: Story[] = [
    {
      id: 'child_1',
      headline: 'New Child Advocacy Center Opens in Downtown Gwalior',
      imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
      summary: 'A new facility dedicated to child welfare and family assistance opens today.',
      timestamp: '2 hours ago',
      tags: ['child welfare', 'advocacy'],
      sourceName: 'Gwalior Times',
      cause: 'Child Welfare',
    },
    {
      id: 'edu_1',
      headline: 'Pratham MP Education Reaches 4,500 Rural Children',
      imageUri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400',
      summary: 'Volunteers and educators complete a massive reading campaign across 12 settlements.',
      timestamp: '5 hours ago',
      tags: ['education', 'mentorship'],
      sourceName: 'MP News',
      cause: 'Education',
    },
    {
      id: 'edu_2',
      headline: 'New Weekend Tutoring Program Started',
      imageUri: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      summary: '80 children helped across local municipal schools by 12 volunteers.',
      timestamp: 'Yesterday',
      tags: ['education', 'tutoring'],
      sourceName: 'Daily Journal',
      cause: 'Education',
    },
    {
      id: 'edu_3',
      headline: 'Community Library Launched in Rural Gwalior',
      imageUri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
      summary: 'A group of caseworkers and teachers build a reading space for children.',
      timestamp: '3 days ago',
      tags: ['library', 'reading'],
      sourceName: 'Gwalior Post',
      cause: 'Education',
    },
    {
      id: 'health_1',
      headline: 'Free Medical Clinic Treats 250 Patients',
      imageUri: 'https://images.unsplash.com/photo-1584515901187-601004a35269?w=400',
      summary: 'Doctors and volunteers team up to offer free basic health checkups.',
      timestamp: 'Yesterday',
      tags: ['healthcare', 'clinic'],
      sourceName: 'Welfare Bulletin',
      cause: 'Healthcare',
    },
    {
      id: 'pov_1',
      headline: 'Food Bank Supports 120 Low-Income Families',
      imageUri: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=400',
      summary: 'Winter food kit distribution drive completed successfully.',
      timestamp: '1 day ago',
      tags: ['poverty', 'food bank'],
      sourceName: 'Social Echo',
      cause: 'Poverty Alleviation & Livelihoods',
    },
    {
      id: 'women_1',
      headline: 'Livelihood Training for 400 Women Completed',
      imageUri: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
      summary: 'Self-help groups in Gwalior graduate their latest cohort in sewing and handicraft.',
      timestamp: '2 days ago',
      tags: ['women empowerment', 'training'],
      sourceName: 'Empower MP',
      cause: 'Women Empowerment',
    },
    {
      id: 'disaster_1',
      headline: 'Flood Relief Materials Distributed to 200 Families',
      imageUri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
      summary: 'Emergency response volunteers deliver housing and nutrition packages.',
      timestamp: 'Yesterday',
      tags: ['disaster relief', 'floods'],
      sourceName: 'Rescue News',
      cause: 'Disaster Relief',
    },
    {
      id: 'env_1',
      headline: 'Green Gwalior Plants 3,500 Saplings',
      imageUri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      summary: 'Huge city park reforestation campaign sees participation from all ages.',
      timestamp: '3 hours ago',
      tags: ['environment', 'tree planting'],
      sourceName: 'Eco Voice',
      cause: 'Environment & Sustainability',
    },
    {
      id: 'env_2',
      headline: 'Bio-Sand Well Rejuvenation Project Finishes First Phase',
      imageUri: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400',
      summary: '18 village wells cleaned and fitted with eco-friendly filtering units.',
      timestamp: '1 week ago',
      tags: ['water', 'environment'],
      sourceName: 'Clean Earth',
      cause: 'Environment & Sustainability',
    },
    {
      id: 'animal_1',
      headline: 'Reflective Collars Fitted on 180 Stray Dogs',
      imageUri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
      summary: 'Animal shelter volunteers reduce traffic accidents with simple reflective gear.',
      timestamp: '4 days ago',
      tags: ['animal welfare', 'dogs'],
      sourceName: 'Paws Gwalior',
      cause: 'Animal Welfare',
    },
    {
      id: 'disability_1',
      headline: 'Volunteers Record 120 Audiobooks for the Blind',
      imageUri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
      summary: 'New study materials made accessible through remote reading services.',
      timestamp: '5 days ago',
      tags: ['disability', 'audiobooks'],
      sourceName: 'Inclusion Hub',
      cause: 'Support for Persons with Disabilities',
    },
    {
      id: 'elder_1',
      headline: 'Companion Visits Expand at Senior Care Home',
      imageUri: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400',
      summary: '60 residents assisted by youth volunteers over the past month.',
      timestamp: '2 weeks ago',
      tags: ['elderly care', 'outreach'],
      sourceName: 'Golden Years',
      cause: 'Elderly Care',
    },
    {
      id: 'wash_1',
      headline: '70 Bio-Sand Filters Installed in East District',
      imageUri: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400',
      summary: 'Clean water solution deployed to schools and community centers.',
      timestamp: '3 days ago',
      tags: ['water', 'sanitation', 'WASH'],
      sourceName: 'WASH Initiative',
      cause: 'Water, Sanitation, and Hygiene (WASH)',
    },
    {
      id: 'rural_1',
      headline: 'Rural Preservation Initiative Saves 350 Crop Varieties',
      imageUri: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400',
      summary: 'Seed bank coordination system connects farmers across Gwalior.',
      timestamp: '1 month ago',
      tags: ['rural development', 'farming'],
      sourceName: 'Agro Watch',
      cause: 'Rural Development',
    },
  ];

  getSortedStoriesForCause(cause: CauseType): Story[] {
    return this.stories.filter(s => s.cause === cause);
  }

  isCauseBookmarked(cause: CauseType): boolean {
    return !!this.bookmarkedCauses[cause];
  }

  toggleCauseBookmarked(cause: CauseType): boolean {
    this.bookmarkedCauses[cause] = !this.bookmarkedCauses[cause];
    return this.bookmarkedCauses[cause];
  }

  markCauseSeen(cause: CauseType, seen: boolean): void {
    this.seenCauses[cause] = seen;
  }

  isCauseSeen(cause: CauseType): boolean {
    return !!this.seenCauses[cause];
  }

  saveProgress(cause: CauseType, index: number): void {
    this.lastReadIndices[cause] = index;
  }

  getLastReadIndex(cause: CauseType): number {
    return this.lastReadIndices[cause] || 0;
  }

  markStorySeen(storyId: string): void {
    this.seenStories.add(storyId);
  }

  incrementTagWeight(tag: string, weight: number): void {
    this.tagWeights[tag] = (this.tagWeights[tag] || 0) + weight;
  }
}

export const StoryService = new StoryManagerService();
