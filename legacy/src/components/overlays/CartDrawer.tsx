import { useEffect } from 'react'
import { ArrowRight, Minus, Plus, ShoppingBag, Truck, X } from 'lucide-react'
import { products } from '../../data/catalog'
import { useBodyLock, useStore } from '../../state/store'

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartSubtotal,
    cartCount,
    updateQuantity,
    removeLine,
    notify,
    showCollection,
  } = useStore()
  useBodyLock(cartOpen)

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCartOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [cartOpen, setCartOpen])

  if (!cartOpen) return null

  const freeShippingTarget = 150
  const shippingProgress = Math.min(1, cartSubtotal / freeShippingTarget)
  const remaining = Math.max(0, freeShippingTarget - cartSubtotal)

  return (
    <div className="cart-layer" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        type="button"
        className="overlay-scrim"
        aria-label="Close shopping bag"
        onClick={() => setCartOpen(false)}
      />
      <aside className="cart-drawer">
        <header className="cart-drawer__head">
          <div>
            <span className="eyebrow">Your selection</span>
            <h2>
              The bag <span>{String(cartCount).padStart(2, '0')}</span>
            </h2>
          </div>
          <button
            type="button"
            className="overlay-close"
            aria-label="Close shopping bag"
            onClick={() => setCartOpen(false)}
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon">
              <ShoppingBag size={24} strokeWidth={1.4} />
            </span>
            <h3>Your bag is quiet.</h3>
            <p>Start with something already made, or bring us an idea of your own.</p>
            <button
              type="button"
              className="btn btn--dark"
              onClick={() => {
                setCartOpen(false)
                showCollection({ tab: 'all', category: 'all' })
              }}
            >
              Explore the collection
              <ArrowRight size={15} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              className="link-arrow cart-empty__link"
              onClick={() => {
                setCartOpen(false)
                showCollection({ tab: 'custom', category: 'all' })
              }}
            >
              Or make something personal
              <ArrowRight size={14} strokeWidth={1.7} />
            </button>
          </div>
        ) : (
          <>
            <div className="cart-shipping">
              <div className="cart-shipping__row">
                <span>
                  <Truck size={14} strokeWidth={1.6} />
                  {remaining > 0 ? (
                    <>Complimentary delivery on orders over ${freeShippingTarget}</>
                  ) : (
                    <>Complimentary delivery unlocked</>
                  )}
                </span>
                <span>{remaining > 0 ? `$${remaining} away` : 'Included'}</span>
              </div>
              <div className="cart-shipping__track">
                <span style={{ width: `${shippingProgress * 100}%` }} />
              </div>
            </div>

            <ul className="cart-lines">
              {cart.map((line) => {
                const product = products.find((item) => item.id === line.productId)
                if (!product) return null
                return (
                  <li className="cart-line" key={line.key}>
                    <div className="cart-line__media" style={{ backgroundColor: product.tone }}>
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="cart-line__body">
                      <div className="cart-line__top">
                        <div>
                          <span className="cart-line__category">{product.categoryLabel}</span>
                          <h3>{product.name}</h3>
                        </div>
                        <button
                          type="button"
                          className="cart-line__remove"
                          aria-label={`Remove ${product.name}`}
                          onClick={() => removeLine(line.key)}
                        >
                          <X size={14} strokeWidth={1.6} />
                        </button>
                      </div>
                      <p className="cart-line__options">
                        {line.finish}
                        {line.size ? ` · ${line.size}` : ''}
                      </p>
                      <div className="cart-line__foot">
                        <div className="qty-stepper">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${product.name}`}
                            onClick={() => updateQuantity(line.key, line.quantity - 1)}
                          >
                            <Minus size={12} strokeWidth={1.8} />
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${product.name}`}
                            onClick={() => updateQuantity(line.key, line.quantity + 1)}
                          >
                            <Plus size={12} strokeWidth={1.8} />
                          </button>
                        </div>
                        <strong>${product.price * line.quantity}</strong>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="cart-drawer__foot">
              <div className="cart-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>${cartSubtotal}</strong>
                </div>
                <p>Taxes and delivery calculated at checkout. Every object is packed by hand.</p>
              </div>
              <button
                type="button"
                className="btn btn--dark btn--large cart-checkout"
                onClick={() => notify('Checkout is a studio preview', 'This concept storefront doesn’t process payments.')}
              >
                Continue to checkout
                <ArrowRight size={16} strokeWidth={1.7} />
              </button>
              <div className="cart-assurances">
                <span>Numbered & certified</span>
                <span aria-hidden="true">·</span>
                <span>30-day returns</span>
                <span aria-hidden="true">·</span>
                <span>Plastic-free packing</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
