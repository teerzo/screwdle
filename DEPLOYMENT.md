# Vercel Deployment Guide

This project is configured for deployment on Vercel with Bun runtime.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier available)
3. Your code pushed to a GitHub repository

## Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Screwdle word game"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/screwdle.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the configuration:
   - **Framework Preset**: Other
   - **Build Command**: `bun run build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

### 3. Environment Variables (Optional)

If you need environment variables:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add any required variables

### 4. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain

## Configuration Files

The following files are configured for Vercel deployment:

- `vercel.json` - Vercel configuration
- `package.json` - Build scripts and dependencies
- `.vercelignore` - Files to ignore during deployment
- `.gitignore` - Git ignore rules

## Build Process

The deployment process:

1. **Install**: `bun install` - Install dependencies
2. **Build**: `bun run build` - Build the application
3. **Deploy**: Serve the `dist` directory

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure build command works locally: `bun run build`
- Check Vercel build logs for specific errors

### Runtime Errors

- Check that the server starts correctly: `bun run start`
- Verify environment variables are set correctly
- Check Vercel function logs

### Performance Issues

- The app uses Bun for optimal performance
- 3D scenes are optimized for web deployment
- Tailwind CSS is loaded via CDN for faster loading

## Local Testing

Test the production build locally:

```bash
# Build the project
bun run build

# Start production server
bun run start
```

Visit `http://localhost:3000` to test the production build.

## Features

Your deployed app will include:

- ✅ Home page with game mode selection
- ✅ Daily mode with interactive 3D scene
- ✅ Responsive design for all devices
- ✅ Fast loading with Bun runtime
- ✅ Modern UI with Tailwind CSS
- ✅ Client-side routing
- ✅ 3D graphics with React Three Fiber

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Test the build locally first
3. Ensure all dependencies are properly installed
4. Verify the build output in the `dist` directory
