import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Copy, Eye, User, Calendar, BookOpen, Check, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { ResearchPaper, Author } from '@/types/paper';
import { useAdminStore } from '@/store/adminStore';

const PaperDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { currentUser } = useAdminStore();

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await fetch(`/api/papers/${id}`);
        if (!res.ok) throw new Error('Paper not found');
        const data = await res.json();
        setPaper(data);
      } catch (err) {
        setError('Paper not found or could not be loaded');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPaper();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paper || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Paper not found</h1>
          <Link to="/papers" className="text-primary hover:underline">Back to papers</Link>
        </div>
      </div>
    );
  }

  // Helper to format authors in APA style (Last, F. M.)
  const formatAPAAuthors = (authors: Author[]) => {
    const formatted = authors.map(author => {
      const initials = author.firstName.trim().split(/\s+/)
        .map(n => `${n.charAt(0).toUpperCase()}.`)
        .join(' ');
      const middleInitial = author.middleName ? `${author.middleName.charAt(0).toUpperCase()}. ` : '';
      let name = `${author.lastName}, ${initials}${middleInitial}`.trim();
      if (author.suffix) name += ` ${author.suffix}`;
      return name;
    });

    if (formatted.length === 0) return '';
    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;

    const lastAuthor = formatted.pop();
    return `${formatted.join(', ')}, & ${lastAuthor}`;
  };

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const citationYear = paper.school_year.includes(' - ')
    ? paper.school_year.split(' - ')[1].trim()
    : paper.school_year;

  const apaTitle = toSentenceCase(paper.title);
  const citation = `${formatAPAAuthors(paper.authors)} (${citationYear}). ${apaTitle} [Unpublished manuscript]. Catubig Valley National High School.`;

  const handleCopyCitation = async () => {
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(citation);
      } else {
        // Fallback for mobile browsers (iOS Safari, older Android)
        const textArea = document.createElement('textarea');
        textArea.value = citation;
        // Prevent scrolling on iOS
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        // For iOS Safari
        textArea.setSelectionRange(0, citation.length);
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Citation copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Last-resort fallback
      try {
        const textArea = document.createElement('textarea');
        textArea.value = citation;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, citation.length);
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success('Citation copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        toast.error('Could not copy. Please select and copy manually.');
      }
    }
  };

  // Helper to display simple list of names for header
  const displayAuthors = paper.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ');

  const handleView = async () => {
    if (!paper.pdf_path) {
      toast.error('Document not available');
      return;
    }

    // Always fetch fresh permission from backend
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        if (user.role === 'viewer' && !user.hasPermission) {
          setShowPermissionModal(true);
          return;
        }
      }
    } catch (err) {
      console.error('Error checking permission:', err);
    }

    navigate(`/papers/${paper._id}/view`);
  };

  return (
    <div className="min-h-screen pt-24 pb-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/papers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to papers
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-primary/10 text-primary mb-4">
              {paper.strand}
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              {paper.title}
            </h1>
            <p className={`font-semibold text-primary mb-6 ${paper.authors.length <= 3
              ? 'text-xl lg:text-2xl'
              : paper.authors.length <= 6
                ? 'text-lg lg:text-xl'
                : 'text-base lg:text-lg'
              }`}>
              {displayAuthors}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> {paper.adviser}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {paper.school_year}</span>
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {paper.grade_section}</span>
            </div>
          </div>

          {/* Abstract */}
          <div className="p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-accent/50 to-card border border-primary/10 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Abstract</h2>
            <p className="text-muted-foreground leading-relaxed">{paper.abstract}</p>
          </div>

          {/* Keywords */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-foreground mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map(k => (
                <Link key={k} to={`/papers?search=${k}`} className="px-4 py-2 rounded-full bg-secondary hover:bg-muted text-secondary-foreground text-sm font-medium transition-colors">
                  {k}
                </Link>
              ))}
            </div>
          </div>

          {/* Citation */}
          <div className="p-6 rounded-2xl bg-card border border-border mb-8">
            <h3 className="text-sm font-bold text-foreground mb-3">Citation</h3>
            <p className="text-sm text-muted-foreground italic">
              {formatAPAAuthors(paper.authors)} ({citationYear}). <span className="italic">{apaTitle}</span> [Unpublished manuscript]. Catubig Valley National High School.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-2"><Download className="w-4 h-4" /> {paper.download_count} downloads</span>
            <span>Uploaded: {new Date(paper.published_date).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleView}
              className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all btn-press"
            >
              <Eye className="w-5 h-5" /> View Document
            </button>

            <button onClick={handleCopyCitation} className="flex-1 py-4 rounded-2xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-all btn-press">
              {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />} {copied ? 'Copied!' : 'Copy Citation'}
            </button>
          </div>
        </motion.div>
      </div >

      {/* Permission Denied Modal */}
      {
        createPortal(
          <AnimatePresence>
            {showPermissionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated overflow-hidden p-6"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Access Restricted</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You do not have permission to view this document. Please contact the administrator to request access.
                    </p>
                    <button
                      onClick={() => setShowPermissionModal(false)}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all text-sm"
                    >
                      Understood
                    </button>
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

export default PaperDetailPage;
