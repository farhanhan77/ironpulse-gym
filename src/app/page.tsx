import { Suspense } from 'react'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import LandingView from '@/components/landing-view'

async function LandingContent() {
  await connection()

  const activePlans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })

  return (
    <LandingView
      activePlans={activePlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        durationDays: plan.durationDays,
        price: plan.price,
        description: plan.description,
        features: plan.features,
      }))}
    />
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LandingView activePlans={[]} />}>
      <LandingContent />
    </Suspense>
  )
}