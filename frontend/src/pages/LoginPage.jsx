import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import SupportPanel from '../components/login/SupportPanel';
import { CommunityRulesModal } from '../components/login/CommunityRulesModal';

const badgeLabels = ['Ẩn danh', 'Không mật khẩu', 'Tôn trọng'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState('email');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const { requestLoginCode, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setInterval(() => setCountdown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendCode = async () => {
    if (!email) {
      setError('Nhập email để tiếp tục.');
      return;
    }
    setRequesting(true);
    setError('');
    try {
      await requestLoginCode(email);
      setPhase('code');
      setStatus('Mã xác thực đã được gửi. Hãy kiểm tra email.');
      setCountdown(60);
    } catch (err) {
      setError('Không thể gửi mã OTP, vui lòng thử lại.');
    } finally {
      setRequesting(false);
    }
  };

  const handleRequest = (event) => {
    event.preventDefault();
    sendCode();
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setVerifying(true);
    setError('');
    try {
      await login(email, otp);
      navigate('/');
    } catch (err) {
      setError('Mã xác thực không hợp lệ.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    sendCode();
  };

  const handleChangeEmail = () => {
    setPhase('email');
    setOtp('');
    setStatus('');
    setError('');
  };

  const cooldownLabel = useMemo(() => (countdown > 0 ? `Gửi lại trong ${countdown}s` : 'Gửi lại'), [countdown]);

  return (
    <div className="app-shell auth-shell">
      <div className="login-grid">
        <SupportPanel />
        <Card className="login-panel">
          <div>
            <p className="login-title">DearPeer</p>
            <p className="login-subtitle">
              Không gian im lặng, an toàn để chia sẻ áp lực đồng trang lứa.
            </p>
          </div>

          <form onSubmit={phase === 'email' ? handleRequest : handleVerify} className="login-form">
            {error && (
              <div className="notice is-error" role="alert">
                {error}
              </div>
            )}
            {status && !error && (
              <div className="status-message" role="status">
                {status}
              </div>
            )}

            {phase === 'email' && (
              <>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email của bạn"
                  required
                  autoComplete="email"
                  aria-label="Email"
                  autoFocus
                />
                <Button type="submit" variant="primary" size="lg" disabled={requesting}>
                  {requesting ? 'Đang gửi...' : 'Gửi mã'}
                </Button>
              </>
            )}

            {phase === 'code' && (
              <>
                <div className="helpers">
                  Mã đã gửi đến <strong>{email}</strong>. Nếu chưa thấy mã, kiểm tra Spam hoặc thư mục chính.
                </div>
                <Input
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\s+/g, '').slice(0, 6))}
                  placeholder="Mã 6 số"
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  className="otp-code-input"
                  aria-label="Mã OTP"
                  autoFocus
                />
                <div className="login-actions">
                  <Button type="submit" variant="primary" size="lg" disabled={verifying}>
                    {verifying ? 'Đang xác thực...' : 'Xác thực'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleChangeEmail}
                    disabled={verifying}
                  >
                    Đổi email
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResend}
                    disabled={requesting || countdown > 0}
                  >
                    {cooldownLabel}
                  </Button>
                </div>
                <p className="helpers">Nếu chưa thấy mã, có thể bạn cần đợi vài phút hoặc thử tải lại mail.</p>
              </>
            )}
          </form>

          <div className="trust-strip">
            {badgeLabels.map((label) => (
              <span key={label} className="trust-badge">
                {label}
              </span>
            ))}
            <button type="button" className="trust-link" onClick={() => setRulesOpen(true)}>
              Quy tắc cộng đồng
            </button>
          </div>
        </Card>
      </div>

      <CommunityRulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
