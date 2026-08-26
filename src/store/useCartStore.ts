import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, CouponValidation, Product, ProductVariant } from "@/types";

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  appliedCoupon: CouponValidation | null;
  
  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: number, variantId?: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null | undefined, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CouponValidation) => void;
  removeCoupon: () => void;
  
  // Computed getters
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      appliedCoupon: null,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (product: Product, variant: ProductVariant | null = null, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && (item.variant?.id ?? null) === (variant?.id ?? null)
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated, isCartOpen: true };
          }

          return {
            items: [
              ...state.items,
              {
                product,
                variant: variant ?? null,
                quantity,
                selectedColor: variant?.color_name,
                selectedSize: variant?.size,
              },
            ],
            isCartOpen: true,
          };
        });
      },

      removeItem: (productId: number, variantId: number | null = null) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && (item.variant?.id ?? null) === (variantId ?? null))
          ),
        }));
      },

      updateQuantity: (productId: number, variantId: number | null = null, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId && (item.variant?.id ?? null) === (variantId ?? null)) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: (coupon: CouponValidation) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((acc, item) => {
          const price = Number(item.product.price) + (item.variant ? Number(item.variant.price_modifier) : 0);
          return acc + price * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const { appliedCoupon } = get();
        const subtotal = get().getSubtotal();
        if (!appliedCoupon || !appliedCoupon.valid) return 0;
        return appliedCoupon.discount_amount ?? 0;
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 100 ? 0 : 15;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const taxable = Math.max(0, subtotal - discount);
        return Math.round(taxable * 0.08 * 100) / 100;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const shipping = get().getShipping();
        const tax = get().getTax();
        return Math.max(0, subtotal - discount) + shipping + tax;
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: "ecom_cart_storage_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
    }
  )
);
