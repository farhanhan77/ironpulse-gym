import { Suspense } from 'react'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import AdminDashboard from '@/components/admin-dashboard'

async function AdminContent() {
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

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0E0E11] flex items-center justify-center text-sm text-[#A1A1AA]">
                    Memuat Dashboard Admin...
                </div>
            }
        >
            <AdminContent />
        </Suspense>
    )
}