import React from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'

const shellStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '32px 20px',
  background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
}

const cardStyle = {
  width: '100%',
  maxWidth: '640px',
  background: '#ffffff',
  border: '1px solid #dbe3ef',
  borderRadius: '24px',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
  padding: '40px 32px',
  textAlign: 'center',
}

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 14px',
  borderRadius: '999px',
  background: '#fff7ed',
  color: '#c2410c',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const titleStyle = {
  margin: '18px 0 12px',
  fontSize: 'clamp(32px, 5vw, 48px)',
  lineHeight: 1.1,
  color: '#0f172a',
}

const textStyle = {
  margin: '0 auto',
  maxWidth: '48ch',
  fontSize: '16px',
  lineHeight: 1.7,
  color: '#475569',
}

const actionsStyle = {
  marginTop: '28px',
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  flexWrap: 'wrap',
}

const primaryLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '148px',
  padding: '12px 18px',
  borderRadius: '999px',
  textDecoration: 'none',
  background: '#0f172a',
  color: '#ffffff',
  fontWeight: 600,
}

const secondaryLinkStyle = {
  ...primaryLinkStyle,
  background: '#ffffff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
}

const Maintenance = () => {
  const [details, setDetails] = React.useState({
    site_name: 'BookStore',
    support_email: '',
  })

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axiosClient.get('/settings/public')
        if (response.data?.success) {
          setDetails({
            site_name: response.data.data?.site_name || 'BookStore',
            support_email: response.data.data?.support_email || '',
          })
        }
      } catch (error) {
        console.error('Failed to load maintenance settings:', error)
      }
    }

    loadSettings()
  }, [])

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <span style={badgeStyle}>Temporarily Unavailable</span>
        <h1 style={titleStyle}>Under Maintenance</h1>
        <p style={textStyle}>
          {details.site_name} is being upgraded right now. Public access is temporarily paused, and
          only administrators can continue using the site until maintenance is complete.
        </p>

        {details.support_email ? (
          <p style={{ ...textStyle, marginTop: '14px', fontSize: '14px' }}>
            Need help? Contact <a href={`mailto:${details.support_email}`} style={{ color: '#1d4ed8', fontWeight: 600 }}>
              {details.support_email}
            </a>.
          </p>
        ) : null}

        <div style={actionsStyle}>
          <Link to="/" style={primaryLinkStyle}>Back to Home</Link>
          <Link to="/login" style={secondaryLinkStyle}>Admin Login</Link>
        </div>
      </section>
    </main>
  )
}

export default Maintenance
