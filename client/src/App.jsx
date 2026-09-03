import { useState } from 'react';

const GOOGLE_FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL;

export default function App() {
  const [state, setState] = useState('idle');
  const [ip, setIp] = useState('');
  const [error, setError] = useState('');

  async function checkNetwork() {
    setState('loading');
    setError('');
    setIp('');

    try {
      const response = await fetch('/api/check-ip', { headers: { Accept: 'application/json' } });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'We could not verify your network.');

      setIp(result.ip || 'Unavailable');
      setState(result.allowed ? 'allowed' : 'denied');
    } catch (requestError) {
      setError(requestError.message || 'We could not verify your network. Please try again.');
      setState('error');
    }
  }

  function openForm() {
    if (!GOOGLE_FORM_URL) {
      setError('The attendance form has not been configured. Please contact an administrator.');
      setState('error');
      return;
    }
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
  }

  const checking = state === 'loading';

  return (
    <main className="page-shell">
      <section className="attendance-card" aria-labelledby="page-title">
        <div className="brand">
          <div className="logo" aria-label="Organization logo placeholder">OA</div>
          <span>Organization Name</span>
        </div>

        <div className="hero-icon" aria-hidden="true">⌁</div>
        <p className="eyebrow">EMPLOYEE PORTAL</p>
        <h1 id="page-title">Employee Attendance</h1>
        <p className="intro">Please make sure you are connected to the organization&apos;s Wi-Fi before submitting attendance.</p>

        <div className="network-note">
          <span aria-hidden="true">◒</span>
          <span>Network verification required</span>
        </div>

        {state === 'idle' && (
          <button className="primary-button" onClick={checkNetwork}>Apply Attendance <span aria-hidden="true">→</span></button>
        )}

        {checking && (
          <div className="status loading" role="status">
            <span className="spinner" aria-hidden="true" />
            <div><strong>Checking your network</strong><p>Please wait while we verify your public IP address.</p></div>
          </div>
        )}

        {state === 'allowed' && (
          <div className="status success" role="status">
            <span className="status-icon" aria-hidden="true">✓</span>
            <div><strong>You are connected to the authorized network.</strong><p>Verified public IP: <code>{ip}</code></p></div>
          </div>
        )}

        {state === 'denied' && (
          <div className="status denied" role="alert">
            <span className="status-icon" aria-hidden="true">!</span>
            <div><strong>Access denied.</strong><p>Please connect to the organization&apos;s Wi-Fi and try again.</p><p className="detected-ip">Detected IP: <code>{ip}</code></p></div>
          </div>
        )}

        {state === 'error' && (
          <div className="status denied" role="alert">
            <span className="status-icon" aria-hidden="true">!</span>
            <div><strong>Network check unavailable.</strong><p>{error}</p></div>
          </div>
        )}

        {(state === 'denied' || state === 'error') && <button className="secondary-button" onClick={checkNetwork}>Try again</button>}
        {state === 'allowed' && <button className="primary-button" onClick={openForm}>Continue to Attendance Form <span aria-hidden="true">↗</span></button>}
        <p className="privacy">Your IP address is checked for access control and is not stored.</p>
      </section>
    </main>
  );
}
