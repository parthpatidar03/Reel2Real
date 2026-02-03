# Troubleshooting: npm Installation Error on Windows

## Problem

You encountered this error when running `npm install` in the backend folder:

```
npm error code ENOTEMPTY
npm error syscall rmdir
npm error path E:\Product Folks\reel-to-real\node_modules\yargs-parser\build
npm error errno -4051
npm error ENOTEMPTY: directory not empty, rmdir 'E:\Product Folks\reel-to-real\node_modules\yargs-parser\build'
```

## Root Cause

This is a common Windows issue caused by:
1. File system locking (antivirus, file explorer, or other processes)
2. Corrupted `node_modules` directory
3. npm cache issues

## Solution

### Option 1: Clean Install (Recommended)

Run these commands in order:

```bash
# 1. Navigate to backend folder
cd E:\Product Folks\reel-to-real\backend

# 2. Remove node_modules (may take a minute)
rmdir /s /q node_modules

# 3. Remove package-lock.json
del package-lock.json

# 4. Clear npm cache
npm cache clean --force

# 5. Install dependencies
npm install
```

### Option 2: If Option 1 Fails

If you still get errors, try this:

```bash
# Close all programs that might be locking files
# (VS Code, file explorer, antivirus)

# Then run:
npm install --legacy-peer-deps
```

### Option 3: Use Alternative Package Manager

If npm continues to fail, use **pnpm** or **yarn**:

```bash
# Install pnpm globally
npm install -g pnpm

# Then use pnpm instead
pnpm install
```

## Step-by-Step Installation Guide

### 1. Install Backend Dependencies

```bash
cd E:\Product Folks\reel-to-real\backend
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
```

### 2. Install Worker Dependencies

```bash
cd E:\Product Folks\reel-to-real\worker
npm install
```

### 3. Install Frontend Dependencies

```bash
cd E:\Product Folks\reel-to-real\frontend
npm install
```

### 4. Install Root Dependencies

```bash
cd E:\Product Folks\reel-to-real
npm install
```

## Deprecated Package Warnings

You'll see these warnings - they're **safe to ignore** for the MVP:

```
npm warn deprecated inflight@1.0.6
npm warn deprecated glob@7.2.3
npm warn deprecated supertest@6.3.4
npm warn deprecated @google/maps@1.1.3
```

These are dependency warnings from sub-packages. The application will work fine.

### Optional: Fix Deprecated Packages

If you want to fix them later:

1. **@google/maps** → Update to `@googlemaps/google-maps-services-js`
2. **supertest** → Update to v7.1.3+
3. **glob** → Will be updated when dependencies update

## After Successful Installation

Once all dependencies are installed, you can start the services:

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Redis
redis-server

# Terminal 3: Start Backend
cd E:\Product Folks\reel-to-real\backend
npm run dev

# Terminal 4: Start Worker
cd E:\Product Folks\reel-to-real\worker
npm run dev

# Terminal 5: Start Frontend
cd E:\Product Folks\reel-to-real\frontend
npm run dev
```

## Quick Verification

After installation, verify the packages:

```bash
# Check backend
cd backend
npm list express mongoose bullmq

# Check worker
cd worker
npm list openai tesseract.js

# Check frontend
cd frontend
npm list react vite tailwindcss
```

## Common Issues

### Issue: "Cannot find module 'node-releases/data/processed/envs.json'"

This error occurs when the `browserslist` or `node-releases` package is corrupted.

**Solution:**
```bash
# Navigate to frontend
cd E:\Product Folks\reel-to-real\frontend

# Clean install
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue: "Cannot find module"

**Solution:**
```bash
npm install
```

### Issue: "Port already in use"

**Solution:**
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

### Issue: "EACCES permission denied"

**Solution:**
```bash
# Run as administrator
# Right-click Command Prompt → Run as administrator
```

## Alternative: Use Docker

If npm continues to have issues, use Docker instead:

```bash
# Start all services with Docker Compose
docker-compose up
```

This avoids npm installation issues entirely.

## Need Help?

If you're still having issues:

1. Check `docs/QUICK_START.md` for detailed setup
2. Ensure you have Node.js 18+ installed
3. Try restarting your computer
4. Disable antivirus temporarily during installation

## Success Checklist

✅ `node_modules` folder exists in backend  
✅ `node_modules` folder exists in worker  
✅ `node_modules` folder exists in frontend  
✅ No error messages during `npm install`  
✅ Can run `npm run dev` in each folder  

Once all checkboxes are ticked, you're ready to go! 🚀
