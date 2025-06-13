import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { authOptions } from '../auth/[...nextauth]/route'

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const filename = `${uniqueSuffix}-${file.name}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)

    // Save the file
    await writeFile(filepath, buffer)

    // Return the URL
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 