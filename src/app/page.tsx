'use client';

import { GradingInterface } from "@/components/GradingInterface"
import { AnimatedBackground } from "@/components/AnimatedBackground"

export default function Home() {
  return (
    <main className="min-h-screen p-4" dir="rtl">
      <AnimatedBackground />
      <GradingInterface />
    </main>
  )
}