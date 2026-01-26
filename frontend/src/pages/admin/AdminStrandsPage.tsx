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
import { Icon } from '@iconify/react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { IconRenderer } from '@/components/common/IconRenderer';

const AVAILABLE_ICONS = [
  // Core Education & Academic
  { name: 'Books', id: 'fluent-emoji-flat:books' },
  { name: 'Graduation Cap', id: 'fluent-emoji-flat:graduation-cap' },
  { name: 'Microscope', id: 'fluent-emoji-flat:microscope' },
  { name: 'Test Tube', id: 'fluent-emoji-flat:test-tube' },
  { name: 'DNA', id: 'fluent-emoji-flat:dna' },
  { name: 'Atom', id: 'fluent-emoji-flat:atom-symbol' },
  { name: 'Abacus', id: 'fluent-emoji-flat:abacus' },
  { name: 'Globe', id: 'fluent-emoji-flat:globe-showing-asia-australia' },
  { name: 'Balance Scale', id: 'fluent-emoji-flat:balance-scale' },
  { name: 'Old Key', id: 'fluent-emoji-flat:old-key' },

  // Business & Management
  { name: 'Bar Chart', id: 'fluent-emoji-flat:bar-chart' },
  { name: 'Money Bag', id: 'fluent-emoji-flat:money-bag' },
  { name: 'Credit Card', id: 'fluent-emoji-flat:credit-card' },
  { name: 'Briefcase', id: 'fluent-emoji-flat:briefcase' },
  { name: 'Chart Increasing', id: 'fluent-emoji-flat:chart-increasing' },

  // TVL - ICT & Creative
  { name: 'Laptop', id: 'fluent-emoji-flat:laptop' },
  { name: 'Computer', id: 'fluent-emoji-flat:desktop-computer' },
  { name: 'Artist Palette', id: 'fluent-emoji-flat:artist-palette' },
  { name: 'Paintbrush', id: 'fluent-emoji-flat:paintbrush' },
  { name: 'Camera', id: 'fluent-emoji-flat:camera' },
  { name: 'Musical Notes', id: 'fluent-emoji-flat:musical-notes' },
  { name: 'Video Camera', id: 'fluent-emoji-flat:video-camera' },
  { name: 'Theater Masks', id: 'fluent-emoji-flat:performing-arts' },

  // TVL - Industrial Arts
  { name: 'Wrench', id: 'fluent-emoji-flat:wrench' },
  { name: 'Hammer and Wrench', id: 'fluent-emoji-flat:hammer-and-wrench' },
  { name: 'Screwdriver', id: 'fluent-emoji-flat:screwdriver' },
  { name: 'Gear', id: 'fluent-emoji-flat:gear' },
  { name: 'Hammer', id: 'fluent-emoji-flat:hammer' },
  { name: 'Nut and Bolt', id: 'fluent-emoji-flat:nut-and-bolt' },
  { name: 'Plug', id: 'fluent-emoji-flat:electric-plug' },
  { name: 'High Voltage', id: 'fluent-emoji-flat:high-voltage' },
  { name: 'Fire', id: 'fluent-emoji-flat:fire' },
  { name: 'Car', id: 'fluent-emoji-flat:automobile' },

  // TVL - Home Economics
  { name: 'Utensils', id: 'fluent-emoji-flat:fork-and-knife' },
  { name: 'Chef Hat', id: 'fluent-emoji-flat:chef-hat' },
  { name: 'Pizza', id: 'fluent-emoji-flat:pizza' },
  { name: 'Thread', id: 'fluent-emoji-flat:spool-of-thread' },
  { name: 'Dress', id: 'fluent-emoji-flat:dress' },
  { name: 'Lotion Bottle', id: 'fluent-emoji-flat:lotion-bottle' },

  // TVL - Agri-Fishery Arts
  { name: 'Seedling', id: 'fluent-emoji-flat:seedling' },
  { name: 'Sheaf of Rice', id: 'fluent-emoji-flat:sheaf-of-rice' },
  { name: 'Tractor', id: 'fluent-emoji-flat:tractor' },
  { name: 'Cow Face', id: 'fluent-emoji-flat:cow-face' },
  { name: 'Fish', id: 'fluent-emoji-flat:fish' },

  // Sports & Wellness
  { name: 'Basketball', id: 'fluent-emoji-flat:basketball' },
  { name: 'Soccer Ball', id: 'fluent-emoji-flat:soccer-ball' },
  { name: 'Volleyball', id: 'fluent-emoji-flat:volleyball' },
  { name: 'Sports Medal', id: 'fluent-emoji-flat:sports-medal' },
  { name: 'Running Shoe', id: 'fluent-emoji-flat:running-shoe' },

  // Maritime & Others
  { name: 'Ship', id: 'fluent-emoji-flat:ship' },
  { name: 'Compass', id: 'fluent-emoji-flat:compass' },
  { name: 'Anchor', id: 'fluent-emoji-flat:anchor' },
  { name: 'Rocket', id: 'fluent-emoji-flat:rocket' },
  { name: 'Light Bulb', id: 'fluent-emoji-flat:light-bulb' },
  { name: 'Satellite Antenna', id: 'fluent-emoji-flat:satellite-antenna' },
  { name: 'Memo', id: 'fluent-emoji-flat:memo' },
];



interface StrandData {
  _id: string;
  short: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  paperCount?: number;
}


const AdminStrandsPage: React.FC = () => {
  const { addToast } = useAdminStore();
  const [strands, setStrands] = useState<StrandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingStrand, setEditingStrand] = useState<StrandData | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [strandToDelete, setStrandToDelete] = useState<StrandData | null>(null);

  // Form State
  const [formData, setFormData] = useState({ short: '', name: '', description: '', icon: 'fluent-emoji-flat:books' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/strands');
      if (res.ok) {
        const data = await res.json();
        setStrands(data);
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to fetch strands' });
      }
    } catch (error) {
      console.error('Error fetching strands:', error);
      addToast({ type: 'error', title: 'Error', message: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStrands();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setEditingStrand(null);
    setFormData({ short: '', name: '', description: '', icon: 'fluent-emoji-flat:books' });
    setShowModal(true);
  };

  const openEditModal = (strand: StrandData) => {
    setModalMode('edit');
    setEditingStrand(strand);
    setFormData({
      short: strand.short,
      name: strand.name,
      description: strand.description || '',
      icon: strand.icon || 'fluent-emoji-flat:books'
    });
    setShowModal(true);
  };

  const openDeleteModal = (strand: StrandData) => {
    setStrandToDelete(strand);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting Strand Data:', formData);
    setIsSubmitting(true);
    try {
      const url = modalMode === 'edit' && editingStrand
        ? `/api/strands/${editingStrand._id}`
        : '/api/strands';

      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Strand ${modalMode === 'edit' ? 'updated' : 'created'} successfully`
        });
        setShowModal(false);
        fetchStrands();
      } else {
        addToast({ type: 'error', title: 'Error', message: data.message || 'Operation failed' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!strandToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/strands/${strandToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'success', title: 'Deleted', message: 'Strand removed' });
        fetchStrands();
        setIsDeleteModalOpen(false);
      } else {
        const data = await res.json();
        addToast({ type: 'error', title: 'Error', message: data.message || 'Failed to delete' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<StrandData>[]>(
    () => [
      {
        accessorKey: 'short',
        header: 'Acronym',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center shrink-0 shadow-sm border border-border/40 group-hover:border-primary/20 transition-colors">
              <IconRenderer iconName={row.original.icon} className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-primary leading-none mb-1">{row.original.short}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">Strand</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Full Name',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <p className="text-muted-foreground truncate max-w-xs" title={row.original.description}>
            {row.original.description}
          </p>
        ),
      },
      {
        accessorKey: 'paperCount',
        header: 'Papers',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${(row.original.paperCount || 0) > 0
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
              }`}>
              {row.original.paperCount || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => openEditModal(row.original)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              disabled={(row.original.paperCount || 0) > 0}
              className={`p-1.5 rounded-lg transition-colors ${(row.original.paperCount || 0) > 0
                ? 'opacity-30 cursor-not-allowed hover:bg-transparent text-muted-foreground'
                : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'}`}
              title={(row.original.paperCount || 0) > 0 ? "Cannot delete strand with linked papers" : "Delete Strand"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: strands,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search strands..."
            className="pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm w-64"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all text-sm font-medium btn-press"
        >
          <Plus className="w-4 h-4" />
          New Strand
        </button>
      </div>

      {/* Table Container - Fits Screen */}
      <div className="flex-1 rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full relative">
            <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground first:pl-6 last:pr-6"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading strands...
                    </div>
                  </td>
                </tr>
              ) : strands.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                    No strands found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors last:border-b-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-2.5 text-sm first:pl-6 last:pr-6">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Count */}
        {!isLoading && strands.length > 0 && (
          <div className="px-6 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {strands.length} total strands
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-elevated overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-5 py-4 border-b border-border/60 bg-muted/10 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-foreground tracking-tight leading-none">
                  {modalMode === 'add' ? 'Create New Strand' : 'Edit Strand Profile'}
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1.5">
                  Track Configuration & Visual Identity
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-8 overflow-y-auto custom-scrollbar pr-1">
                {/* Left Column: Form Fields */}
                <div className="flex-1 space-y-5">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Acronym</label>
                      <input
                        required
                        type="text"
                        value={formData.short}
                        onChange={(e) => setFormData({ ...formData, short: e.target.value })}
                        placeholder="e.g., STEM"
                        className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Science, Technology, Engineering, and Mathematics"
                        className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., Provide a brief overview of this strand's research focus, such as its primary objectives and specialized fields."
                      className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none transition-all leading-relaxed"
                    />
                  </div>

                  {/* Preview Card */}
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner shrink-0">
                      <IconRenderer iconName={formData.icon} className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground leading-none text-base truncate">{formData.short || '...'}</h4>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{formData.name || 'Strand Name'}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Icon Selection */}
                <div className="w-full lg:w-[200px] flex flex-col shrink-0">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Select Icon</label>
                  <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 p-2 rounded-xl bg-secondary/30 border border-border/60 overflow-y-auto custom-scrollbar max-h-[160px] lg:max-h-full">
                    {AVAILABLE_ICONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.id })}
                        className={`group relative aspect-square rounded-xl flex items-center justify-center transition-all ${formData.icon === item.id
                          ? 'bg-primary/20 ring-2 ring-primary scale-105 shadow-md shadow-primary/10'
                          : 'bg-card border border-border/40 hover:bg-secondary/50'
                          }`}
                        title={item.name}
                      >
                        <Icon icon={item.id} className={`w-6 h-6 transition-transform ${formData.icon === item.id ? 'drop-shadow-sm' : 'grayscale group-hover:grayscale-0'}`} />
                        {formData.icon === item.id && (
                          <motion.div
                            layoutId="activeIcon"
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded-xl bg-secondary text-foreground hover:bg-muted text-sm font-bold transition-all border border-border/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px] px-8 py-2 rounded-xl bg-primary text-primary-foreground hover:brightness-110 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all btn-press"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    modalMode === 'add' ? 'Create Strand' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {
        createPortal(
          <AnimatePresence>
            {isDeleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm focus-ring">
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
                    <h3 className="text-lg font-bold text-foreground">Delete Strand?</h3>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete <strong>{strandToDelete?.short}</strong>? This action cannot be undone.
                    </p>

                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                      <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-muted font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:brightness-110 font-medium text-sm flex items-center justify-center"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )
      }
    </div >
  );
};

export default AdminStrandsPage;
