// Time tracking categories for accurate PpH calculations

export interface TimeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isTreeWork: boolean;
  isStandardCategory: boolean;
  isCustomSOP?: boolean;
  pphTracking: boolean; // Whether this category contributes to PpH calculations
}

// Standard business categories that every tree service company needs
export const STANDARD_CATEGORIES: TimeCategory[] = [
  // Primary Tree Work Categories
  {
    id: 'tree_removal',
    name: 'Tree Removal',
    description: 'Time spent on actual tree removal work',
    icon: '🌳',
    color: 'bg-green-500',
    isTreeWork: true,
    isStandardCategory: true,
    pphTracking: true
  },
  {
    id: 'tree_trimming',
    name: 'Tree Trimming',
    description: 'Time spent on tree trimming and pruning',
    icon: '✂️',
    color: 'bg-emerald-500',
    isTreeWork: true,
    isStandardCategory: true,
    pphTracking: true
  },
  {
    id: 'stump_grinding',
    name: 'Stump Grinding',
    description: 'Time spent on stump removal and grinding',
    icon: '🪚',
    color: 'bg-amber-600',
    isTreeWork: true,
    isStandardCategory: true,
    pphTracking: true
  },
  {
    id: 'crane_operation',
    name: 'Crane Operation',
    description: 'Time spent operating crane equipment',
    icon: '🏗️',
    color: 'bg-orange-500',
    isTreeWork: true,
    isStandardCategory: true,
    pphTracking: true
  },
  {
    id: 'forestry_mulching',
    name: 'Forestry Mulching',
    description: 'Time spent on large-scale mulching operations',
    icon: '🌿',
    color: 'bg-lime-600',
    isTreeWork: true,
    isStandardCategory: true,
    pphTracking: true
  },

  // Support Categories - Essential for accurate total project costs
  {
    id: 'transport',
    name: 'Transport',
    description: 'Travel time to/from job sites',
    icon: '🚛',
    color: 'bg-blue-500',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'debris_hauling',
    name: 'Debris Hauling',
    description: 'Time spent loading and hauling debris',
    icon: '🗑️',
    color: 'bg-yellow-600',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'site_cleanup',
    name: 'Site Cleanup',
    description: 'Final cleanup and site restoration',
    icon: '🧹',
    color: 'bg-purple-500',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'equipment_setup',
    name: 'Equipment Setup',
    description: 'Setting up equipment and safety zones',
    icon: '⚙️',
    color: 'bg-gray-600',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'maintenance',
    name: 'Equipment Maintenance',
    description: 'Equipment maintenance and repairs',
    icon: '🔧',
    color: 'bg-red-500',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'fuel_grease',
    name: 'Fuel & Grease',
    description: 'Refueling and equipment servicing',
    icon: '⛽',
    color: 'bg-indigo-500',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },

  // Business Operations Categories
  {
    id: 'sales',
    name: 'Sales',
    description: 'Time spent on sales activities and estimates',
    icon: '💼',
    color: 'bg-green-600',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'admin',
    name: 'Administration',
    description: 'Office work, paperwork, invoicing',
    icon: '📋',
    color: 'bg-slate-500',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'training',
    name: 'Training',
    description: 'Employee training and certification',
    icon: '🎓',
    color: 'bg-teal-500',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'safety_meeting',
    name: 'Safety Meeting',
    description: 'Safety briefings and meetings',
    icon: '🛡️',
    color: 'bg-rose-500',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  },
  {
    id: 'break',
    name: 'Break',
    description: 'Lunch and break time',
    icon: '☕',
    color: 'bg-neutral-400',
    isTreeWork: false,
    isStandardCategory: true,
    pphTracking: false
  }
];

// PpH Calculation Functions
export interface CategoryPpHData {
  categoryId: string;
  totalHours: number;
  totalTreeScorePoints: number;
  averagePpH: number;
  sessionCount: number;
  lastUpdated: number;
}

export function calculateCategoryPpH(
  categoryId: string,
  sessions: any[],
  treeScoreData: any[]
): CategoryPpHData {
  const categorySessions = sessions.filter(session => 
    session.category === categoryId && 
    session.status === 'completed' &&
    session.totalMinutes
  );

  const totalHours = categorySessions.reduce((total, session) => 
    total + (session.totalMinutes / 60), 0
  );

  // For tree work categories, calculate TreeScore points completed
  let totalTreeScorePoints = 0;
  if (STANDARD_CATEGORIES.find(cat => cat.id === categoryId)?.isTreeWork) {
    totalTreeScorePoints = categorySessions.reduce((total, session) => {
      const sessionTreeScore = treeScoreData.find(ts => ts.sessionId === session._id);
      return total + (sessionTreeScore?.pointsCompleted || 0);
    }, 0);
  }

  const averagePpH = totalHours > 0 ? totalTreeScorePoints / totalHours : 0;

  return {
    categoryId,
    totalHours,
    totalTreeScorePoints,
    averagePpH,
    sessionCount: categorySessions.length,
    lastUpdated: Date.now()
  };
}

// Custom SOP Category Management
export interface CustomSOPCategory extends TimeCategory {
  companyId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: number;
}

export function createCustomSOPCategory(
  companyId: string,
  name: string,
  description: string,
  icon: string,
  color: string
): CustomSOPCategory {
  return {
    id: `custom_${Date.now()}`,
    name,
    description,
    icon,
    color,
    isTreeWork: false,
    isStandardCategory: false,
    isCustomSOP: true,
    pphTracking: false,
    companyId,
    sortOrder: 0,
    isActive: true,
    createdAt: Date.now()
  };
}

// Get all available categories for a company
export function getCompanyCategories(customSOPs: CustomSOPCategory[] = []): TimeCategory[] {
  const activeCustomSOPs = customSOPs
    .filter(sop => sop.isActive)
    .slice(0, 10) // Max 10 custom SOPs
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return [...STANDARD_CATEGORIES, ...activeCustomSOPs];
}

// Category grouping for UI
export function getCategoriesByGroup(categories: TimeCategory[]) {
  return {
    treeWork: categories.filter(cat => cat.isTreeWork),
    support: categories.filter(cat => !cat.isTreeWork && cat.isStandardCategory),
    customSOPs: categories.filter(cat => cat.isCustomSOP)
  };
}

// Time tracking session with category
export interface CategoryTimeSession {
  _id: string;
  employeeId: string;
  employeeName: string;
  workOrderId?: string;
  category: string; // Category ID
  categoryName: string;
  sessionNumber: number;
  startTime: number;
  endTime?: number;
  totalMinutes?: number;
  location?: string;
  workDescription?: string;
  notes?: string;
  
  // TreeScore tracking for tree work categories
  treeScorePointsCompleted?: number;
  treesCompleted?: number;
  
  // Equipment used during session
  equipmentUsed: string[];
  
  // Project association
  projectPhase?: 'setup' | 'execution' | 'cleanup' | 'transport';
  
  // Status and approval
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: number;
  
  // Performance metrics
  productivityRating?: number; // 1-10 scale
  efficiencyNotes?: string;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Business intelligence functions
export function getProductivityInsights(
  sessions: CategoryTimeSession[],
  categories: TimeCategory[]
): any {
  const insights = {
    totalHours: 0,
    productiveHours: 0,
    treeWorkHours: 0,
    supportHours: 0,
    categoryBreakdown: {} as Record<string, number>,
    pphByCategory: {} as Record<string, number>,
    recommendations: [] as string[]
  };

  sessions.forEach(session => {
    if (session.status === 'completed' && session.totalMinutes) {
      const hours = session.totalMinutes / 60;
      insights.totalHours += hours;
      
      const category = categories.find(cat => cat.id === session.category);
      if (category) {
        if (category.isTreeWork) {
          insights.treeWorkHours += hours;
          insights.productiveHours += hours;
        } else {
          insights.supportHours += hours;
        }
        
        insights.categoryBreakdown[session.category] = 
          (insights.categoryBreakdown[session.category] || 0) + hours;
          
        // Calculate PpH for tree work categories
        if (category.isTreeWork && session.treeScorePointsCompleted) {
          const currentPpH = insights.pphByCategory[session.category] || 0;
          insights.pphByCategory[session.category] = 
            (currentPpH + (session.treeScorePointsCompleted / hours)) / 2;
        }
      }
    }
  });

  // Generate recommendations
  const productivityRatio = insights.productiveHours / insights.totalHours;
  if (productivityRatio < 0.7) {
    insights.recommendations.push('Consider optimizing support task efficiency - less than 70% productive time');
  }
  
  if (insights.supportHours > insights.treeWorkHours) {
    insights.recommendations.push('Support tasks exceed tree work time - review workflow efficiency');
  }

  return insights;
}