import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker locally
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const PaperViewerPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1);
    const [pageWidth, setPageWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);

    // Permission guard: check on mount
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user.role === 'viewer' && !data.user.hasPermission) {
                        setPermissionDenied(true);
                    }
                }
            } catch (err) {
                console.error('Error checking permission:', err);
            }
        };
        checkPermission();
    }, []);

    // Calculate the width to fit the container
    const updateWidth = useCallback(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            // Leave some padding
            setPageWidth(Math.min(containerWidth - 16, 900));
        }
    }, []);

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [updateWidth]);

    useEffect(() => {
        const fetchPaperTitle = async () => {
            try {
                const res = await fetch(`/api/papers/${id}`);
                if (!res.ok) throw new Error('Paper not found.');
                const data = await res.json();
                setTitle(data.title);
            } catch {
                setTitle('Document Viewer');
            }
        };
        if (id) fetchPaperTitle();
    }, [id]);

    const pdfUrl = `/api/papers/view/${id}`;

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const onDocumentLoadError = () => {
        setIsLoading(false);
        setLoadError(true);
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

    if (permissionDenied) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="flex flex-col items-center text-center gap-4 max-w-sm">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <ArrowLeft className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You do not have permission to view this document. Please contact the administrator to request access.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="shrink-0 p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-sm sm:text-base font-semibold truncate" title={title}>
                        {title || 'Loading...'}
                    </h1>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* Zoom Controls */}
                    <div className="hidden sm:flex items-center gap-1 bg-muted/50 rounded-xl px-1 py-0.5">
                        <button
                            onClick={zoomOut}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium text-muted-foreground w-10 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                    {numPages > 0 && (
                        <span className="text-xs text-muted-foreground hidden sm:inline px-2">
                            {numPages} page{numPages > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Mobile Zoom Controls */}
            <div className="sm:hidden sticky top-[53px] z-30 bg-card/90 backdrop-blur-sm border-b border-border/50 px-3 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <button
                        onClick={zoomOut}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        aria-label="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground w-10 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        aria-label="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
                {numPages > 0 && (
                    <span className="text-xs text-muted-foreground">
                        {numPages} page{numPages > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* PDF Viewer Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-muted/30"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading document...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {loadError && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4 text-center px-6 max-w-md">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <Download className="w-8 h-8 text-destructive" />
                            </div>
                            <h2 className="text-lg font-semibold">Unable to display document</h2>
                            <p className="text-sm text-muted-foreground">
                                The document could not be loaded.
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                )}

                {/* PDF Document - renders all pages in a scrollable view */}
                <div className="flex flex-col items-center py-4 gap-4">
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={null}
                        error={null}
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <div
                                key={`page_${index + 1}`}
                                className="shadow-lg rounded-lg overflow-hidden bg-white mb-4"
                            >
                                <Page
                                    pageNumber={index + 1}
                                    width={pageWidth * scale}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    loading={
                                        <div className="flex items-center justify-center py-20" style={{ width: pageWidth * scale }}>
                                            <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                                        </div>
                                    }
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
};

export default PaperViewerPage;
