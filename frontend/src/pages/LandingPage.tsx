import Navbar from '../components/landing/Navbar'
import {
  Hero, Especialidades, Sobre, ComoAgendar,
  Depoimentos, Funcionamento, Contato, Footer
} from '../components/landing/Sections'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Especialidades />
      <Sobre />
      <ComoAgendar />
      <Depoimentos />
      <Funcionamento />
      <Contato />
      <Footer />
    </div>
  )
}
