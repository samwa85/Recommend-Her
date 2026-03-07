// ============================================================================
// SETUP ADMIN PAGE - One-time page to create the initial admin user
// Delete this file after admin is created
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInsforgeClient } from '@/lib/insforge/client';

const ADMIN_EMAIL = 'admin@recommendher.africa';
const ADMIN_PASSWORD = 'qwerty7890@';

export default function SetupAdminPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const createAdmin = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const client = getInsforgeClient();
      
      // Sign up the admin user
      const { data, error } = await client.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (error) {
        // Check if user already exists
        if (error.message?.includes('already') || error.message?.includes('exists')) {
          setResult({ 
            success: true, 
            message: 'Admin user already exists. You can log in now.' 
          });
          return;
        }
        
        setResult({ 
          success: false, 
          message: error.message || 'Failed to create admin user' 
        });
        return;
      }

      if (!data) {
        setResult({ 
          success: false, 
          message: 'No data returned from sign up' 
        });
        return;
      }

      // Set admin profile
      try {
        await client.auth.setProfile({
          nickname: 'Super Admin',
          bio: 'Recommend Her Administrator',
        });
      } catch {
        // Profile set failure is not critical
      }
      
      setResult({ 
        success: true, 
        message: `✅ Admin user created successfully!\n\nEmail: ${ADMIN_EMAIL}\nPassword: ${ADMIN_PASSWORD}` 
      });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setResult({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Recommend Her</h1>
          <p className="text-muted-foreground mt-1">Admin Setup</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Admin User</CardTitle>
            <CardDescription>
              This will create the initial admin account for the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Admin Credentials:</p>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Email:</span> {ADMIN_EMAIL}</p>
                <p><span className="text-muted-foreground">Password:</span> {ADMIN_PASSWORD}</p>
              </div>
            </div>

            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="whitespace-pre-line">
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={createAdmin} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                'Create Admin User'
              )}
            </Button>

            {result?.success && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/admin/login')}
              >
                Go to Login
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Delete this page after setup is complete
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
