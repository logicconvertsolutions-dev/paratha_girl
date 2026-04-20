'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartState, Product } from '@/types'
import { lineTotal } from '@/types'

// Two lines may share a product when the buyer picks different sides, so each
// line gets its own id. That's why we key by lineId rather than product id.
function newLineId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function sameSelection(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((v, i) => v === sortedB[i])
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      addItem: (
        product: Product,
        quantity: number,
        sides: string[] = [],
        extras: string[] = [],
      ) => {
        set((state) => {
          // Merge into an existing line only when the product AND sides AND
          // extras all match — otherwise it's a distinct configuration.
          const existing = state.items.find(
            (i) =>
              i.product.id === product.id &&
              sameSelection(i.sides, sides) &&
              sameSelection(i.extras, extras),
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === existing.lineId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { lineId: newLineId(), product, quantity, sides, extras },
            ],
          }
        })
      },

      removeItem: (lineId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.lineId !== lineId),
        }))
      },

      updateQty: (lineId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(lineId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity } : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        +get().items.reduce((sum, i) => sum + lineTotal(i), 0).toFixed(2),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      setHydrated: (hydrated: boolean) => set({ hydrated }),
    }),
    {
      name: 'paratha-girl-cart',
      version: 2,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true)
      },
    },
  ),
)
