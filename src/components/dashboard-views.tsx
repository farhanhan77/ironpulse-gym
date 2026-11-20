'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Activity,
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Dumbbell,
    Ellipsis,
    Search,
    Users,
    X,
} from 'lucide-react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
    approveSubscriptionAction,
    createMemberByAdminAction,
    createPlanAction,
    extendMemberPlanAction,
    rejectSubscriptionAction,
    togglePlanStatusAction,
} from '@/app/actions/plans'

export type DBPlan = {
    id: string
    name: string
    durationDays: number
    price: number
    description: string | null
    features: string[]
    isActive: boolean
    isPopular: boolean
}

export type DBSubscription = {
    id: string
    startDate: Date | string
    endDate: Date | string
    status: 'PENDING' | 'ACTIVE' | 'EXPIRED'
    plan: DBPlan
}

export type DBMember = {
    id: string
    memberCode: string
    name: string
    email: string
    subscriptions: DBSubscription[]
}

export type DBCheckIn = {
    id: string
    checkedInAt: Date | string
    method: string
    user: {
        id: string
        name: string
        memberCode: string
    }
}

type MemberRow = {
    id: string
    code: string
    name: string
    email: string
    initials: string
    plan: string
    status: 'Aktif' | 'Segera habis' | 'Kedaluwarsa' | 'Menunggu Konfirmasi'
    daysLeft: number
    expires: string
    avatar: string
    pendingSubId?: string
}

type PlanItem = {
    id: string
    name: string
    duration: string
    price: number
    description: string
    features: string[]
    active: boolean
    popular?: boolean
}

const AVATAR_CLASSES = ['avatar-one', 'avatar-two', 'avatar-three', 'avatar-four', 'avatar-five', 'avatar-six']

const trafficConfig = {
    visitors: { label: 'Check-in', color: 'var(--chart-1)' },
} satisfies ChartConfig

function formatRupiah(value: number) {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
}

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'MB'
}

function formatDuration(days: number) {
    if (days === 1) return '1 hari'
    if (days === 30) return '30 hari'
    if (days % 30 === 0 && days < 360) return `${days / 30} bulan`
    if (days >= 360) return '12 bulan'
    return `${days} hari`
}

function mapMemberRows(rawMembers: DBMember[]): MemberRow[] {
    const now = new Date()
    return rawMembers.map((member, index) => {
        const latestSub = member.subscriptions[0]
        if (!latestSub) {
            return {
                id: member.id,
                code: member.memberCode,
                name: member.name,
                email: member.email,
                initials: getInitials(member.name),
                plan: 'Belum ada paket',
                status: 'Kedaluwarsa',
                daysLeft: 0,
                expires: '-',
                avatar: AVATAR_CLASSES[index % AVATAR_CLASSES.length],
            }
        }

        if (latestSub.status === 'PENDING') {
            return {
                id: member.id,
                code: member.memberCode,
                name: member.name,
                email: member.email,
                initials: getInitials(member.name),
                plan: latestSub.plan.name,
                status: 'Menunggu Konfirmasi',
                daysLeft: latestSub.plan.durationDays,
                expires: 'Belum aktif',
                avatar: AVATAR_CLASSES[index % AVATAR_CLASSES.length],
                pendingSubId: latestSub.id,
            }
        }

        const endDate = new Date(latestSub.endDate)
        const diffMs = endDate.getTime() - now.getTime()
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

        let status: MemberRow['status'] = 'Aktif'
        if (latestSub.status === 'EXPIRED' || daysLeft <= 0) {
            status = 'Kedaluwarsa'
        } else if (daysLeft <= 7) {
            status = 'Segera habis'
        }

        return {
            id: member.id,
            code: member.memberCode,
            name: member.name,
            email: member.email,
            initials: getInitials(member.name),
            plan: latestSub.plan.name,
            status,
            daysLeft: Math.max(0, daysLeft),
            expires: endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            avatar: AVATAR_CLASSES[index % AVATAR_CLASSES.length],
        }
    })
}

function buildTrafficSeries(days: number, checkIns: DBCheckIn[]) {
    const today = new Date()
    return Array.from({ length: days }, (_, idx) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (days - 1 - idx))
        const key = date.toISOString().slice(0, 10)
        const count = checkIns.filter((item) => new Date(item.checkedInAt).toISOString().slice(0, 10) === key).length
        return {
            label: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            visitors: count,
        }
    })
}

function MetricCard({ label, value, detail, icon: Icon, tone = 'neutral' }: {
    label: string
    value: string
    detail: string
    icon: typeof Users
    tone?: 'neutral' | 'red' | 'amber'
}) {
    return (
        <article className={`metric-card dashboard-metric ${tone}`}>
            <div className="dashboard-metric-top">
                <span className="metric-label">{label}</span>
                <span className="dashboard-metric-icon"><Icon size={16} aria-hidden="true" /></span>
            </div>
            <div className="dashboard-metric-bottom">
                <span className="metric-value">{value}</span>
                <span className="dashboard-metric-detail">{detail}</span>
            </div>
        </article>
    )
}

export function DashboardView({
    initialMembers = [],
    initialCheckIns = [],
}: {
    initialMembers?: DBMember[]
    initialCheckIns?: DBCheckIn[]
}) {
    const router = useRouter()
    const [range, setRange] = useState<'7' | '30'>('7')
    const [processingId, setProcessingId] = useState<string | null>(null)

    const memberRows = useMemo(() => mapMemberRows(initialMembers), [initialMembers])
    const activeCount = memberRows.filter((m) => m.status === 'Aktif' || m.status === 'Segera habis').length
    const expiringMembers = memberRows.filter((m) => m.status === 'Segera habis')

    const pendingRequests = useMemo(
        () =>
            initialMembers
                .filter((m) => m.subscriptions[0]?.status === 'PENDING')
                .map((m) => ({
                    member: m,
                    sub: m.subscriptions[0],
                })),
        [initialMembers]
    )

    const todayKey = new Date().toISOString().slice(0, 10)
    const todayCheckIns = initialCheckIns.filter(
        (item) => new Date(item.checkedInAt).toISOString().slice(0, 10) === todayKey
    ).length

    const monthlyRevenue = initialMembers.reduce((sum, member) => {
        const activeSub = member.subscriptions[0]
        return activeSub && activeSub.status === 'ACTIVE' ? sum + activeSub.plan.price : sum
    }, 0)

    const chartData = useMemo(
        () => buildTrafficSeries(range === '7' ? 7 : 30, initialCheckIns),
        [range, initialCheckIns]
    )

    async function handleApprove(subId: string) {
        setProcessingId(subId)
        try {
            await approveSubscriptionAction(subId)
            router.refresh()
        } finally {
            setProcessingId(null)
        }
    }

    async function handleReject(subId: string) {
        setProcessingId(subId)
        try {
            await rejectSubscriptionAction(subId)
            router.refresh()
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="view-stack">
            <section className="metrics-grid dashboard-kpis" aria-label="Ringkasan operasional">
                <MetricCard label="Member Aktif" value={String(activeCount)} detail={`${memberRows.length} total terdaftar`} icon={Users} tone="red" />
                <MetricCard label="Check-in Hari Ini" value={String(todayCheckIns)} detail="Log absensi harian" icon={Activity} />
                <MetricCard label="Menunggu Konfirmasi" value={String(pendingRequests.length)} detail={`${expiringMembers.length} segera habis`} icon={Clock3} tone="amber" />
                <MetricCard label="Pendapatan Aktif" value={formatRupiah(monthlyRevenue)} detail="Dari langganan aktif" icon={ArrowUpRight} />
            </section>

            {/* Panel Konfirmasi Pembayaran Paket dari Member */}
            {pendingRequests.length > 0 && (
                <section className="panel border-amber-500/30" aria-label="Konfirmasi pengajuan paket">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow"><span className="eyebrow-dot amber-dot" /> BUTUH KONFIRMASI KASIR</span>
                            <h2>Pengajuan Paket Member ({pendingRequests.length})</h2>
                            <p>Pastikan pembayaran sudah diterima sebelum mengaktifkan QR member</p>
                        </div>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Kode</th>
                                    <th>Paket Dipilih</th>
                                    <th>Tagihan</th>
                                    <th>Aksi Konfirmasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map(({ member, sub }) => (
                                    <tr key={sub.id}>
                                        <td>
                                            <div className="table-member">
                                                <div className="table-avatar avatar-one">{getInitials(member.name)}</div>
                                                <div className="member-cell-copy">
                                                    <strong>{member.name}</strong>
                                                    <span>{member.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="mono">{member.memberCode}</td>
                                        <td>{sub.plan.name} ({formatDuration(sub.plan.durationDays)})</td>
                                        <td className="mono font-semibold">{formatRupiah(sub.plan.price)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={processingId === sub.id}
                                                    onClick={() => handleApprove(sub.id)}
                                                    className="primary-button !py-1.5 !px-3 !text-xs"
                                                >
                                                    <Check size={14} /> {processingId === sub.id ? 'Memproses...' : 'Konfirmasi & Aktifkan'}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={processingId === sub.id}
                                                    onClick={() => handleReject(sub.id)}
                                                    className="secondary-button !py-1.5 !px-3 !text-xs"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <section className="dashboard-insights" aria-label="Traffic pengunjung dan member segera habis">
                <article className="panel traffic-panel">
                    <div className="panel-heading traffic-heading">
                        <div>
                            <span className="eyebrow"><span className="eyebrow-dot" /> AKTIVITAS GYM</span>
                            <h2>Traffic Pengunjung</h2>
                            <p>Tren check-in member dari waktu ke waktu</p>
                        </div>
                        <div className="range-switch" role="group" aria-label="Rentang traffic">
                            <button className={range === '7' ? 'selected' : ''} onClick={() => setRange('7')} aria-pressed={range === '7'}>7 hari</button>
                            <button className={range === '30' ? 'selected' : ''} onClick={() => setRange('30')} aria-pressed={range === '30'}>30 hari</button>
                        </div>
                    </div>
                    <div className="traffic-summary">
                        <strong>{todayCheckIns}</strong>
                        <span>check-in hari ini</span>
                    </div>
                    <ChartContainer config={trafficConfig} className="traffic-chart" aria-label={`Grafik traffic ${range} hari`}>
                        <LineChart data={chartData} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="#27272c" strokeDasharray="3 5" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={10} minTickGap={18} padding={{ left: 4, right: 12 }} interval={range === '7' ? 'preserveStartEnd' : 4} />
                            <YAxis axisLine={false} tickLine={false} tickMargin={8} width={42} allowDecimals={false} />
                            <Tooltip cursor={{ stroke: '#3a3030', strokeDasharray: '4 4' }} content={<ChartTooltipContent indicator="line" />} />
                            <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#dc2626', stroke: '#17171a', strokeWidth: 3 }} />
                        </LineChart>
                    </ChartContainer>
                    <div className="chart-legend"><span /> Total check-in</div>
                </article>

                <article className="panel expiring-panel">
                    <div className="panel-heading expiring-heading">
                        <div><span className="eyebrow"><span className="eyebrow-dot amber-dot" /> PERLU TINDAKAN</span><h2>Member Segera Habis</h2><p>Perpanjang agar latihan tetap lancar</p></div>
                        <span className="count-pill">{expiringMembers.length}</span>
                    </div>
                    <div className="expiring-list">
                        {expiringMembers.length === 0 ? (
                            <p className="text-sm text-zinc-500 py-6 text-center">Belum ada member yang masa aktifnya segera habis.</p>
                        ) : (
                            expiringMembers.map((member) => (
                                <div className="expiring-member" key={member.id}>
                                    <div className={`table-avatar ${member.avatar}`}>{member.initials}</div>
                                    <div className="expiring-member-copy"><strong>{member.name}</strong><span>{member.plan}</span></div>
                                    <span className="expiring-days">{member.daysLeft} hari</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="expiring-footer"><span>Menampilkan {expiringMembers.length} member</span><span>Database PostgreSQL</span></div>
                </article>
            </section>

            <section className="panel history-panel dashboard-history">
                <div className="panel-heading history-heading"><div><h2>Check-in Terbaru</h2><p>Aktivitas member hari ini</p></div><span className="small-counter">{initialCheckIns.length} total</span></div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Nama Member</th><th>Kode Member</th><th>Waktu Masuk</th><th>Status</th></tr></thead>
                        <tbody>
                            {initialCheckIns.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-zinc-500 py-8">Belum ada aktivitas check-in di database.</td>
                                </tr>
                            ) : (
                                initialCheckIns.slice(0, 5).map((item, index) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="table-member">
                                                <div className={`table-avatar ${AVATAR_CLASSES[index % AVATAR_CLASSES.length]}`}>{getInitials(item.user.name)}</div>
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
            </section>
        </div>
    )
}

function MemberStatus({ status }: { status: MemberRow['status'] }) {
    const tone =
        status === 'Aktif'
            ? 'active'
            : status === 'Segera habis' || status === 'Menunggu Konfirmasi'
                ? 'warning'
                : 'expired'
    return <span className={`status-pill ${tone}`}><span />{status}</span>
}

export function MembersView({ initialMembers = [] }: { initialMembers?: DBMember[] }) {
    const router = useRouter()
    const [members, setMembers] = useState<MemberRow[]>(() => mapMemberRows(initialMembers))
    const [query, setQuery] = useState('')
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null)
    const [months, setMonths] = useState('1')
    const [extending, setExtending] = useState(false)
    const [notice, setNotice] = useState('')

    // State modal Tambah Member oleh Admin
    const [addMemberOpen, setAddMemberOpen] = useState(false)
    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [addError, setAddError] = useState('')
    const [addingMember, setAddingMember] = useState(false)

    const filteredMembers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return members
        return members.filter((member) => `${member.name} ${member.email} ${member.code} ${member.plan}`.toLowerCase().includes(normalizedQuery))
    }, [members, query])

    async function handleQuickApprove(member: MemberRow) {
        if (!member.pendingSubId) return
        await approveSubscriptionAction(member.pendingSubId)
        setMembers((current) =>
            current.map((m) => (m.id === member.id ? { ...m, status: 'Aktif', pendingSubId: undefined } : m))
        )
        setNotice(`Paket ${member.name} berhasil dikonfirmasi & diaktifkan.`)
        router.refresh()
    }

    async function extendSelectedMember() {
        if (!selectedMember || extending) return
        setExtending(true)
        try {
            const res = await extendMemberPlanAction(selectedMember.id, Number(months))
            if (!res.ok || !res.endDate) {
                setNotice(res.error || 'Gagal memperpanjang paket.')
                setSelectedMember(null)
                return
            }

            const updatedExpiry = new Date(res.endDate).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })

            setMembers((current) =>
                current.map((member) =>
                    member.id === selectedMember.id
                        ? { ...member, expires: updatedExpiry, status: 'Aktif', plan: res.planName || member.plan }
                        : member
                )
            )
            setNotice(`Paket ${selectedMember.name} berhasil diperpanjang hingga ${updatedExpiry}.`)
            setSelectedMember(null)
            router.refresh()
        } finally {
            setExtending(false)
        }
    }

    async function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setAddingMember(true)
        setAddError('')
        try {
            const res = await createMemberByAdminAction({
                name: newName,
                email: newEmail,
                password: newPassword,
            })

            if (!res.ok || !res.member) {
                setAddError(res.error || 'Gagal menambah member.')
                return
            }

            setMembers((current) => [
                {
                    id: res.member.id,
                    code: res.member.memberCode,
                    name: res.member.name,
                    email: res.member.email,
                    initials: getInitials(res.member.name),
                    plan: 'Belum ada paket',
                    status: 'Kedaluwarsa',
                    daysLeft: 0,
                    expires: '-',
                    avatar: AVATAR_CLASSES[current.length % AVATAR_CLASSES.length],
                },
                ...current,
            ])

            setNewName('')
            setNewEmail('')
            setNewPassword('')
            setAddMemberOpen(false)
            setNotice(`Member ${res.member.name} (${res.member.memberCode}) berhasil ditambahkan.`)
            router.refresh()
        } finally {
            setAddingMember(false)
        }
    }

    return (
        <div className="view-stack">
            <section className="member-summary-row" aria-label="Ringkasan member">
                <span><strong>{members.length}</strong> member terdaftar</span>
                <span><i className="summary-dot" /> Tersambung ke PostgreSQL</span>
            </section>
            <section className="panel data-panel">
                <div className="data-toolbar">
                    <div><h2>Semua Member</h2><p>Kelola keanggotaan dan status paket</p></div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <label className="search-control">
                            <Search size={16} aria-hidden="true" />
                            <span className="sr-only">Cari member</span>
                            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, email, atau ID..." />
                        </label>
                        <button type="button" className="primary-button" onClick={() => setAddMemberOpen(true)}>
                            <span>+</span> Tambah Member
                        </button>
                    </div>
                </div>
                {notice && <div className="inline-notice" role="status"><Check size={15} />{notice}<button onClick={() => setNotice('')} aria-label="Tutup pemberitahuan"><X size={14} /></button></div>}
                <div className="table-wrap"><table className="member-table"><thead><tr><th>Member</th><th>ID Member</th><th>Paket</th><th>Status</th><th>Berlaku sampai</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>{filteredMembers.map((member) => <tr key={member.id}><td><div className="table-member"><div className={`table-avatar ${member.avatar}`}>{member.initials}</div><div className="member-cell-copy"><strong>{member.name}</strong><span>{member.email}</span></div></div></td><td className="mono member-id">{member.code}</td><td>{member.plan}</td><td><MemberStatus status={member.status} /></td><td>{member.expires}</td><td>{member.status === 'Menunggu Konfirmasi' ? <button className="primary-button !py-1.5 !px-3 !text-xs" onClick={() => handleQuickApprove(member)}>Konfirmasi</button> : <button className="row-action" onClick={() => { setSelectedMember(member); setMonths('1') }}>Extend Plan</button>}</td></tr>)}</tbody></table></div>
                {filteredMembers.length === 0 && (
                    <div className="table-empty">
                        <Users size={20} />
                        <strong>{members.length === 0 ? 'Belum ada member terdaftar' : 'Member tidak ditemukan'}</strong>
                        <span>{members.length === 0 ? 'Klik "+ Tambah Member" untuk mendaftarkan anggota pertama.' : 'Coba kata kunci lain.'}</span>
                    </div>
                )}
                <div className="table-bottom"><span>Menampilkan {filteredMembers.length} dari {members.length} member</span><span className="table-footnote">Tersambung ke PostgreSQL</span></div>
            </section>

            {/* Dialog Extend Plan */}
            <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
                <DialogContent className="dashboard-dialog">
                    <DialogHeader className="dashboard-dialog-header"><span className="dialog-icon"><CalendarDays size={18} /></span><DialogTitle>Extend Plan</DialogTitle><DialogDescription>Tambahkan masa aktif keanggotaan member ke database.</DialogDescription></DialogHeader>
                    {selectedMember && <div className="extend-member-card"><div className={`table-avatar ${selectedMember.avatar}`}>{selectedMember.initials}</div><div><strong>{selectedMember.name}</strong><span>{selectedMember.code} · {selectedMember.plan}</span></div></div>}
                    <label className="form-field"><span>Perpanjang selama</span><span className="select-wrap"><select value={months} onChange={(event) => setMonths(event.target.value)}><option value="1">1 bulan</option><option value="3">3 bulan</option><option value="6">6 bulan</option><option value="12">12 bulan</option></select><ChevronDown size={15} aria-hidden="true" /></span></label>
                    <div className="dialog-actions"><button className="secondary-button" onClick={() => setSelectedMember(null)}>Batal</button><button className="primary-button" disabled={extending} onClick={extendSelectedMember}>{extending ? 'Menyimpan...' : 'Konfirmasi Perpanjangan'}</button></div>
                </DialogContent>
            </Dialog>

            {/* Dialog Tambah Member Baru */}
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                <DialogContent className="dashboard-dialog">
                    <DialogHeader className="dashboard-dialog-header"><span className="dialog-icon"><Users size={18} /></span><DialogTitle>Tambah Member Baru</DialogTitle><DialogDescription>Daftarkan akun member baru dengan kode QR unik otomatis.</DialogDescription></DialogHeader>
                    <form className="plan-form" onSubmit={handleAddMember}>
                        <label className="form-field"><span>Nama lengkap</span><input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contoh: Dimas Saputra" required /></label>
                        <label className="form-field"><span>Email</span><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="dimas@email.com" required /></label>
                        <label className="form-field"><span>Password awal</span><input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" required /></label>
                        {addError && <p className="form-error" role="alert">{addError}</p>}
                        <div className="dialog-actions"><button type="button" className="secondary-button" onClick={() => setAddMemberOpen(false)}>Batal</button><button type="submit" disabled={addingMember} className="primary-button"><Check size={15} /> {addingMember ? 'Mendaftarkan...' : 'Simpan Member'}</button></div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function PlansView({ initialPlans = [] }: { initialPlans?: DBPlan[] }) {
    const router = useRouter()
    const [plans, setPlans] = useState<PlanItem[]>(() =>
        initialPlans.map((p) => ({
            id: p.id,
            name: p.name,
            duration: formatDuration(p.durationDays),
            price: p.price,
            description: p.description || 'Paket keanggotaan IronPulse.',
            features: p.features,
            active: p.isActive,
            popular: p.isPopular,
        }))
    )
    const [addOpen, setAddOpen] = useState(false)
    const [name, setName] = useState('')
    const [duration, setDuration] = useState('30 hari')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [formError, setFormError] = useState('')
    const [saving, setSaving] = useState(false)

    const activePlans = plans.filter((plan) => plan.active).length

    async function addPlan(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const numericPrice = Number(price)
        if (!name.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            setFormError('Isi nama paket dan harga yang valid.')
            return
        }

        setSaving(true)
        try {
            const res = await createPlanAction({
                name: name.trim(),
                durationLabel: duration,
                price: numericPrice,
                description: description.trim(),
            })

            if (!res.ok || !res.plan) {
                setFormError(res.error || 'Gagal menyimpan paket.')
                return
            }

            setPlans((current) => [
                ...current,
                {
                    id: res.plan.id,
                    name: res.plan.name,
                    duration: formatDuration(res.plan.durationDays),
                    price: res.plan.price,
                    description: res.plan.description || 'Paket keanggotaan IronPulse.',
                    features: res.plan.features,
                    active: res.plan.isActive,
                    popular: res.plan.isPopular,
                },
            ])
            setName('')
            setDuration('30 hari')
            setPrice('')
            setDescription('')
            setFormError('')
            setAddOpen(false)
            router.refresh()
        } finally {
            setSaving(false)
        }
    }

    async function handleTogglePlan(planId: string, checked: boolean) {
        setPlans((current) => current.map((item) => (item.id === planId ? { ...item, active: checked } : item)))
        await togglePlanStatusAction(planId, checked)
        router.refresh()
    }

    return (
        <div className="view-stack">
            <div className="plans-toolbar"><div className="plan-count"><span className="plan-count-icon"><Dumbbell size={17} /></span><span><strong>{activePlans} paket aktif</strong><small>{plans.length} paket tersedia</small></span></div><button className="primary-button" onClick={() => setAddOpen(true)}><span>+</span> Add Plan</button></div>
            {plans.length === 0 ? (
                <section className="panel">
                    <div className="table-empty">
                        <Dumbbell size={22} />
                        <strong>Belum ada paket gym</strong>
                        <span>Tabel MembershipPlan masih kosong. Klik tombol &quot;+ Add Plan&quot; di atas untuk menambahkan paket pertama.</span>
                    </div>
                </section>
            ) : (
                <section className="plans-grid" aria-label="Paket membership">
                    {plans.map((plan) => <article className={`panel plan-card ${plan.popular ? 'popular' : ''} ${!plan.active ? 'inactive-plan' : ''}`} key={plan.id}>
                        {plan.popular && <span className="popular-tag">PALING POPULER</span>}
                        <div className="plan-card-heading"><span className="plan-mark"><Dumbbell size={17} /></span><div className="plan-switch-label"><span>{plan.active ? 'Aktif' : 'Nonaktif'}</span><Switch checked={plan.active} onCheckedChange={(checked) => handleTogglePlan(plan.id, checked)} aria-label={`Paket ${plan.name}`} /></div></div>
                        <span className="plan-duration">{plan.duration}</span><h2>{plan.name}</h2><p className="plan-description">{plan.description}</p>
                        <div className="plan-price">{formatRupiah(plan.price)}<span> / {plan.duration}</span></div>
                        <div className="plan-divider" />
                        <ul className="plan-features">{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
                        <div className="plan-card-footer"><span><span className={`plan-status-dot ${plan.active ? 'on' : ''}`} />{plan.active ? 'Paket tersedia untuk member' : 'Paket disembunyikan'}</span><button className="icon-button plan-more" aria-label={`Opsi paket ${plan.name}`}><Ellipsis size={18} /></button></div>
                    </article>)}
                </section>
            )}
            <div className="plans-note"><span className="note-mark"><Dumbbell size={15} /></span><span><strong>Atur paket sesuai kebutuhan gym.</strong> Paket nonaktif tidak dapat dipilih saat memperpanjang keanggotaan.</span></div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="dashboard-dialog">
                    <DialogHeader className="dashboard-dialog-header"><span className="dialog-icon"><Dumbbell size={18} /></span><DialogTitle>Add Plan</DialogTitle><DialogDescription>Buat pilihan membership baru untuk member IronPulse.</DialogDescription></DialogHeader>
                    <form className="plan-form" onSubmit={addPlan}>
                        <label className="form-field"><span>Nama paket</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Bulanan Plus" required /></label>
                        <div className="form-grid"><label className="form-field"><span>Durasi</span><span className="select-wrap"><select value={duration} onChange={(event) => setDuration(event.target.value)}><option>1 hari</option><option>30 hari</option><option>3 bulan</option><option>6 bulan</option><option>12 bulan</option></select><ChevronDown size={15} aria-hidden="true" /></span></label><label className="form-field"><span>Harga (Rp)</span><input type="number" min="1000" step="1000" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="150000" required /></label></div>
                        <label className="form-field"><span>Deskripsi <small>Opsional</small></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ceritakan keunggulan paket ini" rows={3} /></label>
                        {formError && <p className="form-error" role="alert">{formError}</p>}
                        <div className="dialog-actions"><button type="button" className="secondary-button" onClick={() => setAddOpen(false)}>Batal</button><button type="submit" disabled={saving} className="primary-button"><Check size={15} /> {saving ? 'Menyimpan...' : 'Simpan Paket'}</button></div>
                    </form>
                </DialogContent>
            </Dialog>
            <span className="sr-only" aria-live="polite">{activePlans} paket aktif</span>
        </div>
    )
}