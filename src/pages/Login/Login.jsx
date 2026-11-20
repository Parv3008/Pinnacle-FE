import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema } from './login.schema.js';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';

export default function Login() {
  const { user, loading, login, loggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader label="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await login(values);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Login failed');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.35),_transparent_45%)]" />
        <div className="relative">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5">
              <img
                src="/pinnacle-logo.png"
                alt="Pinnacle Recruitment"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Pinnacle Recruitment</p>
              <p className="text-sm text-slate-400">Elevating Potential</p>
            </div>
          </div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight text-white">
            Manage companies, job profiles, candidates and hiring in one place.
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            Secure admin access for recruitment teams to track openings, referrals and joining
            outcomes with complete auditability.
          </p>
        </div>
        <p className="relative text-sm text-slate-500">Authorized administrators only</p>
      </div>

      <div className="flex items-center justify-center bg-surface px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-200">
              <img
                src="/pinnacle-logo.png"
                alt="Pinnacle Recruitment"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Pinnacle Recruitment</h1>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Admin Login</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in with your administrator credentials</p>

          {location.state?.sessionExpired && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Your session expired. Please log in again.
            </div>
          )}

          {formError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" className="w-full" loading={loggingIn}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
