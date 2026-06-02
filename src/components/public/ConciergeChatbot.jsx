import { useState, useRef, useEffect } from 'react'
import './ConciergeChatbot.css'

export default function ConciergeChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to Grand Palace Hotel. I am your AI Concierge. How may I assist you today?' }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setInput('')

    // Mock AI response logic
    setTimeout(() => {
      let botResponse = "I'd be happy to help you with that. Let me connect you with our front desk for more specific details."
      const lowerInput = userMsg.toLowerCase()
      
      if (lowerInput.includes('check in') || lowerInput.includes('check-in')) {
        botResponse = "Check-in time is typically 3:00 PM, and check-out is at 11:00 PM. We do offer late check-out upon request."
      } else if (lowerInput.includes('parking')) {
        botResponse = "We offer complimentary valet parking for all our guests. Just pull up to the main entrance!"
      } else if (lowerInput.includes('breakfast')) {
        botResponse = "Our complimentary gourmet breakfast buffet is served from 7:00 AM to 10:30 AM in the Grand Dining Room."
      } else if (lowerInput.includes('pool') || lowerInput.includes('spa')) {
        botResponse = "Our infinity pool and full-service spa are located on the 4th floor, open from 6:00 AM to 10:00 PM."
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }])
    }, 1000)
  }

  return (
    <div className="chatbot-container">
      {/* Floating Action Button */}
      <button 
        className={`chatbot-fab ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open Concierge Chat"
      >
        <span className="chatbot-fab-icon">✨</span>
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <span className="chatbot-avatar">🛎️</span>
            <div>
              <h3>AI Concierge</h3>
              <span className="chatbot-status">Online</span>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chatbot-bubble-wrap ${msg.sender}`}>
              <div className="chatbot-bubble">{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask about amenities, check-in..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>Send</button>
        </form>
      </div>
    </div>
  )
}
