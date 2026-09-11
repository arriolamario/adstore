import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/home/Hero'
import TrustBar from '../components/home/TrustBar'
import HowItWorks from '../components/home/HowItWorks'
import CTASection from '../components/home/CTASection'
import CatalogExplorer from '../components/catalog/CatalogExplorer'

export default function HomePage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [hash])

  return (
    <>
      <Hero />
      <TrustBar />

      <section className="section" id="catalogo">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Catalogo</span>
            <h2 className="section-title">Productos disponibles y a pedido</h2>
            <p className="section-lead">
              Filtra por disponibilidad y categoria. Lo marcado como “a pedido” se encarga y llega
              en aproximadamente 5 dias habiles.
            </p>
          </div>
          <CatalogExplorer pageSize={8} />
        </div>
      </section>

      <HowItWorks />
      <CTASection />
    </>
  )
}
