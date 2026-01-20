import React from 'react';
import { Race } from '../types';
import { useI18n } from '../i18n/context';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { exportRacesToCSV } from '../utils/export';

interface YearStatsProps {
  races: Race[];
  year: number;
}

export function YearStats({ races, year }: YearStatsProps) {
  const { t, language } = useI18n();
  const yearRaces = races.filter(r => new Date(r.date).getFullYear() === year);
  const completedRaces = yearRaces.filter(r => r.actualTime);
  const upcomingRaces = yearRaces.filter(r => !r.actualTime && new Date(r.date) >= new Date());
  const pastRaces = yearRaces.filter(r => !r.actualTime && new Date(r.date) < new Date());

  const totalDistance = completedRaces.reduce((sum, r) => sum + (r.actualDistance || r.distance), 0);
  const totalDistanceKm = (totalDistance / 1000).toFixed(1);

  const racesByType = yearRaces.reduce((acc, race) => {
    acc[race.raceType] = (acc[race.raceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const racesByPriority = yearRaces.reduce((acc, race) => {
    acc[race.priority] = (acc[race.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      }
      return `${minutes}m ${seconds}s`;
    }
    return timeStr;
  };

  const calculateAverageTime = () => {
    if (completedRaces.length === 0) return null;
    const totalSeconds = completedRaces.reduce((sum, race) => {
      if (!race.actualTime) return sum;
      const parts = race.actualTime.split(':');
      if (parts.length === 3) {
        return sum + parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      }
      return sum;
    }, 0);
    const avgSeconds = Math.round(totalSeconds / completedRaces.length);
    const hours = Math.floor(avgSeconds / 3600);
    const minutes = Math.floor((avgSeconds % 3600) / 60);
    const seconds = avgSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const averageTime = calculateAverageTime();

  const handleExport = () => {
    const racesToExport = yearRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    exportRacesToCSV(racesToExport, language === 'es' ? `estadisticas_${year}` : `stats_${year}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{language === 'es' ? `Estadísticas ${year}` : `${year} Statistics`}</h2>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {language === 'es' ? 'Exportar CSV' : 'Export CSV'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{language === 'es' ? `Balance ${year}` : `${year} Summary`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{yearRaces.length}</div>
              <div className="text-sm text-muted-foreground mt-1">{language === 'es' ? 'Total Carreras' : 'Total Races'}</div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedRaces.length}</div>
              <div className="text-sm text-muted-foreground mt-1">{language === 'es' ? 'Completadas' : 'Completed'}</div>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{upcomingRaces.length}</div>
              <div className="text-sm text-muted-foreground mt-1">{language === 'es' ? 'Próximas' : 'Upcoming'}</div>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pastRaces.length}</div>
              <div className="text-sm text-muted-foreground mt-1">{language === 'es' ? 'No Completadas' : 'Not Completed'}</div>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalDistanceKm} km</div>
              <div className="text-sm text-muted-foreground mt-1">{t('common.distance')} {t('common.total')}</div>
            </div>

            {averageTime && (
              <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-950 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{averageTime}</div>
                <div className="text-sm text-muted-foreground mt-1">{language === 'es' ? 'Tiempo Promedio' : 'Average Time'}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {Object.keys(racesByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'es' ? 'Carreras por Tipo' : 'Races by Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(racesByType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Badge variant="outline" className="text-sm">
                    {t(`race.types.${type}`)}
                  </Badge>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(racesByPriority).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'es' ? 'Carreras por Prioridad' : 'Races by Priority'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(racesByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Badge variant="outline" className="text-sm">
                    {t(`race.priorities.${priority}`)}
                  </Badge>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
