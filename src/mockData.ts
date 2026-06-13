import { Campus, PresetLocation, DeliverySlot, Vendor, MenuItem } from './types';

export const CAMPUSES: Campus[] = [
  { id: 'camp_1', name: 'Venite University, Main Campus', code: 'VUNIV_MAIN' }
];

export const PRESET_LOCATIONS: PresetLocation[] = [
  // Zone A Hostels & Departments
  { id: 'loc_hall1', campusId: 'camp_1', name: 'Hall 1 (Postgraduate Residence)', zone: 'Zone A', type: 'Hostel' },
  { id: 'loc_hall2', campusId: 'camp_1', name: 'Hall 2 (Undergraduate Residence)', zone: 'Zone A', type: 'Hostel' },
  { id: 'loc_fac_sci', campusId: 'camp_1', name: 'Faculty of Science Complex', zone: 'Zone A', type: 'Department' },
  { id: 'loc_library', campusId: 'camp_1', name: 'Main Library Block', zone: 'Zone A', type: 'Department' },
  { id: 'loc_med_quarters', campusId: 'camp_1', name: 'Zone A Medical Quarters', zone: 'Zone A', type: 'Hostel' },

  // Zone B Hostels & Departments
  { id: 'loc_hall3', campusId: 'camp_1', name: 'Hall 3 (Female Hostel Block)', zone: 'Zone B', type: 'Hostel' },
  { id: 'loc_hall4', campusId: 'camp_1', name: 'Hall 4 (Male Hostel Block)', zone: 'Zone B', type: 'Hostel' },
  { id: 'loc_fac_eng', campusId: 'camp_1', name: 'Faculty of Engineering Lab Wing', zone: 'Zone B', type: 'Department' },
  { id: 'loc_admin', campusId: 'camp_1', name: 'Administrative Center Block', zone: 'Zone B', type: 'Department' },
  { id: 'loc_staff_housing', campusId: 'camp_1', name: 'Zone B Staff Quarters', zone: 'Zone B', type: 'Hostel' }
];

export const DELIVERY_SLOTS: DeliverySlot[] = [
  { id: 'slot_8', time: '08:00', label: 'Breakfast (8:00 AM)' },
  { id: 'slot_10', time: '10:00', label: 'Late Morning (10:00 AM)' },
  { id: 'slot_12', time: '12:00', label: 'Lunch (12:00 PM)' },
  { id: 'slot_14', time: '14:00', label: 'Mid-Day Snack (2:00 PM)' },
  { id: 'slot_17', time: '17:00', label: 'Early Dinner (5:00 PM)' },
  { id: 'slot_19', time: '19:00', label: 'Late Dinner (7:00 PM)' }
];

export const VENDORS: Vendor[] = [
  {
    id: 'ven_grill',
    name: 'The Campus Grill',
    description: 'Serving hot charcoal-fired chicken, spicy shawarma wraps, and smokey Jollof rice loaded with classic Venite seasoning.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviewCount: 142,
    featuredTags: ['Spicy', 'Grill', 'Student Favorite'],
    preparationTimeMins: 25
  },
  {
    id: 'ven_bistro',
    name: 'Savoury Spoon Bistro',
    description: 'Expertly prepared traditional swallows, Egusi vegetable soup, and perfectly cooked white rice topped with delicious Ayamase sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400',
    rating: 4.6,
    reviewCount: 98,
    featuredTags: ['Traditional', 'Swallows', 'Home Cooked'],
    preparationTimeMins: 30
  },
  {
    id: 'ven_bake',
    name: 'Venite Fuel & Bake',
    description: 'Fresh campus pastries, hot meatpies, juicy gourmet double burgers, and ice-cold hand-spun vanilla and strawberry milkshakes.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviewCount: 119,
    featuredTags: ['Bakery', 'Burgers', 'Quick Snack'],
    preparationTimeMins: 15
  }
];

export const MENU_ITEMS: MenuItem[] = [
  // The Campus Grill menu
  {
    id: 'item_grill1',
    name: 'Charcoal Grilled Quarter Chicken',
    description: 'Large flame-grilled chicken quarter with spicy pepper seasoning, served with traditional sweet potato fritters.',
    priceKobo: 250000, // ₦2,500.00
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=300',
    category: 'Mains',
    availableQuantity: 25
  },
  {
    id: 'item_grill2',
    name: 'Smokey Party Jollof Rice (Meal)',
    description: 'Authentic Nigerian firewood-smokey Jollof rice, served with fried sweet plantain dodo and a crispy chicken wing.',
    priceKobo: 180000, // ₦1,800.00
    imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=300',
    category: 'Mains',
    availableQuantity: 40
  },
  {
    id: 'item_grill3',
    name: 'Supreme Beef Shawarma Wrap',
    description: 'Flour tortilla stuffed with tender beef strips, fresh cabbage salad, and our signature double-garlic mayo cream.',
    priceKobo: 150000, // ₦1,500.00
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&q=80&w=300',
    category: 'Quick Bites',
    availableQuantity: 15
  },
  {
    id: 'item_grill4',
    name: 'Crispy Sautéed Gizzard Sticks',
    description: 'Deliciously fried gizzard skewered and tossed in spicy bell pepper sauce.',
    priceKobo: 90000, // ₦900.00
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300',
    category: 'Sides & Snacks',
    availableQuantity: 10
  },

  // Savoury Spoon Bistro menu
  {
    id: 'item_bistro1',
    name: 'Traditional Amala & Rich Abula combo',
    description: 'Smooth soft hot Yam flour (Amala) served with Gbegiri (bean soup), Ewedu, and tasty bell pepper stew with tender beef.',
    priceKobo: 220000, // ₦2,200.00
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
    category: 'Swallows',
    availableQuantity: 20
  },
  {
    id: 'item_bistro2',
    name: 'Steaming Egusi Soup with Semovita',
    description: 'Rich ground melon seed Egusi soup cooked with fresh local spinach, tripe, beef chunk, served with smooth Semovita.',
    priceKobo: 240000, // ₦2,400.00
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=300',
    category: 'Swallows',
    availableQuantity: 18
  },
  {
    id: 'item_bistro3',
    name: 'ofada Special Rice Pot',
    description: 'Locally grown unpolished ofada Rice served in clean banana leaf wrap with fiery Ayamase pepper sauce, egg, and meat.',
    priceKobo: 260000, // ₦2,600.00
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=300',
    category: 'Mains',
    availableQuantity: 15
  },

  // Venite Fuel & Bake menu
  {
    id: 'item_bake1',
    name: 'The Campus Double Cheeseburger',
    description: 'Two grilled 100% grade-A beef patties, double sliced melted cheddar, sweet onions, and buttery toasted brioche bun.',
    priceKobo: 280000, // ₦2,800.00
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    category: 'Mains',
    availableQuantity: 12
  },
  {
    id: 'item_bake2',
    name: 'Flaky Golden Beef Meatpie',
    description: 'Freshly baked buttery pastry filled with spiced lean ground beef, soft carrots, and diced potato cubes.',
    priceKobo: 70000, // ₦700.00
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 30
  },
  {
    id: 'item_bake3',
    name: 'Hand-Spun Creamy Vanilla Shake',
    description: 'Cold blended thick milkshake made with premium milk, fresh whipped vanilla bean ice cream, and whipped cream topping.',
    priceKobo: 120000, // ₦1,200.00
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=300',
    category: 'Drinks',
    availableQuantity: 15
  }
];

// Helper to filter items for a vendor
export const getMenuItemsByVendor = (vendorId: string): MenuItem[] => {
  if (vendorId === 'ven_grill') return MENU_ITEMS.filter(it => it.id.startsWith('item_grill'));
  if (vendorId === 'ven_bistro') return MENU_ITEMS.filter(it => it.id.startsWith('item_bistro'));
  if (vendorId === 'ven_bake') return MENU_ITEMS.filter(it => it.id.startsWith('item_bake'));
  return [];
};

// Return a currency formatted string
export const formatNGN = (kobo: number): string => {
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(naira);
};

// Check if a slot is available (closes 60 minutes before drop-off)
export const isSlotAvailable = (slotTime: string, targetDateStr: string, mockCurrentTimeInMins?: number): boolean => {
  // targetDateStr config
  const dateSplit = targetDateStr.split('-');
  const year = parseInt(dateSplit[0]);
  const month = parseInt(dateSplit[1]) - 1;
  const day = parseInt(dateSplit[2]);

  const targetDate = new Date(year, month, day);
  const now = new Date();
  
  // Set times to midnight to check if target date is in the future
  const targetMidnight = new Date(year, month, day, 0, 0, 0, 0).getTime();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();

  if (targetMidnight > todayMidnight) {
    return true; // Future dates are fully open
  }
  if (targetMidnight < todayMidnight) {
    return false; // Past dates are closed
  }

  // Same day. Check cutoff (60 mins before delivery slot time)
  const slotSplit = slotTime.split(':');
  const slotHour = parseInt(slotSplit[0]);
  const slotMin = parseInt(slotSplit[1]);

  let currentHour = now.getHours();
  let currentMin = now.getMinutes();

  if (mockCurrentTimeInMins !== undefined) {
    currentHour = Math.floor(mockCurrentTimeInMins / 60);
    currentMin = mockCurrentTimeInMins % 60;
  }

  const slotMinutes = slotHour * 60 + slotMin;
  const currentMinutes = currentHour * 60 + currentMin;

  // Ordering closes 60 minutes before delivery time
  return (slotMinutes - currentMinutes) >= 60;
};
