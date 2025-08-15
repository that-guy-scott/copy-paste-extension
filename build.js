const fs = require('fs');
const path = require('path');

const sourceDir = __dirname;
const distDir = path.join(__dirname, 'dist');

const filesToCopy = [
  'manifest.json',
  'background.js',
  'content.js',
  'content.css',
  'popup.html',
  'popup.js'
];

function cleanDist() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('Cleaned dist directory');
  }
}

function createDirectories() {
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(path.join(distDir, 'icons'), { recursive: true });
  console.log('Created dist directories');
}

function copyFile(fileName) {
  const sourcePath = path.join(sourceDir, fileName);
  const destPath = path.join(distDir, fileName);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${fileName}`);
  } else {
    console.warn(`Warning: ${fileName} not found in source directory`);
  }
}

function copyIcons() {
  const iconsSourceDir = path.join(sourceDir, 'icons');
  const iconsDistDir = path.join(distDir, 'icons');
  
  if (fs.existsSync(iconsSourceDir)) {
    const iconFiles = fs.readdirSync(iconsSourceDir);
    iconFiles.forEach(file => {
      const sourcePath = path.join(iconsSourceDir, file);
      const destPath = path.join(iconsDistDir, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied icons/${file}`);
    });
  } else {
    console.warn('Warning: icons directory not found');
  }
}

function build() {
  try {
    console.log('Starting build...');
    
    cleanDist();
    createDirectories();
    
    filesToCopy.forEach(copyFile);
    copyIcons();
    
    console.log('✅ Build completed successfully!');
    console.log(`📁 Extension files are ready in: ${distDir}`);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();