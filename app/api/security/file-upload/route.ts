
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { FileSecurityManager, SecurityLogger } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const dynamic = "force-dynamic"

// Secure file upload with scanning
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string

    if (!file) {
      return createErrorResponse('No file provided', 400)
    }

    // Validate and scan file
    const scanResult = await FileSecurityManager.scanFile(file, adminId)

    if (!scanResult.safe) {
      await SecurityLogger.logEvent('FILE_UPLOAD_THREAT', 'HIGH', {
        fileName: file.name,
        fileSize: file.size,
        uploadedBy: adminId,
        threats: scanResult.scanResult.threats,
        blocked: true
      })

      return createErrorResponse(
        `File upload blocked: ${scanResult.scanResult.details}`,
        400
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate safe filename
    const timestamp = Date.now()
    const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(uploadsDir, safeFileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    await SecurityLogger.logEvent('FILE_UPLOAD_SUCCESS', 'LOW', {
      fileName: safeFileName,
      originalName: file.name,
      fileSize: file.size,
      uploadedBy: adminId,
      description
    })

    return createSecureApiResponse({
      message: 'File uploaded successfully',
      file: {
        name: safeFileName,
        originalName: file.name,
        size: file.size,
        path: `/api/files/${safeFileName}`,
        uploadedAt: new Date().toISOString(),
        scanResult: scanResult.scanResult
      }
    }, 201)
  } catch (error) {
    console.error('File upload error:', error)
    return createErrorResponse('File upload failed', 500)
  }
}
