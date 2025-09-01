import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectToDatabase from '@/lib/mongodb'
import Admin from '@/lib/models/Admin'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find admin by username
    const admin = await Admin.findOne({ username, isActive: true })
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    admin.lastLogin = new Date()
    await admin.save()

    // Create JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id.toString(),
        username: admin.username,
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return admin data (without password) and token
    const adminData = {
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin
    }

    return NextResponse.json({
      success: true,
      token,
      admin: adminData
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
