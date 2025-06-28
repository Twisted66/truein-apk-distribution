const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Serve APK files
app.use('/downloads', express.static('apks'));

// API endpoint to get APK info
app.get('/api/apks', (req, res) => {
    const apkDir = path.join(__dirname, 'apks');
    
    if (!fs.existsSync(apkDir)) {
        return res.json([]);
    }
    
    const files = fs.readdirSync(apkDir);
    const apkFiles = files.filter(file => file.endsWith('.apk'));
    
    const apkInfo = apkFiles.map(file => {
        const filePath = path.join(apkDir, file);
        const stats = fs.statSync(filePath);
        
        return {
            name: file,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            downloadUrl: `/downloads/${file}`,
            lastModified: stats.mtime
        };
    });
    
    res.json(apkInfo);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

app.listen(PORT, () => {
    console.log(`Truein APK Distribution Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});