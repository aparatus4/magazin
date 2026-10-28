import { CartDrawer } from './overlays/CartDrawer'
import { ProjectModal } from './overlays/ProjectModal'
import { QuickView } from './overlays/QuickView'
import { SearchOverlay } from './overlays/SearchOverlay'
import { Toast } from './overlays/Toast'

export function Overlays() {
  return (
    <>
      <CartDrawer />
      <QuickView />
      <SearchOverlay />
      <ProjectModal />
      <Toast />
    </>
  )
}
