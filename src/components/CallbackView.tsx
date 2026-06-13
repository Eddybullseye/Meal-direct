import React, { useEffect, useState } from 'react';
import { useMealDirect } from '../store';
import { AppShell, GlassPanel } from './CommonUI';
import { Loader2, CheckCircle2, ShieldX } from 'lucide-react';

export const CallbackView: React.FC = () => {
  const { user, mockCallbackExchange, navigateTo } = useMealDirect();
  const [phase, setPhase] = useState<'exchanging' | 'profiling' | 'routing' | 'error'>('exchanging');
  const [errorStr, setErrorStr] = useState<string | null>(null);

  useEffect(() => {
    // 1. Exchange the code simulation
    const timerExchange = setTimeout(() => {
      try {
        mockCallbackExchange(); // logs user in as non-onboarded
        setPhase('profiling');
      } catch (err: any) {
        setPhase('error');
        setErrorStr('Failed to negotiate secure token state.');
      }
    }, 1500);

    return () => clearTimeout(timerExchange);
  }, []);

  useEffect(() => {
    if (phase === 'profiling' && user) {
      // 2. Profile Loaded successfully. Check onboarding status to route
      const timerRoute = setTimeout(() => {
        setPhase('routing');
        if (user.isOnboarded) {
          navigateTo('/home');
        } else {
          navigateTo('/onboarding');
        }
      }, 1000);

      return () => clearTimeout(timerRoute);
    }
  }, [phase, user]);

  return (
    <AppShell activeTab="none">
      <div className="max-w-md mx-auto py-16" id="callback_stage">
        <GlassPanel className="p-8 text-center border-t-4 border-t-mango-warm shadow-md">
          {phase === 'exchanging' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-emerald-deep animate-spin" />
              <div>
                <h3 className="font-display font-medium text-sm text-emerald-strong" id="callback_title">Exchanging OAuth Code...</h3>
                <p className="text-[10px] text-muted-grey mt-1">Negotiating validated auth token. Standby.</p>
              </div>
            </div>
          )}

          {phase === 'profiling' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-deep/10 text-emerald-strong flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-medium text-sm text-emerald-strong">Loading Student Profile...</h3>
                <p className="text-[10px] text-muted-grey mt-1">Authenticated Gbenga. Retrieving default preset location...</p>
              </div>
            </div>
          )}

          {phase === 'routing' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-mango-warm animate-spin" />
              <div>
                <h3 className="font-display font-medium text-sm text-emerald-strong">Setting Up Landing Workspace...</h3>
                <p className="text-[10px] text-muted-grey mt-1">Redirecting you to complete your meal schedules.</p>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex flex-col items-center gap-4" id="callback_error">
              <div className="w-10 h-10 rounded-full bg-red-100 text-danger flex items-center justify-center">
                <ShieldX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-medium text-sm text-danger">Callback Negotiating Failed</h3>
                <p className="text-[10px] text-muted-grey mt-1">{errorStr || 'Access was revoked or academic identity expired.'}</p>
              </div>
              <button
                onClick={() => navigateTo('/auth/sign-in')}
                className="mt-4 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Retry Sign-In
              </button>
            </div>
          )}
        </GlassPanel>
      </div>
    </AppShell>
  );
};
