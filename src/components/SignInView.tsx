import React, { useState, useEffect } from 'react';
import { useMealDirect } from '../store';
import { AppShell, GlassPanel } from './CommonUI';
import { ShieldCheck, ArrowRight, Loader2, Landmark, GraduationCap } from 'lucide-react';

export const SignInView: React.FC = () => {
  const { user, signIn, navigateTo } = useMealDirect();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated and onboarded, push home
    if (user) {
      if (user.isOnboarded) {
        navigateTo('/home');
      } else {
        navigateTo('/onboarding');
      }
    }
  }, [user]);

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    setErrorText(null);
    
    // Simulate redirection delay to Google Authentication Servers
    setTimeout(() => {
      setIsRedirecting(false);
      signIn(); // calls store.signIn which goes to callback
    }, 1200);
  };

  const handleMockCancel = () => {
    setIsRedirecting(false);
    setErrorText('Google sign-in attempt was cancelled by student.');
  };

  return (
    <AppShell activeTab="none">
      <div className="max-w-md mx-auto py-12" id="auth_signin_container">
        <GlassPanel className="p-8 border-t-4 border-t-emerald-deep relative overflow-hidden">
          {/* Subtle branding backgrounds */}
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-32 h-32 bg-emerald-deep/5 rounded-full" />
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-strong to-emerald-deep flex items-center justify-center text-white shadow font-display font-black text-2xl mx-auto mb-4 border border-emerald-deep/12">
              M
            </div>
            <h2 className="font-display text-2xl font-black text-emerald-strong">Student Sign In</h2>
            <p className="text-xs text-muted-grey mt-1">Authenticate securely matching Venite credentials</p>
          </div>

          {errorText && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-danger font-semibold flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-danger rotate-180" />
              <span>{errorText}</span>
            </div>
          )}

          {isRedirecting ? (
            <div className="text-center py-6 flex flex-col items-center justify-center gap-4" id="redirecting_state">
              <Loader2 className="w-8 h-8 text-emerald-deep animate-spin" />
              <div>
                <p className="text-xs font-bold text-emerald-strong">Contacting Google OAuth Server...</p>
                <p className="text-[10px] text-muted-grey mt-0.5">Please wait while we establish a secure session session token API.</p>
              </div>
              <button
                onClick={handleMockCancel}
                className="mt-4 text-xs font-semibold text-danger bg-red-50 border border-red-100 hover:bg-red-100 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Cancel Redirect
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6" id="signin_choices">
              {/* Material styled Google action */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-4.5 px-4 bg-white hover:bg-neutral-50 text-ink-deep border border-emerald-deep/15 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm hover:shadow hover:scale-[1.01] active:scale-95 cursor-pointer"
                id="google_signin_btn"
              >
                {/* Standard custom Google multi-color G icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.06-1.11-.13-1.19-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with student Google Account</span>
              </button>

              <div className="flex items-center gap-2 text-[10px] text-muted-grey bg-emerald-deep/5 p-3.5 rounded-2xl border border-emerald-deep/8">
                <Landmark className="w-5 h-5 text-emerald-deep shrink-0" />
                <span>
                  <strong>Strict Security:</strong> Only registered student emails ending in <code>*.uniedu.ng</code> or official <code>*venite.edu.ng</code> affiliates are permitted entries.
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-emerald-deep/8 flex items-center justify-between text-[11px] text-muted-grey">
            <button
              onClick={() => navigateTo('/')}
              className="hover:underline hover:text-emerald-strong cursor-pointer"
            >
              Back to Landing
            </button>
            <a href="https://mealdirect.com/terms" className="hover:underline">Legal terms</a>
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
};
