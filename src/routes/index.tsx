import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { KitBuilder } from '@/components/KitBuilder'
import { PainStory } from '@/components/PainStory'
import { StockDashboard } from '@/components/StockDashboard'
import { Audience, Faq, FinalCta, FloatingWhatsApp, Footer, Marquee, Numbers } from '@/components/Sections'
import { useReveal } from '@/lib/scroll'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  useReveal()
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PainStory />
        <Marquee />
        <HowItWorks />
        <StockDashboard />
        <Audience />
        <KitBuilder />
        <Numbers />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
