import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Phone, KeyRound, Loader, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { setCredentials } from '../store/authSlice';
import { toast } from 'react-toastify';

const PhoneAuthModal = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: phone, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    // Format phone number if needed (Firebase requires E.164 format, e.g. +91...)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/send-otp', { phone: formattedPhone });
      setStep(2);
      toast.success("OTP sent to your phone!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send OTP. Check phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError(null);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const response = await api.post('/auth/verify-otp', { phone: formattedPhone, otp });
      
      dispatch(setCredentials(response.data));
      onClose();
      toast.success("Successfully logged in with Phone!");
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid OTP or verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Phone size={20} className="text-cyan-400" /> Phone Login
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 flex items-start gap-2 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Phone size={18} /></span>
                  <input 
                    type="tel" 
                    required 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white transition-colors"
                    placeholder="+91 9876543210" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Include country code (e.g. +91 for India)</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {loading ? <Loader size={20} className="animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Enter OTP</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><KeyRound size={18} /></span>
                  <input 
                    type="text" 
                    required 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white transition-colors text-center tracking-[0.5em] font-bold text-lg"
                    placeholder="------" 
                    maxLength={6}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || otp.length < 6}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {loading ? <Loader size={20} className="animate-spin" /> : 'Verify OTP'}
              </button>
              
              <button 
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(null); }}
                className="w-full text-sm text-gray-400 hover:text-white mt-2"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneAuthModal;
