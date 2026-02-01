import { type FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, Car, ArrowRight, Shield } from 'lucide-react';
import { Button, Input, Container } from '@components/ui';
import { authService } from '@services/authService';

/**
 * Normalize Philippine phone number to international format
 */
const normalizePhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('0')) {
    return '+63' + digits.slice(1);
  }
  
  if (digits.startsWith('63')) {
    return '+' + digits;
  }
  
  if (phone.startsWith('+')) {
    return phone;
  }
  
  return '+63' + digits;
};

/**
 * Admin Login page component - matches landing page design
 */
export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string; general?: string }>({});

  // Load remembered credentials on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('admin_remembered_phone');
    const savedRemember = localStorage.getItem('admin_remember_me') === 'true';
    if (savedPhone && savedRemember) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      // Normalize phone number to international format
      const normalizedPhone = normalizePhoneNumber(phone);
      const { user, error } = await authService.loginWithPhone(normalizedPhone, password);

      if (error || !user) {
        setErrors({ general: error || 'Invalid phone number or password' });
        return;
      }

      // Check if user is admin
      if (user.role !== 'admin' && user.role !== 'staff') {
        setErrors({ general: 'Access denied. Admin credentials required.' });
        await authService.logout();
        return;
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('admin_remembered_phone', phone);
        localStorage.setItem('admin_remember_me', 'true');
      } else {
        localStorage.removeItem('admin_remembered_phone');
        localStorage.removeItem('admin_remember_me');
      }

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An error occurred during login. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')]" />
      </div>

      {/* Red Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-primary-600/10 to-transparent" />

      <Container className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30">
                <Car className="h-9 w-9 text-white" />
              </div>
              <span className="font-bold text-2xl text-white tracking-wide">
                AR CAR RENTAL SERVICES
              </span>
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Admin{' '}
              <span className="text-primary-500">Portal</span>
            </h1>
            
            <p className="text-neutral-400 text-lg mb-8 max-w-md">
              Manage your fleet, bookings, and business operations from a single dashboard.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-neutral-300">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-500" />
                </div>
                <span>Secure admin access</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary-500" />
                </div>
                <span>Fleet management</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary-500" />
                </div>
                <span>Protected dashboard</span>
              </div>
            </div>

            {/* Admin Illustration */}
            <div className="mt-12 relative">
              <div className="absolute -top-10 -right-10 w-[400px] h-[250px] bg-gradient-to-br from-primary-600/30 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary-600/20 to-neutral-800 flex items-center justify-center border border-neutral-700">
                  <Shield className="h-24 w-24 text-primary-500/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary-600 shadow-lg">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <span className="font-bold text-xl text-white tracking-wide">
                  AR CAR RENTAL SERVICES
                </span>
              </Link>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
              {/* Admin Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-semibold text-primary-600">Admin Access Only</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
                  Admin Login
                </h2>
                <p className="text-neutral-500">
                  Enter your credentials to continue
                </p>
              </div>

              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="09773259391"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="h-5 w-5 text-neutral-400" />}
                    error={errors.phone}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-5 w-5 text-neutral-400" />}
                      error={errors.password}
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-neutral-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  className="h-12 text-base font-semibold bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/30"
                  isLoading={isLoading}
                >
                  {!isLoading && (
                    <>
                      Sign In to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-neutral-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default LoginPage;
