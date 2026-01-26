import React, { useEffect, useState } from 'react';
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
  Pencil,
  Trash2,
  ShieldCheck,
  Eye,
  X,
  Loader2,
  EyeOff,
  AlertTriangle,
  LogOut,
  Circle,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

// Define Interface matching Backend Data
interface UserData {
  _id: string;
  full_name: string;
  username: string;
  role: 'admin' | 'viewer' | 'editor';
  createdAt: string;
  // password is not returned
}

const roleIcons = {
  admin: ShieldCheck,
  viewer: Eye,
  editor: Pencil, // or another icon like Edit/FileText
};

const roleColors = {
  admin: 'bg-primary/10 text-primary',
  viewer: 'bg-muted text-muted-foreground',
  editor: 'bg-indigo-500/10 text-indigo-500',
};

const AdminUsersPage: React.FC = () => {
  const { addToast, currentUser } = useAdminStore();
  const [data, setData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Kick Modal States
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [userToKick, setUserToKick] = useState<UserData | null>(null);

  // Active Sessions State
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'viewer' as 'admin' | 'viewer' | 'editor',
    currentAdminPassword: '', // For verifying admin identity on edit
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json();
        setData(users);
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to fetch users' });
      }
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Error', message: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Active Sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/users/sessions');
      if (res.ok) {
        const ids = await res.json();
        setActiveUserIds(ids);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSessions();
  }, [addToast]);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ fullName: '', username: '', password: '', role: 'viewer', currentAdminPassword: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserData) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      fullName: user.full_name,
      username: user.username,
      password: '', // Leave empty if not changing
      role: user.role,
      currentAdminPassword: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const openKickModal = (user: UserData) => {
    setUserToKick(user);
    setIsKickModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (modalMode === 'add') {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      }
    } else {
      // Edit Mode
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'New password must be at least 6 characters.';
      }
      // Require admin password verification if editing an admin account
      if (selectedUser?.role === 'admin' && !formData.currentAdminPassword) {
        newErrors.currentAdminPassword = 'Required to verify changes.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.fullName,
            username: formData.username,
            password: formData.password,
            role: formData.role
          }),
        });

        if (res.ok) {
          addToast({ type: 'success', title: 'Success', message: 'User created successfully' });
          setIsModalOpen(false);
          fetchUsers();
        } else {
          const data = await res.json();
          setErrors({ ...errors, form: data.message || 'Failed to create user' });
        }
      } else {
        // Edit Mode
        const body: any = {
          full_name: formData.fullName,
          username: formData.username,
          role: formData.role
        };
        if (formData.password) body.password = formData.password;
        if (formData.currentAdminPassword) body.currentPassword = formData.currentAdminPassword;

        const res = await fetch(`/api/users/${selectedUser?._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          addToast({ type: 'success', title: 'Success', message: 'User updated successfully' });
          setIsModalOpen(false);
          fetchUsers();
        } else {
          const data = await res.json();
          if (res.status === 403) {
            setErrors({ ...errors, currentAdminPassword: 'Incorrect password' });
          } else {
            setErrors({ ...errors, form: data.message || 'Failed to update user' });
          }
        }
      }
    } catch (error) {
      console.error(error);
      setErrors({ ...errors, form: 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${userToDelete._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        addToast({ type: 'success', title: 'Deleted', message: 'User and sessions deleted successfully' });
        setIsDeleteModalOpen(false);
        fetchUsers();
        fetchSessions();
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

  const handleKick = async () => {
    if (!userToKick) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${userToKick._id}/sessions`, {
        method: 'DELETE',
      });

      if (res.ok) {
        addToast({ type: 'success', title: 'Kicked', message: `${userToKick.full_name} has been logged out` });
        setIsKickModalOpen(false);
        fetchSessions();
      } else {
        const data = await res.json();
        addToast({ type: 'error', title: 'Error', message: data.message || 'Failed to kick user' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = React.useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {row.original.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-foreground">{row.original.full_name}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">@{row.original.username}</span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const Icon = roleIcons[row.original.role];
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${roleColors[row.original.role]
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = activeUserIds.includes(row.original._id);
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-muted text-muted-foreground'
                }`}
            >
              <Circle className={`w-2 h-2 ${isActive ? 'fill-emerald-500' : 'fill-muted-foreground'}`} />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const isCurrentUser = row.original._id === currentUser?.id;
          const isAdmin = currentUser?.role === 'admin';
          const isActive = activeUserIds.includes(row.original._id);

          // Allow edit if it's NOT an admin account
          // Admins should manage their own accounts via ProfileSettingsPage
          const canEdit = row.original.role !== 'admin';

          return (
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  onClick={() => openEditModal(row.original)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={isCurrentUser ? "Edit Your Account" : "Edit User Full Name"}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {isActive && !isCurrentUser && (
                <button
                  onClick={() => openKickModal(row.original)}
                  className="p-2 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-colors"
                  title="Kick User"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
              <button
                disabled={isCurrentUser}
                onClick={() => openDeleteModal(row.original)}
                className={`p-2 rounded-lg transition-colors ${isCurrentUser
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                  }`}
                title={isCurrentUser ? "Cannot delete yourself" : "Delete User"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [currentUser, activeUserIds]
  );

  const sortedData = React.useMemo(() => {
    const rolePriority = {
      admin: 0,
      editor: 1,
      viewer: 2,
    };

    return [...data].sort((a, b) => {
      // 1. Primary Sort: Role Priority
      const priorityA = rolePriority[a.role];
      const priorityB = rolePriority[b.role];

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 2. Secondary Sort: Full Name (A-Z)
      return a.full_name.localeCompare(b.full_name);
    });
  }, [data]);

  const table = useReactTable({
    data: sortedData,
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm w-64"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all text-sm font-medium btn-press"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Simple summary based on fetched data */}
        {(['admin', 'editor', 'viewer'] as const).map((role) => {
          const count = data.filter((u) => u.role === role).length;
          const Icon = roleIcons[role];
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${roleColors[role]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}s</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground"
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
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit User Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm focus-ring">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-elevated overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
                  <div className="p-6 overflow-y-auto space-y-4">
                    {errors.form && (
                      <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.form}
                      </div>
                    )}

                    {/* Info Banner when admin editing other user */}
                    {modalMode === 'edit' && selectedUser?._id !== currentUser?.id && (
                      <div className="p-3 bg-blue-500/10 text-blue-500 text-xs rounded-xl flex items-center gap-2 border border-blue-500/20">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                        <p>As an administrator, you are editing <strong>{selectedUser?.full_name}</strong>'s account. Per security policy, only the Full Name can be modified.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column or Single Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Full Name</label>
                          <input
                            required
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Enter full name"
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-sm transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">Username</label>
                            {modalMode === 'edit' && selectedUser?._id !== currentUser?.id && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                <X className="w-2.5 h-2.5" />
                                Restricted
                              </div>
                            )}
                          </div>
                          <input
                            required
                            disabled={modalMode === 'edit' && selectedUser?._id !== currentUser?.id}
                            type="text"
                            value={formData.username}
                            onChange={(e) => {
                              setFormData({ ...formData, username: e.target.value });
                              if (errors.username) setErrors({ ...errors, username: '' });
                            }}
                            placeholder="Enter username"
                            className={`w-full px-4 py-2 rounded-xl bg-secondary border outline-none text-sm transition-colors ${errors.username ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                              } ${modalMode === 'edit' && selectedUser?._id !== currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          {errors.username && (
                            <p className="text-xs text-destructive mt-1 font-medium">{errors.username}</p>
                          )}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">
                              {modalMode === 'add' ? 'Password' : 'New Password (Optional)'}
                            </label>
                            {modalMode === 'edit' && selectedUser?._id !== currentUser?.id && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                <X className="w-2.5 h-2.5" />
                                Restricted
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              required={modalMode === 'add'}
                              disabled={modalMode === 'edit' && selectedUser?._id !== currentUser?.id}
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                if (errors.password) setErrors({ ...errors, password: '' });
                              }}
                              placeholder={modalMode === 'add' ? "Enter password" : (selectedUser?._id !== currentUser?.id ? "Administrator restricted" : "Leave blank to keep current")}
                              className={`w-full pl-4 pr-12 py-2 rounded-xl bg-secondary border outline-none text-sm transition-colors ${errors.password ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                                } ${modalMode === 'edit' && selectedUser?._id !== currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            {!(modalMode === 'edit' && selectedUser?._id !== currentUser?.id) && (
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors z-10"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                          {errors.password && (
                            <p className="text-xs text-destructive mt-1 font-medium">{errors.password}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">Role</label>
                            {modalMode === 'edit' && selectedUser?._id !== currentUser?.id && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                <X className="w-2.5 h-2.5" />
                                Restricted
                              </div>
                            )}
                          </div>
                          <select
                            disabled={modalMode === 'edit' && selectedUser?._id !== currentUser?.id}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            className={`w-full px-4 py-2 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-sm transition-colors ${modalMode === 'edit' && selectedUser?._id !== currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Admin Password Verification Section - Full Width Below Grid */}
                    {modalMode === 'edit' && selectedUser?.role === 'admin' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2"
                      >
                        <div className="p-4 bg-muted/40 rounded-xl border border-dashed border-border space-y-3">
                          <div className="flex items-center gap-2 text-amber-500">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">Admin Verification Required</span>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Verify Your Password</label>
                            <input
                              required
                              type="password"
                              value={formData.currentAdminPassword}
                              onChange={(e) => {
                                setFormData({ ...formData, currentAdminPassword: e.target.value });
                                if (errors.currentAdminPassword) setErrors({ ...errors, currentAdminPassword: '' });
                              }}
                              placeholder="Enter your current password"
                              className={`w-full px-4 py-2 rounded-xl bg-background border outline-none text-sm transition-colors ${errors.currentAdminPassword ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                                }`}
                            />
                            {errors.currentAdminPassword && (
                              <p className="text-xs text-destructive mt-1 font-medium">{errors.currentAdminPassword}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="p-6 border-t border-border bg-card flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-foreground hover:bg-muted transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        modalMode === 'add' ? 'Create User' : 'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {createPortal(
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
                  <h3 className="text-lg font-bold text-foreground">Delete User?</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <strong>{userToDelete?.full_name}</strong>? This action cannot be undone.
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
      )}

      {/* Kick Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {isKickModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm focus-ring">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated overflow-hidden p-6"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Kick User?</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to log out <strong>{userToKick?.full_name}</strong>? Their active session will be terminated.
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <button
                      onClick={() => setIsKickModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-muted font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleKick}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:brightness-110 font-medium text-sm flex items-center justify-center"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kick User'}
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

export default AdminUsersPage;
