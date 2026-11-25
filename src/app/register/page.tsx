'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState, Suspense } from 'react'
import { Dumbbell, Lock, Mail, User, CircleAlert, ArrowLeft } from 'lucide-react'
import { memberRegisterAction, type LoginState } from '@/app/actions/auth'

const initialState: LoginState = {}

function RegisterForm() {
    const searchParams = useSearchParams()
    const selectedPlanId = searchParams.get('plan') || ''
    const [state, formAction, isPending] = useActionState(memberRegisterAction, initialState)

    return (
        <div className="w-full max-w-md bg-[#17171A] border border-[#27272C] rounded-xl p-8">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-11 h-11 rounded-lg border-2 border-[#DC2626] flex items-center justify-center text-[#DC2626] mb-4">
                    <Dumbbell size={20} strokeWidth={2.5} />
                </div>
                <h1 className="font-[family-name:var(--font-space)] text-2xl font-bold tracking-tight text-[#F4F4F5]">
                    Daftar Member Baru
                </h1>
                <p className="text-xs text-[#A1A1AA] mt-1.5">
                    Dapatkan ID member &amp; kartu akses QR digital secara instan
                </p>
            </div>

            {state?.error && (
                <div
                    role="alert"
                    className="mb-5 flex items-center gap-2.5 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 px-4 py-3 text-xs text-red-400"
                >
                    <CircleAlert size={16} className="shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            <form action={formAction} className="space-y-4">
                <input type="hidden" name="planId" value={selectedPlanId} />

                <div>
                    <label htmlFor="name" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="Raka Pratama"
                            className="w-full rounded-lg bg-[#0E0E11] border border-[#27272C] pl-10 pr-4 py-2.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 focus:outline-none focus:border-[#DC2626] transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                        Email
                    </label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="raka@email.com"
                            className="w-full rounded-lg bg-[#0E0E11] border border-[#27272C] pl-10 pr-4 py-2.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 focus:outline-none focus:border-[#DC2626] transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Minimal 6 karakter"
                            className="w-full rounded-lg bg-[#0E0E11] border border-[#27272C] pl-10 pr-4 py-2.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 focus:outline-none focus:border-[#DC2626] transition-colors"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-2 rounded-lg bg-[#DC2626] hover:bg-[#EF4444] disabled:opacity-60 text-[#F4F4F5] font-bold py-3 text-xs uppercase tracking-wider transition-colors"
                >
                    {isPending ? 'Membuat Akun...' : 'Buat Akun Member'}
                </button>
            </form>

            <p className="text-center text-xs text-[#A1A1AA] mt-6 pt-5 border-t border-[#27272C]">
                Sudah terdaftar sebagai member?{' '}
                <Link href="/login" className="text-[#F4F4F5] font-semibold hover:text-[#DC2626] transition-colors">
                    Masuk di sini
                </Link>
            </p>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-[#0E0E11] text-[#F4F4F5] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>
            <Suspense fallback={<div className="text-xs text-[#A1A1AA]">Memuat formulir...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    )
}