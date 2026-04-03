import React from 'react'
import PropTypes from 'prop-types'

const DebugPanel = ({ debug }) => {
  if (!debug?.length) {
    return null
  }

  return (
    <aside className="assistant-debug">
      <div className="assistant-debug__header">
        <strong>Tool Log</strong>
        <span>{debug.length} step{debug.length > 1 ? 's' : ''}</span>
      </div>

      <div className="assistant-debug__list">
        {debug.map((item, index) => (
          <div key={`${item.tool || item.type}-${index}`} className="assistant-debug__item">
            <div className="assistant-debug__item-head">
              <strong>{item.tool || item.type}</strong>
              <span className={item.isError ? 'assistant-debug__state assistant-debug__state--error' : 'assistant-debug__state'}>
                {item.isError ? 'error' : 'ok'}
              </span>
            </div>
            <pre>{JSON.stringify({ input: item.input, preview: item.preview }, null, 2)}</pre>
          </div>
        ))}
      </div>
    </aside>
  )
}

DebugPanel.propTypes = {
  debug: PropTypes.arrayOf(
    PropTypes.shape({
      tool: PropTypes.string,
      type: PropTypes.string,
      isError: PropTypes.bool,
      input: PropTypes.any,
      preview: PropTypes.any,
    })
  ).isRequired,
}

export default DebugPanel
