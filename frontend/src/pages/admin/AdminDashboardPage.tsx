import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Layers,
  Users,
  TrendingUp,
  Upload,
  Edit,
  Trash,
  Star,
  UserPlus,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import { DashboardStats } from '@/types/dashboard';

const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          // Include credentials if your auth relies on cookies
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-destructive font-bold">
        {error || 'No data available'}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Papers',
      value: data.stats.totalPapers,
      trend: data.stats.papersTrend,
      icon: FileText,
      color: 'primary',
    },
    {
      label: 'Total Downloads',
      value: data.stats.totalDownloads.toLocaleString(),
      trend: data.stats.downloadsTrend,
      icon: Download,
      color: 'primary',
    },
    {
      label: 'Active Strands',
      value: data.stats.activeStrands,
      icon: Layers,
      color: 'primary',
    },
    {
      label: 'Registered Users',
      value: data.stats.registeredUsers,
      icon: Users,
      color: 'primary',
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative p-4 min-h-[100px] rounded-lg bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                {stat.trend ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-medium text-success">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {stat.trend}%
                  </span>
                ) : null}
              </div>
              <p className="text-xl font-bold text-foreground leading-none">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Archive Uploads (Left Column) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 p-3 rounded-lg bg-card border border-border flex flex-col h-full overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Recent Uploads</h2>
            <Link
              to="/admin/papers"
              className="text-[10px] font-bold text-primary hover:underline uppercase"
            >
              All
            </Link>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {data.recentUploads.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No recent uploads</div>
            ) : (
              data.recentUploads.map((paper) => (
                <div key={paper.id} className="p-2 rounded-md bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors group shrink-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {paper.title}
                    </p>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black shrink-0">
                      <Download className="w-2.5 h-2.5" />
                      {paper.download_count}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">
                      {paper.strand}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(paper.published_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Charts Container */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full min-h-0">
          {/* Papers by School Year */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-card border border-border flex-1 flex flex-col min-h-0"
          >
            <h3 className="text-xs font-black text-foreground mb-2 uppercase tracking-wider shrink-0">Papers by School Year</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.schoolYearDistribution}>
                  <defs>
                    <linearGradient id="schoolYearGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    name="Papers"
                    strokeWidth={2}
                    fill="url(#schoolYearGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Downloads by Strand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-card border border-border flex-1 flex flex-col min-h-0"
          >
            <h3 className="text-xs font-black text-foreground mb-2 uppercase tracking-wider shrink-0">Distribution by Strand</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.downloadsByStrand} layout="vertical" margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="strand" type="category" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={45} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}
                  />
                  <Bar dataKey="downloads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
