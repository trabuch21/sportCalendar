import React from 'react';
import { INTENSITY_REFERENCES } from '../types';
import './References.css';

export function References() {
  return (
    <div className="references">
      <h3>Referencias</h3>
      <div className="references-grid">
        {Object.entries(INTENSITY_REFERENCES).map(([key, value]: [string, string]) => (
          <div key={key} className="reference-item">
            <span className="reference-key">{key}:</span>
            <span className="reference-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

