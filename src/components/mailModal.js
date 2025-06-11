import React, { useState } from 'react';

export default function MailModal({
  show,
  onClose,
  dbName,
  collectionName,
  connectionString,
  userEmail,
  onSent,
}) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!show) return null;

  const handleSend = async () => {
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/send-bulk-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connectionString,
          dbName,
          collectionName,
          from: userEmail,
          subject,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to send emails.');
      } else {
        setSuccess('Email sent to all addresses in this collection!');
        setSubject('');
        setBody('');
        if (onSent) onSent();
      }
    } catch (err) {
      setError('Failed to send emails.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      zIndex: 9999,
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 32,
        minWidth: 340,
        maxWidth: 480,
        boxShadow: '0 4px 32px #6366f144',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#6366f1',
          }}
          aria-label="Close"
        >×</button>
        <div style={{
          background: '#f1f5ff',
          color: '#23272f',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 18,
          fontWeight: 600,
          fontSize: 15,
        }}>
          <span role="img" aria-label="info">📢</span> 
          This email will be sent to <b>all email addresses</b> in the <span style={{color:'#6366f1'}}>{collectionName}</span> collection of <span style={{color:'#6366f1'}}>{dbName}</span>.
        </div>
        <div style={{marginBottom: 12, fontSize: 14}}>
          <b>From:</b> <span style={{color:'#6366f1'}}>{userEmail}</span>
        </div>
        <div style={{marginBottom: 12}}>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #c7d2fe',
              fontSize: 15,
              marginBottom: 8,
            }}
            disabled={sending}
          />
        </div>
        <div style={{marginBottom: 18}}>
          <textarea
            placeholder="Write your email body here..."
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #c7d2fe',
              fontSize: 15,
              resize: 'vertical',
            }}
            disabled={sending}
          />
        </div>
        {error && <div style={{color: '#dc2626', marginBottom: 10}}>{error}</div>}
        {success && <div style={{color: '#16a34a', marginBottom: 10}}>{success}</div>}
        <button
          onClick={handleSend}
          disabled={sending || !subject || !body}
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 22px',
            fontWeight: 700,
            fontSize: 16,
            cursor: sending ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px #6366f133',
            width: '100%',
          }}
        >
          {sending ? 'Sending...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}