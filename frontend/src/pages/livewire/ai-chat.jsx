import React from 'react'

const LivewireAiChat = () => {
  return (
    <div className="page">
<div x-data="{ open: false }" className="chat-widget">

    {/* Floating AI Button */}
    <button ="open = !open" className="chat-button" aria-label="Open AI chat">
        <span aria-hidden="true">&#129302;</span>
    </button>

    {/* Chat Window */}
    <div x-show="open" x-transition className="chat-window">
        {/* Header */}
        <div className="chat-header">
            <span>AI Agent</span>

             <select wire:model.live="model" className="model-select">
{/*                  */}
                    <option value=""></option>
{/*                  */}
            </select>

            <button wire:click="newChat" type="button" className="new-chat-btn" title="Start new chat">
                New Chat
            </button>

            <button ="open = false" className="close-btn" aria-label="Close chat">&times;</button>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
{/*              */}
                <div className="chat-message">
                    <strong>:</strong>
{/*                      === 'assistant' && !empty($chat['source'])) */}
                        <span className="chat-source">[source: ]</span>
{/*                      */}
                    
                </div>
{/*              */}
        </div>

        {/* Input */}
        <div className="chat-input">
            <input
                type="text"
                wire:model="message"
                wire:keydown.enter="ask"
                placeholder="Ask for a book..."
                className="input-field"
             />

            <button wire:click="ask" className="send-btn">
                Send
            </button>
        </div>
    </div>

</div>
    </div>
  )
}

export default LivewireAiChat







