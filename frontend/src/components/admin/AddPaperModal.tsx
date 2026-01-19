import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  X,
  Upload,
  FileText,
  Users,
  BookOpen,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Star,
  GraduationCap,
  Calendar,
  Hash,
  User,
  AlertCircle,
} from 'lucide-react';
// import { strands } from '@/data/mockPapers'; // Removed mock import
// import { strands } from '@/data/mockPapers'; // Removed mock import

interface Author {
  id: string; // Internal ID for keys
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
}

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  strands: any[]; // Passed from parent
  initialData?: any; // For Edit Mode
}

const STEPS = [
  { id: 1, title: 'Upload PDF', icon: Upload, description: 'Upload your research document' },
  { id: 2, title: 'Details', icon: BookOpen, description: 'Enter research information' },
  { id: 3, title: 'Authors', icon: Users, description: 'Add author information' },
  { id: 4, title: 'Review', icon: Sparkles, description: 'Preview and submit' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

export const AddPaperModal: React.FC<AddPaperModalProps> = ({ isOpen, onClose, onSubmit, strands, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    adviser: '',
    strand: '',
    schoolYear: '',
    gradeSection: '',
    isFeatured: false,
  });

  const [authors, setAuthors] = useState<Author[]>([
    { id: generateId(), firstName: '', middleName: '', lastName: '', suffix: '' },
  ]);

  // Handle Initial Data (Edit Mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || '',
        abstract: initialData.abstract || '',
        keywords: Array.isArray(initialData.keywords) ? initialData.keywords.join(', ') : initialData.keywords || '',
        adviser: initialData.adviser || '',
        strand: initialData.strand || '', // Short code
        schoolYear: initialData.school_year || '',
        gradeSection: initialData.grade_section || '',
        isFeatured: initialData.is_featured || false,
      });

      if (initialData.authors && Array.isArray(initialData.authors)) {
        setAuthors(initialData.authors.map((a: any) => ({
          id: generateId(),
          firstName: a.firstName || '',
          middleName: a.middleName || '',
          lastName: a.lastName || '',
          suffix: a.suffix || ''
        })));
      }

      // If editing, we mark upload as complete/skipped if we don't change it
      // We can start at step 2?
      setCurrentStep(2);
      setUploadProgress(100);
    } else if (isOpen && !initialData) {
      // Reset defaults if opening fresh
      resetForm();
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setCurrentStep(1);
    setSubmitSuccess(false);
    setPdfFile(null);
    setUploadProgress(0);
    setFormData({
      title: '',
      abstract: '',
      keywords: '',
      adviser: '',
      strand: '',
      schoolYear: '',
      gradeSection: '',
      isFeatured: false,
    });
    setAuthors([{ id: generateId(), firstName: '', middleName: '', lastName: '', suffix: '' }]);
  };


  // Dropzone for PDF upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(progress);
      }, 200);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Auto-format School Year (Input + Label)
    if (name === 'schoolYear') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
      let finalValue = numbersOnly;

      if (numbersOnly.length === 4) {
        const startYear = parseInt(numbersOnly);
        finalValue = `${startYear} - ${startYear + 1}`;
      }

      setFormData(prev => ({
        ...prev,
        schoolYear: finalValue,
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addAuthor = () => {
    setAuthors(prev => [...prev, { id: generateId(), firstName: '', middleName: '', lastName: '', suffix: '' }]);
  };

  const removeAuthor = (id: string) => {
    if (authors.length > 1) {
      setAuthors(prev => prev.filter(a => a.id !== id));
    }
  };

  const updateAuthor = (id: string, field: keyof Author, value: string) => {
    setAuthors(prev => prev.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const getAuthorDisplay = () => {
    return authors
      .filter(a => a.lastName)
      .map(a => {
        let name = a.lastName;
        if (a.firstName) name += `, ${a.firstName.charAt(0)}.`;
        if (a.middleName) name += ` ${a.middleName.charAt(0)}.`;
        if (a.suffix) name += ` ${a.suffix}`;
        return name;
      })
      .join(', ');
  };

  const getCitation = () => {
    const authorDisplay = getAuthorDisplay();
    return `${authorDisplay || '[Authors]'}. (${formData.schoolYear || '[Year]'}). ${formData.title || '[Title]'}. Adviser: ${formData.adviser || '[Adviser]'}. ${formData.gradeSection || '[Section]'}, Catubig Valley National High School.`;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Allow if a new file is uploaded and done, OR if editing (initialData exists) and no new file is selected (keeping old one)
        return (pdfFile && uploadProgress >= 100) || (!!initialData && !pdfFile);
      case 2:
        return formData.title && formData.abstract && formData.strand && formData.schoolYear;
      case 3:
        return authors.some(a => a.firstName && a.lastName);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        // Transform authors to expected format if needed, but the current format is fine for our JSON.parse on backend
        // We pass the raw data, let parent handle FormData conversion
        await onSubmit({
          ...formData,
          authors: authors.filter(a => a.lastName).map(a => ({
            firstName: a.firstName,
            middleName: a.middleName,
            lastName: a.lastName,
            suffix: a.suffix
          })), // Send object array, not string array, so backend key names match
          pdfFile,
        });
      }

      setSubmitSuccess(true);

      // Auto close after success message
      setTimeout(() => {
        onClose();
        // Reset state
        setCurrentStep(1);
        setSubmitSuccess(false);
        setPdfFile(null);
        setUploadProgress(0);
        setFormData({
          title: '',
          abstract: '',
          keywords: '',
          adviser: '',
          strand: '',
          schoolYear: '',
          gradeSection: '',
          isFeatured: false,
        });
        setAuthors([{ id: generateId(), firstName: '', middleName: '', lastName: '', suffix: '' }]);
      }, 2000);

    } catch (error) {
      console.error("Submission failed", error);
      // Ideally show error state here
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setSubmitSuccess(false);
    setPdfFile(null);
    setUploadProgress(0);
    setFormData({
      title: '',
      abstract: '',
      keywords: '',
      adviser: '',
      strand: '',
      schoolYear: '',
      gradeSection: '',
      isFeatured: false,
    });
    setAuthors([{ id: generateId(), firstName: '', middleName: '', lastName: '', suffix: '' }]);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-card border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative px-8 py-6 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />

            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Add New Research Paper</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Step {currentStep} of 4 — {STEPS[currentStep - 1].description}
                </p>
              </div>
              <button
                onClick={resetAndClose}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="relative mt-6 flex items-center justify-between">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <motion.div
                    className="flex flex-col items-center"
                    initial={false}
                    animate={{
                      scale: currentStep === step.id ? 1.05 : 1,
                    }}
                  >
                    <motion.div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                          ? 'bg-primary/10 text-primary ring-2 ring-primary/30'
                          : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                      {currentStep === step.id && (
                        <motion.div
                          layoutId="stepGlow"
                          className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
                        />
                      )}
                    </motion.div>
                    <span className={`mt-2 text-xs font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                      {step.title}
                    </span>
                  </motion.div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 h-0.5 rounded-full bg-border overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{
                          width: currentStep > step.id ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
            <AnimatePresence mode="wait">
              {/* Step 1: PDF Upload */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div
                    {...getRootProps()}
                    className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${isDragActive
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : pdfFile
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                  >
                    <input {...getInputProps()} />

                    <div className="p-12 text-center">
                      {pdfFile ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{pdfFile.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div className="max-w-xs mx-auto">
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary to-primary/80"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {uploadProgress < 100 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload complete!'}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPdfFile(null);
                              setUploadProgress(0);
                            }}
                            className="text-sm text-destructive hover:underline"
                          >
                            Remove file
                          </button>
                        </motion.div>
                      ) : initialData && !pdfFile ? (
                        <div className="space-y-4">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20"
                          >
                            <FileText className="w-10 h-10 text-primary" />
                          </motion.div>
                          <div>
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                CURRENT FILE
                              </span>
                            </div>
                            <p className="font-semibold text-foreground truncate max-w-[200px] mx-auto">
                              {initialData.pdf_path || 'Existing Document'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Drag & drop to replace this file
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <motion.div
                            animate={{
                              y: isDragActive ? -5 : 0,
                              scale: isDragActive ? 1.05 : 1,
                            }}
                            className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors"
                          >
                            <Upload className={`w-10 h-10 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                          </motion.div>
                          <div>
                            <p className="text-lg font-semibold text-foreground">
                              {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              or click to browse from your computer
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Maximum file size: 50MB • PDF format only
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Glow effect on drag */}
                    {isDragActive && (
                      <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl pointer-events-none" />
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Research Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Research Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter the complete title of your research paper"
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Abstract */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm font-medium text-foreground">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Abstract
                      </span>
                    </label>
                    <textarea
                      name="abstract"
                      value={formData.abstract}
                      onChange={handleInputChange}
                      placeholder="Write a comprehensive abstract describing your research methodology, findings, and conclusions..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Hash className="w-4 h-4 text-primary" />
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="Enter keywords separated by commas (e.g., machine learning, education, data analysis)"
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Adviser */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="w-4 h-4 text-primary" />
                      Research Adviser
                    </label>
                    <input
                      type="text"
                      name="adviser"
                      value={formData.adviser}
                      onChange={handleInputChange}
                      placeholder="Dr. Juan dela Cruz"
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Grid for Strand, Year, Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        Strand
                      </label>
                      <select
                        name="strand"
                        value={formData.strand}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary outline-none transition-all"
                      >
                        <option value="">Select strand</option>
                        {strands.map((s: any) => (
                          <option key={s._id || s.id} value={s.short}>{s.short} - {s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        School Year
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="schoolYear"
                          value={formData.schoolYear.split(' - ')[0]}
                          onChange={handleInputChange}
                          placeholder="2023"
                          maxLength={4}
                          className="w-24 px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center"
                        />
                        <span className="text-lg font-medium text-muted-foreground">-</span>
                        <div className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground font-medium">
                          {formData.schoolYear.includes(' - ') ? formData.schoolYear.split(' - ')[1] : '####'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        Grade & Section
                      </label>
                      <input
                        type="text"
                        name="gradeSection"
                        value={formData.gradeSection}
                        onChange={handleInputChange}
                        placeholder="Grade 12 - Einstein"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Featured toggle */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${formData.isFeatured ? 'text-primary fill-current' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium text-foreground">Mark as Featured Research</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Authors */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Research Authors</h3>
                      <p className="text-sm text-muted-foreground">Add all authors of this research paper</p>
                    </div>
                    <button
                      onClick={addAuthor}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Author
                    </button>
                  </div>

                  <div className="space-y-4">
                    {authors.map((author, idx) => (
                      <motion.div
                        key={author.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Author {idx + 1}
                          </span>
                          {authors.length > 1 && (
                            <button
                              onClick={() => removeAuthor(author.id)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground">First Name *</label>
                            <input
                              type="text"
                              value={author.firstName}
                              onChange={(e) => updateAuthor(author.id, 'firstName', e.target.value)}
                              placeholder="Juan"
                              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Middle Name</label>
                            <input
                              type="text"
                              value={author.middleName}
                              onChange={(e) => updateAuthor(author.id, 'middleName', e.target.value)}
                              placeholder="Santos"
                              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Last Name *</label>
                            <input
                              type="text"
                              value={author.lastName}
                              onChange={(e) => updateAuthor(author.id, 'lastName', e.target.value)}
                              placeholder="dela Cruz"
                              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Suffix</label>
                            <input
                              type="text"
                              value={author.suffix}
                              onChange={(e) => updateAuthor(author.id, 'suffix', e.target.value)}
                              placeholder="Jr., III, etc."
                              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Author display preview */}
                  {getAuthorDisplay() && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Author Display Preview</p>
                      <p className="text-sm font-medium text-primary">{getAuthorDisplay()}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {submitSuccess ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6"
                      >
                        <Check className="w-12 h-12 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Paper Submitted!</h3>
                      <p className="text-muted-foreground">Your research paper has been successfully added to the library.</p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Preview Card */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-border space-y-5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                            {formData.strand || 'STRAND'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                            {formData.schoolYear || 'School Year'}
                          </span>
                          {formData.isFeatured && (
                            <span className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-bold text-foreground leading-tight">
                          {formData.title || 'Research Title'}
                        </h3>

                        <p className="text-primary font-medium">
                          {getAuthorDisplay() || 'Authors'}
                        </p>

                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                          {formData.abstract || 'Abstract will appear here...'}
                        </p>

                        {formData.keywords && (
                          <div className="flex flex-wrap gap-2">
                            {formData.keywords.split(',').slice(0, 5).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs"
                              >
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Adviser:</span> {formData.adviser || 'N/A'} •
                          <span className="font-medium ml-2">Section:</span> {formData.gradeSection || 'N/A'}
                        </div>
                      </div>

                      {/* Citation Preview */}
                      <div className="p-5 rounded-xl bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Citation Preview</p>
                        <p className="text-sm text-foreground italic leading-relaxed">{getCitation()}</p>
                      </div>

                      {/* File info */}
                      {pdfFile && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{pdfFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document</p>
                          </div>
                          <Check className="w-5 h-5 text-primary ml-auto" />
                        </div>
                      )}

                      {/* Warning */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-600 dark:text-amber-400">Please review carefully</p>
                          <p className="text-muted-foreground mt-1">Make sure all information is correct before submitting. This action cannot be undone easily.</p>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with navigation */}
          {!submitSuccess && (
            <div className="px-8 py-5 border-t border-border bg-muted/20 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:brightness-110 disabled:opacity-70 transition-all text-sm font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Submit Paper
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
