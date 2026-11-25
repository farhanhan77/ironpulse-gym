import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'
import MemberPortalView from '@/components/member-portal-view'

export default async function MemberDashboardPage() {
    await connection()

    const cookieStore = await cookies()
    const token = cookieStore.get('ironpulse_member_session')?.value
    if (!token) redirect('/login')

    const session = await verifySessionToken(token)
    if (!session || session.role !== 'MEMBER') redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            subscriptions: {
                include: { plan: true },
                orderBy: { endDate: 'desc' },
            },
        },
    })

    if (!user) redirect('/login')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [monthlyCheckIns, plans] = await Promise.all([
        prisma.checkIn.count({
            where: {
                userId: user.id,
                checkedInAt: { gte: startOfMonth },
            },
        }),
        prisma.membershipPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        }),
    ])

    const activeRecord = user.subscriptions.find(
        (s) => s.status === 'ACTIVE' && new Date(s.endDate) >= now
    )
    const pendingRecord = user.subscriptions.find((s) => s.status === 'PENDING')

    const todayLabel = now
        .toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
        .toUpperCase()

    return (
        <MemberPortalView
            member={{
                name: user.name,
                memberCode: user.memberCode,
            }}
            activeSub={
                activeRecord
                    ? {
                        id: activeRecord.id,
                        status: activeRecord.status,
                        endDate: activeRecord.endDate.toISOString(),
                        planName: activeRecord.plan.name,
                        planPrice: activeRecord.plan.price,
                    }
                    : null
            }
            pendingSub={
                pendingRecord
                    ? {
                        id: pendingRecord.id,
                        status: pendingRecord.status,
                        endDate: pendingRecord.endDate.toISOString(),
                        planName: pendingRecord.plan.name,
                        planPrice: pendingRecord.plan.price,
                    }
                    : null
            }
            plans={plans.map((p) => ({
                id: p.id,
                name: p.name,
                durationDays: p.durationDays,
                price: p.price,
                description: p.description,
            }))}
            monthlyCheckIns={monthlyCheckIns}
            todayLabel={todayLabel}
        />
    )
}