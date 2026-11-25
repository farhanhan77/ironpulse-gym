'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Dumbbell, Lock, Mail, CircleAlert, ArrowLeft } from 'lucide-react'
import { memberLoginAction, type LoginState } from '@/app/actions/auth'

const initialState: LoginState = {}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(memberLoginAction, initialState)

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

            <div className="w-full max-w-md bg-[#17171A] border border-[#27272C] rounded-xl p-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-11 h-11 rounded-lg border-2 border-[#DC2626] flex items-center justify-center text-[#DC2626] mb-4">
                        <Dumbbell size={20} strokeWidth={2.5} />
                    </div>
                    <h1 className="font-[family-name:var(--font-space)] text-2xl font-bold tracking-tight text-[#F4F4F5]">
                        Masuk ke IronPulse
                    </h1>
                    <p className="text-xs text-[#A1A1AA] mt-1.5">
                        Akses kartu QR member, paket latihan, dan AI Coach
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
                                autoComplete="email"
                                placeholder="nama@email.com"
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
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full rounded-lg bg-[#0E0E11] border border-[#27272C] pl-10 pr-4 py-2.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 focus:outline-none focus:border-[#DC2626] transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full mt-2 rounded-lg bg-[#DC2626] hover:bg-[#EF4444] disabled:opacity-60 text-[#F4F4F5] font-bold py-3 text-xs uppercase tracking-wider transition-colors"
                    >
                        {isPending ? 'Memverifikasi...' : 'Masuk Sekarang'}
                    </button>
                </form>

                <p className="text-center text-xs text-[#A1A1AA] mt-6 pt-5 border-t border-[#27272C]">
                    Belum punya akun member?{' '}
                    <Link href="/register" className="text-[#F4F4F5] font-semibold hover:text-[#DC2626] transition-colors">
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </div>
    )
}