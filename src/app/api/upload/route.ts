import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { authOptions } from '../auth/[...nextauth]/route'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse('Only image files are allowed', { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse('File size must be less than 10MB', { status: 400 })
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const filename = `${uniqueSuffix}-${file.name}`
    const filepath = join(UPLOAD_DIR, filename)

    // Save the file
    await writeFile(filepath, buffer)

    // Return the URL
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    if (error instanceof Error) {
      return new NextResponse(`Upload failed: ${error.message}`, { status: 500 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 