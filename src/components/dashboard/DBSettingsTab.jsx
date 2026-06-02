import { useHotel } from '../../context/HotelContext'

export default function DBSettingsTab() {
  const { settings, updateSettings, addToast, lockSystem, logout } = useHotel()

  function handleInstantToggle(checked) {
    updateSettings({ instantConfirmation: checked })
    addToast('Booking settings updated successfully!')
  }

  function handleThemeChange(theme) {
    updateSettings({ theme })
    addToast(`Theme changed to ${theme === 'dark' ? 'Dark' : 'Light'} Mode`)
  }

  return (
    <div className="db-card" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', marginTop: '24px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-primary)' }}>Settings</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Direct Booking Engine
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            Configure how reservations from your public booking portal are handled.
          </p>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: '44px', height: '24px' }}>
              <input 
                type="checkbox" 
                name="instantConfirm"
                checked={settings.instantConfirmation}
                onChange={e => handleInstantToggle(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: settings.instantConfirmation ? 'var(--status-available)' : 'var(--border)',
                borderRadius: '12px', transition: '0.3s'
              }}>
                <div style={{
                  position: 'absolute', top: '2px', left: settings.instantConfirmation ? '22px' : '2px',
                  width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s'
                }} />
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Instant Confirmation</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {settings.instantConfirmation 
                  ? 'Bookings are instantly confirmed and added to the master calendar.' 
                  : 'Bookings require manual approval before being confirmed.'}
              </div>
            </div>
          </label>
        </div>

        <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Appearance
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            Choose your preferred interface theme.
          </p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', background: settings.theme !== 'dark' ? 'var(--brand-light)' : 'var(--surface)', borderRadius: '6px', border: `1px solid ${settings.theme !== 'dark' ? 'var(--brand-action)' : 'var(--border)'}` }}>
              <input 
                type="radio" 
                name="theme" 
                value="light" 
                checked={settings.theme !== 'dark'} 
                onChange={() => handleThemeChange('light')}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Light Mode ☀️</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', background: settings.theme === 'dark' ? 'var(--brand-light)' : 'var(--surface)', borderRadius: '6px', border: `1px solid ${settings.theme === 'dark' ? 'var(--brand-action)' : 'var(--border)'}` }}>
              <input 
                type="radio" 
                name="theme" 
                value="dark" 
                checked={settings.theme === 'dark'} 
                onChange={() => handleThemeChange('dark')}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Dark Mode 🌙</span>
            </label>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Security
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            Manage session access for this device.
          </p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={lockSystem}
              style={{ padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔒 Lock Screen
            </button>
            <button 
              onClick={logout}
              style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #ef5350', borderRadius: '6px', color: '#ef5350', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
