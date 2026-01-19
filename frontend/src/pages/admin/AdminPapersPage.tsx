import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
// import { strands } from '@/data/mockPapers'; // Removed mock data import
// import { schoolYears } from '@/data/adminMockData'; // Removed fixed list
import { useAdminStore } from '@/store/adminStore';
import { AddPaperModal } from '@/components/admin/AddPaperModal';
import { ViewPaperModal } from '@/components/admin/ViewPaperModal';

// Types matching Backend Response
interface Paper {
  _id: string; // Backend ID
  id?: string; // Sometimes used interchangeably
  title: string;
  authors: { firstName: string; middleName: string; lastName: string; suffix: string }[];
  author_display: string;
  strand: string; // Short code
  school_year: string;
  download_count: number;
  is_featured: boolean;
  abstract: string;
  keywords: string[];
  adviser: string;
  grade_section: string;
  pdf_path: string;
  createdAt: string;
}

interface Strand {
  _id: string;
  short: string;
  name: string;
}

const AdminPapersPage: React.FC = () => {
  const { addToast } = useAdminStore();
  const [data, setData] = useState<Paper[]>([]);
  const [strands, setStrands] = useState<Strand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [strandFilter, setStrandFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [viewPaper, setViewPaper] = useState<Paper | null>(null);
  const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic School Years from data
  const availableYears = useMemo(() => {
    const years = data.map(paper => paper.school_year).filter(Boolean);
    const uniqueYears = Array.from(new Set(years));
    return uniqueYears.sort((a, b) => b.localeCompare(a)); // Descending order
  }, [data]);

  // Initial Fetch
  useEffect(() => {
    Promise.all([fetchPapers(), fetchStrands()]);
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await fetch('/api/papers');
      if (res.ok) {
        const papers = await res.json();
        setData(papers);
      }
    } catch (error) {
      console.error('Failed to fetch papers', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to load papers' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStrands = async () => {
    try {
      const res = await fetch('/api/strands');
      if (res.ok) {
        const list = await res.json();
        setStrands(list);
      }
    } catch (error) {
      console.error('Failed to fetch strands', error);
    }
  };

  const checkStrandsAndOpenModal = () => {
    // 2. Logic: If no strands, warn user.
    if (strands.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Strands Found',
        message: 'Please create at least one Strand before adding a research paper.'
      });
      // Ideally redirect to strands page or open add strand modal, but for now warning is sufficient
      return;
    }
    setEditingPaper(null); // Clear edit state
    setShowNewModal(true);
  };

  const handleEditPaper = (paper: Paper) => {
    setEditingPaper(paper);
    setShowNewModal(true);
  };

  const handleAddPaper = async (paperData: any) => {
    // 3. Validation handled in Modal, here we process upload
    try {
      const formData = new FormData();
      formData.append('title', paperData.title);
      formData.append('abstract', paperData.abstract);
      formData.append('keywords', paperData.keywords);
      formData.append('adviser', paperData.adviser);
      formData.append('strand', paperData.strand);
      formData.append('school_year', paperData.schoolYear);
      formData.append('grade_section', paperData.gradeSection);
      formData.append('is_featured', String(paperData.isFeatured));

      // Authors as JSON string
      formData.append('authors', JSON.stringify(paperData.authors));

      // PDF File (optional for edit)
      if (paperData.pdfFile) {
        formData.append('pdf', paperData.pdfFile);
      }

      const url = editingPaper ? `/api/papers/${editingPaper._id}` : '/api/papers';
      const method = editingPaper ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formData, // No Content-Type header needed, browser sets it for FormData
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Research paper ${editingPaper ? 'updated' : 'added'} successfully!`
        });
        fetchPapers(); // Refresh list
        setEditingPaper(null); // Reset
      } else {
        const err = await res.json();
        addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to save paper' });
      }
    } catch (error) {
      console.error('Error saving paper:', error);
      addToast({ type: 'error', title: 'Error', message: 'Network error occurred' });
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setData((prev) =>
      prev.map((p) => (p._id === id ? { ...p, is_featured: !currentStatus } : p))
    );

    try {
      const res = await fetch(`/api/papers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentStatus }) // Only sending what changed
      });
      if (!res.ok) {
        // Revert on failure
        setData((prev) => prev.map((p) => (p._id === id ? { ...p, is_featured: currentStatus } : p)));
        addToast({ type: 'error', title: 'Update Failed' });
      }
    } catch (e) {
      setData((prev) => prev.map((p) => (p._id === id ? { ...p, is_featured: currentStatus } : p)));
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/papers/${paperToDelete._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        addToast({ type: 'success', title: 'Deleted', message: 'Research paper removed successfully' });
        setData((prev) => prev.filter((p) => p._id !== paperToDelete._id));
      } else {
        const err = await res.json();
        addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to delete' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Network error' });
    } finally {
      setIsDeleting(false);
      setPaperToDelete(null);
    }
  };

  const columns = React.useMemo<ColumnDef<Paper>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="max-w-xs">
            <p className="font-medium text-foreground line-clamp-2" title={row.original.title}>{row.original.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5" title={row.original.author_display}>
              {row.original.author_display}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'strand',
        header: 'Strand',
        cell: ({ row }) => (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {row.original.strand}
          </span>
        ),
      },
      {
        accessorKey: 'school_year',
        header: 'Year',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.school_year}</span>
        ),
      },
      {
        accessorKey: 'download_count',
        header: 'Downloads',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.download_count}</span>
        ),
      },
      {
        accessorKey: 'is_featured',
        header: 'Featured',
        cell: ({ row }) => (
          <button
            onClick={(e) => { e.stopPropagation(); toggleFeatured(row.original._id, row.original.is_featured); }}
            className={`p-2 rounded-lg transition-colors ${row.original.is_featured
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            <Star className={`w-4 h-4 ${row.original.is_featured ? 'fill-current' : ''}`} />
          </button>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewPaper(row.original)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="View Details & PDF"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditPaper(row.original)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Edit Paper"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPaperToDelete(row.original)}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const filteredData = React.useMemo(() => {
    let result = data;
    if (strandFilter) {
      result = result.filter((p) => p.strand === strandFilter);
    }
    if (yearFilter) {
      result = result.filter((p) => p.school_year === yearFilter);
    }
    return result;
  }, [data, strandFilter, yearFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search papers..."
              className="pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm w-64"
            />
          </div>

          {/* Strand Filter */}
          <select
            value={strandFilter}
            onChange={(e) => setStrandFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-sm"
          >
            <option value="">All Strands</option>
            {strands.map((s) => (
              <option key={s._id} value={s.short}>
                {s.short}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-sm"
          >
            <option value="">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkStrandsAndOpenModal} // Updated to check strands first
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all text-sm font-medium btn-press"
          >
            <Plus className="w-4 h-4" />
            New Paper
          </button>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border overflow-hidden"
      >
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p>Loading research papers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-muted-foreground">
                    No research papers found. Click 'New Paper' to add one.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {table.getRowModel().rows.length} of {filteredData.length} papers</span>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Paper Modal */}
      <AddPaperModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleAddPaper}
        strands={strands}
        initialData={editingPaper}
      />

      {/* View Paper Modal */}
      <ViewPaperModal
        paper={viewPaper}
        onClose={() => setViewPaper(null)}
      />

      {/* Delete Confirmation Modal (Styled per Strands Design) */}
      {createPortal(
        <AnimatePresence>
          {paperToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated overflow-hidden p-6"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Delete Paper?</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <span className="font-semibold text-foreground">"{paperToDelete.title}"</span>? This action cannot be undone.
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <button
                      type="button"
                      onClick={() => setPaperToDelete(null)}
                      className="px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-muted transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:brightness-110 disabled:opacity-50 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default AdminPapersPage;
