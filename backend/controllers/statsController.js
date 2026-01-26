const ResearchPaper = require('../models/ResearchPaper');
const Strand = require('../models/Strand');
const User = require('../models/User');

const getPublicStats = async (req, res) => {
    try {
        const totalPapers = await ResearchPaper.countDocuments();
        const activeStrands = await Strand.countDocuments();

        const downloadsResult = await ResearchPaper.aggregate([
            { $group: { _id: null, total: { $sum: "$download_count" } } }
        ]);
        const totalDownloads = downloadsResult.length > 0 ? downloadsResult[0].total : 0;

        res.json({
            papers: totalPapers,
            downloads: totalDownloads,
            strands: activeStrands,
            since: 2020
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const totalPapers = await ResearchPaper.countDocuments();
        const activeStrands = await Strand.countDocuments();
        const registeredUsers = await User.countDocuments();

        const downloadsResult = await ResearchPaper.aggregate([
            { $group: { _id: null, total: { $sum: "$download_count" } } }
        ]);
        const totalDownloads = downloadsResult.length > 0 ? downloadsResult[0].total : 0;

        const recentUploadsResponse = await ResearchPaper.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('strand_id', 'short');

        const recentUploads = recentUploadsResponse.map(p => ({
            id: p._id,
            title: p.title,
            strand: p.strand_id?.short || 'N/A',
            download_count: p.download_count,
            published_date: p.createdAt
        }));

        const schoolYearData = await ResearchPaper.aggregate([
            {
                $group: {
                    _id: "$school_year",
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const schoolYearDistribution = schoolYearData.map(item => ({
            year: item._id || 'Unknown',
            count: item.count
        }));

        const downloadsByStrandRaw = await ResearchPaper.aggregate([
            {
                $group: {
                    _id: "$strand_id",
                    downloads: { $sum: "$download_count" }
                }
            },
            {
                $lookup: {
                    from: "strands",
                    localField: "_id",
                    foreignField: "_id",
                    as: "strand_info"
                }
            },
            { $unwind: "$strand_info" },
            {
                $project: {
                    strand: "$strand_info.short",
                    downloads: 1
                }
            }
        ]);

        const downloadsByStrand = downloadsByStrandRaw.map(item => ({
            strand: item.strand,
            downloads: item.downloads
        })).sort((a, b) => b.downloads - a.downloads);

        res.json({
            stats: {
                totalPapers,
                totalDownloads,
                activeStrands,
                registeredUsers,
                papersTrend: 0,
                downloadsTrend: 0
            },
            recentUploads,
            schoolYearDistribution,
            downloadsByStrand
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

module.exports = { getPublicStats, getDashboardStats };
