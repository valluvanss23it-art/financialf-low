import { useEffect, useState } from 'react';

export default function App() {
  const [backendHealth, setBackendHealth] = useState<boolean>(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(() => setBackendHealth(true))
      .catch(() => setBackendHealth(false));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '10px'
      }}>
        <h1>✅ financeflow Ready!</h1>
        <p style={{ fontSize: '18px', marginTop: '10px' }}>
          Backend Status: {backendHealth ? '✅ Connected' : '❌ Not Connected'}
        </p>
        <button onClick={() => window.location.href = '/auth'} style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Go to Sign In
        </button>
      </div>
    </div>
  );
}

