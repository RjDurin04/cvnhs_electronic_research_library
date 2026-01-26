import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Save, Loader2, AlertTriangle, ShieldCheck, Eye, EyeOff, Trash2, X } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { Badge } from '@/components/ui/badge';
import { createPortal } from 'react-dom';

const ProfileSettingsPage: React.FC = () => {
    const { currentUser, addToast, logout } = useAdminStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formData, setFormData] = useState({
        fullName: currentUser?.name || '',
        username: currentUser?.username || '',
        newPassword: '',
        currentPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
    const [adminCount, setAdminCount] = useState<number | null>(null);

    const checkAdminCount = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const users = await res.json();
                const count = users.filter((u: any) => u.role === 'admin').length;
                setAdminCount(count);
            }
        } catch (error) {
            console.error('Error checking admin count:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!formData.currentPassword) {
            setErrors({ currentPassword: 'You must enter your current password to save changes.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const body: any = {
                full_name: formData.fullName,
                username: formData.username,
                currentPassword: formData.currentPassword
            };

            if (formData.newPassword) {
                if (formData.newPassword.length < 6) {
                    setErrors({ newPassword: 'New password must be at least 6 characters.' });
                    setIsSubmitting(false);
                    return;
                }
                body.password = formData.newPassword;
            }

            const res = await fetch(`/api/users/${currentUser?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                addToast({ type: 'success', title: 'Profile Updated', message: 'Logging you out of all devices...' });

                // 1. Kick all sessions (Logout everywhere)
                try {
                    await fetch(`/api/users/${currentUser?.id}/sessions`, { method: 'DELETE' });
                } catch (e) { console.error('Failed to clear server sessions', e); }

                // 2. Clear client state and redirect
                setTimeout(() => {
                    logout();
                    window.location.href = '/';
                }, 1500);

                setFormData(prev => ({ ...prev, newPassword: '', currentPassword: '' }));
            } else {
                if (res.status === 403) {
                    setErrors({ currentPassword: 'Incorrect current password.' });
                } else if (data.message === 'Username taken') {
                    setErrors({ username: 'This username is already in use.' });
                } else {
                    addToast({ type: 'error', title: 'Error', message: data.message || 'Failed to update profile' });
                }
            }
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'Error', message: 'Network error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirmPassword) {
            setErrors({ deletePassword: 'Password required' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/users/${currentUser?.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: deleteConfirmPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowDeleteModal(false);
                addToast({ type: 'success', title: 'Account Deleted', message: 'Your account has been permanently removed.' });
                setTimeout(() => {
                    logout();
                    window.location.href = '/';
                }, 1500);
            } else {
                addToast({ type: 'error', title: 'Deletion Failed', message: data.message || 'Error deleting account' });
                if (res.status === 403) setErrors({ deletePassword: 'Incorrect password' });
            }
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'Error', message: 'Network error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLastAdmin = currentUser?.role === 'admin' && adminCount === 1;

    return (
        <div className="max-w-5xl mx-auto py-6 px-4">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-black text-foreground tracking-tight leading-none text-primary">Account Settings</h1>
                <p className="text-muted-foreground mt-1.5 text-sm">Manage your personal information and security credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-card border border-border rounded-xl p-5 text-center shadow-sm hover:border-primary/20 transition-colors">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground leading-tight">{currentUser?.name}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">@{currentUser?.username}</p>
                        <div className="mt-5 pt-5 border-t border-border flex flex-col items-center">
                            <Badge variant="secondary" className="px-3 py-0.5 uppercase font-black text-[9px] tracking-widest bg-primary/5 text-primary border-primary/10 border">
                                {currentUser?.role} Role
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-600 shadow-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 text-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Security Notice</p>
                            <p className="text-[11px] leading-relaxed opacity-90 font-medium">Changing your username or password will require you to log in again on your next session.</p>
                        </div>
                    </div>

                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wide text-destructive">Danger Zone</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                checkAdminCount();
                                setDeleteConfirmPassword('');
                                setErrors({});
                                setShowDeleteModal(true);
                            }}
                            className="w-full py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all text-[11px] font-black uppercase tracking-widest border border-destructive/20"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-xl shadow-sm"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-foreground flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-primary" />
                                            Full Name
                                        </label>
                                        <input
                                            required
                                            disabled={currentUser?.role !== 'admin'}
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className={`w-full px-3 py-2 text-sm rounded-lg bg-secondary border outline-none transition-all ${currentUser?.role !== 'admin' ? 'cursor-not-allowed opacity-60 border-border' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                        />
                                        {currentUser?.role !== 'admin' && (
                                            <p className="text-[9px] text-muted-foreground italic leading-tight mt-1">Only Admins can change full names.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-foreground flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                            Username
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className={`w-full px-3 py-2 text-sm rounded-lg bg-secondary border outline-none transition-all ${errors.username ? 'border-destructive ring-destructive/20 focus:ring-2' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                        />
                                        {errors.username && <p className="text-[10px] font-medium text-destructive mt-1">{errors.username}</p>}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <div className="mb-4">
                                        <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2 leading-none">
                                            <Lock className="w-3.5 h-3.5 text-primary" />
                                            Security Update
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground mt-1">Leave blank to keep current password.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                    placeholder="Min 6 chars"
                                                    className={`w-full px-3 py-2 text-sm rounded-lg bg-secondary border outline-none transition-all ${errors.newPassword ? 'border-destructive ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            {errors.newPassword && <p className="text-[10px] font-medium text-destructive mt-1">{errors.newPassword}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground">Current Password</label>
                                            <input
                                                required
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                placeholder="Required to save"
                                                className={`w-full px-3 py-2 text-sm rounded-lg bg-secondary border outline-none transition-all ${errors.currentPassword ? 'border-destructive ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                            />
                                            {errors.currentPassword && <p className="text-[10px] font-medium text-destructive mt-1">{errors.currentPassword}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all font-bold text-sm shadow-md disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3.5 h-3.5" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Account Deletion Confirmation Modal */}
            {createPortal(
                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-sm bg-card border border-border rounded-xl shadow-elevated overflow-hidden p-6 text-center"
                            >
                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-destructive/20">
                                    <AlertTriangle className="w-8 h-8 text-destructive" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Delete Your Account?</h3>

                                {isLastAdmin ? (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-xs font-medium leading-relaxed border border-destructive/20 text-left">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span className="font-bold">System Protection Active</span>
                                            </div>
                                            You are currently the **only administrator**. Account deletion is locked to prevent administrative lockout. Please promote another user to Admin before deleting your account.
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="w-full py-2.5 rounded-lg bg-secondary text-foreground font-bold text-sm hover:bg-muted transition-all"
                                        >
                                            Return to Safety
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                            This will permanently remove your data. Enter your password to confirm.
                                        </p>

                                        <div className="space-y-4 text-left">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Confirm Identity</label>
                                                <input
                                                    autoFocus
                                                    type="password"
                                                    value={deleteConfirmPassword}
                                                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                                                    placeholder="Enter your password..."
                                                    className={`w-full px-4 py-2.5 rounded-xl bg-secondary border outline-none text-sm transition-all ${errors.deletePassword ? 'border-destructive ring-2 ring-destructive/20' : 'border-border focus:border-primary'}`}
                                                />
                                                {errors.deletePassword && (
                                                    <p className="text-[10px] font-bold text-destructive mt-1 ml-1">{errors.deletePassword}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={isSubmitting || !deleteConfirmPassword}
                                                    className="w-full py-3 rounded-lg bg-destructive text-white font-bold text-sm shadow-lg shadow-destructive/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete Permanently</>}
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteModal(false)}
                                                    className="w-full py-2.5 rounded-lg bg-secondary text-foreground font-bold text-sm hover:bg-muted transition-all"
                                                >
                                                    Keep My Account
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default ProfileSettingsPage;
