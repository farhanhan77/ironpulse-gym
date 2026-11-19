'use client'

import { logoutAction } from '@/app/actions/auth'
import { useEffect, useState } from 'react'
import {
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    ChevronRight,
    CircleAlert,
    CreditCard,
    Dumbbell,
    LayoutDashboard,
    LogOut,
    Plus,
    ScanLine,
    Search,
    Users,
} from 'lucide-react'
import {
    DashboardView,
    MembersView,
    PlansView,
    type DBCheckIn,
    type DBMember,
    type DBPlan,
} from '@/components/dashboard-views'
import { QrCameraScanner } from '@/components/qr-camera-scanner'
import { processCheckIn, type ScanValidationResult } from '@/app/actions/checkin'

type DashboardTab = 'Dashboard' | 'QR Scanner' | 'Data Member' | 'Paket Gym'

type AdminDashboardProps = {
    initialMembers?: DBMember[]
    initialPlans?: DBPlan[]
    initialCheckIns?: DBCheckIn[]
}

function Sidebar({ activeView, onNavigate }: { activeView: DashboardTab; onNavigate: (tab: DashboardTab) => void }) {
    const links = [
        { label: 'Dashboard' as const, icon: LayoutDashboard },
        { label: 'QR Scanner' as const, icon: ScanLine },
        { label: 'Data Member' as const, icon: Users },
        { label: 'Paket Gym' as const, icon: CreditCard },
    ]
    return (
        <aside className="sidebar">
            <a className="brand" href="#" aria-label="IronPulse home" onClick={(event) => { event.preventDefault(); onNavigate('Dashboard') }}>
                <span className="brand-mark"><Dumbbell size={19} /></span>
                <span>Iron<span>Pulse</span></span>
            </a>
            <div className="sidebar-section-label">Menu utama</div>
            <nav className="sidebar-nav" aria-label="Navigasi utama">
                {links.map(({ label, icon: Icon }) => {
                    const active = activeView === label
                    return (
                        <button key={label} type="button" className={`nav-link${active ? ' active' : ''}`} aria-label={label} title={label} aria-current={active ? 'page' : undefined} onClick={() => onNavigate(label)}>
                            <Icon size={17} strokeWidth={1.8} /> <span>{label}</span>{active && <span className="active-dot" />}
                        </button>
                    )
                })}
            </nav>
            <div className="sidebar-bottom">
                <div className="admin-profile">
                    <div className="admin-avatar">AD</div>
                    <div className="admin-copy"><span className="admin-name">Admin IronPulse</span><span className="admin-role">Administrator</span></div>
                    <form action={logoutAction}>
                        <button type="submit" className="icon-button logout" aria-label="Keluar" title="Keluar">
                            <LogOut size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    )
}

export function AdminDashboard({
    initialMembers = [],
    initialPlans = [],
    initialCheckIns = [],
}: AdminDashboardProps) {
    const [hydrated, setHydrated] = useState(false)
    const [activeView, setActiveView] = useState<DashboardTab>('Dashboard')
    const [expired, setExpired] = useState(false)
    const [memberQuery, setMemberQuery] = useState('')
    const [feedback, setFeedback] = useState('')
    const [scanResult, setScanResult] = useState<ScanValidationResult['member'] | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    if (!hydrated) return null

    async function handleVerify(code: string, method: 'QR_SCAN' | 'MANUAL') {
        if (isSubmitting) return
        setIsSubmitting(true)
        try {
            const res = await processCheckIn(code, method)
            if (!res.found || !res.member) {
                setScanResult(null)
                setFeedback(res.message || 'Member tidak ditemukan.')
                return
            }
            setScanResult(res.member)
            setExpired(Boolean(res.expired))
            setFeedback('')
            if (method === 'MANUAL') setMemberQuery('')
        } finally {
            setIsSubmitting(false)
        }
    }

    function verifyMember(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        handleVerify(memberQuery, 'MANUAL')
    }

    return (
        <div className="dashboard-shell">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="main-content">
                <header className="topbar">
                    <h1>{activeView === 'Dashboard' ? 'Absensi & Ringkasan' : activeView}</h1>
                    {(activeView === 'Dashboard' || activeView === 'QR Scanner') && (
                        <button
                            className="primary-button"
                            onClick={() => {
                                setActiveView('QR Scanner')
                                setFeedback('Masukkan ID member untuk check-in manual.')
                                setTimeout(() => document.getElementById('member-input')?.focus(), 0)
                            }}
                        >
                            <Plus size={17} /> Check-in Manual
                        </button>
                    )}
                </header>

                {activeView === 'Dashboard' && (
                    <DashboardView initialMembers={initialMembers} initialCheckIns={initialCheckIns} />
                )}
                {activeView === 'Data Member' && (
                    <MembersView initialMembers={initialMembers} />
                )}
                {activeView === 'Paket Gym' && (
                    <PlansView initialPlans={initialPlans} />
                )}
                {activeView === 'QR Scanner' && (
                    <>
                        <section className="scanner-grid" aria-label="Pemindaian dan hasil validasi">
                            <article className="panel scanner-panel">
                                <div className="panel-heading"><div><h2>Scanner QR</h2><p>Arahkan kode QR member ke kamera</p></div></div>
                                <QrCameraScanner onScan={(code) => handleVerify(code, 'QR_SCAN')} />
                                <form className="verify-form" onSubmit={verifyMember}>
                                    <label htmlFor="member-input">Verifikasi manual</label>
                                    <div className="input-row">
                                        <div className="input-wrap">
                                            <Search size={16} />
                                            <input id="member-input" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} placeholder="Masukkan ID Member atau Email" />
                                        </div>
                                        <button className="verify-button" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Memeriksa...' : 'Verifikasi'}
                                        </button>
                                    </div>
                                    {feedback && <p className="form-feedback" role="status">{feedback}</p>}
                                </form>
                            </article>

                            <article className={`panel validation-panel ${scanResult && expired ? 'is-expired' : ''}`}>
                                <div className="panel-heading validation-heading">
                                    <div><h2>Status Validasi</h2><p>Hasil pemindaian terbaru</p></div>
                                    {scanResult && (
                                        <button className="state-toggle" onClick={() => { setExpired(!expired); setFeedback('') }} aria-pressed={expired}>
                                            {expired ? 'Lihat status aktif' : 'Pratinjau kedaluwarsa'} <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>

                                {!scanResult ? (
                                    <div className="table-empty">
                                        <ScanLine size={22} />
                                        <strong>Menunggu pemindaian</strong>
                                        <span>Belum ada member yang dipindai atau diverifikasi.</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`access-badge ${expired ? 'rejected' : ''}`}>
                                            <span className="badge-icon">{expired ? <CircleAlert size={15} /> : <Check size={15} />}</span>
                                            {expired ? 'Paket Kedaluwarsa' : 'Akses Diterima'}
                                        </div>
                                        <div className="member-result">
                                            <div className={`member-avatar ${expired ? 'muted-avatar' : ''} avatar-one`}>
                                                <span>{scanResult.name.slice(0, 2).toUpperCase()}</span>
                                            </div>
                                            <div className="member-info">
                                                <h3>{scanResult.name}</h3>
                                                <span className="member-code">{scanResult.memberCode}</span>
                                            </div>
                                        </div>
                                        <div className="result-details">
                                            <div className="detail-row">
                                                <span>Paket</span>
                                                <strong>{scanResult.planName}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Waktu cek</span>
                                                <strong className="mono">
                                                    {new Date(scanResult.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </strong>
                                            </div>
                                        </div>
                                        {expired && scanResult.endDate && (
                                            <div className="expired-note">
                                                <CircleAlert size={15} /> Paket berakhir pada {new Date(scanResult.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </article>
                        </section>

                        <section className="panel history-panel">
                            <div className="panel-heading history-heading"><div><h2>Riwayat Check-in Terbaru</h2><p>Aktivitas member hari ini</p></div></div>
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Nama Member</th><th>Kode Member</th><th>Waktu Masuk</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {initialCheckIns.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center text-zinc-500 py-8">Belum ada riwayat check-in.</td>
                                            </tr>
                                        ) : (
                                            initialCheckIns.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="table-member">
                                                            <div className="table-avatar avatar-one">{item.user.name.slice(0, 2).toUpperCase()}</div>
                                                            <span>{item.user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="mono">{item.user.memberCode}</td>
                                                    <td className="mono table-time">{new Date(item.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</td>
                                                    <td><span className="table-status"><span />Berhasil masuk</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="table-bottom">
                                <span>Menampilkan {initialCheckIns.length} check-in</span>
                                <div className="table-arrows"><button aria-label="Check-in sebelumnya"><ArrowDownLeft size={15} /></button><button aria-label="Check-in berikutnya"><ArrowUpRight size={15} /></button></div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}

export default AdminDashboard