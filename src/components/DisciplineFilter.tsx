import React from 'react';
import { RaceType } from '../types';
import { Button } from './ui/button';

interface DisciplineFilterProps {
  selectedDiscipline: 'all' | 'running' | 'natación' | 'triatlón' | 'duatlón' | null;
  onDisciplineChange: (discipline: 'all' | 'running' | 'natación' | 'triatlón' | 'duatlón' | null) => void;
}

const DISCIPLINE_GROUPS = {
  running: ['calle', 'trail', 'postas'] as RaceType[],
  natación: ['natación'] as RaceType[],
  triatlón: ['triatlón'] as RaceType[],
  duatlón: ['duatlón'] as RaceType[],
};

export function DisciplineFilter({ selectedDiscipline, onDisciplineChange }: DisciplineFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedDiscipline === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('all')}
      >
        Todas
      </Button>
      <Button
        variant={selectedDiscipline === 'running' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('running')}
      >
        🏃 Running
      </Button>
      <Button
        variant={selectedDiscipline === 'natación' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('natación')}
      >
        🏊 Natación
      </Button>
      <Button
        variant={selectedDiscipline === 'triatlón' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('triatlón')}
      >
        🏊🚴🏃 Triatlón
      </Button>
      <Button
        variant={selectedDiscipline === 'duatlón' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('duatlón')}
      >
        🏃🚴🏃 Duatlón
      </Button>
    </div>
  );
}

export function getDisciplineTypes(discipline: 'all' | 'running' | 'natación' | 'triatlón' | 'duatlón' | null): RaceType[] {
  if (discipline === 'all' || discipline === null) {
    return [];
  }
  if (discipline === 'running') {
    return DISCIPLINE_GROUPS.running;
  }
  if (discipline === 'natación') {
    return DISCIPLINE_GROUPS.natación;
  }
  if (discipline === 'triatlón') {
    return DISCIPLINE_GROUPS.triatlón;
  }
  if (discipline === 'duatlón') {
    return DISCIPLINE_GROUPS.duatlón;
  }
  return [];
}
