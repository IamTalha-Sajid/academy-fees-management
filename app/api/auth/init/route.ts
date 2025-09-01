import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Admin from '@/lib/models/Admin'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'AliRazzaq' })
    
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Default admin already exists' },
        { status: 200 }
      )
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: 'AliRazzaq',
      password: 'AliRazzaq97@',
      role: 'admin',
      isActive: true
    })

    await defaultAdmin.save()

    return NextResponse.json({
      success: true,
      message: 'Default admin created successfully',
      admin: {
        username: defaultAdmin.username,
        role: defaultAdmin.role,
        isActive: defaultAdmin.isActive
      }
    })

  } catch (error) {
    console.error('Init admin error:', error)
    return NextResponse.json(
      { error: 'Failed to create default admin' },
      { status: 500 }
    )
  }
}
