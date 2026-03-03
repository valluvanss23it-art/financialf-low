export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px'
      }}>
        <h1 style={{ 
          color: '#667eea', 
          fontSize: '48px', 
          margin: '0 0 20px 0',
          fontWeight: 'bold'
        }}>
          ✅ Success!
        </h1>
        <p style={{ 
          color: '#333', 
          fontSize: '20px', 
          marginBottom: '10px',
          fontWeight: '600'
        }}>
          financeflow
        </p>
        <p style={{ 
          color: '#666', 
          fontSize: '16px', 
          marginBottom: '30px'
        }}>
          Frontend + Backend Connected ✨
        </p>
        
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
            🟢 React: Working
          </p>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
            🟢 Vite: Running
          </p>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
            🟢 Port: 8081
          </p>
        </div>

        <button 
          onClick={() => window.location.href = '/auth'}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Continue to App →
        </button>
      </div>
    </div>
  );
}

