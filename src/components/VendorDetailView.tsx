import React, { useState, useEffect } from 'react';
import { useMealDirect, computeCustomMealPriceKobo } from '../store';
import { VENDORS, getMenuItemsByVendor, formatNGN } from '../mockData';
import { AppShell, GlassPanel, Currency } from './CommonUI';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ArrowLeft, Clock, Star, Plus, Minus, ShoppingBag, ShoppingCart, Info, Check, ShieldAlert, Trash2, Flame, Sparkles, Heart } from 'lucide-react';
import { CartItem, MenuItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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
    navigateTo,
    favoriteItemIds,
    toggleFavoriteItem,
    menuItemReviews,
    createMenuItemReview
  } = useMealDirect();

  // Rating and feedback states
  const [ratingTemp, setRatingTemp] = useState<number>(5);
  const [commentTemp, setCommentTemp] = useState<string>('');
  const [customRatingTemp, setCustomRatingTemp] = useState<number>(5);
  const [customCommentTemp, setCustomCommentTemp] = useState<string>('');

  const getItemRatingStats = (itemId: string) => {
    const itemRevs = (menuItemReviews || []).filter(r => r.menuItemId === itemId);
    if (itemRevs.length === 0) {
      let defaultStars = 4.5;
      if (itemId === 'item_grill1') defaultStars = 4.8;
      if (itemId === 'item_bake_custom') defaultStars = 4.6;
      if (itemId === 'item_akara_custom') defaultStars = 4.7;
      return { avg: defaultStars, count: Math.floor((itemId.charCodeAt(0) % 15) + 3), reviews: itemRevs };
    }
    const sum = itemRevs.reduce((acc, r) => acc + r.rating, 0);
    return { avg: Number((sum / itemRevs.length).toFixed(1)), count: itemRevs.length, reviews: itemRevs };
  };

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

  // Constants for Venite Main cafeteria options
  const FOOD_TYPES = [
    'White Rice',
    'Jollof Rice',
    'Fried Rice',
    'Spaghetti',
    'Jollof Spaghetti',
    'Fufu',
    'Semo',
    'Beans'
  ];

  const PROTEINS = ['Beef', 'Fish', 'Egg'];

  const DRINKS = [
    'None',
    'Coke',
    'Fanta',
    'Schweppes',
    '7up',
    'Teem',
    'Sprite',
    'Pepsi',
    'Sosa',
    'Predator',
    'Fearless',
    'Malt',
    'Nutrichoco',
    'Nutrimilk',
    'Fayrouz',
    'Viju Milk'
  ];

  const getDrinkPriceNaira = (drinkName: string): number => {
    const norm = drinkName.toLowerCase();
    if (norm === 'none') return 0;
    if (
      norm.includes('coke') ||
      norm.includes('fanta') ||
      norm.includes('schweppes') ||
      norm.includes('7up') ||
      norm.includes('teem') ||
      norm.includes('sprite') ||
      norm.includes('pepsi') ||
      norm.includes('sosa')
    ) {
      return 500;
    }
    if (
      norm.includes('predator') ||
      norm.includes('fearless') ||
      norm.includes('malt')
    ) {
      return 600;
    }
    if (norm.includes('nutrichoco')) {
      return 1000;
    }
    if (
      norm.includes('nutrimilk') ||
      norm.includes('fayrouz') ||
      norm.includes('viju milk')
    ) {
      return 800;
    }
    return 0;
  };

  // States
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [spoonCountTemp, setSpoonCountTemp] = useState<number>(1);
  const [showReplaceCartModal, setShowReplaceCartModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ vId: string; item: CartItem } | null>(null);

  // Custom meal parameters state (multi-select combo)
  const [selectedFoods, setSelectedFoods] = useState<{ type: string; spoons: number }[]>([
    { type: 'Jollof Rice', spoons: 3 }
  ]);
  const [selectedProteins, setSelectedProteins] = useState<{ type: string; qty: number; price?: number }[]>([
    { type: 'Beef', qty: 1 }
  ]);
  const [customDrink, setCustomDrink] = useState<string>('None');
  const [customMealQty, setCustomMealQty] = useState<number>(1);
  const [customPlasticSpoons, setCustomPlasticSpoons] = useState<number>(1);
  const [showLimitWarning, setShowLimitWarning] = useState<boolean>(false);

  // Standard item popup modal temporary states
  const [modalCustomFoodType, setModalCustomFoodType] = useState<string>('Jollof Rice');
  const [modalCustomFoodSpoons, setModalCustomFoodSpoons] = useState<number>(3);
  const [modalCustomProtein, setModalCustomProtein] = useState<string>('Beef');

  // For compatibility with any legacy fields
  const customFoodType = selectedFoods.map(f => `${f.type} (${f.spoons} Spn)`).join(', ');
  const customFoodSpoons = selectedFoods.reduce((sum, f) => sum + f.spoons, 0);
  const customProtein = selectedProteins.map(p => {
    const isFish = p.type.toLowerCase().includes('fish');
    const unitPrice = isFish ? (p.price || 50000) : (vendorId === 'ven_grill' && p.type.toLowerCase().includes('egg') ? 30000 : 50000);
    return `${p.qty}x ${p.type} (₦${(unitPrice / 100).toFixed(0)} ea)`;
  }).join(', ');

  const currentPlateCostKobo = React.useMemo(() => {
    const builderId = 
      vendorId === 'ven_grill' ? 'item_grill5' : 
      vendorId === 'ven_bistro' ? 'item_bistro_custom' : 
      vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom';
    return computeCustomMealPriceKobo(
      builderId,
      selectedFoods,
      selectedProteins,
      vendorId === 'ven_grill' ? customDrink : undefined
    );
  }, [vendorId, selectedFoods, selectedProteins, customDrink]);

  // Sync state once on mount or when vendorId shifts
  useEffect(() => {
    if (vendorId === 'ven_grill' || vendorId === 'ven_bistro' || vendorId === 'ven_bake' || vendorId === 'ven_akara') {
      const bItemId = 
        vendorId === 'ven_grill' ? 'item_grill5' : 
        vendorId === 'ven_bistro' ? 'item_bistro_custom' : 
        vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom';
      const existing = cart && cart.vendorId === vendorId
        ? cart.items.find(it => it.menuItemId === bItemId)
        : null;

      if (existing) {
        if (existing.customFoodSelections && existing.customFoodSelections.length > 0) {
          setSelectedFoods(existing.customFoodSelections);
        } else {
          const defaultFood = 
            vendorId === 'ven_grill' ? 'Jollof Rice' : 
            vendorId === 'ven_bistro' ? 'White Rice' : 
            vendorId === 'ven_bake' ? 'Sausage roll' : 'Sweet Agege Bread';
          setSelectedFoods([{ type: defaultFood, spoons: existing.customFoodSpoons || 3 }]);
        }
        if (existing.customProteinSelections && existing.customProteinSelections.length > 0) {
          setSelectedProteins(existing.customProteinSelections);
        } else {
          setSelectedProteins([{ type: existing.customProtein || 'Beef', qty: 1 }]);
        }
        setCustomDrink(existing.customDrink || 'None');
        setCustomMealQty(existing.quantity || 1);
        setCustomPlasticSpoons(existing.spoonsCount || 1);
      } else {
        const defaultFood = 
          vendorId === 'ven_grill' ? 'Jollof Rice' : 
          vendorId === 'ven_bistro' ? 'White Rice' : 
          vendorId === 'ven_bake' ? 'Sausage roll' : 'Sweet Agege Bread';
        const defaultProtein = 
          vendorId === 'ven_grill' ? 'Beef' : 
          vendorId === 'ven_bistro' ? 'Beef' : 
          vendorId === 'ven_bake' ? 'Slice of Red Velvet Cake' : 'Golden Fried Akara';

        setSelectedFoods([
          { type: defaultFood, spoons: 1 }
        ]);
        setSelectedProteins([{ type: defaultProtein, qty: 1 }]);
        setCustomDrink('None');
        setCustomMealQty(1);
        setCustomPlasticSpoons(1);
      }
    }
  }, [vendorId]);

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

  // Cafeteria live custom meal nutrition
  const [customNutrition, setCustomNutrition] = useState<NutritionData | null>(null);
  const [isCustomNutritionLoading, setIsCustomNutritionLoading] = useState(false);

  useEffect(() => {
    if (vendorId !== 'ven_grill' && vendorId !== 'ven_bistro' && vendorId !== 'ven_bake' && vendorId !== 'ven_akara') return;
    setIsCustomNutritionLoading(true);

    const foodsStr = selectedFoods.map(f => `${f.spoons} spoons of ${f.type}`).join(', ');
    const proteinsStr = selectedProteins.map(p => `${p.qty}x ${p.type}`).join(' and ');
    const textName = `${foodsStr} with ${proteinsStr} (${customDrink})`;
    const textDesc = `A catered student meal package with ${foodsStr}, choice protein Combo of ${proteinsStr}, and paired with a crisp ${customDrink} beverage.`;

    const delayDebounce = setTimeout(() => {
      fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: textName,
          description: textDesc,
          vendorName: vendorId === 'ven_grill' ? 'Venite Main cafeteria' : vendorId === 'ven_bistro' ? 'Matade' : vendorId === 'ven_bake' ? 'Mr Bunmi' : 'Akara Spot',
          category: 'Mains'
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then(data => {
          setCustomNutrition(data);
        })
        .catch(err => {
          console.error('Error loading custom plate nutrition stats:', err);
          const totalSpoonCount = selectedFoods.reduce((acc, curr) => acc + curr.spoons, 0);
          const totalProteinCount = selectedProteins.reduce((acc, curr) => acc + curr.qty, 0);
          const baseCal = totalSpoonCount * 140 + totalProteinCount * 110 + 120;
          setCustomNutrition({
            calories: baseCal,
            protein: `${totalProteinCount * 10 + 8}g`,
            carbs: `${totalSpoonCount * 28 + 35}g`,
            fats: `${totalProteinCount * 5 + 6}g`,
            allergens: ['None'],
            healthTips: 'Traditional hot and highly nutritious combination suitable for standard active university days.',
            isSimulated: true
          });
        })
        .finally(() => {
          setIsCustomNutritionLoading(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [vendorId, selectedFoods, selectedProteins, customDrink]);

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
    setModalCustomFoodType(existing?.customFoodType || 'Jollof Rice');
    setModalCustomFoodSpoons(existing?.customFoodSpoons || 3);
    setModalCustomProtein(existing?.customProtein || 'Beef');
    setCustomDrink(existing?.customDrink || 'Malt');
    setSelectedItem(item);
  };

  const handleSaveItemDetails = () => {
    if (!selectedItem) return;
    const existing = cartItemsMap[selectedItem.id];
    
    const isGrill = vendorId === 'ven_grill';
    const payload: CartItem = {
      menuItemId: selectedItem.id,
      quantity: existing ? existing.quantity : 1,
      spoonsCount: spoonCountTemp,
      ...(isGrill ? {
        customFoodType: modalCustomFoodType,
        customFoodSpoons: modalCustomFoodSpoons,
        customProtein: modalCustomProtein,
        customDrink
      } : {})
    };
    
    if (cart && cart.vendorId !== vendorId) {
      setPendingCartItem({
        vId: vendorId,
        item: payload
      });
      setSelectedItem(null);
      setShowReplaceCartModal(true);
      return;
    }

    if (existing) {
      updateCartItemSpoons(
        selectedItem.id,
        spoonCountTemp,
        isGrill ? modalCustomFoodType : undefined,
        isGrill ? modalCustomFoodSpoons : undefined,
        isGrill ? modalCustomProtein : undefined,
        isGrill ? customDrink : undefined
      );
    } else {
      addToCart(vendorId, payload);
    }
    setSelectedItem(null);
  };

  const handleSaveCustomMeal = () => {
    const builderId = 
      vendorId === 'ven_grill' ? 'item_grill5' : 
      vendorId === 'ven_bistro' ? 'item_bistro_custom' : 
      vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom';
    const builderItem = menuItems.find(it => it.id === builderId);
    if (!builderItem) return;

    const payload: CartItem = {
      menuItemId: builderItem.id,
      quantity: customMealQty,
      spoonsCount: customPlasticSpoons,
      customFoodType,
      customFoodSpoons,
      customProtein,
      customDrink,
      customFoodSelections: selectedFoods,
      customProteinSelections: selectedProteins
    };

    if (cart && cart.vendorId !== vendorId) {
      setPendingCartItem({
        vId: vendorId,
        item: payload
      });
      setShowReplaceCartModal(true);
      return;
    }

    const existingInCart = cart && cart.vendorId === vendorId
      ? cart.items.find(it => it.menuItemId === builderId)
      : null;

    if (existingInCart) {
      updateCartItemSpoons(
        builderId,
        customPlasticSpoons,
        customFoodType,
        customFoodSpoons,
        customProtein,
        customDrink,
        customMealQty,
        selectedFoods,
        selectedProteins
      );
    } else {
      addToCart(vendorId, payload);
    }
  };

  // Sticky bottom summation
  const activeItemsCostKobo = React.useMemo(() => {
    if (!cart || cart.vendorId !== vendorId) return 0;
    return cart.items.reduce((sum, item) => {
      let price = 0;
      const menuIt = menuItems.find(mi => mi.id === item.menuItemId);
      if (menuIt) {
        price = menuIt.priceKobo;
      }
      
      // Calculate dynamic price if match builder items
      if (item.menuItemId === 'item_grill5' || item.menuItemId === 'item_bistro_custom' || item.menuItemId === 'item_bake_custom' || item.menuItemId === 'item_akara_custom') {
        price = computeCustomMealPriceKobo(
          item.menuItemId,
          item.customFoodSelections,
          item.customProteinSelections,
          item.customDrink,
          item.customFoodType,
          item.customFoodSpoons,
          item.customProtein
        );
      }

      return sum + (price * item.quantity);
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

          {/* 2. Group Categories with menu items list OR Custom Form for Cafeteria */}
          {vendorId === 'ven_grill' || vendorId === 'ven_bistro' || vendorId === 'ven_bake' || vendorId === 'ven_akara' ? (
            <div className="space-y-6 max-w-3xl mx-auto" id="custom_meal_builder_stage">
              <GlassPanel className="p-6 md:p-8 space-y-6 border border-emerald-deep/12 shadow-sm bg-white rounded-3xl">
                <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm">
                      <Flame className="w-5 h-5 fill-white text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm text-emerald-strong">Dynamic Campus Plate Builder</h3>
                      <p className="text-[10px] text-muted-grey">Build complex combo meals from {vendor.name} in real time</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-amber-700 bg-amber-50/80 px-2 py-1 rounded-sm border border-amber-200 uppercase tracking-widest">
                      takeaway packaging included (+₦200)
                    </span>
                  </div>
                </div>

                {/* 1. Main Dishes with Spoons Counter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-emerald-strong block uppercase tracking-wider">
                      1. Customize Your Main Dishes (Up to 4 types)
                    </label>
                    <span className="text-[9.5px] font-medium text-muted-grey">
                      Spoons/Pieces: <strong className="text-ink-deep">{customFoodSpoons}</strong> total on plate
                    </span>
                  </div>

                  {showLimitWarning && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-bold flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Maximum 4 distinct main menus can be selected for a single combo takeaway pack.</span>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(vendorId === 'ven_grill' 
                      ? ['White Rice', 'Jollof Rice', 'Fried Rice', 'Spaghetti', 'Jollof Spaghetti', 'Fufu', 'Semo', 'Beans'] 
                      : vendorId === 'ven_bistro'
                      ? ['Jollof Rice', 'White Rice', 'Ofada Rice', 'Peppersoup', 'Jollof Spaghetti', 'Semo', 'Eba']
                      : vendorId === 'ven_bake'
                      ? ['Sausage roll', 'Meat pie', 'Chicken pie', 'Fish pie', 'Egg roll', 'Fish roll']
                      : ['Sweet Agege Bread', 'Wrap of Cold Eko (Solid Pap)']
                    ).map(dish => {
                      const selItem = selectedFoods.find(sf => sf.type === dish);
                      const spoonsVal = selItem ? selItem.spoons : 0;
                      
                      // Calculate exact base price & unit label dynamically
                      let basePricePerSpoon = 500;
                      let unitLabel = 'spoon';
                      if (vendorId === 'ven_grill') {
                        const norm = dish.toLowerCase();
                        if (norm.includes('jollof rice') || norm.includes('white rice')) {
                          basePricePerSpoon = 400;
                        } else if (norm.includes('beans')) {
                          basePricePerSpoon = 300;
                        } else if (norm.includes('fufu') || norm.includes('semo')) {
                          basePricePerSpoon = 250;
                          unitLabel = 'piece';
                        }
                      } else if (vendorId === 'ven_bistro') {
                        if (dish.toLowerCase().includes('peppersoup')) {
                          basePricePerSpoon = 2500;
                          unitLabel = 'portion';
                        } else if (dish.toLowerCase().includes('semo') || dish.toLowerCase().includes('eba')) {
                          unitLabel = 'piece';
                        }
                      } else if (vendorId === 'ven_bake') {
                        basePricePerSpoon = 600; // ₦600 pastries
                        unitLabel = 'piece';
                      } else if (vendorId === 'ven_akara') {
                        const norm = dish.toLowerCase();
                        if (norm.includes('bread')) {
                          basePricePerSpoon = 500; // ₦500 bread
                        } else {
                          basePricePerSpoon = 100; // ₦100 Eko wrap
                        }
                        unitLabel = 'piece';
                      }

                      return (
                        <div
                          key={dish}
                          className={`p-3.5 rounded-2xl border transition duration-200 flex items-center justify-between gap-4 ${
                            spoonsVal > 0
                              ? 'bg-emerald-deep/5 border-emerald-deep/30 shadow-xs'
                              : 'bg-neutral-50/40 border-neutral-200/50 hover:bg-neutral-50 hover:border-neutral-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-ink-deep flex items-center gap-1.5">
                              {spoonsVal > 0 && <Check className="w-3.5 h-3.5 text-emerald-strong shrink-0" />}
                              <span>{dish}</span>
                            </div>
                            <span className="text-[9px] text-muted-grey mt-0.5 block">
                              ₦{basePricePerSpoon} / {unitLabel}
                            </span>
                          </div>

                          {spoonsVal === 0 ? (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.94 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                              onClick={() => {
                                const activeDistinctFoods = selectedFoods.filter(sf => sf.type !== dish && sf.spoons > 0);
                                if (activeDistinctFoods.length >= 4) {
                                  setShowLimitWarning(true);
                                  setTimeout(() => setShowLimitWarning(false), 3000);
                                  return;
                                }
                                setSelectedFoods(prev => [...prev, { type: dish, spoons: 1 }]);
                              }}
                              className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-[10px] font-black text-emerald-strong rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </motion.button>
                          ) : (
                            <div className="flex items-center gap-2 bg-white px-2 py-1.5 border border-emerald-deep/15 rounded-xl shadow-2xs">
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.88 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                onClick={() => {
                                  if (spoonsVal - 1 <= 0) {
                                    setSelectedFoods(prev => prev.filter(sf => sf.type !== dish));
                                  } else {
                                    setSelectedFoods(prev => prev.map(sf => sf.type === dish ? { ...sf, spoons: spoonsVal - 1 } : sf));
                                  }
                                }}
                                className="w-5.5 h-5.5 rounded bg-neutral-100 text-ink-deep flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                              >
                                -
                              </motion.button>
                              <span className="text-[10px] font-black font-mono text-emerald-strong min-w-10 text-center">
                                {spoonsVal} {unitLabel === 'spoon' ? 'Spn' : unitLabel === 'piece' ? 'Pcs' : 'Port'}
                              </span>
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.88 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                onClick={() => {
                                  setSelectedFoods(prev => prev.map(sf => sf.type === dish ? { ...sf, spoons: Math.min(10, spoonsVal + 1) } : sf));
                                }}
                                className="w-5.5 h-5.5 rounded bg-neutral-100 text-ink-deep flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                              >
                                +
                              </motion.button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Protein Combo Selection */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-emerald-strong block uppercase tracking-wider">
                      2. Select Proteins / Sweet Add-ons & Sides
                    </label>
                    <span className="text-[9px] font-medium text-muted-grey">
                      Total Added Cost: <strong className="text-ink-deep">₦{
                        (selectedProteins.reduce((sum, p) => {
                          const isFish = p.type.toLowerCase().includes('fish');
                          let unitPrice = 50000;
                          if (vendorId === 'ven_grill') {
                            unitPrice = isFish ? (p.price || 50000) : (p.type.toLowerCase().includes('egg') ? 30000 : 50000);
                          } else if (vendorId === 'ven_bistro') {
                            unitPrice = p.type.toLowerCase().includes('egg') ? 30000 : 50000;
                          } else if (vendorId === 'ven_bake') {
                            const norm = p.type.toLowerCase();
                            if (norm.includes('red velvet')) unitPrice = 80000;
                            else if (norm.includes('vanilla')) unitPrice = 70000;
                            else if (norm.includes('hot dog')) unitPrice = 30000;
                            else if (norm.includes('spring roll')) unitPrice = 20000;
                            else if (norm.includes('puff puff')) unitPrice = 15000;
                          } else if (vendorId === 'ven_akara') {
                            unitPrice = 10000;
                          }
                          return sum + (unitPrice * p.qty);
                        }, 0) / 100).toFixed(0)
                      }</strong>
                    </span>
                  </div>
                  <p className="text-[9.5px] text-muted-grey">Add as many as you want of any choice. Customize quantity of each below.</p>
                  
                  <div className="space-y-2.5">
                    {(vendorId === 'ven_grill' 
                      ? ['Beef', 'Fish', 'Egg', 'Ponmo'] 
                      : vendorId === 'ven_bistro'
                      ? ['Beef', 'Fish(Cote)', 'Egg', 'Ponmo']
                      : vendorId === 'ven_bake'
                      ? ['Slice of Vanilla Sponge Cake', 'Slice of Red Velvet Cake', 'Hot dog', 'Puff puff', 'Spring roll']
                      : ['Golden Fried Akara', 'Fried Sweet Potato', 'Fried Yam Slice (Dundun)']
                    ).map(proteinType => {
                      const existing = selectedProteins.find(p => p.type === proteinType);
                      const isSelected = !!existing;
                      const qtyVal = existing ? existing.qty : 0;
                      
                      // Determine display base price
                      let unitPriceNaira = 500;
                      if (vendorId === 'ven_grill') {
                        if (proteinType === 'Egg') unitPriceNaira = 300;
                        else if (proteinType === 'Fish') unitPriceNaira = existing?.price ? (existing.price / 100) : 500; // default fish price is 500
                      } else if (vendorId === 'ven_bistro') {
                        if (proteinType === 'Egg') unitPriceNaira = 300;
                        else if (proteinType.includes('Fish')) unitPriceNaira = 500;
                      } else if (vendorId === 'ven_bake') {
                        const norm = proteinType.toLowerCase();
                        if (norm.includes('red velvet')) unitPriceNaira = 800;
                        else if (norm.includes('vanilla')) unitPriceNaira = 700;
                        else if (norm.includes('hot dog')) unitPriceNaira = 300;
                        else if (norm.includes('spring roll')) unitPriceNaira = 200;
                        else if (norm.includes('puff puff')) unitPriceNaira = 150;
                      } else if (vendorId === 'ven_akara') {
                        unitPriceNaira = 100;
                      }

                      const isGrillFish = vendorId === 'ven_grill' && proteinType === 'Fish';

                      return (
                        <div
                          key={proteinType}
                          className={`p-3.5 rounded-2xl border transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-amber-500/5 border-amber-500/25 shadow-xs'
                              : 'bg-neutral-50/40 border-neutral-200/50 hover:bg-neutral-50 hover:border-neutral-200'
                          }`}
                        >
                          {/* Info Details */}
                          <div className="flex items-start gap-2.5">
                            <div className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition ${
                              isSelected ? 'bg-amber-500 border-amber-600 text-amber-950' : 'bg-white border-neutral-300'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-ink-deep flex items-center gap-1.5">
                                <span>{proteinType}</span>
                                {isSelected && (
                                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200">
                                    {qtyVal} Select
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-muted-grey mt-0.5 block">
                                {isGrillFish ? 'Varying price depending on your choice' : `₦${unitPriceNaira} each`}
                              </span>
                            </div>
                          </div>

                          {/* Steppers & Fish Price dropdown */}
                          <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
                            {/* If it is Grill Fish and selected, show the price dropdown picker */}
                            {isGrillFish && isSelected && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8.5px] font-bold text-muted-grey uppercase tracking-wider">
                                  Price:
                                </span>
                                <select
                                  value={existing.price || 50000}
                                  onChange={(e) => {
                                    const priceKobo = Number(e.target.value);
                                    setSelectedProteins(prev =>
                                      prev.map(p => p.type === 'Fish' ? { ...p, price: priceKobo } : p)
                                    );
                                  }}
                                  className="px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-[10px] font-bold text-ink-deep cursor-pointer focus:outline-none"
                                >
                                  <option value={30000}>₦300</option>
                                  <option value={40000}>₦400</option>
                                  <option value={50000}>₦500</option>
                                  <option value={60000}>₦600</option>
                                  <option value={70000}>₦700</option>
                                  <option value={80000}>₦800</option>
                                </select>
                              </div>
                            )}

                            {/* Stepper Controls */}
                            {!isSelected ? (
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.94 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                onClick={() => {
                                  let initialPrice: number | undefined = undefined;
                                  if (isGrillFish) initialPrice = 50000; // default ₦500 fish
                                  setSelectedProteins(prev => [...prev, { type: proteinType, qty: 1, price: initialPrice }]);
                                }}
                                className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-[10px] font-black text-amber-600 rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </motion.button>
                            ) : (
                              <div className="flex items-center gap-2 bg-white px-2 py-1.5 border border-amber-500/15 rounded-xl shadow-2xs">
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.88 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                  onClick={() => {
                                    if (qtyVal - 1 <= 0) {
                                      setSelectedProteins(prev => prev.filter(p => p.type !== proteinType));
                                    } else {
                                      setSelectedProteins(prev =>
                                        prev.map(p => p.type === proteinType ? { ...p, qty: qtyVal - 1 } : p)
                                      );
                                    }
                                  }}
                                  className="w-5.5 h-5.5 rounded bg-neutral-100 text-ink-deep flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                                >
                                  -
                                </motion.button>
                                <span className="text-[10px] font-black font-mono text-amber-600 min-w-8 text-center">
                                  {qtyVal} unit
                                </span>
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.88 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                  onClick={() => {
                                    setSelectedProteins(prev =>
                                      prev.map(p => p.type === proteinType ? { ...p, qty: Math.min(10, qtyVal + 1) } : p)
                                    );
                                  }}
                                  className="w-5.5 h-5.5 rounded bg-neutral-100 text-ink-deep flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                                >
                                  +
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Choice of Ice-Cold Drink */}
                {vendorId === 'ven_grill' && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-bold text-emerald-strong block uppercase tracking-wider" htmlFor="combo_drink_type_inline">
                      3. Pair with an Ice-Cold Drink
                    </label>
                    <div className="relative">
                      <select
                        id="combo_drink_type_inline"
                        value={customDrink}
                        onChange={(e) => setCustomDrink(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-ink-deep focus:ring-2 focus:ring-emerald-deep focus:border-emerald-deep focus:outline-none cursor-pointer"
                      >
                        {DRINKS.map(drink => {
                          const priceNum = getDrinkPriceNaira(drink);
                          return (
                            <option key={drink} value={drink}>
                              {drink === 'None' ? 'No Drink (None)' : `${drink} ${priceNum > 0 ? `(+₦${priceNum})` : ''}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Packs quantity and optional plastic spoons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Packs Stepper */}
                  <div className="bg-neutral-50 p-4 border border-neutral-200/50 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase text-emerald-strong tracking-wide block">How Many Packs?</span>
                      <span className="text-[9px] text-muted-grey block">Number of identical combo plates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setCustomMealQty(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-emerald-deep/5 hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center font-bold text-sm cursor-pointer transition select-none"
                      >
                        -
                      </motion.button>
                      <span className="text-xs font-black font-mono text-emerald-strong min-w-4 text-center">{customMealQty}</span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setCustomMealQty(prev => Math.min(10, prev + 1))}
                        className="w-7 h-7 rounded-lg bg-emerald-deep/5 hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center font-bold text-sm cursor-pointer transition select-none"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Utensils Stepper */}
                  <div className="bg-neutral-50 p-4 border border-neutral-200/50 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase text-emerald-strong tracking-wide block">Spoons requested</span>
                      <span className="text-[9px] text-muted-grey block">Plastic spoons needed (Max 3)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setCustomPlasticSpoons(prev => Math.max(0, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-emerald-deep/5 hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center font-bold text-sm cursor-pointer transition select-none"
                      >
                        -
                      </motion.button>
                      <span className="text-xs font-black font-mono text-emerald-strong min-w-4 text-center">{customPlasticSpoons}</span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setCustomPlasticSpoons(prev => Math.min(3, prev + 1))}
                        className="w-7 h-7 rounded-lg bg-emerald-deep/5 hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center font-bold text-sm cursor-pointer transition select-none"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* 5. Dynamic Live nutrition panel */}
                <div className="bg-emerald-deep/5 p-4 rounded-3xl border border-emerald-deep/8 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-deep/10 pb-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-strong uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                      <span>Plate Calorie breakdown (Dynamic AI estimate)</span>
                    </span>
                    <span className="text-[8px] font-bold text-emerald-strong/80 bg-white/70 px-2 py-0.5 rounded border border-emerald-deep/6 uppercase tracking-wider">
                      Powered by Gemini 3.5
                    </span>
                  </div>

                  {isCustomNutritionLoading ? (
                    <div className="space-y-2 animate-pulse min-h-[60px] py-1">
                      <div className="h-3 bg-emerald-deep/10 rounded w-1/3" />
                      <div className="grid grid-cols-4 gap-2">
                        <div className="h-9 bg-emerald-deep/10 rounded" />
                        <div className="h-9 bg-emerald-deep/10 rounded" />
                        <div className="h-9 bg-emerald-deep/10 rounded" />
                        <div className="h-9 bg-emerald-deep/10 rounded" />
                      </div>
                    </div>
                  ) : customNutrition ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                        <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                          <span className="text-[7.5px] font-extrabold uppercase text-muted-grey block tracking-wider">Calories</span>
                          <span className="text-xs font-black text-emerald-strong">{customNutrition.calories} <span className="text-[9px] font-medium">kcal</span></span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                          <span className="text-[7.5px] font-extrabold uppercase text-muted-grey block tracking-wider">Protein</span>
                          <span className="text-xs font-extrabold text-emerald-strong">{customNutrition.protein}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                          <span className="text-[7.5px] font-extrabold uppercase text-muted-grey block tracking-wider">Carbs</span>
                          <span className="text-xs font-extrabold text-emerald-strong">{customNutrition.carbs}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-emerald-deep/6">
                          <span className="text-[7.5px] font-extrabold uppercase text-muted-grey block tracking-wider">Fats</span>
                          <span className="text-xs font-extrabold text-emerald-strong">{customNutrition.fats}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 items-start text-[10px] italic text-muted-grey bg-white/40 p-2.5 rounded-xl border border-neutral-100">
                        <Info className="w-3.5 h-3.5 text-emerald-deep shrink-0 mt-0.5" />
                        <span>{customNutrition.healthTips}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-grey italic">Adjust choices to load plate nutrition...</p>
                  )}
                </div>

                {/* 6. Save choice Call To Action Button with Dynamic Pricing */}
                <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-rose-grey block uppercase font-bold tracking-wider text-muted-grey">Total Cost estimate</span>
                    <div className="text-xl font-black text-emerald-strong font-mono">
                      {formatNGN(currentPlateCostKobo * customMealQty)}
                    </div>
                    <span className="text-[8.5px] text-muted-grey block mt-0.5">
                      (Includes ₦200 takeaway surcharge per pack)
                    </span>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                    onClick={handleSaveCustomMeal}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-deep hover:bg-emerald-strong text-white font-bold text-xs rounded-2xl shadow-lg transition duration-200 cursor-pointer text-center hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-mango-warm" />
                    <span>
                      {cart && cart.vendorId === vendorId && cart.items.some(it => it.menuItemId === (vendorId === 'ven_grill' ? 'item_grill5' : vendorId === 'ven_bistro' ? 'item_bistro_custom' : vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom')) 
                        ? 'Update Custom Plate in Cart' 
                        : 'Add Custom Plate to Cart'}
                    </span>
                  </motion.button>
                </div>
              </GlassPanel>

              {/* Feedback Block for Builder items */}
              <GlassPanel className="p-6 md:p-8 space-y-6 border border-emerald-deep/12 shadow-sm bg-white rounded-3xl mt-6">
                <div className="border-t border-neutral-100 pt-4 space-y-3.5">
                  <h4 className="font-display font-bold text-xs text-emerald-strong flex items-center justify-between">
                    <span>Vendor Meal Selections & Ingredient Feedback</span>
                    <span className="text-[10px] font-bold text-mango-warm flex items-center gap-0.5">
                      ⭐ {getItemRatingStats(vendorId === 'ven_grill' ? 'item_grill5' : vendorId === 'ven_bistro' ? 'item_bistro_custom' : vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom').avg} ({getItemRatingStats(vendorId === 'ven_grill' ? 'item_grill5' : vendorId === 'ven_bistro' ? 'item_bistro_custom' : vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom').count} ratings)
                    </span>
                  </h4>

                  {/* Leave Feedback Form */}
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/60 flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold text-emerald-strong block uppercase tracking-wider">Leave Feedback</span>
                    
                    {/* Clickable Star Rating Stepper */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-semibold text-muted-grey">Your Score:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isLit = starVal <= customRatingTemp;
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setCustomRatingTemp(starVal)}
                              className="text-amber-400 hover:scale-115 transition duration-150 cursor-pointer p-0.5 focus:outline-none"
                              title={`Rate ${starVal} Stars`}
                            >
                              <Star className={`w-5 h-5 ${isLit ? 'text-mango-warm fill-mango-warm' : 'text-neutral-300'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCommentTemp}
                        onChange={(e) => setCustomCommentTemp(e.target.value)}
                        placeholder="E.g., Delicious plate choices, hot pastries, highly convenient custom plate builder!"
                        className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs placeholder:text-neutral-400 font-medium text-emerald-strong focus:outline-none focus:ring-1 focus:ring-emerald-deep"
                        id="custom_meal_comment_input"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!customCommentTemp.trim()) return;
                          const activeBuilderId = 
                            vendorId === 'ven_grill' ? 'item_grill5' : 
                            vendorId === 'ven_bistro' ? 'item_bistro_custom' : 
                            vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom';
                          createMenuItemReview(activeBuilderId, customRatingTemp, customCommentTemp);
                          setCustomCommentTemp('');
                          setCustomRatingTemp(5);
                        }}
                        className="px-3.5 py-2 bg-emerald-deep hover:bg-emerald-strong text-white font-bold text-[10px] rounded-xl cursor-pointer"
                      >
                        Post Feedback
                      </button>
                    </div>
                  </div>

                  {/* Feed of Recent Reviews */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {getItemRatingStats(vendorId === 'ven_grill' ? 'item_grill5' : vendorId === 'ven_bistro' ? 'item_bistro_custom' : vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom').reviews && getItemRatingStats(vendorId === 'ven_grill' ? 'item_grill5' : vendorId === 'ven_bistro' ? 'item_bistro_custom' : vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom').reviews.length > 0 ? (
                      getItemRatingStats(vendorId === 'ven_grill' ? 'item_grill5' : vendorId === 'ven_bistro' ? 'item_bistro_custom' : vendorId === 'ven_bake' ? 'item_bake_custom' : 'item_akara_custom').reviews.map((rev) => (
                        <div key={rev.id} className="p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-100 text-[10px] leading-relaxed">
                          <div className="flex items-center justify-between font-bold col-span-2 mb-1">
                            <span className="text-emerald-strong">{rev.userName}</span>
                            <span className="text-mango-warm">{'★'.repeat(rev.rating)}</span>
                          </div>
                          <p className="text-muted-grey text-[9.5px] italic">"{rev.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                        <p className="text-[10px] text-muted-grey italic">Leave the first review for this custom kitchen plate builder! ⭐</p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassPanel>
            </div>
          ) : (
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
                        const isFav = favoriteItemIds?.includes(item.id);
                        
                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-emerald-deep/6 p-4 flex gap-4 shadow-xs hover:border-emerald-deep/15 transition relative animate-fade-in"
                            id={`menu_item_card_${item.id}`}
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
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavoriteItem(item.id);
                                      }}
                                      className={`p-1 rounded-md transition cursor-pointer ${
                                        isFav ? 'text-rose-500 hover:text-rose-600' : 'text-neutral-400 hover:text-rose-500'
                                      }`}
                                      title={isFav ? "Remove from Favorites" : "Save to Favorites"}
                                      id={`fav_toggle_${item.id}`}
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                                    </button>
                                    <button
                                      onClick={() => handleOpenItemDetail(item)}
                                      className="text-muted-grey hover:text-emerald-deep p-1 rounded-md transition cursor-pointer"
                                      title="More details and spoon choices"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted-grey line-clamp-2 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                                
                                {/* Star rating display line */}
                                {(() => {
                                  const { avg, count } = getItemRatingStats(item.id);
                                  return (
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star 
                                            key={star} 
                                            className={`w-3.5 h-3.5 ${star <= Math.round(avg) ? 'text-mango-warm fill-mango-warm font-bold' : 'text-neutral-200 fill-neutral-200'}`} 
                                          />
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-bold text-ink-deep leading-none">{avg}</span>
                                      <span className="text-[9px] text-muted-grey font-medium leading-none">({count} ratings)</span>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <Currency kobo={item.priceKobo} className="text-xs text-ink-deep" />

                                {/* Stepper controls */}
                                {activeInCart ? (
                                  <div className="flex items-center gap-2 bg-emerald-deep/5 border border-emerald-deep/12 rounded-lg p-1">
                                    <button
                                      onClick={() => handleStepSubtract(item)}
                                      className="w-6 h-6 rounded-md hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center cursor-pointer transition"
                                      id={`step_sub_${item.id}`}
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-xs font-bold font-mono text-emerald-strong px-1.5">{activeInCart.quantity}</span>
                                    <button
                                      onClick={() => handleStepAdd(item)}
                                      className="w-6 h-6 rounded-md hover:bg-emerald-deep/10 text-emerald-strong flex items-center justify-center cursor-pointer transition"
                                      id={`step_add_${item.id}`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleStepAdd(item)}
                                    className="bg-emerald-deep hover:bg-emerald-strong text-white rounded-lg p-1 px-3.5 text-[10px] font-bold cursor-pointer transition shadow-sm hover:scale-[1.01] active:scale-95 flex items-center gap-1"
                                    id={`quick_add_${item.id}`}
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Quick Add
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
          )}
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[88vh] overflow-y-auto border border-emerald-deep/12 shadow-2xl flex flex-col gap-5">
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

            {vendorId === 'ven_grill' && (
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-3.5">
                <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-amber-800">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>Venite Main cafeteria Plate Customization</span>
                </div>

                {/* 1. Type of Food */}
                <div>
                  <label className="text-[9px] font-bold text-amber-900 block mb-1.5 uppercase tracking-wider">Select Main Food Type</label>
                  <select
                    value={modalCustomFoodType}
                    onChange={(e) => setModalCustomFoodType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-ink-deep focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    id="combo_food_type"
                  >
                    {['White Rice', 'Jollof Rice', 'Fried Rice', 'Spaghetti', 'Jollof Spaghetti', 'Fufu', 'Semo', 'Beans'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Quantity of Food: Number of Spoons */}
                <div>
                  <label className="text-[9px] font-bold text-amber-900 block mb-1.5 uppercase tracking-wider">Portion Quantity ({modalCustomFoodSpoons} Spoons)</label>
                  <div className="flex items-center justify-between bg-white border border-amber-200 rounded-xl p-2 px-3">
                    <span className="text-[10px] text-muted-grey font-medium">How many spoons of food?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setModalCustomFoodSpoons(prev => Math.max(1, prev - 1))}
                        className="w-6 h-6 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-black font-mono text-amber-950 min-w-4 text-center">{modalCustomFoodSpoons}</span>
                      <button
                        type="button"
                        onClick={() => setModalCustomFoodSpoons(prev => Math.min(10, prev + 1))}
                        className="w-6 h-6 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Protein Selection */}
                <div>
                  <label className="text-[9px] font-bold text-amber-900 block mb-1.5 uppercase tracking-wider">Preferred Protein (Choose One)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beef', 'Fish', 'Egg', 'Ponmo'].map(protein => {
                      const isSelected = modalCustomProtein === protein;
                      return (
                        <button
                          key={protein}
                          type="button"
                          onClick={() => setModalCustomProtein(protein)}
                          className={`py-2 px-3 text-xs font-black rounded-lg border text-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 border-amber-600 text-amber-950 shadow-xs'
                              : 'bg-white border-amber-100 text-amber-900 hover:bg-amber-50/50'
                          }`}
                        >
                          {protein}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Drink Selection */}
                <div>
                  <label className="text-[9px] font-bold text-amber-900 block mb-1.5 uppercase tracking-wider">Choice of Ice-Cold Drink</label>
                  <select
                    value={customDrink}
                    onChange={(e) => setCustomDrink(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-ink-deep focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    id="combo_drink_type"
                  >
                    {DRINKS.map(drink => (
                      <option key={drink} value={drink}>{drink}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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

            {/* ITEM FEEDBACK AND RATINGS PANEL */}
            <div className="border-t border-neutral-100 pt-4 mt-2 space-y-3.5">
              <h4 className="font-display font-bold text-xs text-emerald-strong flex items-center justify-between">
                <span>Meal Feedback & Student Reviews</span>
                <span className="text-[10px] font-bold text-mango-warm flex items-center gap-0.5">
                  ⭐ {getItemRatingStats(selectedItem.id).avg} ({getItemRatingStats(selectedItem.id).count} ratings)
                </span>
              </h4>

              {/* Leave Rating section */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60 flex flex-col gap-2">
                <span className="text-[9.5px] font-bold text-emerald-strong uppercase tracking-wide">Write a Review</span>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-semibold text-muted-grey">Your Score:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isLit = starVal <= ratingTemp;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRatingTemp(starVal)}
                          className="text-amber-400 hover:scale-110 transition duration-150 cursor-pointer p-0.5"
                          title={`Rate ${starVal} Star`}
                        >
                          <Star className={`w-4 h-4 ${isLit ? 'text-mango-warm fill-mango-warm' : 'text-neutral-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={commentTemp}
                    onChange={(e) => setCommentTemp(e.target.value)}
                    placeholder="E.g., Delicious plate choices, hot pastries!"
                    className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs placeholder:text-neutral-400 text-ink-deep font-medium focus:outline-none focus:ring-1 focus:ring-emerald-deep"
                    id="standard_item_comment_input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!commentTemp.trim()) return;
                      createMenuItemReview(selectedItem.id, ratingTemp, commentTemp);
                      setCommentTemp('');
                      setRatingTemp(5);
                    }}
                    className="px-3 py-1.5 bg-emerald-deep hover:bg-emerald-strong text-white font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Feed of Recent Reviews */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {getItemRatingStats(selectedItem.id).reviews && getItemRatingStats(selectedItem.id).reviews.length > 0 ? (
                  getItemRatingStats(selectedItem.id).reviews.map((rev) => (
                    <div key={rev.id} className="p-2 rounded-lg bg-neutral-50/50 border border-neutral-100 text-[10px] leading-relaxed">
                      <div className="flex items-center justify-between font-bold mb-0.5">
                        <span className="text-emerald-strong">{rev.userName}</span>
                        <span className="text-mango-warm">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="text-muted-grey text-[9px] italic">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 bg-neutral-50/50 rounded-lg border border-dashed border-neutral-200">
                    <p className="text-[9.5px] text-muted-grey italic">No student reviews yet. Be the first to leave one! ⭐</p>
                  </div>
                )}
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
