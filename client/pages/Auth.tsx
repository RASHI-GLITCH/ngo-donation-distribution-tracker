import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationPermissionDialog } from '@/components/LocationPermissionDialog';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { register, login, role } = useAuth();
  const { requestLocationPermission, loading: locationLoading, error: locationError } = useLocation();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!role) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name, role);
      }
      setShowLocationDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationGranted = async () => {
    try {
      await requestLocationPermission();
      navigate('/dashboard');
    } catch (err) {
      console.warn('Location permission error:', err);
      navigate('/dashboard');
    }
  };

  const handleLocationDenied = () => {
    setShowLocationDialog(false);
    navigate('/');
  };

  const roleLabels: Record<UserRole, string> = {
    donor: 'Donor',
    ngo_admin: 'NGO Admin',
    app_admin: 'App Admin',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader>
          <CardTitle className="text-3xl">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Logging in as <span className="font-semibold text-slate-900">{roleLabels[role]}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              disabled={loading}
            >
              Change Role
            </button>
          </div>
        </CardContent>
      </Card>

      <LocationPermissionDialog
        open={showLocationDialog}
        onGranted={handleLocationGranted}
        onDenied={handleLocationDenied}
        isLoading={locationLoading}
        error={locationError}
      />
    </div>
  );
}
