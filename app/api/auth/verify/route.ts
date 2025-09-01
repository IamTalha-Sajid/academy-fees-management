import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectToDatabase from '@/lib/mongodb'
import Admin from '@/lib/models/Admin'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      await connectToDatabase()
      
      // Find admin in database
      const admin = await Admin.findById(decoded.adminId)
      
      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { error: 'Admin not found or inactive' },
          { status: 401 }
        )
      }

      // Return admin data (without password)
      const adminData = {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin
      }

      return NextResponse.json(adminData)

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
