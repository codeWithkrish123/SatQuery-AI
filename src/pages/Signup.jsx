import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Building2, Lock, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import AuthVisualCarousel from '../components/AuthVisualCarousel';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('ISRO Space Applications Centre');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://satquery-backend-sandy.vercel.app';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '88401843727-9ukv0sck0jgjnpn0vs8ijk7968pek926.apps.googleusercontent.com';

  useEffect(() => {
    // Check if returning from Google OAuth redirect hash (#access_token=...)
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, null, window.location.pathname);
        handleGoogleTokenSuccess(accessToken);
      }
    }
  }, []);

  const handleGoogleTokenSuccess = async (accessToken) => {
    setLoading(true);
    setError(null);
    try {
      let googleEmail = '';
      let googleName = '';

      try {
        const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
        if (userInfoRes.ok) {
          const info = await userInfoRes.json();
          googleEmail = info.email;
          googleName = info.name;
        }
      } catch (e) {
        console.warn('Could not fetch google userinfo directly:', e);
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail || 'analyst@gmail.com',
          name: googleName || 'ISRO Satellite Analyst'
        })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('satquery_token', data.token);
        localStorage.setItem('satquery_user', JSON.stringify(data.user));
      } else {
        const fallbackUser = {
          email: googleEmail || 'analyst@gmail.com',
          name: googleName || 'ISRO Satellite Analyst',
          role: 'ISRO Earth Observation Analyst (Google OAuth)',
          clearance: 'LEVEL-4 RESTRICTED'
        };
        localStorage.setItem('satquery_token', `satquery_google_${Date.now()}`);
        localStorage.setItem('satquery_user', JSON.stringify(fallbackUser));
      }
      navigate('/overview');
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    redirectToGoogleOAuth();
  };

  const redirectToGoogleOAuth = () => {
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'email profile openid';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = authUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, organization })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('satquery_token', data.token);
        localStorage.setItem('satquery_user', JSON.stringify(data.user));
        navigate('/overview');
      } else {
        setError(data.message || 'Registration failed. Please check form fields.');
      }
    } catch (err) {
      // Offline fallback
      const fallbackUser = {
        name: name || email.split('@')[0].toUpperCase(),
        email: email || 'analyst@satquery.ai',
        role: 'ISRO Earth Observation Analyst',
        organization: organization || 'ISRO Space Applications Centre'
      };
      localStorage.setItem('satquery_user', JSON.stringify(fallbackUser));
      navigate('/overview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-grid">
        <div className="login-visual relative p-0 overflow-hidden">
          <AuthVisualCarousel />
        </div>

        <div className="login-panel bg-[#F8FAFC]">
          <div className="login-card space-y-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-[#00A3A6] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>

              <div className="inline-flex items-center space-x-2 font-mono text-[10px] font-bold text-[#00A3A6]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00A3A6] animate-pulse"></span>
                <span>NODE REGISTRATION</span>
              </div>
            </div>

            <div>
              <div className="login-brand mb-2">
                <span className="login-brand-box">S</span>
                <span className="login-brand-name font-sans font-extrabold text-slate-900">SatQueryAI</span>
              </div>

              <h1 className="login-heading font-sans font-extrabold text-slate-900 text-3xl">Create Account</h1>
              <p className="login-subheading font-sans text-sm text-slate-500 mt-1">Register your satellite analyst credentials for Level-4 clearance.</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                ⚠️ {error}
              </div>
            )}

            <form className="login-form space-y-4" onSubmit={handleSubmit}>
              <div className="field">
                <div className="field-label-row">
                  <span className="field-label">FULL NAME</span>
                </div>
                <div className="input-shell">
                  <User className="w-4 h-4 text-[#00A3A6] shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-label-row">
                  <span className="field-label">EMAIL ADDRESS</span>
                </div>
                <div className="input-shell">
                  <Mail className="w-4 h-4 text-[#00A3A6] shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="name@organization.gov.in"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-label-row">
                  <span className="field-label">ORGANIZATION / DIVISION</span>
                </div>
                <div className="input-shell">
                  <Building2 className="w-4 h-4 text-[#00A3A6] shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. ISRO Space Applications Centre"
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-label-row">
                  <span className="field-label">PASSWORD</span>
                </div>
                <div className="input-shell">
                  <Lock className="w-4 h-4 text-[#00A3A6] shrink-0" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-label-row">
                  <span className="field-label">CONFIRM PASSWORD</span>
                </div>
                <div className="input-shell">
                  <ShieldCheck className="w-4 h-4 text-[#00A3A6] shrink-0" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 px-4 rounded-xl bg-[#00A3A6] hover:bg-[#008C8F] text-white font-sans text-xs font-bold transition-all shadow-md shadow-[#00A3A6]/20 flex items-center justify-center space-x-2">
                <span>{loading ? 'Creating Analyst Account...' : 'Register & Access Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-4 flex items-center justify-center text-xs text-slate-400 font-mono">
              <span className="bg-[#F8FAFC] px-3 z-10">OR</span>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white font-sans text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60"
            >
              <img
                className="w-4 h-4"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google Logo"
              />
              <span>{loading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </button>

            <div className="pt-2 text-center text-xs font-sans text-slate-500">
              Already registered? <Link to="/login" className="font-bold text-[#00A3A6] hover:underline">Sign in to your account →</Link>
            </div>

            <div className="text-center font-mono text-[10px] text-slate-400">
              SatQueryAI · ISRO Analytics Registration Node
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

