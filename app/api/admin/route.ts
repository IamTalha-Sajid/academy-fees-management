import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Admin from '@/lib/models/Admin'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const admins = await Admin.find({}).select('-password').lean()
    
    // Transform the data to include id fields
    const transformedAdmins = admins.map(admin => ({
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt
    }))

    return NextResponse.json({
      success: true,
      admins: transformedAdmins
    })

  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
