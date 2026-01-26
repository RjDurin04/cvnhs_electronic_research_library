const Strand = require('../models/Strand');
const { logActivity } = require('../middleware/loggerMiddleware');

const getStrands = async (req, res) => {
    try {
        const strands = await Strand.aggregate([
            {
                $lookup: {
                    from: 'researchpapers',
                    localField: '_id',
                    foreignField: 'strand_id',
                    as: 'papers'
                }
            },
            {
                $addFields: {
                    paperCount: { $size: '$papers' },
                    totalDownloads: { $sum: '$papers.download_count' },
                    id: '$_id'
                }
            },
            {
                $project: {
                    papers: 0
                }
            },
            { $sort: { short: 1 } }
        ]);
        res.json(strands);
    } catch (error) {
        console.error('Error fetching strands:', error);
        res.status(500).json({ message: 'Error fetching strands' });
    }
};

const createStrand = async (req, res) => {
    try {
        const { short, name, description, icon } = req.body;

        const existingStrand = await Strand.findOne({ short: short.toUpperCase() });
        if (existingStrand) {
            return res.status(400).json({ message: 'Strand with this acronym already exists' });
        }

        const newStrand = new Strand({
            short,
            name,
            description,
            icon: icon || 'BookOpen'
        });

        await newStrand.save();
        await logActivity(req, 'Added Strand', short, `New strand '${short}' added to strand list`);
        res.status(201).json(newStrand);
    } catch (error) {
        console.error('Error creating strand:', error);
        res.status(500).json({ message: 'Error creating strand' });
    }
};

const updateStrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { short, name, description, icon } = req.body;

        const strandToUpdate = await Strand.findById(id);
        if (!strandToUpdate) {
            return res.status(404).json({ message: 'Strand not found' });
        }

        const originalShort = strandToUpdate.short;
        const originalName = strandToUpdate.name;
        const originalDescription = strandToUpdate.description || '';
        const originalIcon = strandToUpdate.icon || 'BookOpen';

        const existingStrand = await Strand.findOne({ short: short.toUpperCase(), _id: { $ne: id } });
        if (existingStrand) {
            return res.status(400).json({ message: 'Strand with this acronym already exists' });
        }

        let changes = [];
        if (short && short.toUpperCase() !== originalShort) {
            strandToUpdate.short = short;
            changes.push(`Acronym (changed to '${short.toUpperCase()}')`);
        }
        if (name && name !== originalName) {
            strandToUpdate.name = name;
            changes.push('Full Name');
        }
        if (description !== undefined && description !== originalDescription) {
            strandToUpdate.description = description;
            changes.push('Description');
        }
        if (icon && icon !== originalIcon) {
            strandToUpdate.icon = icon;
            changes.push('Icon');
        }

        await strandToUpdate.save();

        if (changes.length > 0) {
            await logActivity(req, 'Edited Strand', originalShort, `Edited: ${changes.join(', ')}`);
        }

        res.json(strandToUpdate);
    } catch (error) {
        console.error('Error updating strand:', error);
        res.status(500).json({ message: 'Error updating strand' });
    }
};

const deleteStrand = async (req, res) => {
    try {
        const { id } = req.params;

        const strand = await Strand.findById(id);
        if (!strand) {
            return res.status(404).json({ message: 'Strand not found' });
        }

        await Strand.findByIdAndDelete(id);
        await logActivity(req, 'Deleted Strand', strand.short, `Strand '${strand.short}' removed from strands collection`);
        res.json({ message: 'Strand deleted successfully' });
    } catch (error) {
        console.error('Error deleting strand:', error);
        res.status(500).json({ message: 'Error deleting strand' });
    }
};

module.exports = { getStrands, createStrand, updateStrand, deleteStrand };
