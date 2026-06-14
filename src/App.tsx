/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MealDirectProvider, useMealDirect } from './store';
import { CallbackView } from './components/CallbackView';
import { OnboardingView } from './components/OnboardingView';
import { HomeView } from './components/HomeView';
import { VendorsView } from './components/VendorsView';
import { VendorDetailView } from './components/VendorDetailView';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { PaymentStatusView } from './components/PaymentStatusView';
import { OrdersView } from './components/OrdersView';
import { OrderDetailView } from './components/OrderDetailView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { OfflineView } from './components/OfflineView';

const RouteDispatcher: React.FC = () => {
  const { router, user } = useMealDirect();
  const { path, params } = router;

  // Onboard check guard: redirect onboard pending students to onboarding
  if (user && !user.isOnboarded && path !== '/onboarding') {
    return <OnboardingView />;
  }

  // Hash SPA routing map
  switch (path) {
    case '/':
      return <HomeView />;
    case '/onboarding':
      return <OnboardingView />;
    case '/home':
      return <HomeView />;
    case '/vendors':
      return <VendorsView />;
    case '/cart':
      return <CartView />;
    case '/checkout':
      return <CheckoutView />;
    case '/orders':
      return <OrdersView />;
    case '/notifications':
      return <NotificationsView />;
    case '/profile':
      return <ProfileView />;
    case '/offline':
      return <OfflineView />;
    default:
      // Dynamic routing switches
      if (path.startsWith('/vendors/') && params.vendorId) {
        return <VendorDetailView vendorId={params.vendorId} />;
      }
      if (path.startsWith('/payment/status/') && params.orderId) {
        return <PaymentStatusView orderId={params.orderId} />;
      }
      if (path.startsWith('/orders/') && params.orderId) {
        return <OrderDetailView orderId={params.orderId} />;
      }
      
      // Fallback
      return <HomeView />;
  }
};

export default function App() {
  return (
    <MealDirectProvider>
      <RouteDispatcher />
    </MealDirectProvider>
  );
}
