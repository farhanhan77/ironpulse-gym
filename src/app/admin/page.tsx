import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import AdminDashboard from '@/components/admin-dashboard'

export default async function AdminPage() {
    await connection()

    const [members, plans, checkIns] = await Promise.all([
        prisma.user.findMany({
            where: { role: 'MEMBER' },
            include: {
                subscriptions: {
                    include: { plan: true },
                    orderBy: { startDate: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.membershipPlan.findMany({
            orderBy: { price: 'asc' },
        }),
        prisma.checkIn.findMany({
            include: { user: true },
            orderBy: { checkedInAt: 'desc' },
            take: 20,
        }),
    ])

    return (
        <AdminDashboard
            initialMembers={members}
            initialPlans={plans}
            initialCheckIns={checkIns}
        />
    )
}