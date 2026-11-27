import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'
import MemberPortalView from '@/components/member-portal-view'

async function MemberContent() {
    const cookieStore = await cookies()
    const token = cookieStore.get('ironpulse_member_session')?.value

    if (!token) {
        redirect('/login')
    }

    const session = await verifySessionToken(token)
    if (!session || session.role !== 'MEMBER') {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            subscriptions: {
                include: { plan: true },
                orderBy: { startDate: 'desc' },
            },
            checkIns: true,
        },
    })

    if (!user) {
        redirect('/login')
    }

    const now = new Date()
    const activeSubRaw = user.subscriptions.find(
        (s) => s.status === 'ACTIVE' && new Date(s.endDate) >= now
    )
    const pendingSubRaw = user.subscriptions.find((s) => s.status === 'PENDING')

    const plans = await prisma.membershipPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
    })

    const monthlyCheckIns = user.checkIns.filter((c) => {
        const d = new Date(c.checkedInAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    const todayLabel = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <MemberPortalView
            member={{
                name: user.name,
                memberCode: user.memberCode,
            }}
            activeSub={
                activeSubRaw
                    ? {
                        id: activeSubRaw.id,
                        status: activeSubRaw.status,
                        endDate: activeSubRaw.endDate.toISOString(),
                        planName: activeSubRaw.plan.name,
                        planPrice: activeSubRaw.plan.price,
                    }
                    : null
            }
            pendingSub={
                pendingSubRaw
                    ? {
                        id: pendingSubRaw.id,
                        status: pendingSubRaw.status,
                        endDate: pendingSubRaw.endDate.toISOString(),
                        planName: pendingSubRaw.plan.name,
                        planPrice: pendingSubRaw.plan.price,
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

export default function MemberPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0E0E11] flex items-center justify-center text-sm text-[#A1A1AA]">
                    Memuat Portal Member...
                </div>
            }
        >
            <MemberContent />
        </Suspense>
    )
}