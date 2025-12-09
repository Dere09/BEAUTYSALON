const Ad = require('../models/Ad');
const { optimizer } = require('../middleware/multerConfig');
const path = require('path');
const fs = require('fs-extra');

class AdController {
    // Create new ad with optimization
    async create(req, res) {
        try {
            const { title, description, url, position, status } = req.body;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Image upload is required!'
                });
            }

            console.log(`🎨 Processing ad: ${title}`);

            // Optimize image
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const uploadDir = path.join('public/uploads/ads', `${year}/${month}`);
            
            const optimizationResult = await optimizer.optimizeImage(req.file.path, uploadDir);

            if (!optimizationResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Image optimization failed!'
                });
            }

            const adData = {
                title,
                description: description || '',
                url,
                position,
                status: status || 'active',
                optimization: optimizationResult
            };

            const newAd = await Ad.create(adData, req.file.path);
            
            // Cleanup temp file
            fs.removeSync(req.file.path);

            res.json({
                success: true,
                message: `✅ Ad created with ${optimizationResult.savings_percent}% optimization!`,
                ad: newAd
            });

        } catch (error) {
            console.error('Create ad error:', error);
            
            // Cleanup on error
            if (req.file) {
                fs.removeSync(req.file.path);
            }
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create ad'
            });
        }
    }

    // Get all ads
    async getAll(req, res) {
        try {
            const ads = await Ad.getAll();
            
            // Add image optimization stats
            const totalAds = ads.length;
            const totalSavings = ads.reduce((sum, ad) => sum + (ad.optimization?.savings_percent || 0), 0);
            const avgSavings = totalAds ? (totalSavings / totalAds).toFixed(1) : 0;

            res.json({
                success: true,
                stats: {
                    totalAds,
                    avgSavings: `${avgSavings}%`,
                    totalStorageSaved: `${((ads.reduce((sum, ad) => sum + (ad.optimization?.optimized_size || 0), 0) / 1024 / 1024).toFixed(1))} MB saved`
                },
                ads
            });
        } catch (error) {
            console.error('Get ads error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch ads'
            });
        }
    }

    // Get ad by ID
    async getById(req, res) {
        try {
            const ad = await Ad.getById(req.params.id);
            if (!ad) {
                return res.status(404).json({
                    success: false,
                    message: 'Ad not found'
                });
            }
            res.json({ success: true, ad });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update ad status only (image optimization is permanent)
    async update(req, res) {
        try {
            const { status } = req.body;
            const ad = await Ad.update(req.params.id, { status, updated_at: new Date().toISOString() });
            
            if (!ad) {
                return res.status(404).json({
                    success: false,
                    message: 'Ad not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Ad updated successfully!',
                ad
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete ad (cleanup optimized files)
    async delete(req, res) {
        try {
            const ad = await Ad.getById(req.params.id);
            if (!ad) {
                return res.status(404).json({
                    success: false,
                    message: 'Ad not found'
                });
            }

            // Cleanup all optimized versions
            const formats = ['webp', 'jpg', 'original'];
            for (const format of formats) {
                const dir = path.join('public/uploads/ads', format);
                if (ad.optimization?.urls?.[format]) {
                    for (const size of Object.values(ad.optimization.urls[format])) {
                        await fs.remove(path.join(dir, path.basename(size)));
                    }
                }
            }

            await Ad.delete(req.params.id);
            
            res.json({
                success: true,
                message: 'Ad and optimized files deleted successfully!'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Bulk create ads
    async bulkCreate(req, res) {
        try {
            const files = req.files; // Multiple files from multer.array()
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded!'
                });
            }

            const { bulkData } = req.body; // JSON string of bulk ad data
            const bulkAdData = JSON.parse(bulkData || '[]');
            
            if (bulkAdData.length !== files.length) {
                return res.status(400).json({
                    success: false,
                    message: `Mismatch: ${files.length} files but ${bulkAdData.length} ad data entries`
                });
            }

            const results = [];
            const errors = [];

            // Process each file concurrently with limit
            const processPromises = files.map(async (file, index) => {
                try {
                    const adData = bulkAdData[index] || {};
                    
                    // Default values if not provided
                    const defaultAdData = {
                        title: `Ad ${index + 1}`,
                        description: '',
                        url: `https://example.com/ad-${index + 1}`,
                        position: 'mid-page-banner',
                        status: 'active'
                    };
                    
                    const finalAdData = { ...defaultAdData, ...adData };
                    
                    // Optimize image
                    const year = new Date().getFullYear();
                    const month = String(new Date().getMonth() + 1).padStart(2, '0');
                    const uploadDir = path.join('public/uploads/ads', `${year}/${month}`);
                    
                    const optimizationResult = await optimizer.optimizeImage(file.path, uploadDir);
                    
                    if (!optimizationResult.success) {
                        throw new Error(`Optimization failed for ${file.originalname}`);
                    }

                    const newAd = await Ad.create({
                        ...finalAdData,
                        optimization: optimizationResult
                    }, file.path);

                    // Cleanup temp file
                    fs.removeSync(file.path);

                    results.push({
                        success: true,
                        ad: newAd,
                        file: file.originalname
                    });

                } catch (error) {
                    errors.push({
                        error: error.message,
                        file: file.originalname,
                        index
                    });
                    // Cleanup temp file on error
                    if (fs.existsSync(file.path)) {
                        fs.removeSync(file.path);
                    }
                }
            });

            await Promise.all(processPromises);

            const total = results.length + errors.length;
            const successCount = results.length;

            res.json({
                success: true,
                message: `✅ Bulk upload complete: ${successCount}/${total} ads processed`,
                stats: {
                    total,
                    success: successCount,
                    failed: errors.length,
                    savings: results.reduce((sum, r) => sum + (r.ad.optimization?.savings_percent || 0), 0) / successCount || 0
                },
                results,
                errors
            });

        } catch (error) {
            console.error('Bulk create error:', error);
            res.status(500).json({
                success: false,
                message: 'Bulk upload failed: ' + error.message
            });
        }
    }
}

module.exports = new AdController();