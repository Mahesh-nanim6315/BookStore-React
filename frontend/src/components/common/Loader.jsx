import React from 'react'

const Loader = () => {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="loader-spinner" aria-hidden="true"></div>
      <div className="loader-text">Loading...</div>
    </div>
  )
}

export default Loader
