// Launcher script to start Electron in proper GUI mode.
// Clears ELECTRON_RUN_AS_NODE which IDEs (like VS Code) set,
// causing Electron to run as plain Node.js instead of a GUI app.
const { spawn } = require('child_process');
const path = require('path');

const electronPath = require('electron');
const projectRoot = path.join(__dirname, '..');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, [projectRoot], {
    stdio: 'inherit',
    env: env
});

child.on('close', (code) => {
    process.exit(code);
});
