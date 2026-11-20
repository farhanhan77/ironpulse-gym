'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function parseDurationToDays(durationLabel: string): number {
    if (durationLabel === '1 hari') return 1
    if (durationLabel === '30 hari') return 30
    if (durationLabel === '3 bulan') return 90
    if (durationLabel === '6 bulan') return 180
    if (durationLabel === '12 bulan') return 365
    return 30
}

export async function createPlanAction(input: {
    name: string
    durationLabel: string
    price: number
    description: string
}) {
    const name = input.name.trim()
    if (!name || !Number.isFinite(input.price) || input.price <= 0) {
        return { ok: false, error: 'Nama paket dan harga wajib valid.' }
    }

    const plan = await prisma.membershipPlan.create({
        data: {
            name,
            durationDays: parseDurationToDays(input.durationLabel),
            price: Math.round(input.price),
            description: input.description.trim() || 'Paket keanggotaan IronPulse.',
            features: ['Akses gym sesuai masa aktif', 'Semua area latihan'],
            isActive: true,
            isPopular: false,
        },
    })

    revalidatePath('/admin')
    revalidatePath('/member')
    return { ok: true, plan }
}

export async function togglePlanStatusAction(planId: string, isActive: boolean) {
    await prisma.membershipPlan.update({
        where: { id: planId },
        data: { isActive },
    })

    revalidatePath('/admin')
    revalidatePath('/member')
    return { ok: true }
}

export async function approveSubscriptionAction(subscriptionId: string) {
    const sub = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
    })

    if (!sub) {
        return { ok: false, error: 'Data pengajuan tidak ditemukan.' }
    }

    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + sub.plan.durationDays)

    await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
            status: 'ACTIVE',
            startDate: now,
            endDate,
        },
    })

    revalidatePath('/admin')
    revalidatePath('/member')
    return { ok: true }
}

export async function rejectSubscriptionAction(subscriptionId: string) {
    await prisma.subscription.delete({
        where: { id: subscriptionId },
    })

    revalidatePath('/admin')
    revalidatePath('/member')
    return { ok: true }
}

export async function extendMemberPlanAction(userId: string, months: number) {
    const latestSub = await prisma.subscription.findFirst({
        where: { userId },
        include: { plan: true },
        orderBy: { startDate: 'desc' },
    })

    if (!latestSub) {
        const defaultPlan = await prisma.membershipPlan.findFirst({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        })
        if (!defaultPlan) {
            return { ok: false, error: 'Buat minimal 1 paket gym aktif terlebih dahulu.' }
        }

        const now = new Date()
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + months)

        await prisma.subscription.create({
            data: {
                userId,
                planId: defaultPlan.id,
                startDate: now,
                endDate,
                status: 'ACTIVE',
            },
        })

        revalidatePath('/admin')
        return { ok: true, endDate: endDate.toISOString(), planName: defaultPlan.name }
    }

    const now = new Date()
    const baseDate = new Date(latestSub.endDate) > now ? new Date(latestSub.endDate) : now
    const newEndDate = new Date(baseDate)
    newEndDate.setMonth(newEndDate.getMonth() + months)

    await prisma.subscription.update({
        where: { id: latestSub.id },
        data: {
            status: 'ACTIVE',
            endDate: newEndDate,
        },
    })

    revalidatePath('/admin')
    return { ok: true, endDate: newEndDate.toISOString(), planName: latestSub.plan.name }
}

export async function createMemberByAdminAction(input: {
    name: string
    email: string
    password: string
}) {
    const name = input.name.trim()
    const email = input.email.trim().toLowerCase()
    const password = input.password

    if (!name || !email || password.length < 6) {
        return { ok: false, error: 'Nama, email, dan password (min. 6 karakter) wajib diisi.' }
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
        return { ok: false, error: 'Email sudah terdaftar di sistem.' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const memberCode = `IP-${Math.floor(10000 + Math.random() * 90000)}`

    const user = await prisma.user.create({
        data: {
            memberCode,
            name,
            email,
            password: hashedPassword,
            role: 'MEMBER',
        },
    })

    revalidatePath('/admin')
    return { ok: true, member: user }
}