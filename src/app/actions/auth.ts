'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signSessionToken } from '@/lib/auth'

export type LoginState = {
    error?: string
}

export async function loginAction(
    _prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')

    if (!email || !password) {
        return { error: 'Email dan password wajib diisi.' }
    }

    const user = await prisma.user.findUnique({
        where: { email },
    })

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
        maxAge: 60 * 60 * 24, // 1 hari
    })

    redirect('/admin')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('ironpulse_session')
    redirect('/login')
}