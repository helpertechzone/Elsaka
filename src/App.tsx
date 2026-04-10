import React, { useState, useEffect } from 'react';
import { useCart } from './contexts/CartContext';
import { CATEGORIES, MENU_DATA } from './types';
import { cn } from './lib/utils';
import { ShoppingBag, Plus, Minus, Receipt, LayoutDashboard, Globe } from 'lucide-react';
import { db, auth } from './firebase.ts';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [view, setView] = useState<'menu' | 'admin'>('menu');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [showTableModal, setShowTableModal] = useState(true);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { items, addToCart, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user, isAdmin } = useAuth();

  const isRtl = lang === 'ar';

  useEffect(() => {
    if (view === 'admin') {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return unsubscribe;
    }
  }, [view]);

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      setShowTableModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'orders'), {
        tableNumber,
        items,
        totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
        language: lang
      });
      clearCart();
      setShowCart(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAdminLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const t = {
    en: {
      menu: 'Menu',
      admin: 'Dashboard',
      table: 'Table Number',
      enterTable: 'Enter Table Number',
      confirm: 'Confirm',
      addToCart: 'Add to Cart',
      cart: 'Your Cart',
      total: 'Total',
      placeOrder: 'Place Order',
      emptyCart: 'Your cart is empty',
      orderSuccess: 'Order placed successfully!',
      status: 'Status',
      actions: 'Actions',
      preparing: 'Preparing',
      delivered: 'Delivered',
      pending: 'Pending',
      items: 'Items',
      price: 'Price',
      time: 'Time'
    },
    ar: {
      menu: 'القائمة',
      admin: 'لوحة التحكم',
      table: 'رقم الطاولة',
      enterTable: 'أدخل رقم الطاولة',
      confirm: 'تأكيد',
      addToCart: 'إضافة للسلة',
      cart: 'سلتك',
      total: 'الإجمالي',
      placeOrder: 'إرسال الطلب',
      emptyCart: 'سلتك فارغة',
      orderSuccess: 'تم إرسال الطلب بنجاح!',
      status: 'الحالة',
      actions: 'إجراءات',
      preparing: 'جاري التحضير',
      delivered: 'تم التوصيل',
      pending: 'قيد الانتظار',
      items: 'الأصناف',
      price: 'السعر',
      time: 'الوقت'
    }
  }[lang];

  return (
    <div className={cn("min-h-screen bg-[#131313] text-[#E5E2E1] font-body", isRtl ? "rtl" : "ltr")} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <button 
            onClick={() => setView(view === 'menu' ? 'admin' : 'menu')}
            className="text-[#E5E2E1] hover:text-[#E30613] transition-colors"
          >
            {view === 'menu' ? <LayoutDashboard size={24} /> : <Receipt size={24} />}
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="font-headline font-black text-xl tracking-tighter text-[#E5E2E1]">EL SAKA</h1>
            <div className="h-0.5 w-8 bg-[#E30613]"></div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="text-[#E5E2E1] hover:text-[#E30613]">
              <Globe size={20} />
            </button>
            {view === 'menu' && (
              <button onClick={() => setShowCart(true)} className="relative text-[#E5E2E1] hover:text-[#E30613]">
                <ShoppingBag size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E30613] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-24 px-4 max-w-4xl mx-auto">
        {view === 'menu' ? (
          <>
            {/* Category Tabs */}
            <div className="sticky top-16 z-40 bg-[#131313] py-4 overflow-x-auto no-scrollbar flex gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                    activeCategory === cat 
                      ? "bg-[#E30613] text-white shadow-lg shadow-[#E30613]/20" 
                      : "bg-[#201f1f] text-[#E5E2E1]/60 hover:bg-[#353534]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MENU_DATA.filter(item => item.category === activeCategory).map(item => (
                <div key={item.id} className="bg-[#201f1f] rounded-2xl p-4 flex justify-between items-center group hover:bg-[#2a2a2a] transition-colors">
                  <div>
                    <h3 className="font-bold text-lg">{lang === 'ar' ? item.nameAr : item.nameEn}</h3>
                    <p className="text-[#E30613] font-black mt-1">{item.price} LE</p>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-10 h-10 rounded-xl bg-[#353534] flex items-center justify-center text-[#E5E2E1] group-hover:bg-[#E30613] group-hover:text-white transition-all active:scale-90"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {!isAdmin ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-black mb-4">Admin Access Required</h2>
                <button 
                  onClick={handleAdminLogin}
                  className="bg-[#E30613] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest"
                >
                  Login with Google
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter">{t.admin}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-[#201f1f] rounded-2xl p-6 border-l-4 border-[#E30613]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-black text-xl">TABLE #{order.tableNumber}</h3>
                          <p className="text-xs text-[#E5E2E1]/60">{order.createdAt?.toDate().toLocaleTimeString()}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          order.status === 'pending' ? "bg-yellow-500/20 text-yellow-500" :
                          order.status === 'preparing' ? "bg-blue-500/20 text-blue-500" :
                          "bg-green-500/20 text-green-500"
                        )}>
                          {t[order.status]}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {lang === 'ar' ? item.nameAr : item.nameEn}</span>
                            <span>{item.price * item.quantity} LE</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className="font-black text-lg">{order.totalPrice} LE</span>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                            >
                              {t.preparing}
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                            >
                              {t.delivered}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Table Number Modal */}
      <AnimatePresence>
        {showTableModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#201f1f] w-full max-w-sm rounded-3xl p-8 text-center"
            >
              <h2 className="font-headline text-2xl font-black mb-2 uppercase">{t.enterTable}</h2>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-[#131313] border-none rounded-2xl h-20 text-center text-4xl font-black focus:ring-2 focus:ring-[#E30613] mb-6"
                placeholder="00"
              />
              <button
                onClick={() => tableNumber && setShowTableModal(false)}
                className="w-full bg-[#E30613] text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-[#E30613]/20 disabled:opacity-50"
                disabled={!tableNumber}
              >
                {t.confirm}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div 
            initial={{ x: isRtl ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: isRtl ? '-100%' : '100%' }}
            className={cn(
              "fixed inset-y-0 z-[60] w-full max-w-md bg-[#1c1b1b] shadow-2xl p-6 flex flex-col",
              isRtl ? "left-0" : "right-0"
            )}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase">{t.cart}</h2>
              <button onClick={() => setShowCart(false)} className="text-[#E5E2E1]/60 hover:text-white">
                <Minus size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 no-scrollbar">
              {items.length === 0 ? (
                <p className="text-center text-[#E5E2E1]/40 py-20">{t.emptyCart}</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className="bg-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{lang === 'ar' ? item.nameAr : item.nameEn}</h4>
                      <p className="text-[#E30613] font-bold text-sm">{item.price} LE</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg bg-[#353534] flex items-center justify-center"><Minus size={16} /></button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-lg bg-[#353534] flex items-center justify-center"><Plus size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[#E5E2E1]/60 font-bold uppercase text-xs tracking-widest">{t.total}</span>
                <span className="text-3xl font-black text-[#E30613]">{totalPrice} LE</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={items.length === 0}
                className="w-full bg-[#E30613] text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-[#E30613]/20 disabled:opacity-50 active:scale-95 transition-all"
              >
                {t.placeOrder}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <Receipt size={20} />
            {t.orderSuccess}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
