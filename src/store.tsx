import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Cart,
  CartItem,
  Order,
  OrderStatus,
  Notification,
  Escalation,
  Review,
  RoutePath,
  OrderQuote,
  MenuItemReview
} from './types';
import { CAMPUSES, PRESET_LOCATIONS, DELIVERY_SLOTS, VENDORS, MENU_ITEMS } from './mockData';
import { triggerVibration, VIBE_PATTERNS } from './utils/vibe';

interface RouterState {
  path: string;
  params: Record<string, string>;
}

export type Theme = 'light' | 'dark' | 'system';

interface MealDirectContextType {
  // Appearance
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Session / User Profile
  user: UserProfile | null;
  onboardingData: { phone: string; campusId: string; locationId: string } | null;
  signIn: () => void;
  mockCallbackExchange: () => void;
  completeOnboarding: (phone: string, campusId: string, locationId: string) => void;
  updateProfile: (fullName: string, phone: string, campusId: string, defaultLocationId: string) => void;
  signOut: () => void;

  // Routing
  router: RouterState;
  navigateTo: (path: string) => void;
  goBack: () => void;

  // Cart
  cart: Cart | null;
  addToCart: (vendorId: string, item: CartItem) => void;
  updateCartItemQuantity: (menuItemId: string, quantity: number) => void;
  updateCartItemSpoons: (
    menuItemId: string,
    spoonsCount: number,
    customFoodType?: string,
    customFoodSpoons?: number,
    customProtein?: string,
    customDrink?: string,
    quantity?: number,
    customFoodSelections?: { type: string; spoons: number }[],
    customProteinSelections?: { type: string; qty: number; price?: number }[]
  ) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  setCartDateTimeLocation: (date: string, slotId: string, locationId: string) => void;
  getCartQuote: () => OrderQuote;

  // Orders
  orders: Order[];
  createOrder: (specialInstructions?: string) => Order;
  payOrder: (orderId: string) => void;
  confirmDelivery: (orderId: string) => void;
  progressOrderStatus: (orderId: string) => void; // Simulated status incrementer for demo!
  cancelOrder: (orderId: string) => void;
  reorderOrder: (orderId: string) => void;

  // Escalations
  escalations: Escalation[];
  createEscalation: (orderId: string, category: Escalation['category'], description: string) => void;

  // Reviews
  reviews: Review[];
  createReview: (orderId: string, rating: number, comment: string) => void;
  menuItemReviews: MenuItemReview[];
  createMenuItemReview: (menuItemId: string, rating: number, comment: string, userName?: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Connection & Offline simulated states
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  lastSyncTime: string;

  // Global Context Helpers
  currentDate: string;
  currentSlotId: string;
  currentLocationId: string;
  setCurrentDateTimeLocation: (date: string, slotId: string, locationId: string) => void;

  // Local live in-app alert notification
  activeInAppAlert: { id: string; orderId: string; orderNumber: string; title: string; message: string; timestamp: string } | null;
  dismissInAppAlert: () => void;

  // Saved Delivery Locations
  savedLocationIds: string[];
  toggleSaveLocation: (locationId: string) => void;

  // Saved Favorite Dishes
  favoriteItemIds: string[];
  toggleFavoriteItem: (itemId: string) => void;
}

const MealDirectContext = createContext<MealDirectContextType | undefined>(undefined);

// Helper to extract path & params (e.g. /vendors/ven_grill or /orders/ord_123/escalate)
function parseLocation(): RouterState {
  const hash = window.location.hash || '#/';
  const path = hash.replace('#', '').split('?')[0];

  const params: Record<string, string> = {};
  
  // Custom segment matchers
  if (path.startsWith('/vendors/')) {
    const parts = path.split('/');
    if (parts[2]) params.vendorId = parts[2];
  } else if (path.startsWith('/payment/status/')) {
    const parts = path.split('/');
    if (parts[3]) params.orderId = parts[3];
  } else if (path.startsWith('/orders/')) {
    const parts = path.split('/');
    if (parts[2]) params.orderId = parts[2];
    if (parts[3] === 'escalate') params.action = 'escalate';
    if (parts[3] === 'review') params.action = 'review';
  }

  return { path, params };
}

export function computeCustomMealPriceKobo(
  menuItemId: string,
  foods?: { type: string; spoons: number }[],
  proteins?: { type: string; qty: number; price?: number }[],
  drink?: string,
  fallbackFoodType?: string,
  fallbackFoodSpoons?: number,
  fallbackProtein?: string
): number {
  let customSubtotal = 0;

  // Compile effective lists
  const effectiveFoods = (foods && foods.length > 0)
    ? foods
    : (fallbackFoodType ? [{ type: fallbackFoodType, spoons: fallbackFoodSpoons || 3 }] : []);

  const effectiveProteins = (proteins && proteins.length > 0)
    ? proteins
    : (fallbackProtein ? [{ type: fallbackProtein, qty: 1 }] : []);

  if (menuItemId === 'item_bistro_custom') {
    // Matade pricing
    effectiveFoods.forEach(sel => {
      const normType = sel.type.toLowerCase();
      if (normType.includes('peppersoup')) {
        customSubtotal += 250000 * sel.spoons; // ₦2,500 per portion
      } else {
        customSubtotal += 50000 * sel.spoons; // ₦500 per spoon
      }
    });

    effectiveProteins.forEach(sel => {
      customSubtotal += 50000 * (sel.qty || 1); // ₦500 for all proteins at Matade
    });

    // Note: Drinks are removed for Matade
  } else if (menuItemId === 'item_grill5') {
    // Venite Main Cafeteria pricing
    effectiveFoods.forEach(sel => {
      const normType = sel.type.toLowerCase();
      if (normType.includes('jollof rice') || normType.includes('white rice')) {
        customSubtotal += 40000 * sel.spoons; // ₦400 per spoon
      } else if (normType.includes('fried rice') || normType.includes('jollof spaghetti') || normType.includes('white spaghetti') || normType.includes('spaghetti')) {
        customSubtotal += 50000 * sel.spoons; // ₦500 per spoon
      } else if (normType.includes('beans')) {
        customSubtotal += 30000 * sel.spoons; // ₦300 per spoon
      } else if (normType.includes('fufu') || normType.includes('semo')) {
        customSubtotal += 25000 * sel.spoons; // ₦250 per piece (one/spoon)
      } else {
        customSubtotal += 50000 * sel.spoons; // Fallback
      }
    });

    effectiveProteins.forEach(sel => {
      const normType = sel.type.toLowerCase();
      const qty = sel.qty || 1;
      if (normType.includes('beef') || normType.includes('ponmo')) {
        customSubtotal += 50000 * qty; // ₦500 each
      } else if (normType.includes('egg')) {
        customSubtotal += 30000 * qty; // ₦300 each
      } else if (normType.includes('fish')) {
        const fishPriceKobo = sel.price ? sel.price : 50000; // default to 500 kobo if not specified
        customSubtotal += fishPriceKobo * qty;
      } else {
        customSubtotal += 50000 * qty; // Fallback
      }
    });

    if (drink) {
      const normDrink = drink.toLowerCase();
      if (
        normDrink.includes('coke') ||
        normDrink.includes('fanta') ||
        normDrink.includes('schweppes') ||
        normDrink.includes('7up') ||
        normDrink.includes('teem') ||
        normDrink.includes('sprite') ||
        normDrink.includes('pepsi') ||
        normDrink.includes('sosa')
      ) {
        customSubtotal += 50000; // ₦500
      } else if (
        normDrink.includes('predator') ||
        normDrink.includes('fearless') ||
        normDrink.includes('malt')
      ) {
        customSubtotal += 60000; // ₦600
      } else if (normDrink.includes('nutrichoco')) {
        customSubtotal += 100000; // ₦1,000
      } else if (
        normDrink.includes('nutrimilk') ||
        normDrink.includes('fayrouz') ||
        normDrink.includes('viju milk')
      ) {
        customSubtotal += 80000; // ₦800
      }
    }
  } else if (menuItemId === 'item_bake_custom') {
    // Mr Bunmi pricing: Bakery goods are ₦600 each
    effectiveFoods.forEach(sel => {
      customSubtotal += 60000 * sel.spoons;
    });

    // Extras/Hotdogs/Cakes
    effectiveProteins.forEach(sel => {
      const norm = sel.type.toLowerCase();
      let price = 30000;
      if (norm.includes('red velvet')) price = 80000;
      else if (norm.includes('vanilla')) price = 70000;
      else if (norm.includes('spring roll')) price = 20000;
      else if (norm.includes('puff puff')) price = 15000;
      else if (norm.includes('hot dog')) price = 30000;
      customSubtotal += price * (sel.qty || 1);
    });
  } else if (menuItemId === 'item_akara_custom') {
    // Akara Spot pricing
    effectiveFoods.forEach(sel => {
      const norm = sel.type.toLowerCase();
      let price = 10000; // wrap of cold eko is ₦100
      if (norm.includes('bread')) price = 50000; // sweet agege bread is ₦500
      customSubtotal += price * sel.spoons;
    });

    effectiveProteins.forEach(sel => {
      customSubtotal += 10000 * (sel.qty || 1); // Akara, Fried Yam Dundun, Fried Sweet Potatoes are ₦100 each
    });
  } else {
    return 0; // Not a custom meal item
  }

  // Always add takeaway packing surcharge fee (₦200 = 20000 kobo)
  customSubtotal += 20000;

  return customSubtotal;
}

export const MealDirectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Appearance State
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('md_theme');
    return (saved as Theme) || 'system';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('md_theme', newTheme);
  };

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Offline State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Routing State
  const [router, setRouter] = useState<RouterState>(parseLocation());

  // Global Context state: Selection overrides
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentSlotId, setCurrentSlotId] = useState<string>('slot_12'); // Defaults to Lunch
  const [currentLocationId, setCurrentLocationId] = useState<string>('');

  // Persisted Database State
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('md_user');
    if (saved) return JSON.parse(saved);

    const defaultUser: UserProfile = {
      id: 'usr_venite_auto',
      email: 'gbenga.venite@gmail.com',
      fullName: 'Gbenga Venite',
      isOnboarded: false
    };
    localStorage.setItem('md_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [onboardingData, setOnboardingData] = useState<{ phone: string; campusId: string; locationId: string } | null>(() => {
    const saved = localStorage.getItem('md_onboarding_temp');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<Cart | null>(() => {
    const saved = localStorage.getItem('md_cart');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('md_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('md_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [escalations, setEscalations] = useState<Escalation[]>(() => {
    const saved = localStorage.getItem('md_escalations');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('md_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [menuItemReviews, setMenuItemReviews] = useState<MenuItemReview[]>(() => {
    const saved = localStorage.getItem('md_menu_item_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedLocationIds, setSavedLocationIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('md_saved_location_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteItemIds, setFavoriteItemIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('md_favorite_item_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeInAppAlert, setActiveInAppAlert] = useState<{ id: string; orderId: string; orderNumber: string; title: string; message: string; timestamp: string } | null>(null);
  const dismissInAppAlert = () => setActiveInAppAlert(null);

  // Sync state with storage
  useEffect(() => {
    localStorage.setItem('md_user', user ? JSON.stringify(user) : '');
    localStorage.setItem('md_cart', cart ? JSON.stringify(cart) : '');
    localStorage.setItem('md_orders', JSON.stringify(orders));
    localStorage.setItem('md_notifications', JSON.stringify(notifications));
    localStorage.setItem('md_escalations', JSON.stringify(escalations));
    localStorage.setItem('md_reviews', JSON.stringify(reviews));
    localStorage.setItem('md_menu_item_reviews', JSON.stringify(menuItemReviews));
    localStorage.setItem('md_saved_location_ids', JSON.stringify(savedLocationIds));
    localStorage.setItem('md_favorite_item_ids', JSON.stringify(favoriteItemIds));
  }, [user, cart, orders, notifications, escalations, reviews, menuItemReviews, savedLocationIds, favoriteItemIds]);

  const toggleSaveLocation = (locationId: string) => {
    triggerVibration(VIBE_PATTERNS.MEDIUM);
    setSavedLocationIds(prev => {
      const isSaved = prev.includes(locationId);
      let next: string[];
      if (isSaved) {
        next = prev.filter(id => id !== locationId);
        addNotification('Location Unpinned 📍', 'The building has been unpinned from your rapid checkout shortcuts.', 'general');
      } else {
        next = [...prev, locationId];
        addNotification('Location Pinned! 📍', 'The building has been pinned for fast checkout shortcuts!', 'general');
      }
      return next;
    });
  };

  const toggleFavoriteItem = (itemId: string) => {
    triggerVibration(VIBE_PATTERNS.MEDIUM);
    setFavoriteItemIds(prev => {
      const isFav = prev.includes(itemId);
      let next: string[];
      if (isFav) {
        next = prev.filter(id => id !== itemId);
        addNotification('Removed from Favorites ❤️', 'The dish was removed from your favorites list.', 'general');
      } else {
        next = [...prev, itemId];
        addNotification('Added to Favorites ❤️', 'The dish was successfully saved to your favorites tab.', 'general');
      }
      return next;
    });
  };

  // Sync Routing
  useEffect(() => {
    const handlePopState = () => {
      setRouter(parseLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (pathPattern: string) => {
    window.location.hash = pathPattern;
    setRouter(parseLocation());
  };

  const goBack = () => {
    window.history.back();
  };

  // Sync date updates
  const setCurrentDateTimeLocation = (date: string, slotId: string, locationId: string) => {
    setCurrentDate(date);
    setCurrentSlotId(slotId);
    setCurrentLocationId(locationId);
    if (cart) {
      setCart({
        ...cart,
        deliveryDate: date,
        deliverySlotId: slotId,
        deliveryLocationId: locationId
      });
    }
  };

  // Auth Functions
  const signIn = () => {
    // Stage 1: Route to callback path to mimic OAuth redirect exchange flow
    navigateTo('/auth/callback');
  };

  const mockCallbackExchange = () => {
    // Exchange callback, create user shell
    const loggedUser: UserProfile = {
      id: 'usr_venite_' + Math.random().toString(36).substr(2, 9),
      email: 'gbenga.venite@gmail.com',
      fullName: 'Gbenga Venite',
      isOnboarded: false
    };
    setUser(loggedUser);
    setLastSyncTime(new Date().toLocaleTimeString());

    // Generate toast greeting
    addNotification('Authentication Successful 🔑', 'You have securely signed in via Google OAuth. Complete onboarding to resume.', 'general');
  };

  const completeOnboarding = (phone: string, campusId: string, locationId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      phone,
      campusId,
      defaultLocationId: locationId,
      isOnboarded: true
    };
    setUser(updatedUser);
    setCurrentLocationId(locationId);
    navigateTo('/home');

    // Notification
    addNotification(
      'Onboarding Completed 🎓',
      `Welcome onboard, Gbenga. Your default delivery hostel or department location has been validated for campus dispatch.`,
      'general'
    );
  };

  const updateProfile = (fullName: string, phone: string, campusId: string, defaultLocationId: string) => {
    if (!user) return;
    setUser({
      ...user,
      fullName,
      phone,
      campusId,
      defaultLocationId,
      isOnboarded: true
    });
    setCurrentLocationId(defaultLocationId);
    addNotification('Profile Saved Successfully', 'Your contact phone number and preset dispatch terminal were updated.', 'general');
  };

  const signOut = () => {
    localStorage.removeItem('md_orders');
    localStorage.removeItem('md_cart');
    localStorage.removeItem('md_notifications');
    localStorage.removeItem('md_escalations');
    localStorage.removeItem('md_reviews');
    localStorage.removeItem('md_onboarding_temp');

    const freshUser: UserProfile = {
      id: 'usr_venite_' + Math.random().toString(36).substr(2, 9),
      email: 'gbenga.venite@gmail.com',
      fullName: 'Gbenga Venite',
      isOnboarded: false
    };
    localStorage.setItem('md_user', JSON.stringify(freshUser));
    
    setUser(freshUser);
    setCart(null);
    setOrders([]);
    setNotifications([]);
    setOnboardingData(null);
    navigateTo('/onboarding');
  };

  // Cart operations
  const addToCart = (vendorId: string, newItem: CartItem) => {
    triggerVibration(VIBE_PATTERNS.TICK);
    // Validate Single-Vendor cart rule
    if (cart && cart.vendorId !== vendorId) {
      // Prompt modal confirmation is required, but we enforce this check on the menu Page as well
      // For hard reset, override cart:
      setCart({
        vendorId,
        items: [newItem],
        deliverySlotId: currentSlotId,
        deliveryDate: currentDate,
        deliveryLocationId: currentLocationId || user?.defaultLocationId || ''
      });
      return;
    }

    const currentItems = cart ? [...cart.items] : [];
    const existingIndex = currentItems.findIndex(it => it.menuItemId === newItem.menuItemId);

    if (existingIndex >= 0) {
      currentItems[existingIndex].quantity += newItem.quantity;
      // Enforce the 3 spoon restriction
      currentItems[existingIndex].spoonsCount = Math.min(3, newItem.spoonsCount);
      if (newItem.customFoodType !== undefined) currentItems[existingIndex].customFoodType = newItem.customFoodType;
      if (newItem.customFoodSpoons !== undefined) currentItems[existingIndex].customFoodSpoons = newItem.customFoodSpoons;
      if (newItem.customProtein !== undefined) currentItems[existingIndex].customProtein = newItem.customProtein;
      if (newItem.customDrink !== undefined) currentItems[existingIndex].customDrink = newItem.customDrink;
    } else {
      currentItems.push({
        ...newItem,
        spoonsCount: Math.min(3, newItem.spoonsCount)
      });
    }

    setCart({
      vendorId,
      items: currentItems,
      deliverySlotId: currentSlotId,
      deliveryDate: currentDate,
      deliveryLocationId: currentLocationId || user?.defaultLocationId || ''
    });

    addNotification(
      'Takeaway Added 🛍️',
      `A custom takeaway package was added to your cart.`,
      'general'
    );
  };

  const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
    if (!cart) return;
    triggerVibration(VIBE_PATTERNS.TICK);
    let currentItems = [...cart.items];
    if (quantity <= 0) {
      currentItems = currentItems.filter(it => it.menuItemId !== menuItemId);
    } else {
      const idx = currentItems.findIndex(it => it.menuItemId === menuItemId);
      if (idx >= 0) {
        currentItems[idx].quantity = quantity;
      }
    }

    if (currentItems.length === 0) {
      setCart(null);
    } else {
      setCart({ ...cart, items: currentItems });
    }
  };

  const updateCartItemSpoons = (
    menuItemId: string,
    spoonsCount: number,
    customFoodType?: string,
    customFoodSpoons?: number,
    customProtein?: string,
    customDrink?: string,
    quantity?: number,
    customFoodSelections?: { type: string; spoons: number }[],
    customProteinSelections?: { type: string; qty: number; price?: number }[]
  ) => {
    if (!cart) return;
    triggerVibration(VIBE_PATTERNS.TICK);
    const currentItems = [...cart.items];
    const idx = currentItems.findIndex(it => it.menuItemId === menuItemId);
    if (idx >= 0) {
      currentItems[idx].spoonsCount = Math.min(3, Math.max(0, spoonsCount)); // business rule cap of 3
      if (customFoodType !== undefined) currentItems[idx].customFoodType = customFoodType;
      if (customFoodSpoons !== undefined) currentItems[idx].customFoodSpoons = customFoodSpoons;
      if (customProtein !== undefined) currentItems[idx].customProtein = customProtein;
      if (customDrink !== undefined) currentItems[idx].customDrink = customDrink;
      if (quantity !== undefined) currentItems[idx].quantity = quantity;
      if (customFoodSelections !== undefined) currentItems[idx].customFoodSelections = customFoodSelections;
      if (customProteinSelections !== undefined) currentItems[idx].customProteinSelections = customProteinSelections;
      setCart({ ...cart, items: currentItems });
    }
  };

  const removeFromCart = (menuItemId: string) => {
    if (!cart) return;
    triggerVibration(VIBE_PATTERNS.TICK);
    const currentItems = cart.items.filter(it => it.menuItemId !== menuItemId);
    if (currentItems.length === 0) {
      setCart(null);
    } else {
      setCart({ ...cart, items: currentItems });
    }
  };

  const clearCart = () => {
    triggerVibration(VIBE_PATTERNS.TICK);
    setCart(null);
  };

  const setCartDateTimeLocation = (date: string, slotId: string, locationId: string) => {
    if (!cart) return;
    setCart({
      ...cart,
      deliveryDate: date,
      deliverySlotId: slotId,
      deliveryLocationId: locationId
    });
  };

  const getCartQuote = (): OrderQuote => {
    if (!cart) {
      return { subtotalKobo: 0, deliveryFeeKobo: 15000, totalKobo: 15000, itemCount: 0, spoonCount: 0, isValid: false, errors: ['Cart is empty'] };
    }

    let subtotalKobo = 0;
    let spoonCount = 0;
    let itemCount = 0;
    const errors: string[] = [];

    cart.items.forEach(cItem => {
      const dbItem = MENU_ITEMS.find(it => it.id === cItem.menuItemId);
      if (dbItem) {
        let itemPriceKobo = dbItem.priceKobo;
        if (cItem.menuItemId === 'item_grill5' || cItem.menuItemId === 'item_bistro_custom') {
          itemPriceKobo = computeCustomMealPriceKobo(
            cItem.menuItemId,
            cItem.customFoodSelections,
            cItem.customProteinSelections,
            cItem.customDrink,
            cItem.customFoodType,
            cItem.customFoodSpoons,
            cItem.customProtein
          );
        }

        subtotalKobo += itemPriceKobo * cItem.quantity;
        spoonCount += cItem.spoonsCount;
        itemCount += cItem.quantity;
        if (cItem.spoonsCount > 3) {
          errors.push(`Takeaway item '${dbItem.name}' exceeds the maximum allowed 3 spoons limit.`);
        }
      } else {
        errors.push(`Item code '${cItem.menuItemId}' could not be validated.`);
      }
    });

    const deliveryFeeKobo = 15000; // Flat ₦150
    const totalKobo = subtotalKobo + deliveryFeeKobo;

    return {
      subtotalKobo,
      deliveryFeeKobo,
      totalKobo,
      spoonCount,
      itemCount,
      isValid: errors.length === 0,
      errors
    };
  };

  // Orders Actions
  const createOrder = (specialInstructions?: string): Order => {
    if (!cart || !user) throw new Error('Cannot create order: Pre-requisites not met.');

    const quote = getCartQuote();
    const orderNum = 'MD-' + Math.floor(100000 + Math.random() * 900000);
    const orderId = 'ord_' + Math.floor(Math.random() * 10000000);

    const itemsDetail = cart.items.map(cItem => {
      const dbItem = MENU_ITEMS.find(it => it.id === cItem.menuItemId)!;
      return {
        menuItemId: cItem.menuItemId,
        name: dbItem.name,
        priceKobo: dbItem.priceKobo,
        quantity: cItem.quantity,
        spoonsCount: cItem.spoonsCount,
        customFoodType: cItem.customFoodType,
        customFoodSpoons: cItem.customFoodSpoons,
        customProtein: cItem.customProtein,
        customDrink: cItem.customDrink,
        customFoodSelections: cItem.customFoodSelections,
        customProteinSelections: cItem.customProteinSelections
      };
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      userId: user.id,
      vendorId: cart.vendorId,
      campusId: user.campusId || 'camp_1',
      locationId: cart.deliveryLocationId || user.defaultLocationId || '',
      slotId: cart.deliverySlotId || currentSlotId,
      deliveryDate: cart.deliveryDate || currentDate,
      items: itemsDetail,
      subtotalKobo: quote.subtotalKobo,
      deliveryFeeKobo: quote.deliveryFeeKobo,
      totalKobo: quote.totalKobo,
      status: 'PENDING_PAYMENT',
      statusHistory: [
        {
          status: 'PENDING_PAYMENT',
          timestamp: new Date().toISOString(),
          title: 'Order Created',
          description: 'A waiting quote reservation was successfully established. Launching Paystack...'
        }
      ],
      requestId: 'req_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      hasEscalation: false,
      hasReview: false,
      specialInstructions
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart(null); // Clear active cart on check out
    triggerVibration(VIBE_PATTERNS.MEDIUM);
    return newOrder;
  };

  const payOrder = (orderId: string) => {
    triggerVibration(VIBE_PATTERNS.SUCCESS);
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const timestamp = new Date().toISOString();
          return {
            ...o,
            status: 'PAID',
            statusHistory: [
              ...o.statusHistory,
              {
                status: 'PAID',
                timestamp,
                title: 'Payment Confirmed 💳',
                description: '₦' + (o.totalKobo / 100) + ' secured through Paystack gateway. Order submitted to vendor.'
              }
            ]
          };
        }
        return o;
      })
    );

    // Notification alert
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      addNotification(
        'Order Paid Successfully 🎉',
        `Your order ${targetOrder.orderNumber} is paid and submitted. Fresh, secure cooking is starting!`,
        'order_status',
        orderId
      );
    }
  };

  const confirmDelivery = (orderId: string) => {
    triggerVibration(VIBE_PATTERNS.SUCCESS);
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const timestamp = new Date().toISOString();
          return {
            ...o,
            status: 'CONFIRMED',
            statusHistory: [
              ...o.statusHistory,
              {
                status: 'CONFIRMED',
                timestamp,
                title: 'Order Confirmed by Customer 👍',
                description: 'You indicated successful checkout delivery. Thank you for dining with Meal Direct!'
              }
            ]
          };
        }
        return o;
      })
    );

    addNotification(
      'Order Confirmed 👍',
      'You have confirmed clean delivery. Write a vendor review to share feedback!',
      'order_status',
      orderId
    );
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const timestamp = new Date().toISOString();
          return {
            ...o,
            status: 'CANCELLED',
            statusHistory: [
              ...o.statusHistory,
              {
                status: 'CANCELLED',
                timestamp,
                title: 'Order Cancelled',
                description: 'Your order has been cancelled.'
              }
            ]
          };
        }
        return o;
      })
    );

    addNotification('Order Cancelled 🚫', 'The order has been marked as cancelled.', 'order_status', orderId);
  };

  const reorderOrder = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const newItems: CartItem[] = targetOrder.items.map(it => ({
      menuItemId: it.menuItemId,
      quantity: it.quantity,
      spoonsCount: it.spoonsCount
    }));

    setCart({
      vendorId: targetOrder.vendorId,
      items: newItems,
      deliverySlotId: currentSlotId,
      deliveryDate: currentDate,
      deliveryLocationId: currentLocationId || user?.defaultLocationId || ''
    });

    addNotification(
      'Order Reordered 🛍️',
      `Items from order ${targetOrder.orderNumber} have been placed in your cart.`,
      'general'
    );

    navigateTo('/cart');
  };

  const progressOrderStatus = (orderId: string) => {
    const list = [
      'PENDING_PAYMENT',
      'PAID',
      'ACCEPTED',
      'PREPARING',
      'READY',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ] as OrderStatus[];

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const currentIdx = list.indexOf(o.status);
          if (currentIdx === -1 || currentIdx === list.length - 1) return o; // already past or terminal

          const nextStatus = list[currentIdx + 1];
          const timestamp = new Date().toISOString();

          let title = '';
          let description = '';

          switch (nextStatus) {
            case 'PAID':
              title = 'Payment Received';
              description = 'Successful payout via secure Paystack channel.';
              break;
            case 'ACCEPTED':
              title = 'Order Accepted 🧑‍🍳';
              description = 'The vendor confirmed receipt of your meal plan and is assembling components.';
              break;
            case 'PREPARING':
              title = 'In the Kitchen 🔥';
              description = 'Ingredients are cooking! Savoring the best temperature.';
              break;
            case 'READY':
              title = 'Takeaway Packaged 📦';
              description = 'Your meal is safely sealed in compostable material and marked for central courier dispatch.';
              break;
            case 'PICKED_UP':
              title = 'Picked up by Courier 🚴';
              description = 'Meal Direct delivery rider has verified security seals and departed the central pickup hub.';
              break;
            case 'OUT_FOR_DELIVERY':
              title = 'Out for Campus Dispatch 📍';
              description = 'The rider is approaching your zone. Be ready to receive at your preset desk/hostel doorway!';
              break;
            case 'DELIVERED':
              title = 'Arrived at Location 🏁';
              description = 'Takeaway has been dispatched at the terminal desk. Confirm code receipt on screen.';
              break;
          }

          const updatedHist = [...o.statusHistory, { status: nextStatus, timestamp, title, description }];

          // Trigger local in-app alert window when order status transitions from 'Preparing' to 'Out for Delivery'
          if (nextStatus === 'OUT_FOR_DELIVERY') {
            const wasPreparing = o.status === 'PREPARING' || o.status === 'READY' || o.status === 'PICKED_UP' || o.statusHistory.some(h => h.status === 'PREPARING');
            if (wasPreparing) {
              setActiveInAppAlert({
                id: 'alert_' + Date.now(),
                orderId: o.id,
                orderNumber: o.orderNumber,
                title: 'Arriving Soon! 🚴💨',
                message: `Alert: Your delicious meal (Order ${o.orderNumber}) has transitioned from 'Preparing' to 'Out for Delivery'! The courier is approaching your terminal area right now.`,
                timestamp: new Date().toISOString()
              });
            }
          }

          // Trigger toast alert
          setTimeout(() => {
            addNotification(
              `Order status: ${title}`,
              `Your order ${o.orderNumber} is now ${nextStatus.toLowerCase().replace('_', ' ')}.`,
              'order_status',
              o.id
            );
          }, 100);

          return {
            ...o,
            status: nextStatus,
            statusHistory: updatedHist
          };
        }
        return o;
      })
    );
  };

  // Escalation actions
  const createEscalation = (
    orderId: string,
    category: Escalation['category'],
    description: string
  ) => {
    const escId = 'esc_' + Math.floor(Math.random() * 1000000);
    const newEsc: Escalation = {
      id: escId,
      orderId,
      category,
      description,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setEscalations(prev => [newEsc, ...prev]);

    // Update order status indicator
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const timestamp = new Date().toISOString();
          return {
            ...o,
            status: 'ESCALATED',
            hasEscalation: true,
            statusHistory: [
              ...o.statusHistory,
              {
                status: 'ESCALATED',
                timestamp,
                title: 'Case Escalated to Helpdesk ⚠️',
                description: `Customer submitted investigation query regarding: ${category.replace(/_/g, ' ')}. Description: ${description}`
              }
            ]
          };
        }
        return o;
      })
    );

    addNotification(
      'Issue Reported ⚠️',
      'The support ticket has been logged and assigned to the Venite Campus Lead. We will investigate shortly.',
      'support_update',
      orderId
    );

    // Auto resolution simulation in 20 seconds for interactive demo fun!
    setTimeout(() => {
      setEscalations(prev =>
        prev.map(e => {
          if (e.id === escId) {
            return {
              ...e,
              status: 'RESOLVED',
              replyMessage: 'Our courier lead confirmed dispatch delay. We have processed a complimentary credit / apology refund token V-COMM-150.'
            };
          }
          return e;
        })
      );
      addNotification('Escalation Resolved ✅', 'Your reported ticket has been resolved by helpdesk. Open support details to check resolution.', 'support_update', orderId);
    }, 15000);
  };

  // Review actions
  const createReview = (orderId: string, rating: number, comment: string) => {
    const newRev: Review = {
      orderId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newRev, ...prev]);

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return { ...o, hasReview: true };
        }
        return o;
      })
    );

    addNotification('Review Logged ⭐', 'Thank you for grading the meal! Your feedback shapes launch vendor scorecards.', 'general', orderId);
  };

  const createMenuItemReview = (menuItemId: string, rating: number, comment: string, userName?: string) => {
    const newRev: MenuItemReview = {
      id: 'mr_' + Date.now(),
      menuItemId,
      rating,
      comment,
      userName: userName || user?.fullName || 'Anonymous Student',
      createdAt: new Date().toISOString()
    };
    setMenuItemReviews(prev => [newRev, ...prev]);
    addNotification('Meal Feedback Logged ⭐', 'Thank you for sharing your feedback on this single meal helper item!', 'general');
  };

  // Notification actions
  const addNotification = (title: string, message: string, type: Notification['type'], orderId?: string) => {
    const noti: Notification = {
      id: 'noti_' + Date.now() + Math.floor(Math.random() * 100),
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      type,
      orderId
    };
    setNotifications(prev => [noti, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Toggle offline connection simulation
  const setOnlineStatus = (status: boolean) => {
    setIsOnline(status);
    setLastSyncTime(new Date().toLocaleTimeString());
    if (status) {
      addNotification('Connection Re-established 🤝', 'Application synchronized back with live Venite dispatch catalog.', 'general');
    } else {
      addNotification('Offline Mode Triggered 🔌', 'Operating in cached safe mode. Financial transactions and order submission are disabled.', 'general');
    }
  };

  return (
    <MealDirectContext.Provider
      value={{
        theme,
        setTheme,
        user,
        onboardingData,
        signIn,
        mockCallbackExchange,
        completeOnboarding,
        updateProfile,
        signOut,

        router,
        navigateTo,
        goBack,

        cart,
        addToCart,
        updateCartItemQuantity,
        updateCartItemSpoons,
        removeFromCart,
        clearCart,
        setCartDateTimeLocation,
        getCartQuote,

        orders,
        createOrder,
        payOrder,
        confirmDelivery,
        progressOrderStatus,
        cancelOrder,
        reorderOrder,

        escalations,
        createEscalation,

        reviews,
        createReview,
        menuItemReviews,
        createMenuItemReview,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,

        isOnline,
        setOnlineStatus,
        lastSyncTime,

        currentDate,
        currentSlotId,
        currentLocationId,
        setCurrentDateTimeLocation,

        activeInAppAlert,
        dismissInAppAlert,

        savedLocationIds,
        toggleSaveLocation,

        favoriteItemIds,
        toggleFavoriteItem
      }}
    >
      {children}
    </MealDirectContext.Provider>
  );
};

export const useMealDirect = () => {
  const context = useContext(MealDirectContext);
  if (!context) throw new Error('useMealDirect must be used within a MealDirectProvider');
  return context;
};
