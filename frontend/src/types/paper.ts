export interface Author {
    firstName: string;
    lastName: string;
    middleInitial?: string;
}

export interface ResearchPaper {
    _id: string;
    id: string;
    title: string;
    authors: Author[];
    author_display?: string;
    abstract: string;
    keywords: string[];
    adviser: string;
    school_year: string;
    grade_section: string;
    strand: string;
    strand_id?: {
        _id: string;
        short: string;
        name: string;
    };
    is_featured: boolean;
    download_count: number;
    pdf_path: string;
    published_date: string; // Mapped from createdAt in frontend or backend
    createdAt: string;
}
