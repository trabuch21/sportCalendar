import React from 'react';
import { RaceType } from '../types';
import { useI18n } from '../i18n/context';
import { Button } from './ui/button';

interface DisciplineFilterProps {
  selectedDiscipline: 'all' | 'running' | 'natación' | 'triatlón' | 'duatlón' | null;
  onDisciplineChange: (discipline: 'all' | 'running' | 'natación' | 'triatlón' | 'duatlón' | null) => void;
}

const DISCIPLINE_GROUPS = {
  running: ['calle', 'trail'] as RaceType[],
  natación: ['natación'] as RaceType[],
  triatlón: ['triatlón'] as RaceType[],
  duatlón: ['duatlón'] as RaceType[],
};

export function DisciplineFilter({ selectedDiscipline, onDisciplineChange }: DisciplineFilterProps) {
  const { t } = useI18n();
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedDiscipline === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('all')}
      >
        {t('common.all')}
      </Button>
      <Button
        variant={selectedDiscipline === 'running' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('running')}
      >
        🏃 {t('dashboard.filters.running')}
      </Button>
      <Button
        variant={selectedDiscipline === 'natación' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('natación')}
      >
        🏊 {t('dashboard.filters.natación')}
      </Button>
      <Button
        variant={selectedDiscipline === 'triatlón' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('triatlón')}
      >
        🏊🚴🏃 {t('dashboard.filters.triatlón')}
      </Button>
      <Button
        variant={selectedDiscipline === 'duatlón' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDisciplineChange('duatlón')}
      >
        🏃🚴🏃 {t('dashboard.filters.duatlón')}
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
