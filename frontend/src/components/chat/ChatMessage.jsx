import React from 'react'
import PropTypes from 'prop-types'

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`assistant-message ${isUser ? 'assistant-message--user' : ''}`}>
      <div className="assistant-message__meta">
        <span>{isUser ? 'You' : 'Bookstore AI'}</span>
      </div>
      <div className="assistant-message__bubble">
        <div
          className={`assistant-message__content ${isUser ? 'assistant-message__content--user' : ''}`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
  }).isRequired,
}

export default ChatMessage
