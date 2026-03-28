import React from 'react'

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`assistant-message ${isUser ? 'assistant-message--user' : ''}`}>
      <div className="assistant-message__meta">
        <span>{isUser ? 'You' : 'Bookstore AI'}</span>
      </div>
      <div className="assistant-message__bubble">
        <p id='back'>{message.content}</p>
      </div>
    </div>
  )
}

export default ChatMessage
