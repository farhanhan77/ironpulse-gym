'use client'

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
import { DashboardView, MembersView, PlansView } from '@/components/dashboard-views'

const members = [
    { name: 'Raka Pratama', initials: 'RP', plan: 'Bulanan Pro', time: '14:28 WIB', status: 'Berhasil masuk', color: 'emerald', avatar: 'avatar-one' },
    { name: 'Nadia Putri', initials: 'NP', plan: 'Tahunan', time: '14:16 WIB', status: 'Berhasil masuk', color: 'emerald', avatar: 'avatar-two' },
    { name: 'Dimas Saputra', initials: 'DS', plan: 'Bulanan', time: '13:52 WIB', status: 'Berhasil masuk', color: 'emerald', avatar: 'avatar-three' },
    { name: 'Sarah Amelia', initials: 'SA', plan: 'Harian', time: '13:41 WIB', status: 'Berhasil masuk', color: 'emerald', avatar: 'avatar-four' },
]

type DashboardTab = 'Dashboard' | 'QR Scanner' | 'Data Member' | 'Paket Gym'

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
                    <div className="admin-avatar">AR</div>
                    <div className="admin-copy"><span className="admin-name">Andi Ramadhan</span><span className="admin-role">Administrator</span></div>
                    <button className="icon-button logout" aria-label="Keluar"><LogOut size={16} /></button>
                </div>
            </div>
        </aside>
    )
}

export function AdminDashboard() {
    const [hydrated, setHydrated] = useState(false)
    const [activeView, setActiveView] = useState<DashboardTab>('Dashboard')
    const [expired, setExpired] = useState(false)
    const [memberQuery, setMemberQuery] = useState('')
    const [feedback, setFeedback] = useState('')

    useEffect(() => {
        setHydrated(true)
    }, [])

    if (!hydrated) return null

    function verifyMember(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!memberQuery.trim()) {
            setFeedback('Masukkan ID member atau email terlebih dahulu.')
            return
        }
        setExpired(memberQuery.toLowerCase().includes('expired') || memberQuery.toLowerCase().includes('kadaluarsa'))
        setFeedback('')
    }

    return (
        <div className="dashboard-shell">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="main-content">
                <header className="topbar">
                    <h1>{activeView === 'Dashboard' ? 'Absensi & Ringkasan' : activeView}</h1>
                    {(activeView === 'Dashboard' || activeView === 'QR Scanner') && <button className="primary-button" onClick={() => { setActiveView('QR Scanner'); setFeedback('Masukkan ID member untuk check-in manual.'); setTimeout(() => document.getElementById('member-input')?.focus(), 0) }}><Plus size={17} /> Check-in Manual</button>}
                </header>

                {activeView === 'Dashboard' && <DashboardView />}
                {activeView === 'Data Member' && <MembersView />}
                {activeView === 'Paket Gym' && <PlansView />}
                {activeView === 'QR Scanner' && <>
                    <section className="scanner-grid" aria-label="Pemindaian dan hasil validasi">
                        <article className="panel scanner-panel">
                            <div className="panel-heading"><div><h2>Scanner QR</h2><p>Arahkan kode QR member ke kamera</p></div></div>
                            <div className="camera-placeholder" aria-label="Area kamera pemindai QR">
                                <div className="camera-inner">
                                    <span className="corner corner-tl" /><span className="corner corner-tr" /><span className="corner corner-bl" /><span className="corner corner-br" />
                                    <div className="scan-icon"><ScanLine size={25} strokeWidth={1.5} /></div>
                                    <span className="camera-prompt">Kamera siap digunakan</span>
                                </div>
                            </div>
                            <form className="verify-form" onSubmit={verifyMember}>
                                <label htmlFor="member-input">Verifikasi manual</label>
                                <div className="input-row"><div className="input-wrap"><Search size={16} /><input id="member-input" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} placeholder="Masukkan ID Member atau Email" /></div><button className="verify-button" type="submit">Verifikasi</button></div>
                                {feedback && <p className="form-feedback" role="status">{feedback}</p>}
                            </form>
                        </article>

                        <article className={`panel validation-panel ${expired ? 'is-expired' : ''}`}>
                            <div className="panel-heading validation-heading"><div><h2>Status Validasi</h2><p>Hasil pemindaian terbaru</p></div><button className="state-toggle" onClick={() => { setExpired(!expired); setFeedback('') }} aria-pressed={expired}>{expired ? 'Lihat status aktif' : 'Pratinjau kedaluwarsa'} <ChevronRight size={14} /></button></div>
                            <div className={`access-badge ${expired ? 'rejected' : ''}`}><span className="badge-icon">{expired ? <CircleAlert size={15} /> : <Check size={15} />}</span>{expired ? 'Paket Kedaluwarsa' : 'Akses Diterima'}</div>
                            <div className="member-result">
                                <div className={`member-avatar ${expired ? 'muted-avatar' : ''} avatar-one`}><span>RP</span></div>
                                <div className="member-info"><h3>Raka Pratama</h3><span className="member-code">IP-89240</span></div>
                            </div>
                            <div className="result-details">
                                <div className="detail-row"><span>Paket</span><strong>{expired ? 'Bulanan Pro — Kedaluwarsa' : 'Bulanan Pro — Sisa 24 Hari'}</strong></div>
                                <div className="detail-row"><span>Waktu masuk</span><strong className="mono">14:28 WIB</strong></div>
                            </div>
                            {expired && <div className="expired-note"><CircleAlert size={15} /> Paket berakhir pada 10 November 2026</div>}
                        </article>
                    </section>

                    <section className="panel history-panel">
                        <div className="panel-heading history-heading"><div><h2>Riwayat Check-in Terbaru</h2><p>Aktivitas member hari ini</p></div><button className="text-action">Lihat semua <ChevronRight size={15} /></button></div>
                        <div className="table-wrap"><table><thead><tr><th>Nama Member</th><th>Paket</th><th>Waktu Masuk</th><th>Status</th></tr></thead><tbody>{members.map((member) => <tr key={member.name}><td><div className="table-member"><div className={`table-avatar ${member.avatar}`}>{member.initials}</div><span>{member.name}</span></div></td><td>{member.plan}</td><td className="mono table-time">{member.time}</td><td><span className="table-status"><span />{member.status}</span></td></tr>)}</tbody></table></div>
                        <div className="table-bottom"><span>Menampilkan 4 dari 68 check-in</span><div className="table-arrows"><button aria-label="Check-in sebelumnya"><ArrowDownLeft size={15} /></button><button aria-label="Check-in berikutnya"><ArrowUpRight size={15} /></button></div></div>
                    </section>
                </>}
            </main>
        </div>
    )
}
