import React from 'react';
import { ParsedWorkout, WorkoutStep, WorkoutBlock } from '../types';
import './WorkoutDisplay.css';

interface WorkoutDisplayProps {
  workout: ParsedWorkout;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) {
    return `${mins}:00`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function StepDisplay({ step, isNested = false }: { step: WorkoutStep; isNested?: boolean }) {
  const getBarColor = () => {
    switch (step.type) {
      case 'warmup': return '#e74c3c'; // red
      case 'cooldown': return '#27ae60'; // green
      case 'run': return '#3498db'; // blue
      case 'rest':
      case 'recover': return '#95a5a6'; // gray
      default: return '#95a5a6';
    }
  };

  return (
    <div className={`step ${isNested ? 'nested' : ''}`}>
      <div className="step-bar" style={{ backgroundColor: getBarColor() }} />
      <div className="step-content">
        <div className="step-header">
          <span className="step-type">
            {step.type === 'warmup' && 'Warm up'}
            {step.type === 'cooldown' && 'Cool down'}
            {step.type === 'run' && 'Run'}
            {step.type === 'rest' && 'Rest'}
            {step.type === 'recover' && 'Recover'}
          </span>
          {step.lapButtonPress && (
            <span className="lap-indicator">Lap Button Press</span>
          )}
        </div>
        {step.distance && (
          <div className="step-detail">
            <span className="detail-label">Distance:</span>
            <span className="detail-value">{formatDistance(step.distance)}</span>
          </div>
        )}
        {step.duration && (
          <div className="step-detail">
            <span className="detail-label">Duration:</span>
            <span className="detail-value">{formatDuration(step.duration)}</span>
          </div>
        )}
        {step.intensity && (
          <div className="step-detail">
            <span className="detail-label">Intensity Target:</span>
            <span className="detail-value">{step.intensity.paceRange || step.intensity.type}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BlockDisplay({ block, depth = 0 }: { block: WorkoutBlock; depth?: number }) {
  return (
    <div className={`repetition-block ${depth > 0 ? 'nested-block' : ''}`}>
      <div className="block-header">
        <span className="repetition-icon">↻</span>
        <span className="repetition-count">{block.times} Times</span>
      </div>
      <div className="block-steps">
        {block.steps.map((item: WorkoutStep | WorkoutBlock, idx: number) => {
          if ('type' in item && item.type === 'repetition') {
            return <BlockDisplay key={idx} block={item as WorkoutBlock} depth={depth + 1} />;
          }
          return <StepDisplay key={idx} step={item as WorkoutStep} isNested={true} />;
        })}
      </div>
    </div>
  );
}

export function WorkoutDisplay({ workout }: WorkoutDisplayProps) {
  return (
    <div className="workout-display">
      {(workout.name || workout.date) && (
        <div className="workout-header">
          {workout.name && <h2 className="workout-name">{workout.name}</h2>}
          {workout.date && <p className="workout-date">{workout.date}</p>}
        </div>
      )}
      
      <div className="workout-steps">
        <StepDisplay step={workout.warmup} />
        
        {workout.blocks.map((block: WorkoutStep | WorkoutBlock, idx: number) => (
          <React.Fragment key={idx}>
            {'type' in block && block.type === 'repetition' ? (
              <BlockDisplay block={block as WorkoutBlock} />
            ) : (
              <StepDisplay step={block as WorkoutStep} />
            )}
          </React.Fragment>
        ))}
        
        <StepDisplay step={workout.cooldown} />
      </div>
    </div>
  );
}

