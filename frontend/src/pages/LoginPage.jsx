import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestLoginCode, login } = useAuth();
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestLoginCode(email);
      setStep(2);
      setError('');
    } catch (err) {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, otp);
      navigate('/');
    } catch (err) {
      setError('Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell auth-shell">
      <div className="auth-layout">
        <div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            A calm space for peers to listen, reflect, and connect. Stay anonymous, stay kind.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--textMuted)' }}>
            <div>
              <strong className="auth-highlight">TokyoNight</strong> inspired UI for easy reading.
            </div>
            <div>Secure OTP sign-in, no passwords to remember.</div>
          </div>
        </div>

        <Card className="auth-card">
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Sign in</h2>
          {error && (
            <div className="notice is-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Sending...' : 'Send Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--textMuted)', margin: 0 }}>
                Code sent to <strong>{email}</strong>
              </p>
              <Input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter code"
                required
                className="code-input"
              />
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Verifying...' : 'Sign In'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Use a different email
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
