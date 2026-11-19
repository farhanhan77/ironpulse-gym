import { SignJWT, jwtVerify } from 'jose'

const secretKey = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'ironpulse-fallback-secret-key-2026'
)

export type SessionPayload = {
    userId: string
    email: string
    name: string
    role: 'ADMIN' | 'MEMBER'
}

export async function signSessionToken(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(secretKey)
}

export async function verifySessionToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secretKey)
        return payload as unknown as SessionPayload
    } catch {
        return null
    }
}