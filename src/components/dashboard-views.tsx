'use client'

import { useMemo, useState } from 'react'
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

type Member = {
    id: string
    name: string
    email: string
    initials: string
    plan: string
    status: 'Aktif' | 'Segera habis' | 'Kedaluwarsa'
    expires: string
    avatar: string
}

type Plan = {
    id: number
    name: string
    duration: string
    price: number
    description: string
    features: string[]
    active: boolean
    popular?: boolean
}

const initialMembers: Member[] = [
    { id: 'IP-89240', name: 'Raka Pratama', email: 'raka.pratama@email.com', initials: 'RP', plan: 'Bulanan Pro', status: 'Aktif', expires: '08 Des 2026', avatar: 'avatar-one' },
    { id: 'IP-89239', name: 'Nadia Putri', email: 'nadia.putri@email.com', initials: 'NP', plan: 'Tahunan', status: 'Aktif', expires: '21 Agu 2027', avatar: 'avatar-two' },
    { id: 'IP-89238', name: 'Dimas Saputra', email: 'dimas.saputra@email.com', initials: 'DS', plan: 'Bulanan', status: 'Segera habis', expires: '18 Nov 2026', avatar: 'avatar-three' },
    { id: 'IP-89237', name: 'Sarah Amelia', email: 'sarah.amelia@email.com', initials: 'SA', plan: 'Harian', status: 'Segera habis', expires: '17 Nov 2026', avatar: 'avatar-four' },
    { id: 'IP-89236', name: 'Bima Wirawan', email: 'bima.wirawan@email.com', initials: 'BW', plan: 'Bulanan Pro', status: 'Segera habis', expires: '16 Nov 2026', avatar: 'avatar-five' },
    { id: 'IP-89235', name: 'Intan Permata', email: 'intan.permata@email.com', initials: 'IP', plan: 'Tahunan', status: 'Aktif', expires: '04 Mar 2027', avatar: 'avatar-six' },
    { id: 'IP-89234', name: 'Fajar Hidayat', email: 'fajar.hidayat@email.com', initials: 'FH', plan: 'Bulanan', status: 'Kedaluwarsa', expires: '10 Nov 2026', avatar: 'avatar-three' },
    { id: 'IP-89233', name: 'Maya Kusuma', email: 'maya.kusuma@email.com', initials: 'MK', plan: 'Bulanan Pro', status: 'Aktif', expires: '30 Nov 2026', avatar: 'avatar-two' },
]

const initialPlans: Plan[] = [
    { id: 1, name: 'Harian', duration: '1 hari', price: 50000, description: 'Untuk latihan fleksibel tanpa komitmen.', features: ['Akses gym 1 hari', 'Semua area latihan', 'Loker harian'], active: true },
    { id: 2, name: 'Bulanan Pro', duration: '30 hari', price: 450000, description: 'Pilihan lengkap untuk rutinitas latihan.', features: ['Akses gym tanpa batas', 'Kelas grup pilihan', 'Konsultasi trainer'], active: true, popular: true },
    { id: 3, name: 'Tahunan', duration: '12 bulan', price: 4200000, description: 'Komitmen terbaik untuk progres jangka panjang.', features: ['Akses gym tanpa batas', 'Semua kelas grup', 'Evaluasi kebugaran bulanan'], active: true },
]

const sevenDayTraffic = [
    { label: '08 Nov', visitors: 214 }, { label: '09 Nov', visitors: 278 },
    { label: '10 Nov', visitors: 251 }, { label: '11 Nov', visitors: 342 },
    { label: '12 Nov', visitors: 306 }, { label: '13 Nov', visitors: 391 },
    { label: '14 Nov', visitors: 368 },
]

const thirtyDayTraffic = Array.from({ length: 30 }, (_, index) => {
    const wave = Math.sin(index * 0.72) * 58 + Math.cos(index * 0.31) * 27
    const weekdayAdjustment = index % 7 === 5 || index % 7 === 6 ? -42 : 24
    return {
        label: `${String(index + 16 > 30 ? index + 16 - 30 : index + 16).padStart(2, '0')} ${index + 16 > 30 ? 'Nov' : 'Okt'}`,
        visitors: Math.round(286 + wave + weekdayAdjustment),
    }
})

const trafficConfig = {
    visitors: { label: 'Check-in', color: 'var(--chart-1)' },
} satisfies ChartConfig

function formatRupiah(value: number) {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
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

export function DashboardView() {
    const [range, setRange] = useState<'7' | '30'>('7')
    const chartData = range === '7' ? sevenDayTraffic : thirtyDayTraffic
    const expiringMembers = initialMembers.filter((member) => member.status === 'Segera habis')

    return (
        <div className="view-stack">
            <section className="metrics-grid dashboard-kpis" aria-label="Ringkasan operasional">
                <MetricCard label="Member Aktif" value="342" detail="+12 bulan ini" icon={Users} tone="red" />
                <MetricCard label="Check-in Hari Ini" value="68" detail="vs. 54 kemarin" icon={Activity} />
                <MetricCard label="Segera Habis" value="14" detail="Dalam 7 hari" icon={Clock3} tone="amber" />
                <MetricCard label="Pendapatan Bulan Ini" value="Rp 48,5 jt" detail="+8,4% bulan lalu" icon={ArrowUpRight} />
            </section>

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
                    <div className="traffic-summary"><strong>368</strong><span>check-in hari ini</span><span className="traffic-change"><ArrowUpRight size={13} /> 12,6%</span></div>
                    <ChartContainer config={trafficConfig} className="traffic-chart" aria-label={`Grafik traffic ${range} hari`}>
                        <LineChart data={chartData} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="#27272c" strokeDasharray="3 5" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={10} minTickGap={18} padding={{ left: 4, right: 12 }} interval={range === '7' ? 'preserveStartEnd' : 4} />
                            <YAxis axisLine={false} tickLine={false} tickMargin={8} width={42} domain={[0, 500]} ticks={[0, 150, 300, 500]} />
                            <Tooltip cursor={{ stroke: '#3a3030', strokeDasharray: '4 4' }} content={<ChartTooltipContent indicator="line" />} />
                            <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#dc2626', stroke: '#17171a', strokeWidth: 3 }} />
                        </LineChart>
                    </ChartContainer>
                    <div className="chart-legend"><span /> Total check-in</div>
                </article>

                <article className="panel expiring-panel">
                    <div className="panel-heading expiring-heading">
                        <div><span className="eyebrow"><span className="eyebrow-dot amber-dot" /> PERLU TINDAKAN</span><h2>Member Segera Habis</h2><p>Perpanjang agar latihan tetap lancar</p></div>
                        <span className="count-pill">14</span>
                    </div>
                    <div className="expiring-list">
                        {expiringMembers.map((member) => (
                            <div className="expiring-member" key={member.id}>
                                <div className={`table-avatar ${member.avatar}`}>{member.initials}</div>
                                <div className="expiring-member-copy"><strong>{member.name}</strong><span>{member.plan}</span></div>
                                <span className="expiring-days">{member.id === 'IP-89238' ? '4 hari' : '2 hari'}</span>
                            </div>
                        ))}
                    </div>
                    <div className="expiring-footer"><span>Menampilkan {expiringMembers.length} dari 14 member</span><span>Perlu diperpanjang</span></div>
                </article>
            </section>

            <section className="panel history-panel dashboard-history">
                <div className="panel-heading history-heading"><div><h2>Check-in Terbaru</h2><p>Aktivitas member hari ini</p></div><span className="small-counter">68 total</span></div>
                <div className="table-wrap"><table><thead><tr><th>Nama Member</th><th>Paket</th><th>Waktu Masuk</th><th>Status</th></tr></thead><tbody>{initialMembers.slice(0, 4).map((member, index) => <tr key={member.id}><td><div className="table-member"><div className={`table-avatar ${member.avatar}`}>{member.initials}</div><span>{member.name}</span></div></td><td>{member.plan}</td><td className="mono table-time">{['14:28', '14:16', '13:52', '13:41'][index]} WIB</td><td><span className="table-status"><span />Berhasil masuk</span></td></tr>)}</tbody></table></div>
            </section>
        </div>
    )
}

function MemberStatus({ status }: { status: Member['status'] }) {
    const tone = status === 'Aktif' ? 'active' : status === 'Segera habis' ? 'warning' : 'expired'
    return <span className={`status-pill ${tone}`}><span />{status}</span>
}

export function MembersView() {
    const [members, setMembers] = useState(initialMembers)
    const [query, setQuery] = useState('')
    const [selectedMember, setSelectedMember] = useState<Member | null>(null)
    const [months, setMonths] = useState('1')
    const [notice, setNotice] = useState('')
    const filteredMembers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return members
        return members.filter((member) => `${member.name} ${member.email} ${member.id} ${member.plan}`.toLowerCase().includes(normalizedQuery))
    }, [members, query])

    function extendSelectedMember() {
        if (!selectedMember) return
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + Number(months))
        const updatedExpiry = endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        setMembers((current) => current.map((member) => member.id === selectedMember.id ? { ...member, expires: updatedExpiry, status: 'Aktif' } : member))
        setNotice(`Paket ${selectedMember.name} berhasil diperpanjang.`)
        setSelectedMember(null)
    }

    return (
        <div className="view-stack">
            <section className="member-summary-row" aria-label="Ringkasan member"><span><strong>{members.length}</strong> member ditampilkan</span><span><i className="summary-dot" /> Data member gym</span></section>
            <section className="panel data-panel">
                <div className="data-toolbar"><div><h2>Semua Member</h2><p>Kelola keanggotaan dan status paket</p></div><label className="search-control"><Search size={16} aria-hidden="true" /><span className="sr-only">Cari member</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, email, atau ID..." /></label></div>
                {notice && <div className="inline-notice" role="status"><Check size={15} />{notice}<button onClick={() => setNotice('')} aria-label="Tutup pemberitahuan"><X size={14} /></button></div>}
                <div className="table-wrap"><table className="member-table"><thead><tr><th>Member</th><th>ID Member</th><th>Paket</th><th>Status</th><th>Berlaku sampai</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>{filteredMembers.map((member) => <tr key={member.id}><td><div className="table-member"><div className={`table-avatar ${member.avatar}`}>{member.initials}</div><div className="member-cell-copy"><strong>{member.name}</strong><span>{member.email}</span></div></div></td><td className="mono member-id">{member.id}</td><td>{member.plan}</td><td><MemberStatus status={member.status} /></td><td>{member.expires}</td><td><button className="row-action" onClick={() => { setSelectedMember(member); setMonths('1') }}>Extend Plan</button></td></tr>)}</tbody></table></div>
                {filteredMembers.length === 0 && <div className="table-empty"><Search size={20} /><strong>Member tidak ditemukan</strong><span>Coba kata kunci lain.</span></div>}
                <div className="table-bottom"><span>Menampilkan {filteredMembers.length} dari {members.length} member</span><span className="table-footnote">Data diperbarui hari ini</span></div>
            </section>
            <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
                <DialogContent className="dashboard-dialog">
                    <DialogHeader className="dashboard-dialog-header"><span className="dialog-icon"><CalendarDays size={18} /></span><DialogTitle>Extend Plan</DialogTitle><DialogDescription>Tambahkan masa aktif keanggotaan member.</DialogDescription></DialogHeader>
                    {selectedMember && <div className="extend-member-card"><div className={`table-avatar ${selectedMember.avatar}`}>{selectedMember.initials}</div><div><strong>{selectedMember.name}</strong><span>{selectedMember.id} · {selectedMember.plan}</span></div></div>}
                    <label className="form-field"><span>Perpanjang selama</span><span className="select-wrap"><select value={months} onChange={(event) => setMonths(event.target.value)}><option value="1">1 bulan</option><option value="3">3 bulan</option><option value="6">6 bulan</option><option value="12">12 bulan</option></select><ChevronDown size={15} aria-hidden="true" /></span></label>
                    <div className="dialog-actions"><button className="secondary-button" onClick={() => setSelectedMember(null)}>Batal</button><button className="primary-button" onClick={extendSelectedMember}>Konfirmasi Perpanjangan</button></div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function PlansView() {
    const [plans, setPlans] = useState(initialPlans)
    const [addOpen, setAddOpen] = useState(false)
    const [name, setName] = useState('')
    const [duration, setDuration] = useState('30 hari')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [formError, setFormError] = useState('')
    const activePlans = plans.filter((plan) => plan.active).length

    function addPlan(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const numericPrice = Number(price)
        if (!name.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            setFormError('Isi nama paket dan harga yang valid.')
            return
        }
        setPlans((current) => [...current, { id: Date.now(), name: name.trim(), duration, price: numericPrice, description: description.trim() || 'Paket keanggotaan IronPulse.', features: ['Akses gym sesuai masa aktif', 'Semua area latihan'], active: true }])
        setName('')
        setDuration('30 hari')
        setPrice('')
        setDescription('')
        setFormError('')
        setAddOpen(false)
    }

    return (
        <div className="view-stack">
            <div className="plans-toolbar"><div className="plan-count"><span className="plan-count-icon"><Dumbbell size={17} /></span><span><strong>{activePlans} paket aktif</strong><small>{plans.length} paket tersedia</small></span></div><button className="primary-button" onClick={() => setAddOpen(true)}><span>+</span> Add Plan</button></div>
            <section className="plans-grid" aria-label="Paket membership">
                {plans.map((plan) => <article className={`panel plan-card ${plan.popular ? 'popular' : ''} ${!plan.active ? 'inactive-plan' : ''}`} key={plan.id}>
                    {plan.popular && <span className="popular-tag">PALING POPULER</span>}
                    <div className="plan-card-heading"><span className="plan-mark"><Dumbbell size={17} /></span><div className="plan-switch-label"><span>{plan.active ? 'Aktif' : 'Nonaktif'}</span><Switch checked={plan.active} onCheckedChange={(checked) => setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, active: checked } : item))} aria-label={`Paket ${plan.name}`} /></div></div>
                    <span className="plan-duration">{plan.duration}</span><h2>{plan.name}</h2><p className="plan-description">{plan.description}</p>
                    <div className="plan-price">{formatRupiah(plan.price)}<span> / {plan.duration}</span></div>
                    <div className="plan-divider" />
                    <ul className="plan-features">{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
                    <div className="plan-card-footer"><span><span className={`plan-status-dot ${plan.active ? 'on' : ''}`} />{plan.active ? 'Paket tersedia untuk member' : 'Paket disembunyikan'}</span><button className="icon-button plan-more" aria-label={`Opsi paket ${plan.name}`}><Ellipsis size={18} /></button></div>
                </article>)}
            </section>
            <div className="plans-note"><span className="note-mark"><Dumbbell size={15} /></span><span><strong>Atur paket sesuai kebutuhan gym.</strong> Paket nonaktif tidak dapat dipilih saat memperpanjang keanggotaan.</span></div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="dashboard-dialog">
                    <DialogHeader className="dashboard-dialog-header"><span className="dialog-icon"><Dumbbell size={18} /></span><DialogTitle>Add Plan</DialogTitle><DialogDescription>Buat pilihan membership baru untuk member IronPulse.</DialogDescription></DialogHeader>
                    <form className="plan-form" onSubmit={addPlan}>
                        <label className="form-field"><span>Nama paket</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Bulanan Plus" required /></label>
                        <div className="form-grid"><label className="form-field"><span>Durasi</span><span className="select-wrap"><select value={duration} onChange={(event) => setDuration(event.target.value)}><option>1 hari</option><option>30 hari</option><option>3 bulan</option><option>6 bulan</option><option>12 bulan</option></select><ChevronDown size={15} aria-hidden="true" /></span></label><label className="form-field"><span>Harga (Rp)</span><input type="number" min="1000" step="1000" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="450000" required /></label></div>
                        <label className="form-field"><span>Deskripsi <small>Opsional</small></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ceritakan keunggulan paket ini" rows={3} /></label>
                        {formError && <p className="form-error" role="alert">{formError}</p>}
                        <div className="dialog-actions"><button type="button" className="secondary-button" onClick={() => setAddOpen(false)}>Batal</button><button type="submit" className="primary-button"><Check size={15} /> Simpan Paket</button></div>
                    </form>
                </DialogContent>
            </Dialog>
            <span className="sr-only" aria-live="polite">{activePlans} paket aktif</span>
        </div>
    )
}
