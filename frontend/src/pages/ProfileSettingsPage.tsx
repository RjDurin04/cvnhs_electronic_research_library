import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Loader2, AlertTriangle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { Badge } from '@/components/ui/badge';

const ProfileSettingsPage: React.FC = () => {
    const { currentUser, addToast } = useAdminStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: currentUser?.name || '',
        username: currentUser?.username || '',
        newPassword: '',
        currentPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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
                // We use window.location to ensure a full refresh/clear
                setTimeout(() => {
                    useAdminStore.getState().logout();
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

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-foreground tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground mt-1 text-lg">Manage your personal information and security credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Info Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{currentUser?.name}</h2>
                        <p className="text-sm text-muted-foreground">@{currentUser?.username}</p>

                        <div className="mt-6 pt-6 border-t border-border flex flex-col items-center">
                            <Badge variant="secondary" className="px-4 py-1 uppercase font-black text-[10px] tracking-widest bg-primary/5 text-primary border-primary/10">
                                {currentUser?.role} Role
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-600">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">Security Notice</p>
                            <p className="text-xs leading-relaxed opacity-90">If you change your username or password, you will need to log in again with your new credentials on your next visit.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl shadow-elevated overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary" />
                                            Full Name
                                        </label>
                                        <input
                                            required
                                            disabled={currentUser?.role !== 'admin'}
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className={`w-full px-4 py-3 rounded-xl bg-secondary border outline-none transition-all ${currentUser?.role !== 'admin' ? 'cursor-not-allowed opacity-70 border-border' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                        />
                                        {currentUser?.role !== 'admin' && (
                                            <p className="text-[10px] text-muted-foreground italic">Note: Only Administrators can authorize name changes.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                            Username
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className={`w-full px-4 py-3 rounded-xl bg-secondary border outline-none transition-all ${errors.username ? 'border-destructive ring-destructive/20 focus:ring-2' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                        />
                                        {errors.username && <p className="text-xs font-medium text-destructive mt-1">{errors.username}</p>}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-primary" />
                                            Security Update
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">Leave new password blank if you don't want to change it.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                    placeholder="Min 6 characters"
                                                    className={`w-full px-4 py-3 rounded-xl bg-secondary border outline-none transition-all ${errors.newPassword ? 'border-destructive ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.newPassword && <p className="text-xs font-medium text-destructive mt-1">{errors.newPassword}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground">Current Password</label>
                                            <input
                                                required
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                placeholder="Required to save changes"
                                                className={`w-full px-4 py-3 rounded-xl bg-secondary border outline-none transition-all ${errors.currentPassword ? 'border-destructive ring-destructive/20 focus:ring-2' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                                            />
                                            {errors.currentPassword && <p className="text-xs font-medium text-destructive mt-1">{errors.currentPassword}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-muted/30 border-t border-border flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;
