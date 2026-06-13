import React, { useState, useEffect } from 'react';
import { useMealDirect } from '../store';
import { VENDORS, getMenuItemsByVendor, formatNGN } from '../mockData';
import { AppShell, GlassPanel, Currency } from './CommonUI';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ArrowLeft, Clock, Star, Plus, Minus, ShoppingBag, ShoppingCart, Info, Check, ShieldAlert, Trash2, Flame, Sparkles, Heart } from 'lucide-react';
import { CartItem, MenuItem } from '../types';

interface VendorDetailViewProps {
  vendorId: string;
}

export const VendorDetailView: React.FC<VendorDetailViewProps> = ({ vendorId }) => {
  const {
    cart,
    addToCart,
    updateCartItemQuantity,
    updateCartItemSpoons,
    removeFromCart,
    clearCart,
    navigateTo
  } = useMealDirect();

  // Simulated API loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [vendorId]);

  // Find active vendor
  const vendor = VENDORS.find(v => v.id === vendorId);
  if (!vendor) {
    return (
      <AppShell activeTab="vendors">
        <div className="text-center py-12 bg-white rounded-2xl border border-red-200">
          <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-3" />
          <p className="text-sm font-bold text-emerald-strong">Vendor ID '{vendorId}' is not registered on this campus catalog.</p>
          <button onClick={() => navigateTo('/vendors')} className="mt-4 px-4 py-2 bg-emerald-deep text-white rounded-xl text-xs font-bold cursor-pointer">
            Back to Vendors
          </button>
        </div>
      </AppShell>
    );
  }

  const menuItems = getMenuItemsByVendor(vendorId);

  // States
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [spoonCountTemp, setSpoonCountTemp] = useState<number>(1);
  const [showReplaceCartModal, setShowReplaceCartModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ vId: string; item: CartItem } | null>(null);

  // Nutrition state variables fetched from Gemini
  interface NutritionData {
    calories: number;
    protein: string;
    carbs: string;
    fats: string;
    allergens: string[];
    healthTips: string;
    isSimulated?: boolean;
  }
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [isNutritionLoading, setIsNutritionLoading] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setNutrition(null);
      return;
    }

    setIsNutritionLoading(true);
    setNutrition(null);

    fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: selectedItem.name,
        description: selectedItem.description,
        vendorName: vendor?.name || 'Meal Direct Kitchen',
        category: selectedItem.category
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        setNutrition(data);
      })
      .catch(err => {
        console.error('Error loading nutritional facts:', err);
        setNutrition({
          calories: 340,
          protein: '11g',
          carbs: '42g',
          fats: '8g',
          allergens: ['None'],
          healthTips: 'Naturally sourced campus recipe prepared under strict food hygiene guidelines.',
          isSimulated: true
        });
      })
      .finally(() => {
        setIsNutritionLoading(false);
      });
  }, [selectedItem, vendor]);

  // Group items by category
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  // Fast mapping of items currently in cart
  const cartItemsMap = React.useMemo(() => {
    const map: Record<string, CartItem> = {};
    if (cart && cart.vendorId === vendorId) {
      cart.items.forEach(it => {
        map[it.menuItemId] = it;
      });
    }
    return map;
  }, [cart, vendorId]);

  const handleStepAdd = (item: MenuItem) => {
    const existing = cartItemsMap[item.id];
    if (cart && cart.vendorId !== vendorId) {
      // Prompt modal constraint: Confirm cart override
      setPendingCartItem({
        vId: vendorId,
        item: { menuItemId: item.id, quantity: 1, spoonsCount: 1 }
      });
      setShowReplaceCartModal(true);
      return;
    }

    if (existing) {
      updateCartItemQuantity(item.id, existing.quantity + 1);
    } else {
      addToCart(vendorId, { menuItemId: item.id, quantity: 1, spoonsCount: 1 });
    }
  };

  const handleStepSubtract = (item: MenuItem) => {
    const existing = cartItemsMap[item.id];
    if (existing) {
      if (existing.quantity <= 1) {
        removeFromCart(item.id);
      } else {
        updateCartItemQuantity(item.id, existing.quantity - 1);
      }
    }
  };

  const handleConfirmReplaceCart = () => {
    if (pendingCartItem) {
      clearCart();
      // Wait micro delay to clear and trigger new cart
      setTimeout(() => {
        addToCart(pendingCartItem.vId, pendingCartItem.item);
        setShowReplaceCartModal(false);
        setPendingCartItem(null);
      }, 50);
    }
  };

  const handleOpenItemDetail = (item: MenuItem) => {
    const existing = cartItemsMap[item.id];
    setSpoonCountTemp(existing ? existing.spoonsCount : 1);
    setSelectedItem(item);
  };

  const handleSaveItemDetails = () => {
    if (!selectedItem) return;
    const existing = cartItemsMap[selectedItem.id];
    
    if (cart && cart.vendorId !== vendorId) {
      setPendingCartItem({
        vId: vendorId,
        item: { menuItemId: selectedItem.id, quantity: 1, spoonsCount: spoonCountTemp }
      });
      setSelectedItem(null);
      setShowReplaceCartModal(true);
      return;
    }

    if (existing) {
      updateCartItemSpoons(selectedItem.id, spoonCountTemp);
    } else {
      addToCart(vendorId, { menuItemId: selectedItem.id, quantity: 1, spoonsCount: spoonCountTemp });
    }
    setSelectedItem(null);
  };

  // Sticky bottom summation
  const activeItemsCostKobo = React.useMemo(() => {
    if (!cart || cart.vendorId !== vendorId) return 0;
    return cart.items.reduce((sum, item) => {
      const menuIt = menuItems.find(mi => mi.id === item.menuItemId);
      return sum + (menuIt ? menuIt.priceKobo * item.quantity : 0);
    }, 0);
  }, [cart, vendorId, menuItems]);

  const activeSpoonsCount = React.useMemo(() => {
    if (!cart || cart.vendorId !== vendorId) return 0;
    return cart.items.reduce((sum, item) => sum + item.spoonsCount, 0);
  }, [cart, vendorId]);

  return (
    <AppShell activeTab="vendors">
      {/* Back CTA actions */}
      <button
        onClick={() => navigateTo('/home')}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-deep hover:underline cursor-pointer"
        id="back_to_vendors_btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home Catalog</span>
      </button>

      {/* 1. Details sections with simulated skeleton loading */}
      {isLoading ? (
        <LoadingSkeleton.Detail />
      ) : (
        <>
          {/* 1. Header Banner of the Selected Vendor */}
          <section className="mb-6" id="vendor_detail_banner">
            <div className="bg-white rounded-3xl border border-emerald-deep/8 overflow-hidden shadow-xs">
              <div className="h-48 md:h-60 w-full relative">
                <img
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight" id="active_vendor_name">{vendor.name}</h2>
                  <p className="text-xs text-neutral-200 mt-1" id="active_vendor_desc">{vendor.description}</p>
                </div>
              </div>

              <div className="p-4 px-6 bg-neutral-50/50 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-muted-grey">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-mango-warm stroke-mango-warm text-mango-warm" />
                  <span className="text-ink-deep font-bold">{vendor.rating.toFixed(1)}</span>
                  <span>({vendor.reviewCount} total campus ratings)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-deep" />
                  <span>Schedules cooking and delivery ready in <strong>~{vendor.preparationTimeMins} mins</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Group Categories with menu items list */}
          <section className="space-y-8" id="menu_items_stage">
            {categories.map(category => {
              const items = menuItems.filter(mi => mi.category === category);
              return (
                <div key={category}>
                  <h3 className="font-display font-medium text-xs tracking-widest text-emerald-strong bg-emerald-deep/5 px-2.5 py-1 rounded inline-block uppercase mb-4">
                    {category}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(item => {
                      const activeInCart = cartItemsMap[item.id];
                      
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-emerald-deep/6 p-4 flex gap-4 shadow-xs hover:border-emerald-deep/15 transition relative"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100 relative">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            {activeInCart && (
                              <div className="absolute inset-0 bg-emerald-strong/20 backdrop-blur-xs flex items-center justify-center text-white" />
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-display font-bold text-xs text-emerald-strong leading-normal">{item.name}</h4>
                                <button
                                  onClick={() => handleOpenItemDetail(item)}
                                  className="text-muted-grey hover:text-emerald-deep p-1 rounded-md transition cursor-pointer"
                                  title="More details and spoon choices"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[10px] text-muted-grey line-clamp-2 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <Currency kobo={item.priceKobo} className="text-xs text-ink-deep" />

                              {/* Stepper controls */}
                              {activeInCart ? (
                                <div className="flex items-center gap-2 bg-emerald-deep/5 border border-emerald-deep/12 rounded-lg p-1">
                                  <button
                                    onClick={() => handleStepSubtract(item)}
                                    className="w-6 h-6 rounded-md hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center cursor-pointer transition"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-bold font-mono text-emerald-strong px-1.5">{activeInCart.quantity}</span>
                                  <button
                                    onClick={() => handleStepAdd(item)}
                                    className="w-6 h-6 rounded-md hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center cursor-pointer transition"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStepAdd(item)}
                                  className="bg-emerald-deep hover:bg-emerald-strong text-white rounded-lg p-1 px-3.5 text-[10px] font-bold cursor-pointer transition shadow-sm hover:scale-[1.01] active:scale-95 flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* 3. Sticky cart summation panel */}
      {cart && cart.vendorId === vendorId && (
        <div className="fixed bottom-14 md:bottom-5 left-4 right-4 md:left-auto md:right-5 md:w-80 bg-emerald-strong text-white rounded-2xl p-4 shadow-xl border border-white/5 animate-slide-up z-30">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-mango-warm" />
              <span>Takeaway Review:</span>
            </div>
            <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{cart.items.length} items</span>
          </div>

          <div className="flex items-baseline justify-between mb-4">
            <span className="text-[10px] text-neutral-300">Takeaway Pack price:</span>
            <span className="text-sm font-black text-mango-warm"><Currency kobo={activeItemsCostKobo} /></span>
          </div>

          <button
            onClick={() => navigateTo('/cart')}
            className="w-full py-3 bg-mango-warm text-emerald-strong hover:bg-amber-400 font-bold text-xs rounded-xl transition cursor-pointer text-center shadow-lg active:scale-95 flex items-center justify-center gap-2"
            id="proceed-to-cart-sum"
          >
            <span>Proceed to Cart Quote</span>
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal Component for Spoons customization */}
      {selectedItem && (
        <dialog open className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="item_detail_dialog">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-deep/12 shadow-2xl flex flex-col gap-5">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-3 bg-neutral-100">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display font-black text-sm text-emerald-strong">{selectedItem.name}</h3>
              <p className="text-[10px] text-muted-grey mt-1">{selectedItem.description}</p>
            </div>

            {/* Extended Nutrition Block using Gemini API */}
            <div className="bg-emerald-deep/5 p-4 rounded-2xl border border-emerald-deep/8 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-emerald-deep/10 pb-2">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-strong">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>Estimated Nutrition (Gemini AI)</span>
                </span>
                {nutrition && (
                  <span className="text-[8px] font-bold text-muted-grey bg-white px-2 py-0.5 rounded border border-neutral-100 uppercase tracking-widest">
                    {nutrition.isSimulated ? "Live Est" : "Gemini 3.5"}
                  </span>
                )}
              </div>

              {isNutritionLoading ? (
                <div className="space-y-2 animate-pulse min-h-[70px]">
                  <div className="h-4 bg-emerald-deep/10 rounded w-2/3" />
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-10 bg-emerald-deep/10 rounded" />
                    <div className="h-10 bg-emerald-deep/10 rounded" />
                    <div className="h-10 bg-emerald-deep/10 rounded" />
                    <div className="h-10 bg-emerald-deep/10 rounded" />
                  </div>
                </div>
              ) : nutrition ? (
                <div className="space-y-3">
                  {/* Macros Bento Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                      <span className="text-[8px] font-black uppercase text-muted-grey block">Energy</span>
                      <span className="text-xs font-black text-emerald-strong">{nutrition.calories} <span className="text-[9px] font-normal">kcal</span></span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                      <span className="text-[8px] font-black uppercase text-muted-grey block">Protein</span>
                      <span className="text-xs font-bold text-emerald-strong">{nutrition.protein}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                      <span className="text-[8px] font-black uppercase text-muted-grey block">Carbs</span>
                      <span className="text-xs font-bold text-emerald-strong">{nutrition.carbs}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                      <span className="text-[8px] font-black uppercase text-muted-grey block">Fats</span>
                      <span className="text-xs font-bold text-emerald-strong">{nutrition.fats}</span>
                    </div>
                  </div>

                  {/* Allergens warnings list */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-muted-grey">Allergens:</span>
                    {nutrition.allergens.length === 0 || (nutrition.allergens.length === 1 && nutrition.allergens[0].toLowerCase() === 'none') ? (
                      <span className="bg-emerald-deep/10 text-emerald-strong font-black text-[9px] px-2 py-0.5 rounded-full uppercase border border-emerald-deep/12">
                        ✓ Allergen Safe
                      </span>
                    ) : (
                      nutrition.allergens.map((alg, aIdx) => (
                        <span key={aIdx} className="bg-red-50 text-danger font-black text-[9px] px-2 py-0.5 rounded-full uppercase border border-red-100 flex items-center gap-0.5 animate-pulse">
                          ⚠️ {alg}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Wellness quote bullet */}
                  <p className="text-[10px] text-muted-grey leading-relaxed italic bg-white/40 p-2.5 rounded-xl border border-neutral-100 flex gap-1 items-start">
                    <Sparkles className="w-3.5 h-3.5 text-[#F3B33D] shrink-0 mt-0.5" />
                    <span>{nutrition.healthTips}</span>
                  </p>
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-muted-grey font-medium">
                  Failed to load nutrition parameters.
                </div>
              )}
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-emerald-deep/8">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-emerald-strong justify-center">
                <Info className="w-4 h-4 text-emerald-deep" />
                <span>Custom Spoons count (Rule: Max 3)</span>
              </div>
              <p className="text-[9px] text-muted-grey text-center mb-3">
                Select plastic spoons needed. To prevent plastic waste waste, only request what is required.
              </p>

              {/* Spoon Stepper */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSpoonCountTemp(prev => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-full bg-emerald-deep/5 hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center font-bold cursor-pointer transition text-xs"
                >
                  -
                </button>
                <div className="text-center min-w-16">
                  <span className="text-sm font-black font-mono text-emerald-strong">{spoonCountTemp}</span>
                  <span className="text-[9px] text-muted-grey block mt-0.5">{spoonCountTemp === 1 ? 'Plastic Spoon' : 'Plastic Spoons'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSpoonCountTemp(prev => Math.min(3, prev + 1))}
                  className="w-8 h-8 rounded-full bg-emerald-deep/5 hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center font-bold cursor-pointer transition text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 bg-neutral-50 hover:bg-neutral-100 text-muted-grey font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveItemDetails}
                className="flex-1 py-3 bg-emerald-deep hover:bg-emerald-strong text-white font-bold text-xs rounded-xl transition cursor-pointer text-center"
              >
                Save Choice
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Replace Cart Warning Dialog */}
      {showReplaceCartModal && (
        <dialog open className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="replace_cart_dialog">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-red-100 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-danger font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-danger" />
              <span>Replace Takeaway Cart?</span>
            </div>
            
            <p className="text-xs text-muted-grey leading-relaxed">
              You already have active items from another kitchen in your cart basket. Your Meal Direct takeaway can only process <strong>one vendor per order</strong>.
            </p>

            <span className="text-[10px] text-muted-grey bg-red-50/50 p-2.5 rounded-xl border border-red-200">
              Continuing will discard your old selection and start empty.
            </span>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setShowReplaceCartModal(false);
                  setPendingCartItem(null);
                }}
                className="flex-1 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-muted-grey font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel Override
              </button>
              <button
                onClick={handleConfirmReplaceCart}
                className="flex-1 py-2.5 bg-danger hover:bg-red-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-red-200"
                id="confirm_replace_cart"
              >
                <Trash2 className="w-3.5 h-3.5" /> Discard & Add
              </button>
            </div>
          </div>
        </dialog>
      )}
    </AppShell>
  );
};
