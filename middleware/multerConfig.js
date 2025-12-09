const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');

class ImageOptimizer {
    constructor() {
        this.tmpDir = path.join(__dirname, '../tmp');
        fs.ensureDirSync(this.tmpDir);
    }

    // Optimize and generate multiple formats
    async optimizeImage(filePath, outputDir) {
        const filename = path.basename(filePath);
        const name = path.parse(filename).name;
        const ext = path.parse(filename).ext;

        // Create output directories
        const webpDir = path.join(outputDir, 'webp');
        const jpgDir = path.join(outputDir, 'jpg');
        const originalDir = path.join(outputDir, 'original');
        
        await Promise.all([
            fs.ensureDir(webpDir),
            fs.ensureDir(jpgDir),
            fs.ensureDir(originalDir)
        ]);

        const stats = await fs.stat(filePath);
        const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

        console.log(`🖼️ Optimizing: ${filename} (${fileSizeMB}MB)`);

        // Sharp optimization pipeline
        const pipeline = sharp(filePath)
            .rotate() // Auto-rotate based on EXIF
            .withMetadata() // Preserve metadata
            .on('info', (info) => {
                console.log(`📏 Original: ${info.width}x${info.height}`);
            });

        // Generate optimized versions
        const versions = [
            // WebP (Best compression)
            {
                format: 'webp',
                quality: 85,
                effort: 6,
                dir: webpDir,
                filename: `${name}.webp`,
                sizes: [
                    { width: 1200, suffix: '1200w' }, // Header banner
                    { width: 728, suffix: '728w' },   // Leaderboard
                    { width: 300, suffix: '300w' }    // Sidebar
                ]
            },
            // JPEG (Fallback)
            {
                format: 'jpeg',
                quality: 88,
                effort: 4,
                dir: jpgDir,
                filename: `${name}.jpg`,
                sizes: [
                    { width: 1200, suffix: '1200w' },
                    { width: 728, suffix: '728w' },
                    { width: 300, suffix: '300w' }
                ]
            }
        ];

        const results = {
            original: path.join(originalDir, filename),
            optimized: {}
        };

        // Move original file
        await fs.move(filePath, results.original);

        // Generate all versions
        for (const version of versions) {
            results.optimized[version.format] = {};
            
            for (const size of version.sizes) {
                const outputPath = path.join(version.dir, `${name}_${size.suffix}.${version.format}`);
                
                await pipeline
                    .resize({
                        width: size.width,
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .jpeg({ quality: version.quality, effort: version.effort })
                    .webp({ quality: version.quality, effort: version.effort })
                    .toFormat(version.format)
                    .toFile(outputPath);

                results.optimized[version.format][size.suffix] = outputPath;
            }

            // Also generate full-size optimized version
            const fullSizePath = path.join(version.dir, version.filename);
            await pipeline
                .jpeg({ quality: version.quality, effort: version.effort })
                .webp({ quality: version.quality, effort: version.effort })
                .toFormat(version.format)
                .toFile(fullSizePath);
            
            results.optimized[version.format]['full'] = fullSizePath;
        }

        // Calculate savings
        const originalSize = stats.size;
        const webpFullSize = await fs.stat(results.optimized.webp.full);
        const savings = ((1 - webpFullSize.size / originalSize) * 100).toFixed(1);

        console.log(`✅ Optimized: ${filename} → ${((webpFullSize.size / 1024 / 1024).toFixed(2))}MB (${savings}% smaller)`);

        return {
            success: true,
            original_size: originalSize,
            optimized_size: webpFullSize.size,
            savings_percent: savings,
            urls: {
                webp: {
                    full: `/uploads/ads/webp/${version.filename}`,
                    '1200w': `/uploads/ads/webp/${name}_1200w.webp`,
                    '728w': `/uploads/ads/webp/${name}_728w.webp`,
                    '300w': `/uploads/ads/webp/${name}_300w.webp`
                },
                jpg: {
                    full: `/uploads/ads/jpg/${version.filename}`,
                    '1200w': `/uploads/ads/jpg/${name}_1200w.jpg`,
                    '728w': `/uploads/ads/jpg/${name}_728w.jpg`,
                    '300w': `/uploads/ads/jpg/${name}_300w.jpg`
                }
            },
            recommended: `/uploads/ads/webp/${version.filename}` // Default to WebP full size
        };
    }
}

const optimizer = new ImageOptimizer();

// Multer storage (temporary)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, optimizer.tmpDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `tmp_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'), false);
};

const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB max

const upload = multer({ storage, fileFilter, limits });
// ... existing code ...

// Bulk upload configuration (separate for multiple files)
const bulkUpload = multer({ 
    storage, 
    fileFilter, 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
}).array('images', 50); // Max 50 files

// Export a consistent API: `singleUpload` (multer instance), `bulkUpload` (middleware), and `optimizer`
module.exports = { 
    singleUpload: upload,  // For single uploads: use .single('image') when applying
    bulkUpload,           // For bulk uploads (middleware array)
    optimizer 
};