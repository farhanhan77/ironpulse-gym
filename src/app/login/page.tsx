'use client'

import { useActionState } from 'react'
import { Dumbbell, Lock, Mail, CircleAlert } from 'lucide-react'
import { loginAction, type LoginState } from '@/app/actions/auth'

const initialState: LoginState = {}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState)

    return (
        <div className="min-h-screen bg-[#0e0e11] text-zinc-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#17171a] border border-zinc-800/90 rounded-2xl p-8 shadow-2xl">
                {/* Logo & Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 mb-4">
                        <Dumbbell size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Iron<span className="text-red-500">Pulse</span>
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Masuk ke panel administrator gym
                    </p>
                </div>

                {/* Pesan Error */}
                {state?.error && (
                    <div
                        role="alert"
                        className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
                    >
                        <CircleAlert size={16} className="shrink-0" />
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Form Login */}
                <form action={formAction} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">
                            Email Admin
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="admin@ironpulse.com"
                                className="w-full rounded-xl bg-[#0e0e11] border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1.5">
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
                                className="w-full rounded-xl bg-[#0e0e11] border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full mt-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-medium py-2.5 text-sm transition-colors cursor-pointer"
                    >
                        {isPending ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    )
}