// server.js - Simple Static Server (Replaced dynamic env with static build)
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`\n  ✅ Smart Manager Server running at:`);
    console.log(`     http://localhost:${PORT}\n`);

    // Check if env-config.js exists to warn user to run build
    const envPath = path.join(__dirname, 'env-config.js');
    if (!fs.existsSync(envPath)) {
        console.warn(`  ⚠️  WARNING: env-config.js not found!`);
        console.warn(`      Please run 'npm run build' first to generate it.\n`);
    } else {
        console.log(`  📦 Static environment configuration active.\n`);
    }
});
