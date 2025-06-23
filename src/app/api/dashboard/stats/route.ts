import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get current date and calculate date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Total reports count
    const totalReports = await prisma.report.count({
      where: {
        doctorId: session.user.id,
      },
    })

    // Total patients count
    const totalPatients = await prisma.patient.count({
      where: {
        reports: {
          some: {
            doctorId: session.user.id,
          },
        },
      },
    })

    // Reports this month
    const reportsThisMonth = await prisma.report.count({
      where: {
        doctorId: session.user.id,
        examinationDate: {
          gte: startOfMonth,
        },
      },
    })

    // Reports last month
    const reportsLastMonth = await prisma.report.count({
      where: {
        doctorId: session.user.id,
        examinationDate: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
    })

    // Monthly growth percentage
    const monthlyGrowth = reportsLastMonth > 0 
      ? ((reportsThisMonth - reportsLastMonth) / reportsLastMonth * 100).toFixed(1)
      : reportsThisMonth > 0 ? '100.0' : '0.0'

    // Reports this year
    const reportsThisYear = await prisma.report.count({
      where: {
        doctorId: session.user.id,
        examinationDate: {
          gte: startOfYear,
        },
      },
    })

    // Examination type breakdown
    const examinationTypeStats = await prisma.report.groupBy({
      by: ['examinationType'],
      where: {
        doctorId: session.user.id,
        examinationDate: {
          gte: startOfMonth,
        },
      },
      _count: {
        examinationType: true,
      },
    })

    // Monthly trend for the last 6 months
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const count = await prisma.report.count({
        where: {
          doctorId: session.user.id,
          examinationDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('ko-KR', { month: 'short' }),
        count,
      })
    }

    // Gender distribution of patients
    const genderStats = await prisma.patient.groupBy({
      by: ['gender'],
      where: {
        reports: {
          some: {
            doctorId: session.user.id,
          },
        },
      },
      _count: {
        gender: true,
      },
    })

    // Recent activity (reports in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentActivity = await prisma.report.count({
      where: {
        doctorId: session.user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    const stats = {
      totalReports,
      totalPatients,
      reportsThisMonth,
      reportsLastMonth,
      monthlyGrowth: parseFloat(monthlyGrowth),
      reportsThisYear,
      examinationTypeStats: examinationTypeStats.map(stat => ({
        type: stat.examinationType,
        count: stat._count.examinationType,
        label: getExaminationTypeLabel(stat.examinationType),
      })),
      monthlyTrend,
      genderStats: genderStats.map(stat => ({
        gender: stat.gender,
        count: stat._count.gender,
        label: getGenderLabel(stat.gender),
      })),
      recentActivity,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function getExaminationTypeLabel(type: string): string {
  switch (type) {
    case 'GENERAL':
      return '일반'
    case 'DETAILED':
      return '정밀'
    case 'LIMITED':
      return '제한적'
    default:
      return type
  }
}

function getGenderLabel(gender: string): string {
  switch (gender) {
    case 'MALE':
      return '남성'
    case 'FEMALE':
      return '여성'
    case 'OTHER':
      return '기타'
    default:
      return gender
  }
} 