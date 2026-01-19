export interface DashboardStats {
    stats: {
        totalPapers: number;
        totalDownloads: number;
        activeStrands: number;
        registeredUsers: number;
        papersTrend: number;
        downloadsTrend: number;
    };
    recentUploads: {
        id: string;
        title: string;
        strand: string;
        download_count: number;
        published_date: string;
    }[];
    schoolYearDistribution: {
        year: string;
        count: number;
    }[];
    downloadsByStrand: {
        strand: string;
        downloads: number;
    }[];
}
