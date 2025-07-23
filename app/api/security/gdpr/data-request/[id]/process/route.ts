
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { GdprManager, SecurityLogger } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

interface RouteParams {
  params: {
    id: string
  }
}

// Process GDPR data request
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id
    const { id } = params

    // Check admin permissions
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    // Get the request
    const dataRequest = await prisma.dataProcessingRequest.findUnique({
      where: { id }
    })

    if (!dataRequest) {
      return createErrorResponse('Data processing request not found', 404)
    }

    if (dataRequest.status !== 'PENDING') {
      return createErrorResponse('Request has already been processed', 400)
    }

    let result: any = {}

    try {
      // Process based on request type
      switch (dataRequest.requestType) {
        case 'ACCESS_REQUEST':
          result = await GdprManager.processAccessRequest(id, adminId)
          break
        
        case 'DELETION_REQUEST':
          result = await GdprManager.processDeletionRequest(id, adminId)
          break
        
        default:
          return createErrorResponse('Request type not supported yet', 400)
      }

      await SecurityLogger.logEvent('GDPR_REQUEST_PROCESSED', 'MEDIUM', {
        requestId: id,
        requestType: dataRequest.requestType,
        email: dataRequest.email,
        processedBy: adminId,
        result
      })

      return createSecureApiResponse({
        message: 'Data processing request completed successfully',
        requestId: id,
        requestType: dataRequest.requestType,
        result
      })
    } catch (processingError) {
      const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown error'
      
      // Update request status to failed
      await prisma.dataProcessingRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedBy: adminId,
          processedAt: new Date(),
          responseData: { error: errorMessage }
        }
      })

      await SecurityLogger.logEvent('GDPR_REQUEST_FAILED', 'HIGH', {
        requestId: id,
        email: dataRequest.email,
        error: errorMessage,
        processedBy: adminId
      })

      return createErrorResponse(`Failed to process request: ${errorMessage}`, 500)
    }
  } catch (error) {
    console.error('GDPR request processing error:', error)
    return createErrorResponse('Failed to process data request', 500)
  }
}
