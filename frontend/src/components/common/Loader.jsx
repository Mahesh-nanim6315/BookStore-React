import React from 'react'

const Loader = () => {
  return (
    <output className="loader-container" aria-live="polite">
      <div className="loader-spinner" aria-hidden="true"></div>
      <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Loading
      </span>
    </output>
  )
}

export default Loader
