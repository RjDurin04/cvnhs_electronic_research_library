export interface AdminPaper {
  id: string;
  title: string;
  authors: { first: string; middle?: string; last: string; suffix?: string }[];
  author_display: string;
  adviser: string;
  abstract: string;
  keywords: string[];
  strand: string;
  school_year: string;
  grade_section: string;
  download_count: number;
  published_date: string;
  upload_date: string;
  is_featured: boolean;
  pdf_url?: string;
  pdf_size?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'viewer';
  status: 'active' | 'inactive';
  created_at: string;
  last_login: string;
  avatar?: string;
}

export interface Activity {
  id: string;
  type: 'upload' | 'edit' | 'delete' | 'feature' | 'user';
  message: string;
  user: string;
  timestamp: string;
}

export const adminUsers: AdminUser[] = [
  { id: '1', name: 'Dr. Roberto Garcia', username: 'rgarcia', email: 'rgarcia@cvnhs.edu.ph', role: 'admin', status: 'active', created_at: '2023-01-15', last_login: '2025-01-13T08:30:00' },
  { id: '2', name: 'Ms. Elena Fernandez', username: 'efernandez', email: 'efernandez@cvnhs.edu.ph', role: 'admin', status: 'active', created_at: '2023-02-20', last_login: '2025-01-12T14:22:00' },
  { id: '3', name: 'Mr. Antonio Bautista', username: 'abautista', email: 'abautista@cvnhs.edu.ph', role: 'admin', status: 'active', created_at: '2023-05-10', last_login: '2025-01-11T09:15:00' },
  { id: '4', name: 'Ms. Carla Mendoza', username: 'cmendoza', email: 'cmendoza@cvnhs.edu.ph', role: 'viewer', status: 'active', created_at: '2023-06-01', last_login: '2025-01-10T16:45:00' },
  { id: '5', name: 'Mr. Paulo Fernandez', username: 'pfernandez', email: 'pfernandez@cvnhs.edu.ph', role: 'viewer', status: 'inactive', created_at: '2023-08-15', last_login: '2025-01-09T11:30:00' },
  { id: '6', name: 'Ms. Gloria Pascual', username: 'gpascual', email: 'gpascual@cvnhs.edu.ph', role: 'admin', status: 'active', created_at: '2024-01-10', last_login: '2025-01-08T10:00:00' },
  { id: '7', name: 'John Student', username: 'jstudent', email: 'jstudent@cvnhs.edu.ph', role: 'viewer', status: 'active', created_at: '2024-06-01', last_login: '2025-01-07T13:20:00' },
  { id: '8', name: 'Maria Viewer', username: 'mviewer', email: 'mviewer@cvnhs.edu.ph', role: 'viewer', status: 'active', created_at: '2024-09-15', last_login: '2025-01-05T15:00:00' },
];

export const recentActivity: Activity[] = [
  { id: '1', type: 'upload', message: 'Solar-Powered Phone Charging Station uploaded', user: 'Ms. Elena Fernandez', timestamp: '2h ago' },
  { id: '2', type: 'feature', message: 'Mental Health Awareness study marked as featured', user: 'Dr. Roberto Garcia', timestamp: '4h ago' },
  { id: '3', type: 'edit', message: 'Updated abstract for Financial Literacy paper', user: 'Mr. Antonio Bautista', timestamp: '5h ago' },
  { id: '4', type: 'user', message: 'New editor account created for Ms. Pascual', user: 'Dr. Roberto Garcia', timestamp: '1d ago' },
  { id: '5', type: 'upload', message: 'K-Pop Culture Influence research uploaded', user: 'Ms. Carla Mendoza', timestamp: '1d ago' },
  { id: '6', type: 'delete', message: 'Removed duplicate paper entry', user: 'Dr. Roberto Garcia', timestamp: '2d ago' },
];

export const uploadTrends = [
  { month: 'Jan 2024', uploads: 3 },
  { month: 'Feb 2024', uploads: 5 },
  { month: 'Mar 2024', uploads: 4 },
  { month: 'Apr 2024', uploads: 6 },
  { month: 'May 2024', uploads: 8 },
  { month: 'Jun 2024', uploads: 2 },
  { month: 'Jul 2024', uploads: 4 },
  { month: 'Aug 2024', uploads: 7 },
  { month: 'Sep 2024', uploads: 5 },
  { month: 'Oct 2024', uploads: 6 },
  { month: 'Nov 2024', uploads: 8 },
  { month: 'Dec 2024', uploads: 4 },
  { month: 'Jan 2025', uploads: 6 },
];

export const downloadsByStrand = [
  { strand: 'STEM', downloads: 2450 },
  { strand: 'ABM', downloads: 1820 },
  { strand: 'HUMSS', downloads: 1560 },
  { strand: 'TVL', downloads: 980 },
  { strand: 'GAS', downloads: 720 },
];

export const dashboardStats = {
  totalPapers: 47,
  totalDownloads: 7530,
  activeStrands: 5,
  registeredUsers: 8,
  papersTrend: 12.5,
  downloadsTrend: 8.3,
};

export const schoolYears = [
  '2025-2026',
  '2024-2025',
  '2023-2024',
  '2022-2023',
  '2021-2022',
  '2020-2021',
  '2019-2020',
];

export const strandsList = [
  { id: 'stem', short: 'STEM', name: 'Science, Technology, Engineering, and Mathematics', paperCount: 15, createdAt: '2020-06-01' },
  { id: 'abm', short: 'ABM', name: 'Accountancy, Business, and Management', paperCount: 12, createdAt: '2020-06-01' },
  { id: 'humss', short: 'HUMSS', name: 'Humanities and Social Sciences', paperCount: 10, createdAt: '2020-06-01' },
  { id: 'tvl', short: 'TVL', name: 'Technical-Vocational-Livelihood', paperCount: 6, createdAt: '2020-06-01' },
  { id: 'gas', short: 'GAS', name: 'General Academic Strand', paperCount: 4, createdAt: '2020-06-01' },
];
