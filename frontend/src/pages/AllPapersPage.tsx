import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import { PaperCard } from '@/components/papers/PaperCard';
import { useStore } from '@/store/useStore';
import { ResearchPaper } from '@/types/paper';
import { Strand } from '@/types/strand';

const AllPapersPage: React.FC = () => {
  const { filters, setSearchQuery, toggleStrand, setSelectedYear, setSortBy, clearFilters } = useStore();
  const [searchParams] = useSearchParams();
  const strandParam = searchParams.get('strand');

  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [strands, setStrands] = useState<Strand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersRes, strandsRes] = await Promise.all([
          fetch('/api/papers'),
          fetch('/api/strands')
        ]);

        if (papersRes.ok && strandsRes.ok) {
          const papersData = await papersRes.json();
          const strandsData = await strandsRes.json();
          setPapers(papersData);
          setStrands(strandsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync URL params with store
  useEffect(() => {
    if (strandParam && !filters.selectedStrands.includes(strandParam)) {
      toggleStrand(strandParam);
    }
  }, [strandParam]);

  const filteredPapers = useMemo(() => {
    let result = [...papers];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.some(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(q)) ||
        p.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    if (filters.selectedStrands.length > 0) {
      result = result.filter(p => filters.selectedStrands.includes(p.strand));
    }

    if (filters.selectedYear) {
      result = result.filter(p => p.school_year === filters.selectedYear);
    }

    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());
        break;
      case 'downloads':
        result.sort((a, b) => b.download_count - a.download_count);
        break;
      default:
        result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [filters, papers]);

  const years = useMemo(() =>
    [...new Set(papers.map(p => p.school_year))].sort().reverse(),
    [papers]
  );

  const hasFilters = filters.searchQuery || filters.selectedStrands.length > 0 || filters.selectedYear;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-6 md:pt-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-2 md:mb-4">All Research Papers</h1>
          <p className="text-base md:text-lg text-muted-foreground">Browse our complete collection of student research</p>
        </motion.div>

        <div className="lg:flex lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 mb-6 lg:mb-0">
            <div className="p-4 md:p-5 rounded-2xl bg-card border border-border sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                </h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear</button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>

              {/* Strands */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-foreground mb-2">Strand</h4>
                <div className="flex flex-wrap gap-2">
                  {strands.map(s => (
                    <button
                      key={s._id}
                      onClick={() => toggleStrand(s.short)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filters.selectedStrands.includes(s.short)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                        }`}
                    >
                      {s.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-foreground mb-2">School Year</h4>
                <select
                  value={filters.selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-sm"
                >
                  <option value="">All years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Sort by</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-sm"
                >
                  <option value="title">Title A-Z</option>
                  <option value="newest">Newest First</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">{filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''} found</p>
            </div>

            {filteredPapers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredPapers.map((paper, i) => (
                  <PaperCard key={paper._id} paper={paper} compact index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No papers found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                <button onClick={clearFilters} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium">
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllPapersPage;
