import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, BookOpen, Download } from 'lucide-react';

interface Paper {
    _id: string;
    title: string;
    abstract: string;
    authors: { firstName: string; middleName: string; lastName: string; suffix: string }[];
    author_display: string;
    keywords: string[];
    adviser: string;
    school_year: string;
    grade_section: string;
    strand: string;
    pdf_path: string;
}

interface ViewPaperModalProps {
    paper: Paper | null;
    onClose: () => void;
}

export const ViewPaperModal: React.FC<ViewPaperModalProps> = ({ paper, onClose }) => {
    if (!paper) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                        <h2 className="text-lg font-semibold truncate max-w-3xl" title={paper.title}>
                            {paper.title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* Sidebar Details */}
                        <div className="w-full md:w-80 border-r border-border overflow-y-auto p-6 space-y-6 bg-muted/10">

                            {/* Meta Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                                    {paper.strand}
                                </span>
                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {paper.school_year}
                                </span>
                            </div>

                            {/* Abstract */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    Abstract
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                                    {paper.abstract}
                                </p>
                            </div>

                            {/* Authors */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" />
                                    Authors
                                </h3>
                                <div className="space-y-1">
                                    {paper.authors.map((author, idx) => (
                                        <div key={idx} className="text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg border border-border/50">
                                            {author.firstName} {author.middleName} {author.lastName} {author.suffix}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Adviser */}
                            <div className="space-y-1">
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Adviser</h3>
                                <p className="text-sm font-medium">{paper.adviser}</p>
                            </div>

                            {/* Keywords */}
                            {paper.keywords && paper.keywords.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Keywords</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {paper.keywords.map((k, i) => (
                                            <span key={i} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground border border-border/50">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <a
                                    href={`/api/papers/view/${paper._id}`}
                                    download
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </a>
                            </div>

                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 bg-muted/20 flex flex-col">
                            <iframe
                                src={`/api/papers/view/${paper._id}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="PDF Viewer"
                            />
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};
