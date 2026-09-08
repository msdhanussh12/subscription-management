import React from 'react';

const Loading = ({ fullScreen = false, text = 'Loading data...', size = 'md' }) => {
  const content = (
    <div className="loading-container">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {text && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
