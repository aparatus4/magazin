import { CategoryGrid } from './components/CategoryGrid'
import { Collection } from './components/Collection'
import { CustomBureau } from './components/CustomBureau'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Materials } from './components/Materials'
import { Newsletter } from './components/Newsletter'
import { Overlays } from './components/Overlays'
import { PortraitStudio } from './components/PortraitStudio'
import { Projects } from './components/Projects'
import { Reviews } from './components/Reviews'
import { TrustStrip } from './components/TrustStrip'
import { StoreProvider } from './state/store'

export default function App() {
  return (
    <StoreProvider>
      <div className="site">
        <Header />
        <main>
          <Hero />
          <TrustStrip />
          <PortraitStudio />
          <CategoryGrid />
          <Collection />
          <CustomBureau />
          <Materials />
          <Projects />
          <Reviews />
          <Newsletter />
        </main>
        <Footer />
        <Overlays />
      </div>
    </StoreProvider>
  )
}
