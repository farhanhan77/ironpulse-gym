'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signSessionToken, verifySessionToken } from '@/lib/auth'

export type LoginState = {
    error?: string
}

function generateMemberCode() {
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    return `IP-${randomNum}`
}

// ==========================================
// 1. AUTH ADMIN (TETAP UTUH)
// ==========================================
export async function loginAction(
    _prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')

    if (!email || !password) {
        return { error: 'Email dan password wajib diisi.' }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.role !== 'ADMIN') {
        return { error: 'Email atau password admin salah.' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return { error: 'Email atau password admin salah.' }
    }

    const token = await signSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: 'ADMIN',
    })

    const cookieStore = await cookies()
    cookieStore.set('ironpulse_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
    })

    redirect('/admin')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('ironpulse_session')
    redirect('/login')
}

// ==========================================
// 2. AUTH MEMBER (REGISTER, LOGIN, LOGOUT)
// ==========================================
export async function memberRegisterAction(
    _prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')
    const planId = String(formData.get('planId') || '').trim()

    if (!name || !email || !password) {
        return { error: 'Nama, email, dan password wajib diisi.' }
    }
    if (password.length < 6) {
        return { error: 'Password minimal 6 karakter.' }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return { error: 'Email sudah terdaftar. Silakan masuk ke akunmu.' }
    }

    // Buat memberCode unik IP-XXXXX
    let memberCode = generateMemberCode()
    while (await prisma.user.findUnique({ where: { memberCode } })) {
        memberCode = generateMemberCode()
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            memberCode,
            role: 'MEMBER',
        },
    })

    // Jika user mendaftar dari tombol "Pilih Paket Ini" di Landing Page, otomatis ajukan paket PENDING
    if (planId) {
        const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } })
        if (plan && plan.isActive) {
            const startDate = new Date()
            const endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + plan.durationDays)

            await prisma.subscription.create({
                data: {
                    userId: newUser.id,
                    planId: plan.id,
                    startDate,
                    endDate,
                    status: 'PENDING',
                },
            })
        }
    }

    const token = await signSessionToken({
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: 'MEMBER',
    })

    const cookieStore = await cookies()
    cookieStore.set('ironpulse_member_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    })

    revalidatePath('/admin')
    redirect('/member')
}

export async function memberLoginAction(
    _prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')

    if (!email || !password) {
        return { error: 'Email dan password wajib diisi.' }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return { error: 'Email atau password salah.' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return { error: 'Email atau password salah.' }
    }

    // Jika akun Admin masuk lewat /login, arahkan langsung ke /admin
    if (user.role === 'ADMIN') {
        const adminToken = await signSessionToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: 'ADMIN',
        })
        const cookieStore = await cookies()
        cookieStore.set('ironpulse_session', adminToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        })
        redirect('/admin')
    }

    const token = await signSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: 'MEMBER',
    })

    const cookieStore = await cookies()
    cookieStore.set('ironpulse_member_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    })

    redirect('/member')
}

export async function memberLogoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('ironpulse_member_session')
    redirect('/login')
}

// ==========================================
// 3. PENGAJUAN PAKET OLEH MEMBER (TWO-WAY)
// ==========================================
export async function requestSubscriptionAction(planId: string) {
    const cookieStore = await cookies()
    const token = cookieStore.get('ironpulse_member_session')?.value
    if (!token) return { error: 'Sesi berakhir, silakan login ulang.' }

    const session = await verifySessionToken(token)
    if (!session || session.role !== 'MEMBER') {
        return { error: 'Akses ditolak.' }
    }

    const existingPending = await prisma.subscription.findFirst({
        where: { userId: session.userId, status: 'PENDING' },
    })
    if (existingPending) {
        return { error: 'Kamu masih memiliki pengajuan paket yang menunggu konfirmasi kasir.' }
    }

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } })
    if (!plan || !plan.isActive) {
        return { error: 'Paket tidak ditemukan atau sedang nonaktif.' }
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.durationDays)

    await prisma.subscription.create({
        data: {
            userId: session.userId,
            planId: plan.id,
            startDate,
            endDate,
            status: 'PENDING',
        },
    })

    revalidatePath('/member')
    revalidatePath('/admin')
    return { success: true }
}