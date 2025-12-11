export default function Home() {
  return (
    <div style={{ 
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
      background: 'black',
      color: 'white'
    }}>
      <h1>Tsunami Portal</h1>
      <a href="/login" style={{ padding: 10, background: 'red' }}>Login</a>
      <a href="/signup" style={{ padding: 10, background: 'gray' }}>Signup</a>
    </div>
  );
}
