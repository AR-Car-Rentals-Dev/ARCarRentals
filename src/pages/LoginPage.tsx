import { type FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@services/authService';

/**
 * Admin Login page component - Premium split-screen design
 */
export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('admin_remembered_email');
    const savedRemember = localStorage.getItem('admin_remember_me') === 'true';
    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const { user, error } = await authService.login(email, password);

      if (error || !user) {
        setErrors({ general: error || 'Invalid email or password' });
        return;
      }

      // Check if user is admin or staff
      if (user.role !== 'admin' && user.role !== 'staff') {
        setErrors({ general: 'Access denied. Admin credentials required.' });
        await authService.logout();
        return;
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('admin_remembered_email', email);
        localStorage.setItem('admin_remember_me', 'true');
      } else {
        localStorage.removeItem('admin_remembered_email');
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
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Column - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Premium Car Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2564&auto=format&fit=crop')`,
          }}
        >
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/ARCarRentals.png" 
              alt="AR Car Rentals" 
              className="h-16 w-auto"
            />
          </div>

          {/* Admin Text */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Admin<br />
              Dashboard<br />
            </h1>
            <p className="text-lg text-white/90 leading-relaxed mb-4">
              Mag-login para makita ang inyong vehicles, bookings, at customers.
            </p>
            <p className="text-base text-white/80">
              Secure at protektado ang lahat ng admin data.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[32rem] px-4">
          {/* Logo - Centered */}
          <div className="flex justify-center mb-8">
            <img 
              src="/ARCarRentals.png" 
              alt="AR Car Rentals" 
              className="h-40 w-auto"
            />
          </div>

          {/* Welcome Back Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">WELCOME BACK!</h2>
            <p className="text-gray-600 text-base">Please enter your details.</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-base">
              {errors.general}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-base ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 text-base [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                  }`}
                  style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#EF4444] focus:ring-[#EF4444] focus:ring-offset-0"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-[#EF4444] hover:text-[#DC2626] font-medium transition-colors"
              >
                Forgot password
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          

          {/* Back to Home - Mobile */}
          <div className="mt-6 text-center lg:hidden">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
