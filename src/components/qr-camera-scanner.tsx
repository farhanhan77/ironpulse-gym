'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { CameraOff, ScanLine } from 'lucide-react'

type QrCameraScannerProps = {
    onScan: (decodedText: string) => Promise<void> | void
}

export function QrCameraScanner({ onScan }: QrCameraScannerProps) {
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const lockRef = useRef(false)
    const onScanRef = useRef(onScan)
    onScanRef.current = onScan

    useEffect(() => {
        const elementId = 'ironpulse-qr-reader'
        const container = document.getElementById(elementId)
        if (container) container.innerHTML = ''

        const html5QrCode = new Html5Qrcode(elementId)
        let cancelled = false
        let started = false

        async function startCamera() {
            try {
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 190, height: 190 } },
                    async (decodedText) => {
                        if (lockRef.current) return
                        lockRef.current = true
                        try {
                            await onScanRef.current(decodedText)
                        } finally {
                            setTimeout(() => {
                                lockRef.current = false
                            }, 2500)
                        }
                    },
                    () => { }
                )

                if (cancelled) {
                    await html5QrCode.stop().catch(() => { })
                    html5QrCode.clear()
                    return
                }

                started = true
                setIsScanning(true)
                setCameraError(null)
            } catch {
                if (!cancelled) {
                    setCameraError('Kamera tidak tersedia atau izin ditolak. Gunakan verifikasi manual di bawah.')
                }
            }
        }

        startCamera()

        return () => {
            cancelled = true
            if (started && html5QrCode.isScanning) {
                html5QrCode
                    .stop()
                    .then(() => html5QrCode.clear())
                    .catch(() => { })
            }
        }
    }, [])

    const bracketBase: React.CSSProperties = {
        position: 'absolute',
        width: '28px',
        height: '28px',
        borderColor: '#ffffff',
        borderStyle: 'solid',
        zIndex: 20,
    }

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '300px',
                height: '300px',
                margin: '0 auto 1.25rem auto',
                borderRadius: '0px',
                overflow: 'hidden',
                backgroundColor: '#0e0e11',
                border: '1px solid #27272c',
            }}
            aria-label="Area kamera pemindai QR"
        >
            {/* Video Kamera */}
            <div
                id="ironpulse-qr-reader"
                style={{ width: '100%', height: '100%' }}
                className="[&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&>div]:!border-none"
            />

            {/* Bingkai 4 Siku Putih & Garis Laser */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 20,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Siku Kiri Atas */}
                <span style={{ ...bracketBase, top: '28px', left: '28px', borderWidth: '3px 0 0 3px' }} />
                {/* Siku Kanan Atas */}
                <span style={{ ...bracketBase, top: '28px', right: '28px', borderWidth: '3px 3px 0 0' }} />
                {/* Siku Kiri Bawah */}
                <span style={{ ...bracketBase, bottom: '28px', left: '28px', borderWidth: '0 0 3px 3px' }} />
                {/* Siku Kanan Bawah */}
                <span style={{ ...bracketBase, bottom: '28px', right: '28px', borderWidth: '0 3px 3px 0' }} />

                {isScanning && (
                    <div
                        className="scan-laser"
                        style={{
                            position: 'absolute',
                            left: '34px',
                            right: '34px',
                            height: '2px',
                            backgroundColor: '#ef4444',
                            boxShadow: '0 0 12px #ef4444',
                            zIndex: 20,
                        }}
                    />
                )}

                {!isScanning && !cameraError && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 20 }}>
                        <div className="scan-icon"><ScanLine size={25} strokeWidth={1.5} /></div>
                        <span className="camera-prompt">Menyalakan kamera...</span>
                    </div>
                )}

                {cameraError && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', textAlign: 'center', zIndex: 20 }}>
                        <div className="scan-icon text-red-400"><CameraOff size={25} strokeWidth={1.5} /></div>
                        <span className="camera-prompt">{cameraError}</span>
                    </div>
                )}
            </div>
        </div>
    )
}