'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Dumbbell, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { memberLogoutAction, requestSubscriptionAction } from '@/app/actions/auth'

type PlanItem = {
    id: string
    name: string
    durationDays: number
    price: number
    description: string | null
}

type SubscriptionInfo = {
    id: string
    status: 'PENDING' | 'ACTIVE' | 'EXPIRED'
    endDate: string
    planName: string
    planPrice: number
}

type MemberPortalProps = {
    member: {
        name: string
        memberCode: string
    }
    activeSub: SubscriptionInfo | null
    pendingSub: SubscriptionInfo | null
    plans: PlanItem[]
    monthlyCheckIns: number
    todayLabel: string
}

function formatRupiah(price: number) {
    return `Rp${new Intl.NumberFormat('id-ID').format(price)}`
}

const WORKOUT_GUIDES = [
    {
        meta: '45 MENIT • 4 GERAKAN',
        title: 'Push Day Routine',
        muscles: 'Dada • Bahu • Trisep',
        image:
            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=700&q=80',
    },
    {
        meta: '45 MENIT • 4 GERAKAN',
        title: 'Pull Day Routine',
        muscles: 'Punggung • Bisep',
        image:
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=80',
    },
    {
        meta: '50 MENIT • 4 GERAKAN',
        title: 'Leg & Core Routine',
        muscles: 'Paha • Betis • Perut',
        image:
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
    },
]

export default function MemberPortalView({
    member,
    activeSub,
    pendingSub,
    plans,
    monthlyCheckIns,
    todayLabel,
}: MemberPortalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

    const remainingDays = activeSub
        ? Math.max(
            0,
            Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        )
        : 0

    const formattedExpiry = activeSub
        ? new Date(activeSub.endDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '-'

    function handleSelectPlan(planId: string) {
        setFeedback(null)
        startTransition(async () => {
            const res = await requestSubscriptionAction(planId)
            if (res?.error) {
                setFeedback({ type: 'err', text: res.error })
            } else {
                setFeedback({
                    type: 'ok',
                    text: 'Pengajuan paket terkirim! Tunjukkan QR Code di meja kasir untuk konfirmasi.',
                })
                router.refresh()
            }
        })
    }

    return (
        <div className="min-h-screen bg-[#0E0E11] text-[#F4F4F5] pb-16">
            <header className="border-b border-[#27272C] bg-[#0E0E11]/95 sticky top-0 z-30">
                <div className="max-w-[1264px] mx-auto px-5 md:px-10 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-7 h-6 rounded border-2 border-[#DC2626] flex items-center justify-center text-[#DC2626]">
                            <Dumbbell size={14} strokeWidth={2.5} />
                        </span>
                        <span className="font-[family-name:var(--font-space)] text-xl font-bold tracking-tight">
                            IronPulse
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-[#A1A1AA] hidden sm:inline">
                            {member.name}
                        </span>
                        <form action={memberLogoutAction}>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-md border border-[#27272C] bg-[#17171A] hover:border-zinc-600 text-xs font-medium text-[#F4F4F5] transition-colors"
                            >
                                Keluar
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-[1264px] mx-auto px-5 md:px-10 pt-8 space-y-8">
                <section
                    className="relative rounded-2xl border border-[#27272C] overflow-hidden bg-cover bg-center p-6 sm:p-9"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80')",
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(90deg, rgba(14,14,17,0.96) 0%, rgba(14,14,17,0.85) 55%, rgba(14,14,17,0.72) 100%)',
                        }}
                    />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="text-[11px] font-bold tracking-[1.6px] text-[#A1A1AA] uppercase">
                                MEMBER PORTAL
                            </div>
                            <h1 className="font-[family-name:var(--font-space)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F4F5]">
                                Halo, {member.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-[#A1A1AA]">
                                Selamat datang kembali. Siap jadi lebih kuat hari ini?
                            </p>

                            <div className="pt-3 flex flex-wrap items-center gap-3">
                                <div className="px-4 py-2.5 rounded-lg bg-[#17171A]/90 border border-[#27272C] flex items-center gap-3">
                                    <span className="text-xs text-[#A1A1AA]">Sisa Aktif:</span>
                                    <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#F4F4F5]">
                                        {activeSub ? `${remainingDays} Hari` : '0 Hari'}
                                    </span>
                                </div>

                                <div className="px-4 py-2.5 rounded-lg bg-[#17171A]/90 border border-[#27272C] flex items-center gap-3">
                                    <span className="text-xs text-[#A1A1AA]">Check-in Bulan Ini:</span>
                                    <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#F4F4F5]">
                                        {monthlyCheckIns}x
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block font-[family-name:var(--font-mono)] text-xs text-[#A1A1AA]">
                            {todayLabel}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                    <div className="lg:col-span-4 bg-[#17171A] border border-[#27272C] rounded-2xl p-7 flex flex-col items-center text-center">
                        <h2 className="font-[family-name:var(--font-space)] text-lg font-bold text-[#F4F4F5]">
                            Kartu member digital
                        </h2>

                        <div className="mt-3 mb-6">
                            {activeSub ? (
                                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Membership Aktif
                                </span>
                            ) : pendingSub ? (
                                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-semibold text-amber-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Menunggu Konfirmasi
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-xs font-semibold text-red-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    Belum Ada Paket Aktif
                                </span>
                            )}
                        </div>

                        <div className="p-4 bg-white rounded-xl shadow-inner">
                            <QRCodeSVG
                                value={member.memberCode}
                                size={196}
                                bgColor="#FFFFFF"
                                fgColor="#0E0E11"
                                level="H"
                            />
                        </div>

                        <div className="mt-5 font-[family-name:var(--font-mono)] text-2xl font-bold tracking-wider text-[#F4F4F5]">
                            {member.memberCode}
                        </div>
                        <div className="text-xs text-[#A1A1AA] mt-1">{member.name}</div>

                        <div className="w-full mt-7 pt-5 border-t border-[#27272C] flex items-center justify-between text-left">
                            <div>
                                <div className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                                    PAKET AKTIF
                                </div>
                                <div className="text-sm font-bold text-[#F4F4F5] mt-0.5">
                                    {activeSub ? activeSub.planName : pendingSub ? pendingSub.planName : 'Belum Dipilih'}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                                    BERLAKU HINGGA
                                </div>
                                <div className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#F4F4F5] mt-0.5">
                                    {formattedExpiry}
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-6">
                            Tunjukkan QR ini ke resepsionis. <br />
                            Tanpa kartu fisik, tanpa ribet.
                        </p>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-[family-name:var(--font-space)] text-xl font-bold text-[#F4F4F5]">
                                    Pilih paket berikutnya
                                </h2>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">
                                    Perpanjang lebih awal, latihan tetap lancar.
                                </p>
                            </div>

                            {feedback && (
                                <div
                                    className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-xs ${feedback.type === 'ok'
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                                        }`}
                                >
                                    {feedback.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    <span>{feedback.text}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="bg-[#17171A] border border-[#27272C] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div>
                                            <div className="font-[family-name:var(--font-space)] text-base font-bold text-[#F4F4F5]">
                                                {plan.name}
                                            </div>
                                            <div className="text-xs text-[#A1A1AA] mt-0.5">
                                                {plan.durationDays} hari • {plan.description || 'Akses penuh seluruh fasilitas'}
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                                            <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#F4F4F5]">
                                                {formatRupiah(plan.price)}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={isPending || Boolean(pendingSub)}
                                                onClick={() => handleSelectPlan(plan.id)}
                                                className="px-4 py-2 rounded bg-[#DC2626] hover:bg-[#EF4444] disabled:opacity-45 text-xs font-bold text-[#F4F4F5] transition-colors"
                                            >
                                                Ajukan Paket
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {pendingSub && (
                                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-5 py-4 space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                                        <Clock size={14} />
                                        <span>Menunggu Konfirmasi Kasir</span>
                                    </div>
                                    <p className="text-xs text-[#D4D4D8]">
                                        Pengajuan <strong className="text-[#F4F4F5]">{pendingSub.planName}</strong> ({formatRupiah(pendingSub.planPrice)}) sedang diproses. Paket aktif setelah pembayaran dikonfirmasi di meja kasir.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h2 className="font-[family-name:var(--font-space)] text-lg font-bold text-[#F4F4F5]">
                                Panduan latihan
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {WORKOUT_GUIDES.map((guide) => (
                                    <div
                                        key={guide.title}
                                        className="relative h-64 rounded-xl border border-[#27272C] overflow-hidden bg-cover bg-center"
                                        style={{ backgroundImage: `url('${guide.image}')` }}
                                    >
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    'linear-gradient(180deg, rgba(14,14,17,0.1) 0%, rgba(14,14,17,0.4) 45%, rgba(14,14,17,0.96) 100%)',
                                            }}
                                        />
                                        <div className="absolute left-4 right-4 bottom-4 space-y-1">
                                            <div className="font-[family-name:var(--font-mono)] text-[9px] text-[#D4D4D8]">
                                                {guide.meta}
                                            </div>
                                            <div className="font-[family-name:var(--font-space)] text-sm font-bold text-[#F4F4F5] leading-tight">
                                                {guide.title}
                                            </div>
                                            <div className="text-[11px] text-[#A1A1AA]">{guide.muscles}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}