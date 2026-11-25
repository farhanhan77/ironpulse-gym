import { NextResponse, type NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Cek Sesi Admin (ironpulse_session)
    if (pathname.startsWith('/admin')) {
        const adminToken = request.cookies.get('ironpulse_session')?.value
        const adminSession = adminToken ? await verifySessionToken(adminToken) : null

        if (!adminSession || adminSession.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 2. Cek Sesi Member (ironpulse_member_session)
    if (pathname.startsWith('/member')) {
        const memberToken = request.cookies.get('ironpulse_member_session')?.value
        const memberSession = memberToken ? await verifySessionToken(memberToken) : null

        if (!memberSession || memberSession.role !== 'MEMBER') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/member/:path*'],
}