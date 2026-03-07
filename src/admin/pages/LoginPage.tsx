// ============================================================================
// LOGIN PAGE - Admin login with InsForge authentication
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/hooks';
import { getInsforgeClient } from '@/lib/insforge/client';

type LoginStep = 'login' | 'verify' | 'create';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [step, setStep] = useState<LoginStep>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: 'samwa85@gmail.com',
    password: 'qwerty7890@',
    otp: '',
    rememberMe: false,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string })?.from || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Login] Attempting sign in...', { email: formData.email });
      
      const { success: signInSuccess, error } = await signIn(formData.email, formData.password);
      
      console.log('[Login] Sign in result:', { success: signInSuccess, error: error?.message });
      
      if (!signInSuccess || error) {
        const errorMessage = error?.message || '';
        
        // Check if email verification is required
        if (errorMessage.includes('verification') || errorMessage.includes('verify')) {
          setStep('verify');
          setSuccess('Please check your email for a verification code, or click "Resend Code"');
        } else {
          setError(errorMessage || 'Invalid email or password');
        }
        return;
      }

      toast.success('Welcome back!');
      const from = (location.state as { from?: string })?.from || '/admin';
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.otp || formData.otp.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      const client = getInsforgeClient();
      console.log('[Login] Verifying email...', { email: formData.email, otp: formData.otp });
      
      const { data, error } = await client.auth.verifyEmail({
        email: formData.email,
        otp: formData.otp,
      });

      console.log('[Login] Verify result:', { data, error });

      if (error) {
        setError(error.message || 'Verification failed');
        return;
      }

      if (data?.accessToken) {
        toast.success('Email verified! Logging in...');
        // Try signing in again
        const { success: signInSuccess } = await signIn(formData.email, formData.password);
        if (signInSuccess) {
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const client = getInsforgeClient();
      console.log('[Login] Resending verification email...');
      
      const { data, error } = await client.auth.resendVerificationEmail({
        email: formData.email,
      });

      console.log('[Login] Resend result:', { data, error });

      if (error) {
        setError(error.message || 'Failed to resend code');
        return;
      }

      setSuccess('Verification code sent! Check your email.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const client = getInsforgeClient();
      console.log('[Login] Creating admin user...');
      
      const { data, error } = await client.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      console.log('[Login] Sign up result:', { data, error });

      if (error) {
        if (error.message?.includes('already') || error.message?.includes('exists')) {
          setError('Admin user already exists. Try signing in.');
        } else {
          setError('Failed to create admin: ' + error.message);
        }
        return;
      }

      // Check if email verification is required
      if (data?.requireEmailVerification) {
        setStep('verify');
        setSuccess('Admin created! Check your email for verification code.');
        
        // Set profile
        try {
          await client.auth.setProfile({
            nickname: 'Super Admin',
            bio: 'Recommend Her Administrator',
          });
        } catch {
          // Ignore profile errors
        }
        return;
      }

      // If no verification needed, try signing in
      if (data?.accessToken) {
        toast.success('Admin created and logged in!');
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      console.error('[Login] Create admin error:', err);
      setError('Failed to create admin. Check console.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Recommend Her</h1>
          <p className="text-muted-foreground mt-1">Admin Dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'login' && 'Sign In'}
              {step === 'verify' && 'Verify Email'}
              {step === 'create' && 'Create Admin'}
            </CardTitle>
            <CardDescription>
              {step === 'login' && 'Enter your credentials to access the admin dashboard'}
              {step === 'verify' && 'Enter the 6-digit code sent to your email'}
              {step === 'create' && 'Create the initial admin account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* LOGIN FORM */}
            {step === 'login' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-9"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-9 pr-10"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, rememberMe: checked === true }))
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
                  ) : (
                    <><>Sign In</><ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1" 
                    disabled={isLoading}
                    onClick={handleCreateAdmin}
                  >
                    Create Admin
                  </Button>
                </div>
              </form>
            )}

            {/* VERIFY FORM */}
            {step === 'verify' && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Verification code sent to:<br />
                    <strong>{formData.email}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={formData.otp}
                    onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1" 
                    disabled={isLoading}
                    onClick={handleResendCode}
                  >
                    Resend Code
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    disabled={isLoading}
                    onClick={() => setStep('login')}
                  >
                    Back
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Back to site */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Button variant="link" className="p-0" onClick={() => navigate('/')}>
            ← Back to website
          </Button>
        </p>
      </div>
    </div>
  );
}
