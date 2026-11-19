'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type ScanValidationResult = {
    found: boolean
    message?: string
    expired?: boolean
    member?: {
        id: string
        name: string
        memberCode: string
        planName: string
        endDate: string | null
        checkedInAt: string
    }
}

export async function processCheckIn(
    rawCode: string,
    method: 'QR_SCAN' | 'MANUAL' = 'QR_SCAN'
): Promise<ScanValidationResult> {
    const query = rawCode.trim()
    if (!query) {
        return { found: false, message: 'Masukkan ID member atau email terlebih dahulu.' }
    }

    const user = await prisma.user.findFirst({
        where: {
            role: 'MEMBER',
            OR: [
                { memberCode: { equals: query, mode: 'insensitive' } },
                { email: { equals: query, mode: 'insensitive' } },
            ],
        },
        include: {
            subscriptions: {
                include: { plan: true },
                orderBy: { endDate: 'desc' },
                take: 1,
            },
        },
    })

    if (!user) {
        return { found: false, message: `Member "${query}" tidak ditemukan di database.` }
    }

    const now = new Date()
    const latestSub = user.subscriptions[0]
    const isExpired = !latestSub || latestSub.status === 'EXPIRED' || new Date(latestSub.endDate) < now

    if (!isExpired) {
        // Cegah double-scan dalam 5 menit terakhir
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
        const recentCheckIn = await prisma.checkIn.findFirst({
            where: {
                userId: user.id,
                checkedInAt: { gte: fiveMinutesAgo },
            },
        })

        if (!recentCheckIn) {
            await prisma.checkIn.create({
                data: {
                    userId: user.id,
                    method,
                },
            })
            revalidatePath('/admin')
        }
    }

    return {
        found: true,
        expired: isExpired,
        member: {
            id: user.id,
            name: user.name,
            memberCode: user.memberCode,
            planName: latestSub ? latestSub.plan.name : 'Tidak ada paket',
            endDate: latestSub ? latestSub.endDate.toISOString() : null,
            checkedInAt: now.toISOString(),
        },
    }
}