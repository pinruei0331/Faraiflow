
import React, { useState } from 'react';
import { UIContent, UserAccount } from '../types';
import { login, signup } from '../services/auth';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  ui: UIContent;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ ui, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setError(ui.fieldRequired);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await login(formData.email, formData.password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError(ui.authError);
        }
      } else {
        const result = await signup(formData.name, formData.email, formData.password);
        if ('error' in result) {
           setError(result.error === 'User already exists' ? 'User already exists' : result.error);
        } else {
           onLoginSuccess(result);
        }
      }
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      
      {/* Decorative Background Elements (Iran Flag colors) */}
      <div className="absolute top-0 left-0 w-full h-2 bg-green-700" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-red-600" />

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-green-600 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-700 rounded-full mb-4 shadow-sm border border-green-100">
             <span className="font-farsi text-4xl font-bold pt-2">ف</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{ui.title}</h1>
          <p className="text-slate-500">{isLogin ? ui.loginTitle : ui.signupTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{ui.nameLabel}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-slate-50"
                placeholder="Your Name"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{ui.emailLabel}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-slate-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{ui.passwordLabel}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-slate-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg text-sm border border-red-200">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" /> {ui.loginBtn}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> {ui.signupBtn}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '' });
            }}
            className="text-red-600 hover:text-red-800 text-sm font-bold transition-colors hover:underline"
          >
            {isLogin ? ui.switchNoAccount : ui.switchHasAccount}
          </button>
        </div>
      </div>
    </div>
  );
};
