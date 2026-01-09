import React, { useState } from 'react';
import { parseWorkout } from '../parser';
import { ParsedWorkout } from '../types';
import './WorkoutInput.css';

interface WorkoutInputProps {
  onWorkoutParsed: (workout: ParsedWorkout) => void;
}

export function WorkoutInput({ onWorkoutParsed }: WorkoutInputProps) {
  const [workoutText, setWorkoutText] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const exampleWorkout = `2km TS + 4 x 400 TL Rec.1'30" + 5 x 600 TL Rec.1'30" + 2 x 1km TR Rec. 3' + 1km TS`;

  const handleParse = () => {
    try {
      setError(null);
      if (!workoutText.trim()) {
        setError('Por favor ingresa un entrenamiento');
        return;
      }

      const parsed = parseWorkout(workoutText, workoutName || undefined, workoutDate || undefined);
      onWorkoutParsed(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al parsear el entrenamiento');
    }
  };

  const handleLoadExample = () => {
    setWorkoutText(exampleWorkout);
  };

  return (
    <div className="workout-input">
      <div className="input-section">
        <label htmlFor="workout-name">Nombre del Entrenamiento (opcional)</label>
        <input
          id="workout-name"
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Ej: ENERO - ENTRENAMIENTO 2"
        />
      </div>

      <div className="input-section">
        <label htmlFor="workout-date">Fecha (opcional)</label>
        <input
          id="workout-date"
          type="text"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          placeholder="Ej: January 8, 2026"
        />
      </div>

      <div className="input-section">
        <label htmlFor="workout-text">
          Entrenamiento
          <button type="button" className="example-link" onClick={handleLoadExample}>
            Cargar ejemplo
          </button>
        </label>
        <textarea
          id="workout-text"
          value={workoutText}
          onChange={(e) => setWorkoutText(e.target.value)}
          placeholder={"Ej: 2km TS + (3 x 800 TR x 200 TS x 400 TL Rec.2\") + 2 x (3 x 500TL Rec.1'30\") PL.1'30\"+ 2km TS"}
          rows={6}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button className="parse-button" onClick={handleParse}>
        Convertir a Formato Garmin
      </button>
    </div>
  );
}

