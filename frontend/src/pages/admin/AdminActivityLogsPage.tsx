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
    X as ClearIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

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
    'Deleted Strand': 'bg-red-500/10 text-red-500',
};

const AdminActivityLogsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<DateRange | undefined>();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

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
                // Fail silently or handle error if needed, but per request "make it like other pages"
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
        // Optional: Polling every 30s
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

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
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[260px] justify-start text-left font-normal h-9 text-sm",
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

                <div className="hidden sm:block ml-auto text-xs text-muted-foreground border-l pl-4">
                    {filteredLogs?.length || 0} events
                </div>
            </div>

            {/* Logs List/Table - Flex Grow to fill remaining space */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left relative border-collapse">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-3 font-bold bg-muted/50">Timestamp</th>
                                <th className="px-6 py-3 font-bold bg-muted/50">User</th>
                                <th className="px-6 py-3 font-bold bg-muted/50">Action</th>
                                <th className="px-6 py-3 font-bold bg-muted/50">Target</th>
                                <th className="px-6 py-3 font-bold bg-muted/50">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredLogs && filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-muted/5 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap text-muted-foreground text-xs">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-3 h-3" />
                                                {format(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-xs">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 text-muted-foreground" />
                                                {log.performedBy}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge variant="secondary" className={`${ACTION_COLORS[log.actionType] || 'bg-gray-500/10 text-gray-500'} border-0 px-2 py-0.5 text-[10px]`}>
                                                {log.actionType}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-foreground text-xs">
                                            {log.targetItem}
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground max-w-xs truncate text-xs" title={log.changeDetails || ''}>
                                            {log.changeDetails || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                        No logs found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminActivityLogsPage;
