import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import LandingView from '@/components/landing-view'

export default async function LandingPage() {
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