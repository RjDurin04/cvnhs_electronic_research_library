const ResearchPaper = require('../models/ResearchPaper');
const Strand = require('../models/Strand');
const fs = require('fs');
const path = require('path');
const { paperStoragePath } = require('../middleware/uploadMiddleware');
const { logActivity } = require('../middleware/loggerMiddleware');

const getPapers = async (req, res) => {
    try {
        const papers = await ResearchPaper.find()
            .populate('strand_id', 'short name')
            .sort({ createdAt: -1 });

        const formattedPapers = papers.map(paper => ({
            _id: paper._id,
            id: paper._id,
            title: paper.title,
            authors: paper.authors,
            author_display: paper.authors.map(a => `${a.lastName}, ${a.firstName.charAt(0)}.`).join(' & '),
            abstract: paper.abstract,
            keywords: paper.keywords,
            adviser: paper.adviser,
            school_year: paper.school_year,
            grade_section: paper.grade_section,
            strand: paper.strand_id?.short || 'N/A',
            strand_id: paper.strand_id,
            is_featured: paper.is_featured,
            download_count: paper.download_count,
            pdf_path: paper.pdf_path,
            createdAt: paper.createdAt,
            published_date: paper.createdAt
        }));

        res.json(formattedPapers);
    } catch (error) {
        console.error('Error fetching papers:', error);
        res.status(500).json({ message: 'Error fetching papers' });
    }
};

const getPaperById = async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await ResearchPaper.findById(id).populate('strand_id', 'short name');

        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        const formattedPaper = {
            _id: paper._id,
            id: paper._id,
            title: paper.title,
            authors: paper.authors,
            author_display: paper.authors.map(a => `${a.lastName}, ${a.firstName.charAt(0)}.`).join(' & '),
            abstract: paper.abstract,
            keywords: paper.keywords,
            adviser: paper.adviser,
            school_year: paper.school_year,
            grade_section: paper.grade_section,
            strand: paper.strand_id?.short || 'N/A',
            strand_id: paper.strand_id,
            is_featured: paper.is_featured,
            download_count: paper.download_count,
            pdf_path: paper.pdf_path,
            createdAt: paper.createdAt,
            published_date: paper.createdAt
        };

        res.json(formattedPaper);
    } catch (error) {
        console.error('Error fetching paper details:', error);
        res.status(500).json({ message: 'Error fetching paper details' });
    }
};

const viewPaper = async (req, res) => {
    try {
        const paper = await ResearchPaper.findById(req.params.id);
        if (!paper || !paper.pdf_path) return res.status(404).json({ message: 'File not found' });

        const filePath = path.join(paperStoragePath, paper.pdf_path);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${paper.title}.pdf"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).send('Server Error');
    }
};

const downloadPaper = async (req, res) => {
    try {
        const paper = await ResearchPaper.findByIdAndUpdate(
            req.params.id,
            { $inc: { download_count: 1 } },
            { new: true }
        );

        if (!paper || !paper.pdf_path) return res.status(404).json({ message: 'File not found' });

        const filePath = path.join(paperStoragePath, paper.pdf_path);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${paper.title}.pdf"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error downloading PDF:', error);
        res.status(500).send('Server Error');
    }
};

const createPaper = async (req, res) => {
    try {
        const { title, abstract, keywords, adviser, school_year, grade_section, strand, is_featured } = req.body;

        let authors = [];
        try {
            authors = JSON.parse(req.body.authors);
        } catch (e) {
            console.error('Error parsing authors:', e);
            return res.status(400).json({ message: 'Invalid authors format' });
        }

        const strandObj = await Strand.findOne({ short: strand });
        if (!strandObj) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Invalid Strand' });
        }

        const newPaper = new ResearchPaper({
            title,
            authors,
            abstract,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
            adviser,
            school_year,
            grade_section,
            strand_id: strandObj._id,
            is_featured: is_featured === 'true',
            pdf_path: req.file ? req.file.filename : ''
        });

        await newPaper.save();
        await logActivity(req, 'Added Paper', title, 'New research paper added to library');
        res.status(201).json({ message: 'Paper added successfully', paper: newPaper });

    } catch (error) {
        console.error('Error adding paper:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error adding paper' });
    }
};

const updatePaper = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, abstract, keywords, adviser, school_year, grade_section, strand, is_featured } = req.body;

        const paper = await ResearchPaper.findById(id);
        if (!paper) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Paper not found' });
        }

        const normalizeAuthors = (authorList) => {
            if (!Array.isArray(authorList)) return "[]";
            return JSON.stringify(
                authorList.map(a => ({
                    firstName: a.firstName || '',
                    middleName: a.middleName || '',
                    lastName: a.lastName || '',
                    suffix: a.suffix || ''
                }))
            );
        };

        const originalTitle = paper.title;
        const originalAbstract = paper.abstract;
        const originalAuthors = normalizeAuthors(paper.authors);
        const originalKeywords = [...paper.keywords].sort().join(',');
        const originalAdviser = paper.adviser;
        const originalSchoolYear = paper.school_year;
        const originalGradeSection = paper.grade_section;
        const originalStrandId = paper.strand_id?.toString();
        const originalIsFeatured = paper.is_featured;

        let changes = [];

        if (title && title !== originalTitle) {
            paper.title = title;
            changes.push(`Title (changed to '${title}')`);
        }
        if (abstract !== undefined && abstract !== originalAbstract) {
            paper.abstract = abstract;
            changes.push('Abstract');
        }
        if (keywords !== undefined) {
            const newKeywords = keywords.split(',').map(k => k.trim());
            if (newKeywords.sort().join(',') !== originalKeywords) {
                paper.keywords = newKeywords;
                changes.push('Keywords');
            }
        }
        if (adviser !== undefined && adviser !== originalAdviser) {
            paper.adviser = adviser;
            changes.push('Adviser');
        }
        if (school_year !== undefined && school_year !== originalSchoolYear) {
            paper.school_year = school_year;
            changes.push('School Year');
        }
        if (grade_section !== undefined && grade_section !== originalGradeSection) {
            paper.grade_section = grade_section;
            changes.push('Grade Section');
        }
        if (is_featured !== undefined) {
            const featuredBool = is_featured === 'true' || is_featured === true;
            if (featuredBool !== originalIsFeatured) {
                paper.is_featured = featuredBool;
                changes.push('Featured Status');
            }
        }

        if (strand) {
            const strandObj = await Strand.findOne({ short: strand });
            if (strandObj && strandObj._id.toString() !== originalStrandId) {
                paper.strand_id = strandObj._id;
                changes.push('Strand');
            }
        }

        if (req.body.authors) {
            try {
                const newAuthors = JSON.parse(req.body.authors);
                if (normalizeAuthors(newAuthors) !== originalAuthors) {
                    paper.authors = newAuthors;
                    changes.push('Authors');
                }
            } catch (e) {
                console.error('Error parsing authors update:', e);
            }
        }

        if (req.file) {
            const oldPath = path.join(paperStoragePath, paper.pdf_path);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                } catch (err) {
                    console.error("Failed to delete old file:", err);
                }
            }
            paper.pdf_path = req.file.filename;
            changes.push('Pdf');
        }
        else if (title && title !== originalTitle) {
            const oldPath = path.join(paperStoragePath, paper.pdf_path);
            if (fs.existsSync(oldPath)) {
                const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, "").trim();
                const newFilename = `${sanitizedTitle}.pdf`;
                const newPath = path.join(paperStoragePath, newFilename);

                if (!fs.existsSync(newPath)) {
                    fs.renameSync(oldPath, newPath);
                    paper.pdf_path = newFilename;
                }
            }
        }

        await paper.save();
        await logActivity(req, 'Edited Paper', originalTitle, changes.length > 0 ? `Edited: ${changes.join(', ')}` : 'Updated details');
        res.json({ message: 'Paper updated successfully', paper });

    } catch (error) {
        console.error('Error updating paper:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error updating paper' });
    }
};

const deletePaper = async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await ResearchPaper.findById(id);

        if (!paper) return res.status(404).json({ message: 'Paper not found' });

        if (paper.pdf_path) {
            const filePath = path.join(paperStoragePath, paper.pdf_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await ResearchPaper.findByIdAndDelete(id);
        await logActivity(req, 'Deleted Paper', paper.title, 'Paper permanently removed from library');
        res.json({ message: 'Paper deleted successfully' });
    } catch (error) {
        console.error('Error deleting paper:', error);
        res.status(500).json({ message: 'Error deleting paper' });
    }
};

module.exports = { getPapers, getPaperById, viewPaper, downloadPaper, createPaper, updatePaper, deletePaper };
