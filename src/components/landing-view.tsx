'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Dumbbell,
    QrCode,
    ShieldCheck,
    Layers,
    Clock,
    ArrowUpRight,
    Check,
    MapPin,
    X,
} from 'lucide-react'
import { Reveal } from '@/components/reveal'

export type LandingPlan = {
    id: string
    name: string
    durationDays: number
    price: number
    description: string | null
    features: string[]
}

function formatShortRupiah(price: number) {
    if (price >= 1000) {
        const ribu = price / 1000
        return `Rp ${Number.isInteger(ribu) ? ribu : ribu.toFixed(0)}rb`
    }
    return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`
}

function formatDurationCode(days: number) {
    if (days === 1) return '01 HARI'
    if (days % 30 === 0) {
        const months = days / 30
        return `${String(months).padStart(2, '0')} BULAN`
    }
    return `${String(days).padStart(2, '0')} HARI`
}

const STRIP_ITEMS = [
    {
        num: '01',
        title: 'AKSES QR INSTAN',
        desc: 'Scan kode member. Masuk. Mulai latihan.',
        image:
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85',
    },
    {
        num: '02',
        title: 'KONFIRMASI TRANSPARAN',
        desc: 'Status aktivasi jelas, langsung dari ponsel.',
        image:
            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=85',
    },
    {
        num: '03',
        title: 'AI FITNESS COACH',
        desc: 'Panduan latihan & nutrisi, kapan saja.',
        image:
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85',
    },
]

const PLAN_IMAGES = [
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=85',
]

const HERO_IMAGE =
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1600&q=85'

const FACILITY_IMAGE =
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1400&q=85'

export default function LandingView({ activePlans }: { activePlans: LandingPlan[] }) {
    const [previewImage, setPreviewImage] = useState<{ src: string; caption: string } | null>(null)

    useEffect(() => {
        if (!previewImage) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPreviewImage(null)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [previewImage])

    return (
        <div className="min-h-screen bg-[#0E0E11] text-[#F4F4F5] selection:bg-[#DC2626] selection:text-white overflow-x-hidden">
            {/* 1. NAVBAR FIXED TRANSPARAN DI ATAS BACKGROUND HERO */}
            <header className="fixed top-0 inset-x-0 z-40 bg-[#0E0E11]/65 backdrop-blur-md">
                <div className="max-w-[1264px] mx-auto px-5 md:px-10 h-16 md:h-24 flex items-center justify-between border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2.5 md:gap-3 group">
                        <span className="w-7 h-6 md:w-8 md:h-7 rounded border-2 border-[#DC2626] flex items-center justify-center text-[#DC2626] transition-transform duration-300 group-hover:scale-105">
                            <Dumbbell size={14} strokeWidth={2.5} />
                        </span>
                        <span className="font-[family-name:var(--font-space)] text-xl md:text-[26px] font-bold tracking-tight text-[#F4F4F5]">
                            IronPulse
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-[#A1A1AA]">
                        <a href="#fasilitas" className="hover:text-[#F4F4F5] transition-colors">
                            Fasilitas
                        </a>
                        <a href="#paket" className="hover:text-[#F4F4F5] transition-colors">
                            Paket
                        </a>
                        <a href="#program" className="hover:text-[#F4F4F5] transition-colors">
                            Program
                        </a>
                        <a href="#lokasi" className="hover:text-[#F4F4F5] transition-colors">
                            Lokasi
                        </a>
                    </nav>

                    <Link
                        href="/login"
                        className="h-9 md:h-11 px-4 md:px-6 bg-[#DC2626] hover:bg-[#EF4444] rounded text-xs md:text-sm font-bold text-[#F4F4F5] inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98]"
                    >
                        Masuk / Daftar
                    </Link>
                </div>
            </header>

            {/* 2. HERO SECTION (BACKGROUND PENUH DARI NAVBAR HINGGA JUDUL DI MOBILE & DESKTOP) */}
            <section className="relative w-full pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 min-h-[560px] lg:min-h-[720px] flex items-center">
                {/* Background Foto Full-Bleed sampai ke atas Navbar */}
                <div
                    className="absolute inset-0 lg:left-[32%] bg-cover bg-[72%_center] lg:bg-center"
                    style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
                >
                    {/* Overlay Mobile (gelap seimbang agar foto tetap terlihat jelas & tulisan tajam) */}
                    <div
                        className="absolute inset-0 lg:hidden"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(14, 14, 17, 0.72) 0%, rgba(14, 14, 17, 0.62) 48%, #0E0E11 100%)',
                        }}
                    />
                    {/* Overlay Desktop */}
                    <div
                        className="hidden lg:block absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(90deg, #0E0E11 0%, rgba(14, 14, 17, 0.88) 18%, rgba(14, 14, 17, 0.18) 60%, rgba(14, 14, 17, 0.35) 100%)',
                        }}
                    />
                </div>

                <div className="relative z-10 w-full max-w-[1264px] mx-auto px-5 md:px-10">
                    <div className="max-w-2xl space-y-5 md:space-y-6">
                        <Reveal delay={40}>
                            <div className="text-[11px] md:text-xs font-bold tracking-[1.8px] text-[#DC2626] uppercase">
                                GYM &amp; PERFORMANCE CLUB
                            </div>
                        </Reveal>

                        <Reveal delay={120}>
                            <h1 className="font-[family-name:var(--font-space)] text-[40px] sm:text-6xl lg:text-[72px] font-bold leading-[1.06] tracking-[-0.03em] text-[#F4F4F5]">
                                BENTUK BADAN <br />
                                SEHAT ANDA <br />
                                DISINI.
                            </h1>
                        </Reveal>

                        <Reveal delay={200}>
                            <p className="text-sm sm:text-[15px] leading-[1.65] text-[#D4D4D8] lg:text-[#A1A1AA] max-w-lg">
                                Fokus pada progresmu. Akses gym, kelola membership, dan temukan ritme latihan—semua dalam satu tempat.
                            </p>
                        </Reveal>

                        <Reveal delay={280}>
                            <div className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
                                <Link
                                    href="/register"
                                    className="h-12 sm:h-[52px] px-5 sm:px-8 bg-[#DC2626] hover:bg-[#EF4444] rounded text-xs sm:text-sm font-bold text-[#F4F4F5] inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98]"
                                >
                                    Gabung Member
                                </Link>
                                <a
                                    href="#paket"
                                    className="h-12 sm:h-[52px] px-5 sm:px-7 rounded bg-[#0E0E11]/75 border border-white/15 hover:border-zinc-400 text-xs sm:text-sm font-semibold text-[#F4F4F5] inline-flex items-center justify-center transition-colors backdrop-blur-sm"
                                >
                                    Lihat Paket
                                </a>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 3. 3-COLUMN FEATURE STRIP (FULL KANAN KE KIRI, BERSIH TANPA TULISAN OVERLAY) */}
            <section id="program" className="w-full mt-6 md:mt-14 border-y border-[#27272C]">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {STRIP_ITEMS.map((item, idx) => (
                        <Reveal
                            key={item.num}
                            delay={idx * 100}
                            className={`relative h-[220px] sm:h-[260px] md:h-[310px] overflow-hidden group cursor-pointer ${idx !== 2 ? 'border-b md:border-b-0 md:border-r border-[#27272C]' : ''
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => setPreviewImage({ src: item.image, caption: item.title })}
                                aria-label={item.title}
                                className="w-full h-full text-left relative block focus:outline-none"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                                    style={{ backgroundImage: `url('${item.image}')` }}
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            'linear-gradient(180deg, rgba(14, 14, 17, 0.12) 0%, rgba(14, 14, 17, 0.42) 45%, rgba(14, 14, 17, 0.95) 100%)',
                                    }}
                                />
                                <span className="absolute left-6 md:left-7 top-5 md:top-6 font-[family-name:var(--font-mono)] text-xs font-medium text-[#F4F4F5]/85">
                                    {item.num}
                                </span>
                                <div className="absolute left-6 right-6 md:left-7 md:right-7 bottom-6 md:bottom-7 space-y-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                                    <h2 className="font-[family-name:var(--font-space)] text-xl md:text-2xl font-bold tracking-tight text-[#F4F4F5]">
                                        {item.title}
                                    </h2>
                                    <p className="text-xs md:text-[13px] leading-relaxed text-[#D4D4D8]">{item.desc}</p>
                                </div>
                            </button>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* 4. SPLIT VALUE SECTION (KENAPA IRONPULSE) */}
            <section id="fasilitas" className="max-w-[1264px] mx-auto px-5 md:px-10 py-16 md:py-24 lg:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                    <Reveal className="lg:col-span-6">
                        <button
                            type="button"
                            onClick={() =>
                                setPreviewImage({
                                    src: FACILITY_IMAGE,
                                    caption: 'Area Latihan Utama IronPulse',
                                })
                            }
                            aria-label="Area Latihan Utama IronPulse"
                            className="relative w-full overflow-hidden rounded-2xl border border-[#27272C] group block cursor-pointer focus:outline-none"
                        >
                            <img
                                src={FACILITY_IMAGE}
                                alt="Fasilitas gym IronPulse"
                                className="w-full h-[260px] sm:h-[360px] md:h-[452px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </button>
                    </Reveal>

                    <Reveal delay={120} className="lg:col-span-6 space-y-5 md:space-y-6">
                        <div className="text-[11px] md:text-xs font-bold tracking-[1.8px] text-[#DC2626] uppercase">
                            KENAPA IRONPULSE
                        </div>
                        <h2 className="font-[family-name:var(--font-space)] text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#F4F4F5]">
                            LEBIH FOKUS. <br />
                            LEBIH PROGRES.
                        </h2>
                        <p className="text-sm leading-[1.75] text-[#A1A1AA]">
                            Ruang untuk jadi lebih kuat, sistem yang bikin semua lebih mudah. Dari check-in sampai rencana latihan, kendali ada di tanganmu.
                        </p>

                        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-7 gap-y-4 sm:gap-y-5 pt-1">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <QrCode size={18} strokeWidth={1.5} className="text-[#F4F4F5] shrink-0" />
                                <span className="text-xs sm:text-[13px] font-medium text-[#F4F4F5]">Check-in tanpa kartu</span>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <ShieldCheck size={18} strokeWidth={1.5} className="text-[#F4F4F5] shrink-0" />
                                <span className="text-xs sm:text-[13px] font-medium text-[#F4F4F5]">Aktivasi transparan</span>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <Layers size={18} strokeWidth={1.5} className="text-[#F4F4F5] shrink-0" />
                                <span className="text-xs sm:text-[13px] font-medium text-[#F4F4F5]">Peralatan lengkap</span>
                            </div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <Clock size={18} strokeWidth={1.5} className="text-[#F4F4F5] shrink-0" />
                                <span className="text-xs sm:text-[13px] font-medium text-[#F4F4F5]">Latihan lebih fleksibel</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <a
                                href="#paket"
                                className="w-full sm:w-auto h-12 sm:h-[50px] px-6 rounded border border-[#27272C] hover:border-zinc-500 text-[13px] font-bold text-[#F4F4F5] inline-flex items-center justify-between sm:justify-start gap-6 transition-colors group"
                            >
                                <span>Jelajahi Paket</span>
                                <ArrowUpRight
                                    size={18}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                />
                            </a>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 5. PILIH PAKET LATIHAN (TERHUBUNG KE POSTGRESQL ADMIN) */}
            <section id="paket" className="max-w-[1264px] mx-auto px-5 md:px-10 py-16 md:py-20 border-t border-[#27272C]">
                <Reveal className="text-center max-w-xl mx-auto space-y-3 mb-10 md:mb-14">
                    <div className="text-[11px] md:text-xs font-bold tracking-[1.8px] text-[#DC2626] uppercase">
                        MEMBERSHIP
                    </div>
                    <h2 className="font-[family-name:var(--font-space)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F4F4F5]">
                        PILIH PAKET LATIHAN
                    </h2>
                    <p className="text-xs sm:text-sm text-[#A1A1AA]">
                        Mulai dari satu bulan. Bangun kebiasaan yang bertahan lebih lama.
                    </p>
                </Reveal>

                {activePlans.length === 0 ? (
                    <div className="rounded-xl bg-[#17171A] border border-[#27272C] p-8 sm:p-12 text-center space-y-2">
                        <p className="font-[family-name:var(--font-space)] text-base sm:text-lg font-bold text-[#F4F4F5]">
                            Paket membership sedang disiapkan
                        </p>
                        <p className="text-xs sm:text-sm text-[#A1A1AA]">
                            Silakan hubungi resepsionis atau aktifkan paket melalui Dashboard Admin.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {activePlans.map((plan, index) => {
                            const planImage = PLAN_IMAGES[index % PLAN_IMAGES.length]
                            return (
                                <Reveal key={plan.id} delay={index * 100} className="h-full">
                                    <article className="h-full bg-[#17171A] rounded-xl border border-[#27272C] overflow-hidden flex flex-col justify-between hover:border-zinc-600 transition-all duration-300 group">
                                        <div>
                                            <div className="relative h-48 sm:h-52">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewImage({
                                                            src: planImage,
                                                            caption: `${plan.name} — ${formatShortRupiah(plan.price)}`,
                                                        })
                                                    }
                                                    aria-label={plan.name}
                                                    className="w-full h-full overflow-hidden block relative cursor-pointer focus:outline-none"
                                                >
                                                    <div
                                                        className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                                                        style={{ backgroundImage: `url('${planImage}')` }}
                                                    />
                                                    <div className="absolute inset-0 bg-[#0E0E11]/15" />
                                                </button>

                                                <div className="absolute right-5 sm:right-6 -bottom-5 h-10 sm:h-11 px-4 sm:px-5 bg-[#DC2626] rounded flex items-center justify-center shadow-lg z-10 pointer-events-none">
                                                    <span className="font-[family-name:var(--font-mono)] text-base sm:text-lg font-bold text-[#F4F4F5]">
                                                        {formatShortRupiah(plan.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-8 sm:pt-9 px-6 sm:px-7 pb-5 sm:pb-6 space-y-2.5 sm:space-y-3">
                                                <div className="font-[family-name:var(--font-mono)] text-[11px] font-medium tracking-[0.55px] text-[#A1A1AA]">
                                                    {formatDurationCode(plan.durationDays)}
                                                </div>
                                                <h3 className="font-[family-name:var(--font-space)] text-2xl sm:text-[28px] font-bold leading-tight uppercase text-[#F4F4F5]">
                                                    {plan.name}
                                                </h3>
                                                <p className="text-[13px] leading-relaxed text-[#A1A1AA]">
                                                    {plan.description || 'Langkah pertama menuju versi terkuatmu.'}
                                                </p>

                                                <ul className="pt-2 space-y-2">
                                                    {(plan.features.length > 0
                                                        ? plan.features
                                                        : ['Akses seluruh area gym', 'Check-in QR tanpa batas', 'AI coach di dashboard']
                                                    ).map((feature) => (
                                                        <li key={feature} className="flex items-center gap-3 text-[13px] text-[#A1A1AA]">
                                                            <Check size={15} className="text-[#F4F4F5] shrink-0" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2">
                                            <Link
                                                href={`/register?plan=${plan.id}`}
                                                className="w-full h-11 rounded border border-[#27272C] bg-[#0E0E11]/40 group-hover:bg-[#DC2626] group-hover:border-[#DC2626] text-xs font-bold uppercase tracking-wider text-[#F4F4F5] inline-flex items-center justify-center transition-colors"
                                            >
                                                Pilih Paket Ini
                                            </Link>
                                        </div>
                                    </article>
                                </Reveal>
                            )
                        })}
                    </div>
                )}

                <p className="text-center text-xs text-[#A1A1AA] mt-8 md:mt-10">
                    Semua paket termasuk akses gym pukul 06.00 – 22.00 WIB.
                </p>
            </section>

            {/* 6. FOOTER DENGAN KOTAK ALAMAT */}
            <footer id="lokasi" className="max-w-[1264px] mx-auto px-5 md:px-10 py-12 md:py-14 border-t border-[#27272C]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 md:gap-8 items-start pb-10 md:pb-12">
                    <div className="lg:col-span-4 space-y-1.5">
                        <div className="font-[family-name:var(--font-space)] text-2xl md:text-[28px] font-bold text-[#F4F4F5]">
                            IronPulse
                        </div>
                        <p className="text-[13px] text-[#A1A1AA]">Bangun kekuatan. Temukan ritmemu.</p>
                    </div>

                    <div className="lg:col-span-5 bg-[#17171A] border border-[#27272C] rounded-xl p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4">
                        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/25 flex items-center justify-center text-[#DC2626] shrink-0 mt-0.5">
                            <MapPin size={17} />
                        </span>
                        <div className="space-y-1.5">
                            <div className="text-[10px] font-bold tracking-[1.2px] text-[#A1A1AA] uppercase">
                                ALAMAT STUDIO
                            </div>
                            <p className="text-[13px] leading-relaxed text-[#F4F4F5]">
                                Jl. Panglima Polim No. 24, Kebayoran Baru <br />
                                Jakarta Selatan 12160
                            </p>
                            <a
                                href="https://maps.google.com/?q=Jl.+Panglima+Polim+No.+24+Kebayoran+Baru+Jakarta+Selatan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626] hover:text-[#EF4444] pt-0.5 transition-colors"
                            >
                                <span>Buka di Google Maps</span>
                                <ArrowUpRight size={13} />
                            </a>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-1.5 lg:text-right">
                        <div className="text-[10px] font-bold tracking-[1.2px] text-[#A1A1AA] uppercase">
                            BUKA SETIAP HARI
                        </div>
                        <p className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#F4F4F5]">
                            06.00 – 22.00 WIB
                        </p>
                        <p className="text-xs text-[#A1A1AA]">Termasuk akhir pekan &amp; hari libur</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-[#27272C]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A1A1AA]">
                    <span>© 2026 IronPulse. Seluruh hak cipta dilindungi.</span>
                    <span className="text-[10px] font-bold tracking-[0.8px] uppercase">TRAIN WITH PURPOSE.</span>
                </div>
            </footer>

            {/* MODAL LIGHTBOX FOTO */}
            {previewImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-4xl w-full bg-[#17171A] border border-[#27272C] rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            aria-label="Tutup foto"
                            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#0E0E11]/80 hover:bg-[#DC2626] border border-white/15 flex items-center justify-center text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <img
                            src={previewImage.src}
                            alt={previewImage.caption}
                            className="w-full max-h-[75vh] object-contain bg-[#0E0E11]"
                        />
                        <div className="px-4 sm:px-5 py-3 border-t border-[#27272C] flex items-center justify-between gap-2">
                            <span className="font-[family-name:var(--font-space)] text-xs sm:text-sm font-bold text-[#F4F4F5]">
                                {previewImage.caption}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-[#A1A1AA] shrink-0">Tap luar untuk tutup</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}