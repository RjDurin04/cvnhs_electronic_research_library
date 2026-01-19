const mongoose = require('mongoose');

const researchPaperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    authors: [{
        firstName: { type: String, required: true },
        middleName: { type: String },
        lastName: { type: String, required: true },
        suffix: { type: String }
    }],
    abstract: {
        type: String,
        required: true
    },
    keywords: [{
        type: String
    }],
    adviser: {
        type: String,
        required: true
    },
    school_year: {
        type: String,
        required: true
    },
    grade_section: {
        type: String,
        required: true
    },
    strand_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strand',
        required: true
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    download_count: {
        type: Number,
        default: 0
    },
    pdf_path: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ResearchPaper', researchPaperSchema);
