import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Mail, Lock, Phone, User } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import Banner from '@/components/Banner';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (name.trim().length < 2 || name.trim().length > 100) {
      return 'Name must be between 2 and 100 characters.';
    }
    if (password.length < 6 || password.length > 20) {
      return 'Password must be between 6 and 20 characters.';
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return 'Phone number must be exactly 10 digits.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email, password, phone });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-paper-100/40 px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-paper-50 border border-paper-300/60 rounded-2xl shadow-sm p-8 sm:p-9"
      >
        <div className="flex flex-col items-center mb-7">
          <span className="w-11 h-11 rounded-full bg-meridian-900 flex items-center justify-center text-brass-300 mb-4">
            <Compass className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-2xl text-paper-950">Create your account</h1>
          <p className="text-sm text-paper-700 mt-1">Takes a minute — then you're ready to book.</p>
        </div>

        {error && (
          <div className="mb-5">
            <Banner variant="error">{error}</Banner>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field icon={User} label="Full name" type="text" value={name} onChange={setName} autoComplete="name" />
          <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          <Field
            icon={Phone}
            label="Phone (10 digits)"
            type="tel"
            value={phone}
            onChange={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 10))}
            autoComplete="tel"
          />
          <Field
            icon={Lock}
            label="Password (6–20 characters)"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-meridian-900 hover:bg-meridian-800 disabled:opacity-60 text-paper-50 font-semibold rounded-lg transition-colors mt-2"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-paper-700 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-meridian-800 font-semibold hover:text-meridian-900">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, type, value, onChange, autoComplete }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-paper-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className="w-full pl-10 pr-3 py-2.5 border border-paper-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brass-400 text-paper-900 text-sm"
        />
      </div>
    </div>
  );
}
