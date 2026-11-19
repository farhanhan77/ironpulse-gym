import { NextResponse, type NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('ironpulse_session')?.value
    const session = token ? await verifySessionToken(token) : null

    // Lindungi semua rute di bawah /admin
    if (pathname.startsWith('/admin')) {
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Jika sudah login sebagai admin dan membuka /login, langsung arahkan ke /admin
    if (pathname === '/login' && session?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
}