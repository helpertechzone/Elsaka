export interface MenuItem {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  category: string;
  image?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled';

export interface Order {
  id?: string;
  tableNumber: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: any;
  language: 'ar' | 'en';
}

export const MENU_DATA: MenuItem[] = [
  // Pizza
  { id: 'p1', nameEn: 'Margherita', nameAr: 'مارجريتا', price: 95, category: 'Pizza' },
  { id: 'p2', nameEn: 'Vegetables', nameAr: 'خضروات', price: 105, category: 'Pizza' },
  { id: 'p3', nameEn: 'Mix Cheese', nameAr: 'ميكس جبن', price: 125, category: 'Pizza' },
  { id: 'p4', nameEn: 'Chicken Ranch', nameAr: 'تشيكن رانش', price: 135, category: 'Pizza' },
  
  // Crepe
  { id: 'c1', nameEn: 'Zinger Crepe', nameAr: 'كريب زنجر', price: 95, category: 'Crepe' },
  { id: 'c2', nameEn: 'Mix Chicken Crepe', nameAr: 'كريب ميكس دجاج', price: 125, category: 'Crepe' },
  
  // Pasta
  { id: 'pa1', nameEn: 'Alfredo Pasta', nameAr: 'باستا الفريدو', price: 125, category: 'Pasta' },
  { id: 'pa2', nameEn: 'Negresco', nameAr: 'نجرسكو', price: 125, category: 'Pasta' },
  
  // Grilled
  { id: 'g1', nameEn: 'Kofta Meal', nameAr: 'وجبة كفتة', price: 190, category: 'Grilled' },
  { id: 'g2', nameEn: 'Shish Taouk Meal', nameAr: 'وجبة شيش طاووق', price: 190, category: 'Grilled' },
  
  // Drinks
  { id: 'd1', nameEn: 'Mango Juice', nameAr: 'عصير مانجو', price: 35, category: 'Drinks' },
  { id: 'd2', nameEn: 'Turkish Coffee', nameAr: 'قهوة تركي', price: 20, category: 'Drinks' },
];

export const CATEGORIES = ['Pizza', 'Crepe', 'Pasta', 'Grilled', 'Drinks'];
