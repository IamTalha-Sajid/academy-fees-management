# Vercel Deployment Guide

## Environment Variables Required

You need to set these environment variables in your Vercel project settings:

### 1. MONGODB_URI
- **Value**: Your MongoDB connection string
- **Example**: `mongodb+srv://username:password@cluster.mongodb.net/database`
- **Required**: Yes

### 2. JWT_SECRET
- **Value**: A secure random string for JWT token signing
- **Example**: `your-super-secret-jwt-key-here`
- **Required**: Yes (for production security)

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production, Preview, Development
4. Add the second variable:
   - **Name**: `JWT_SECRET`
   - **Value**: A secure random string
   - **Environment**: Production, Preview, Development

## Initial Admin Setup

After deployment, you'll need to create the initial admin user:

1. Visit your deployed app
2. Go to `/admin`
3. Click "Initialize Default Admin"
4. Use the credentials:
   - **Username**: `AliRazzaq`
   - **Password**: `AliRazzaq97@`

## Common Issues Fixed

- ✅ Removed duplicate Mongoose indexes
- ✅ Fixed authentication flow
- ✅ Protected routes working
- ✅ Sidebar navigation functional

## Build Commands

The build should now work without warnings. If you still see issues:

1. Check that all environment variables are set
2. Ensure MongoDB is accessible from Vercel's servers
3. Verify the JWT_SECRET is properly set
