import React from 'react';

const stateLabels = {
  idle: 'READY',
  processing: 'ANALYZING',
  streaming: 'COMPOSING',
  success: 'COMPLETE',
  error: 'ATTENTION',
};

export default function AIOrb({ state = 'idle', compact = false }) {
  const normalizedState = stateLabels[state] ? state : 'idle';

  return (
    <div className={`ai-orb-wrap ai-orb-${normalizedState} ${compact ? 'ai-orb-compact' : ''}`} role="status" aria-live="polite">
      <span className="ai-orb-ring ai-orb-ring-one" />
      <span className="ai-orb-ring ai-orb-ring-two" />
      <span className="ai-orb-core" />
      <span className="ai-orb-highlight" />
      <span className="ai-orb-label">{stateLabels[normalizedState]}</span>
    </div>
  );
}
