import React, { useState } from 'react';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Search,
    Loader2,
    AlertTriangle,
    User,
    Calendar as CalendarIcon,
    Tag,
    X as ClearIcon,
    Trash2,
    CheckSquare,
    Square,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useAdminStore } from '@/store/adminStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityLog {
    _id: string;
    timestamp: string;
    performedBy: string;
    actionType: string;
    targetItem: string;
    changeDetails?: string;
}

const ACTION_COLORS: Record<string, string> = {
    'Login': 'bg-blue-500/10 text-blue-500',
    'Logout': 'bg-gray-500/10 text-gray-500',
    'Added User': 'bg-green-500/10 text-green-500',
    'Deleted User': 'bg-red-500/10 text-red-500',
    'Kicked User': 'bg-orange-500/10 text-orange-500',
    'Added Paper': 'bg-green-500/10 text-green-500',
    'Edited Paper': 'bg-yellow-500/10 text-yellow-500',
    'Deleted Paper': 'bg-red-500/10 text-red-500',
    'Added Strand': 'bg-green-500/10 text-green-500',
    'Edited Strand': 'bg-yellow-500/10 text-yellow-500',
    'Deleted Strand': 'bg-red-500/10 text-red-500',
};

const AdminActivityLogsPage = () => {
    const { addToast } = useAdminStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<DateRange | undefined>();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Multi-selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchLogs = async () => {
        try {
            setError(false);
            const response = await fetch('/api/activity-logs', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.targetItem.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (date?.from) {
            const logDate = new Date(log.timestamp);
            const from = startOfDay(date.from);
            const to = date.to ? endOfDay(date.to) : endOfDay(date.from);

            if (!isWithinInterval(logDate, { start: from, end: to })) {
                return false;
            }
        }

        return true;
    });

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredLogs.length && filteredLogs.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredLogs.map(l => l._id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/activity-logs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
                credentials: 'include'
            });

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Logs Deleted',
                    message: `Successfully deleted ${selectedIds.size} activity logs.`
                });
                setSelectedIds(new Set());
                fetchLogs();
                setShowDeleteModal(false);
            } else {
                const data = await response.json();
                addToast({
                    type: 'error',
                    title: 'Deletion Failed',
                    message: data.message || 'Error deleting logs'
                });
            }
        } catch (err) {
            console.error('Delete error:', err);
            addToast({
                type: 'error',
                title: 'Network Error',
                message: 'Could not connect to the server'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-destructive">
                <AlertTriangle className="w-12 h-12" />
                <h2 className="text-xl font-semibold">Error Loading Logs</h2>
                <p className="text-muted-foreground">
                    You might not have permission to view this page.
                </p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4">
                <div className="flex flex-col gap-1 flex-shrink-0">
                    <h1 className="text-3xl font-bold tracking-tight">System Activity Logs</h1>
                    <p className="text-muted-foreground text-sm">Monitor all administrative actions and user events.</p>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-4 bg-card p-3 rounded-xl shadow-sm border border-border/50 flex-shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 text-sm rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal h-9 text-sm rounded-lg",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {date && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                onClick={() => setDate(undefined)}
                                title="Clear date filter"
                            >
                                <ClearIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {selectedIds.size > 0 && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="h-9 gap-2 px-4 shadow-sm rounded-lg bg-red-600 hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Selected ({selectedIds.size})
                                </Button>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    <div className="hidden sm:block ml-auto text-xs text-muted-foreground border-l border-border pl-4">
                        <span className="font-semibold text-foreground">{filteredLogs?.length || 0}</span> events
                    </div>
                </div>

                {/* Logs List/Table - Flex Grow to fill remaining space */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-sm text-left relative border-collapse">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-5 py-4 w-12 bg-muted/20">
                                        <button
                                            onClick={toggleSelectAll}
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                                        >
                                            {selectedIds.size === filteredLogs.length && filteredLogs.length > 0 ? (
                                                <CheckSquare className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 font-bold bg-muted/20 w-[200px]">Timestamp</th>
                                    <th className="px-6 py-4 font-bold bg-muted/20 w-[150px]">Performed By</th>
                                    <th className="px-6 py-4 font-bold bg-muted/20 w-[180px]">Action</th>
                                    <th className="px-6 py-4 font-bold bg-muted/20 w-[250px]">Target</th>
                                    <th className="px-6 py-4 font-bold bg-muted/20 min-w-[300px]">Changes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <p className="text-sm font-medium">Loading activity logs...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs && filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr
                                            key={log._id}
                                            className={cn(
                                                "hover:bg-muted/10 transition-colors cursor-pointer group",
                                                selectedIds.has(log._id) && "bg-primary/5 hover:bg-primary/10"
                                            )}
                                            onClick={() => toggleSelect(log._id)}
                                        >
                                            <td className="px-5 py-4 w-12" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleSelect(log._id)}
                                                    className="text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-center"
                                                >
                                                    {selectedIds.has(log._id) ? (
                                                        <CheckSquare className="w-5 h-5 text-primary" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium cursor-default">
                                                            <CalendarIcon className="w-3.5 h-3.5" />
                                                            {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p className="text-xs font-medium">{format(new Date(log.timestamp), 'EEEE, MMMM do, yyyy')}</p>
                                                        <p className="text-[10px] text-muted-foreground">{format(new Date(log.timestamp), 'h:mm:ss a')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {log.performedBy.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {log.performedBy}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "border-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                                                        ACTION_COLORS[log.actionType] || 'bg-gray-500/10 text-gray-500'
                                                    )}
                                                >
                                                    {log.actionType}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="max-w-[200px] truncate text-xs font-semibold text-foreground cursor-default">
                                                            {log.targetItem}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[350px]">
                                                        <p className="text-xs">{log.targetItem}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="max-w-[400px] truncate text-xs text-muted-foreground cursor-default flex items-center gap-2">
                                                            {log.changeDetails || '-'}
                                                            {log.changeDetails && log.changeDetails.length > 50 && (
                                                                <Info className="w-3 h-3 flex-shrink-0 text-muted-foreground/50" />
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    {log.changeDetails && (
                                                        <TooltipContent side="top" className="max-w-[500px] p-3 text-xs leading-relaxed">
                                                            {log.changeDetails}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                                                    <Search className="w-6 h-6 text-muted-foreground/40" />
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">No logs found matching your criteria.</p>
                                                <Button
                                                    variant="link"
                                                    className="text-xs h-auto p-0"
                                                    onClick={() => { setSearchTerm(''); setDate(undefined); }}
                                                >
                                                    Clear all filters
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && createPortal(
                    <AnimatePresence>
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
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
                                    <h3 className="text-lg font-bold text-foreground">Permanently Delete Logs?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You are about to remove <span className="font-bold text-foreground">{selectedIds.size}</span> activity logs. This process is irreversible.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowDeleteModal(false)}
                                            disabled={isDeleting}
                                            className="rounded-xl"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="gap-2 rounded-xl bg-red-600 hover:bg-red-700"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Confirm Delete
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </TooltipProvider>
    );
};

export default AdminActivityLogsPage;
