import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { products, type Product } from '../data/catalog'

export type CollectionTab = 'all' | 'ready' | 'order' | 'custom'
export type ProjectService = 'portrait' | 'custom' | 'other'

export interface CartLine {
  key: string
  productId: string
  quantity: number
  finish: string
  size?: string
}

interface ToastState {
  id: number
  message: string
  detail?: string
}

interface StoreContextValue {
  cart: CartLine[]
  cartCount: number
  cartSubtotal: number
  addToCart: (product: Product, options?: { finish?: string; size?: string; quantity?: number }) => void
  updateQuantity: (key: string, quantity: number) => void
  removeLine: (key: string) => void
  clearCart: () => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void

  quickView: Product | null
  openQuickView: (product: Product) => void
  closeQuickView: () => void

  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  projectModal: { service: ProjectService } | null
  openProjectModal: (service?: ProjectService) => void
  closeProjectModal: () => void

  collectionTab: CollectionTab
  collectionCategory: string
  setCollectionTab: (tab: CollectionTab) => void
  setCollectionCategory: (category: string) => void
  showCollection: (options?: { tab?: CollectionTab; category?: string }) => void

  toast: ToastState | null
  notify: (message: string, detail?: string) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

const CART_KEY = 'forma-cart-v1'

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (line): line is CartLine =>
        !!line &&
        typeof line.key === 'string' &&
        typeof line.productId === 'string' &&
        typeof line.quantity === 'number' &&
        products.some((product) => product.id === line.productId),
    )
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(readCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [projectModal, setProjectModal] = useState<{ service: ProjectService } | null>(null)
  const [collectionTab, setCollectionTab] = useState<CollectionTab>('all')
  const [collectionCategory, setCollectionCategory] = useState('all')
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {
      // Storage may be unavailable in private contexts; the cart still works in memory.
    }
  }, [cart])

  const notify = useCallback((message: string, detail?: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), message, detail })
    toastTimer.current = window.setTimeout(() => setToast(null), 3600)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const addToCart = useCallback<StoreContextValue['addToCart']>(
    (product, options) => {
      const finish = options?.finish ?? product.materials[0] ?? 'Studio finish'
      const size = options?.size ?? product.sizes?.[0]
      const quantity = Math.max(1, options?.quantity ?? 1)
      const key = `${product.id}::${finish}::${size ?? ''}`

      setCart((current) => {
        const existing = current.find((line) => line.key === key)
        if (existing) {
          return current.map((line) =>
            line.key === key ? { ...line, quantity: line.quantity + quantity } : line,
          )
        }
        return [...current, { key, productId: product.id, quantity, finish, size }]
      })
      notify(`${product.name} added to your bag`, `${finish}${size ? ` · ${size}` : ''}`)
    },
    [notify],
  )

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((current) =>
      quantity <= 0
        ? current.filter((line) => line.key !== key)
        : current.map((line) => (line.key === key ? { ...line, quantity } : line)),
    )
  }, [])

  const removeLine = useCallback((key: string) => {
    setCart((current) => current.filter((line) => line.key !== key))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const openQuickView = useCallback((product: Product) => {
    setQuickView(product)
    setSearchOpen(false)
  }, [])

  const closeQuickView = useCallback(() => setQuickView(null), [])

  const openProjectModal = useCallback((service: ProjectService = 'custom') => {
    setProjectModal({ service })
  }, [])

  const closeProjectModal = useCallback(() => setProjectModal(null), [])

  const openCart = useCallback((open: boolean) => {
    setCartOpen(open)
    if (open) setToast(null)
  }, [])

  const showCollection = useCallback<StoreContextValue['showCollection']>((options) => {
    if (options?.tab) setCollectionTab(options.tab)
    if (options?.category) setCollectionCategory(options.category)
    window.setTimeout(() => {
      const target = document.getElementById('collection')
      if (!target) return
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 30)
  }, [])

  const cartCount = useMemo(() => cart.reduce((total, line) => total + line.quantity, 0), [cart])
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((total, line) => {
        const product = products.find((item) => item.id === line.productId)
        return total + (product?.price ?? 0) * line.quantity
      }, 0),
    [cart],
  )

  const value: StoreContextValue = {
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    cartOpen,
    setCartOpen: openCart,
    quickView,
    openQuickView,
    closeQuickView,
    searchOpen,
    setSearchOpen,
    projectModal,
    openProjectModal,
    closeProjectModal,
    collectionTab,
    collectionCategory,
    setCollectionTab,
    setCollectionCategory,
    showCollection,
    toast,
    notify,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used inside StoreProvider')
  return context
}

export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    document.body.classList.add('no-scroll')
    return () => document.body.classList.remove('no-scroll')
  }, [locked])
}
