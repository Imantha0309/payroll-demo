export default function Dashboard() {
  return (
    <div style={{
      padding: '2rem',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      textAlign: 'center',
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 800,
        color: '#009448',
        margin: 0
      }}>
        This is Payroll dashboard
      </h1>
      <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '1.1rem' }}>
        Welcome to the payroll application control panel.
      </p>
    </div>
  );
}
