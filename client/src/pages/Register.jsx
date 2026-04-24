import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { setCredentials } from '../store/authSlice';
import { User, Mail, Lock, Phone, AlertCircle, Loader, CheckCircle, ShieldCheck } from 'lucide-react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

const Register = () => {
  const [step, setStep] = useState(1); // 1: form, 2: email OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  if (isAuthenticated) { navigate('/'); return null; }

  // Handle Google redirect result (for mobile)
  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result && result.user) {
        const idToken = await result.user.getIdToken();
        const response = await api.post('/auth/firebase', { idToken });
        dispatch(setCredentials(response.data));
        navigate('/');
      }
    }).catch(err => console.error('Redirect error:', err));
  }, []);

  const handleSendEmailOtp = async () => {
    if (!email) return setError('Please enter your email first');
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/send-email-otp', { email });
      setOtpSent(true);
      setSuccess('OTP sent! Check your backend terminal for the code.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOtp) return setError('Please enter the email OTP');
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password, phone, emailOtp });
      dispatch(setCredentials(response.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await api.post('/auth/firebase', { idToken });
      dispatch(setCredentials(response.data));
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 mt-2">
      <div className="bg-dark-800 p-8 rounded-2xl shadow-2xl border border-dark-700 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-primary-500"></div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center gap-1.5 text-sm font-medium ${step >= 1 ? 'text-cyan-400' : 'text-gray-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${step >= 1 ? 'border-cyan-400 bg-cyan-400/20' : 'border-gray-600'}`}>1</div>
            Details
          </div>
          <div className={`flex-1 h-px ${step >= 2 ? 'bg-cyan-400' : 'bg-dark-600'}`}></div>
          <div className={`flex items-center gap-1.5 text-sm font-medium ${step >= 2 ? 'text-cyan-400' : 'text-gray-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${step >= 2 ? 'border-cyan-400 bg-cyan-400/20' : 'border-gray-600'}`}>2</div>
            Verify Email
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><User size={18} /></span>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white transition-colors"
                    placeholder="Anas Khan" />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Mail size={18} /></span>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white transition-colors"
                    placeholder="you@example.com" />
                </div>
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number <span className="text-cyan-400 text-xs">(for Phone Login)</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Phone size={18} /></span>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white transition-colors"
                    placeholder="9876543210" maxLength={10} />
                </div>
                <p className="text-xs text-gray-500 mt-1">10-digit number without country code</p>
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Lock size={18} /></span>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white transition-colors"
                    placeholder="••••••••" />
                </div>
              </div>

              <button onClick={handleSendEmailOtp} disabled={loading || !email || !name || !phone || !password}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-2">
                {loading ? <Loader size={20} className="animate-spin" /> : <><ShieldCheck size={18} /> Verify Email & Continue</>}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-600"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-dark-800 text-gray-400">Or register with</span></div>
              </div>
              <div className="mt-4">
                <button onClick={handleGoogleLogin} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail size={28} className="text-cyan-400" />
              </div>
              <p className="text-gray-300 text-sm">We've sent a 6-digit OTP to</p>
              <p className="text-white font-semibold">{email}</p>
              <p className="text-xs text-amber-400 mt-1">⚠️ Check your backend terminal for OTP</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Enter OTP</label>
              <input type="text" required value={emailOtp} onChange={e => setEmailOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white transition-colors text-center tracking-[0.5em] font-bold text-xl"
                placeholder="------" />
            </div>

            <button type="submit" disabled={loading || emailOtp.length < 6}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
              {loading ? <Loader size={20} className="animate-spin" /> : <><CheckCircle size={18} /> Complete Registration</>}
            </button>

            <button type="button" onClick={() => { setStep(1); setError(null); setSuccess(null); setEmailOtp(''); }}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors">
              ← Go back
            </button>

            <button type="button" onClick={handleSendEmailOtp} disabled={loading}
              className="w-full text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              Resend OTP
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
