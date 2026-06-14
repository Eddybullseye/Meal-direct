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
    name: 'Venite Main cafeteria',
    description: 'Serving hot charcoal-fired chicken, spicy shawarma wraps, and smokey Jollof rice loaded with classic Venite seasoning.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviewCount: 142,
    featuredTags: ['Spicy', 'Grill', 'Student Favorite'],
    preparationTimeMins: 25
  },
  {
    id: 'ven_bistro',
    name: 'Matade',
    description: 'Create your perfect combination of Jollof rice, white rice, ofada, peppersoup, spaghetti, semo, or eba paired with premium proteins like beef, fish, ponmo, and egg.',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400',
    rating: 4.6,
    reviewCount: 98,
    featuredTags: ['Traditional', 'Swallows', 'Home Cooked'],
    preparationTimeMins: 30
  },
  {
    id: 'ven_bake',
    name: 'Mr Bunmi',
    description: 'Delectable campus pastries, fresh meat pies, hot dogs, fluffy spring rolls, pizza, double burgers, and custom dessert cakes.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviewCount: 119,
    featuredTags: ['Bakery', 'Burgers', 'Quick Snack'],
    preparationTimeMins: 15
  },
  {
    id: 'ven_akara',
    name: 'Akara spot',
    description: 'Amazing hot Akara, sweet pull-apart bread, fried sweet potato slices, crispy fried yam, and cold Eko wraps. Fast, authentic native breakfast.',
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewCount: 84,
    featuredTags: ['Breakfast', 'Akara', 'Student Favorite'],
    preparationTimeMins: 10
  }
];

export const MENU_ITEMS: MenuItem[] = [
  // The Venite Main cafeteria menu
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
  {
    id: 'item_grill5',
    name: 'Venite Cafeteria Custom Combo Builder (Tailored)',
    description: 'Build your custom buffet meal combo: choose up to four local main menus, portions, preferred proteins including ponmo, and cold drink.',
    priceKobo: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
    category: 'Mains',
    availableQuantity: 100
  },

  // Matade menu
  {
    id: 'item_bistro_custom',
    name: 'Matade Custom Plate Builder (Tailored)',
    description: 'Customize a combination of piping-hot main menus, select preferred proteins like tender beef or seasoned ponmo, portion size, and takeaway package.',
    priceKobo: 0, // Calculated dynamically
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=300',
    category: 'Mains',
    availableQuantity: 100
  },

  // Mr Bunmi menu items
  {
    id: 'item_bake_sausage',
    name: 'Sausage roll',
    description: 'Golden flaky pastry wrapped around a delicious seasoned sausage roll.',
    priceKobo: 60000, // ₦600.00
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 50
  },
  {
    id: 'item_bake_meatpie',
    name: 'Meat pie',
    description: 'Freshly-baked buttery pastry stuffed with seasoned ground beef, potatoes, and diced carrots.',
    priceKobo: 60000, // ₦600.00
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 45
  },
  {
    id: 'item_bake_chickenpie',
    name: 'Chicken pie',
    description: 'Buttery shortcrust pastry filled with delicious shredded chicken breast and savory vegetable gravy.',
    priceKobo: 60000, // ₦600.00
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 40
  },
  {
    id: 'item_bake_hotdog',
    name: 'Hot dog',
    description: 'Juicy grilled beef sausage inside a toasted soft bun, drizzled with mustard and sweet relish ketchup.',
    priceKobo: 30000, // ₦300.00
    imageUrl: 'https://images.unsplash.com/photo-1541248163665-21d78ebd55bf?auto=format&fit=crop&q=80&w=300',
    category: 'Quick Bites',
    availableQuantity: 25
  },
  {
    id: 'item_bake_puffpuff',
    name: 'Puff puff',
    description: 'Sweet, fluffy fried dough balls dusted with sugar - a classic campus favorite.',
    priceKobo: 15000, // ₦150.00
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=300',
    category: 'Quick Bites',
    availableQuantity: 100
  },
  {
    id: 'item_bake_fishpie',
    name: 'Fish pie',
    description: 'Savory deep-fried puff pastry pocket packed with spiced shredded mackerel.',
    priceKobo: 60000, // ₦600.00
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 30
  },
  {
    id: 'item_bake_springroll',
    name: 'Spring roll',
    description: 'Crunchy golden light wrappers stuffed with mixed shredded vegetables and minced chicken.',
    priceKobo: 20000, // ₦200.00
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300',
    category: 'Quick Bites',
    availableQuantity: 35
  },
  {
    id: 'item_bake_cake1',
    name: 'Slice of Vanilla Sponge Cake',
    description: 'Thick moist slice of hand-whipped vanilla butter sponge cake.',
    priceKobo: 70000, // ₦700.00
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 20
  },
  {
    id: 'item_bake_cake2',
    name: 'Slice of Red Velvet Cake',
    description: 'Premium rich chocolate red velvet cake slice topped with smooth sweet cream cheese frosting.',
    priceKobo: 80000, // ₦800.00
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 15
  },
  {
    id: 'item_bake_eggroll',
    name: 'Egg roll',
    description: 'Hard-boiled whole egg wrapped inside golden crisp yeast dough.',
    priceKobo: 60000, // ₦600.00
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 22
  },
  {
    id: 'item_bake_fishroll',
    name: 'Fish roll',
    description: 'Spiced flaky roll filled with savory minced mackerel fish stuffing.',
    priceKobo: 60000, // ₦600.00
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=300',
    category: 'Pastries',
    availableQuantity: 20
  },

  // Akara spot menu items
  {
    id: 'item_akara_akara',
    name: 'Golden Fried Akara',
    description: 'Crispy fried bean cake made from pure ground brown beans, spicy onions, and chillies.',
    priceKobo: 10000, // ₦100.00 per unit
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=300',
    category: 'Hot Mains',
    availableQuantity: 150
  },
  {
    id: 'item_akara_bread',
    name: 'Sweet Agege Bread',
    description: 'Freshly baked soft Nigerian pull-apart sweet bread - perfect companion for Akara.',
    priceKobo: 50000, // ₦500.00 per unit
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300',
    category: 'Sides & Bread',
    availableQuantity: 40
  },
  {
    id: 'item_akara_potato',
    name: 'Fried Sweet Potato',
    description: 'Soft crisp fried sweet potato slices salted to perfection.',
    priceKobo: 10000, // ₦100.00 per unit
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300',
    category: 'Sides & Bread',
    availableQuantity: 80
  },
  {
    id: 'item_akara_yam',
    name: 'Fried Yam Slice (Dundun)',
    description: 'Crispy oil-fried white yam fingers seasoned lightly with local sea salt.',
    priceKobo: 10000, // ₦100.00 per unit
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=300',
    category: 'Sides & Bread',
    availableQuantity: 90
  },
  {
    id: 'item_akara_eko',
    name: 'Wrap of Cold Eko (Solid Pap)',
    description: 'Cold solid corn starch pudding wrapped traditionally in plantain leaves.',
    priceKobo: 10000, // ₦100.00 per unit
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
    category: 'Sides & Bread',
    availableQuantity: 50
  }
];

// Helper to filter items for a vendor
export const getMenuItemsByVendor = (vendorId: string): MenuItem[] => {
  if (vendorId === 'ven_grill') return MENU_ITEMS.filter(it => it.id.startsWith('item_grill'));
  if (vendorId === 'ven_bistro') return MENU_ITEMS.filter(it => it.id.startsWith('item_bistro'));
  if (vendorId === 'ven_bake') return MENU_ITEMS.filter(it => it.id.startsWith('item_bake'));
  if (vendorId === 'ven_akara') return MENU_ITEMS.filter(it => it.id.startsWith('item_akara'));
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
