import React, { useState } from 'react';
import { useMealDirect } from '../store';
import { PRESET_LOCATIONS, DELIVERY_SLOTS, VENDORS, formatNGN } from '../mockData';
import { AppShell, GlassPanel, Currency } from './CommonUI';
import { ShieldCheck, ArrowRight, Loader2, Landmark, HelpCircle, MapPin, Clock, CreditCard, Lock, ClipboardList } from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    user,
    cart,
    navigateTo,
    getCartQuote,
    createOrder,
    payOrder,
    isOnline
  } = useMealDirect();

  // Quote
  const quote = getCartQuote();

  // States
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paystackGatewayActive, setPaystackGatewayActive] = useState(false);
  const [activeCreatedOrder, setActiveCreatedOrder] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const activeLocation = PRESET_LOCATIONS.find(l => l.id === (cart?.deliveryLocationId || user?.defaultLocationId));
  const activeSlot = DELIVERY_SLOTS.find(s => s.id === (cart?.deliverySlotId));
  const activeVendor = VENDORS.find(v => v.id === cart?.vendorId);

  const handleLaunchPayment = () => {
    if (!isOnline) {
      setErrorMessage('Offline cache. Payout requires internet connectivity.');
      return;
    }
    setErrorMessage(null);
    setIsCreatingOrder(true);

    // Simulate ordering submission (checks quotas & reserves slots)
    setTimeout(() => {
      try {
        const orderResult = createOrder(specialInstructions); // creates order & clears cart
        setActiveCreatedOrder(orderResult);
        setIsCreatingOrder(false);
        // Stage 2: Initialize Paystack simulation
        setPaystackGatewayActive(true);
      } catch (err: any) {
        setIsCreatingOrder(false);
        setErrorMessage('Failed to lock checkout inventory quotas. Try cooking options.');
      }
    }, 1800);
  };

  const handlePaystackSuccess = () => {
    if (!activeCreatedOrder) return;
    setPaymentProcessing(true);

    // Simulate webhook transaction processing
    setTimeout(() => {
      payOrder(activeCreatedOrder.id); // set status to PAID
      setPaymentProcessing(false);
      setPaystackGatewayActive(false);
      
      // Reroute to success parameters URL
      navigateTo(`/payment/status/${activeCreatedOrder.id}?status=success`);
    }, 1600);
  };

  const handlePaystackFail = () => {
    if (!activeCreatedOrder) return;
    setPaystackGatewayActive(false);
    
    // Reroute to status page marked with fail details
    navigateTo(`/payment/status/${activeCreatedOrder.id}?status=cancelled`);
  };

  // If cart is empty and Paystack is not currently simulating, push back home
  if (!cart && !paystackGatewayActive) {
    return (
      <AppShell activeTab="cart">
        <div className="text-center py-12 bg-white rounded-3xl border border-red-100">
          <ShieldCheck className="w-12 h-12 text-danger mx-auto mb-3" />
          <p className="text-sm font-bold text-emerald-strong">Your cart is empty. Checkout requires active packaging.</p>
          <button onClick={() => navigateTo('/home')} className="mt-4 px-4 py-2 bg-emerald-deep text-white rounded-xl text-xs font-bold cursor-pointer">
            Return Home
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeTab="cart">
      <section className="mb-6" id="checkout_page_header">
        <div>
          <span className="text-[10px] font-black tracking-widest text-emerald-deep uppercase bg-emerald-deep/5 px-2.5 py-1 rounded">Safe Gateway</span>
          <h2 className="font-display font-black text-2xl text-emerald-strong mt-1.5" id="checkout_headline">Checkout Payment Slate</h2>
          <p className="text-xs text-muted-grey">Authorize your order securely. We partner with Paystack for campus remittance.</p>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-xs text-danger font-semibold rounded-2xl flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-danger shrink-0 rotate-180" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isCreatingOrder ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-emerald-deep/8 flex flex-col items-center justify-center p-6" id="order_creating_state">
          <Loader2 className="w-10 h-10 text-emerald-deep animate-spin mb-4" />
          <h3 className="font-display font-bold text-sm text-emerald-strong">Securing Ingredient Inventory...</h3>
          <p className="text-xs text-muted-grey mt-1 max-w-sm">
            Communicating with <strong>{activeVendor?.name}</strong>. Reserving delivery slots under the flat ₦150 dispatch window.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="checkout_main_grid">
          {/* Left Summary columns */}
          <div className="lg:col-span-2 space-y-6">
            <GlassPanel className="p-6">
              <h3 className="font-display font-bold text-sm text-emerald-strong mb-4">Takeway Booking Breakdown</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-neutral-50 rounded-xl text-emerald-deep border border-neutral-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-strong">Dispatch Destination Terminal</h4>
                    <p className="text-[11px] text-muted-grey mt-0.5">{activeLocation ? activeLocation.name : 'Not set'}</p>
                    <span className="inline-block mt-1 text-[9px] bg-emerald-deep/5 px-2 py-0.5 text-emerald-strong font-semibold rounded-md border border-emerald-deep/8">
                      {activeLocation?.zone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-neutral-50 rounded-xl text-emerald-deep border border-neutral-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-strong">Delivery Slot Time Window</h4>
                    <p className="text-[11px] text-muted-grey mt-0.5">{activeSlot ? activeSlot.label : 'None configured'}</p>
                    <span className="inline-block mt-1 text-[9px] bg-mango-warm/15 px-2 py-0.5 text-orange-700 font-semibold rounded-md border border-mango-warm/20">
                      Standard batch delivery
                    </span>
                  </div>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4.5 h-4.5 text-emerald-deep" />
                <h3 className="font-display font-bold text-sm text-emerald-strong">Special Delivery & Kitchen Instructions</h3>
              </div>
              <p className="text-xs text-muted-grey mb-3 leading-relaxed font-normal">
                Specify optional details such as delivery gate codes, specific outer entrance directions, or food allergy requests for the kitchen staff.
              </p>
              <div className="relative">
                <textarea
                  placeholder="e.g. Gate code is #5512. Hall 4 entrance. Allergy: Absolutely no peanuts or trace seafood elements, thank you!"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full text-xs font-semibold text-ink-deep bg-neutral-50/50 hover:bg-neutral-50 border border-emerald-deep/12 rounded-2xl p-3.5 min-h-[90px] pr-20 focus:ring-2 focus:ring-emerald-deep focus:outline-none focus:bg-white transition-all placeholder:text-muted-grey/60 placeholder:font-normal resize-none"
                  id="checkout_special_instructions"
                  maxLength={400}
                />
                <span className="absolute bottom-3.5 right-3 text-[9px] font-mono font-black text-muted-grey bg-neutral-100 px-1.5 py-0.5 rounded">
                  {specialInstructions.length}/400 chars
                </span>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4.5 h-4.5 text-emerald-deep" />
                <h3 className="font-display font-bold text-sm text-emerald-strong">Remittance Protocol</h3>
              </div>
              <p className="text-xs text-muted-grey leading-relaxed">
                Meal Direct complies with global card encryption laws. We do not store credit card inputs on local terminal databases. Paystack processes transaction validations independently with campus bank structures.
              </p>
            </GlassPanel>
          </div>

          {/* Right Summation Cards */}
          <div>
            <GlassPanel className="p-6 bg-emerald-strong text-white border-t-4 border-t-mango-warm">
              <h3 className="font-display text-base font-bold mb-4">Remittance Quote</h3>

              <div className="space-y-3 pb-4 border-b border-white/8 text-xs text-emerald-100">
                <div className="flex justify-between">
                  <span>Takeaways Basket:</span>
                  <Currency kobo={quote.subtotalKobo} className="text-white font-bold" />
                </div>
                <div className="flex justify-between">
                  <span>Spoons customization:</span>
                  <span className="text-mango-warm font-semibold font-mono">{quote.spoonCount} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispatch Courier Fee:</span>
                  <Currency kobo={15000} className="text-white font-bold" />
                </div>
              </div>

              <div className="flex justify-between items-baseline py-4 mb-6">
                <span className="text-xs font-bold text-white">Remittance Total:</span>
                <span className="text-xl font-black text-mango-warm select-all"><Currency kobo={quote.totalKobo} /></span>
              </div>

              <button
                onClick={handleLaunchPayment}
                className="w-full py-4 bg-mango-warm hover:bg-amber-400 text-emerald-strong font-bold text-xs rounded-2xl transition shadow-lg shadow-emerald-deep/15 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                id="launch_paystack_simulation"
              >
                <CreditCard className="w-4 h-4" />
                <span>Initialize Paystack Portal</span>
              </button>
            </GlassPanel>
          </div>
        </div>
      )}

      {/* SECURE MOCK PAYSTACK PAYMENT GATEWAY PORTAL MODAL DIALOG */}
      {paystackGatewayActive && activeCreatedOrder && (
        <dialog open className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="paystack_simulation_dialog">
          <div className="bg-[#121A20] text-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-neutral-700 shadow-2xl flex flex-col gap-6 relative">
            {/* Paystack header banner */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#08A0A0] flex items-center justify-center font-bold text-white tracking-widest text-sm font-mono select-none">
                  p
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-none text-white tracking-wide">Secure Checkout</h4>
                  <p className="text-[9px] text-neutral-400 mt-1">powered by Paystack</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block font-semibold uppercase">PAYABLE</span>
                <span className="text-xs font-black text-white numeric-tabular font-mono">
                  ₦{(activeCreatedOrder.totalKobo / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error notifications inside gateway */}
            {paymentProcessing ? (
              <div className="text-center py-6 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#08A0A0] animate-spin" />
                <div>
                  <p className="text-xs font-bold text-white">Authorizing Transaction...</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">Contacting campus bank verification nodes. Do not refresh.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] text-neutral-400 leading-relaxed text-center bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  This is a secure <strong>Meal Direct interactive simulator</strong>. Fill inputs or double click buttons below to test redirection. No real debit card debits occur.
                </p>

                {/* Cards styling form */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[8px] font-bold text-neutral-400 block mb-1 uppercase">CARD NUMBER</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="5061 2234 5567 8901 (Verve / Naira)"
                      value={cardNumber}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        // Chunk 4 format
                        let chunks = v.match(/.{1,4}/g);
                        setCardNumber(chunks ? chunks.join(' ') : v);
                      }}
                      className="w-full bg-[#1A2228] border border-neutral-800 focus:border-[#08A0A0] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-bold text-neutral-400 block mb-1 uppercase">EXPIRY DATE</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) {
                            setCardExpiry(v.slice(0, 2) + '/' + v.slice(2, 4));
                          } else {
                            setCardExpiry(v);
                          }
                        }}
                        className="w-full bg-[#1A2228] border border-neutral-800 focus:border-[#08A0A0] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-neutral-400 block mb-1 uppercase">CVV SECURITY</label>
                      <input
                        type="password"
                        maxLength={3}
                        placeholder="112"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#1A2228] border border-neutral-800 focus:border-[#08A0A0] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handlePaystackSuccess}
                    className="w-full py-3 bg-[#3fbeae] hover:bg-[#329e92] text-white font-bold text-xs rounded-xl transition cursor-pointer text-center shadow"
                    id="mock_payment_success"
                  >
                    Simulate Payment Success (Webhook Approved)
                  </button>

                  <button
                    type="button"
                    onClick={handlePaystackFail}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 font-semibold text-xs rounded-xl transition cursor-pointer text-center"
                    id="mock_payment_cancel"
                  >
                    Cancel checkout selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </dialog>
      )}
    </AppShell>
  );
};
