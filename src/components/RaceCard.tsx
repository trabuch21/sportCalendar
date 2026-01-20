import React from 'react';
import { Race } from '../types';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useI18n } from '../i18n/context';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface RaceCardProps {
  race: Race;
  onEdit: (race: Race) => void;
  onDelete: (id: string) => void;
}

export function RaceCard({ race, onEdit, onDelete }: RaceCardProps) {
  const { t, language } = useI18n();
  const dateLocale = language === 'es' ? es : enUS;
  
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
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

  const getRaceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      calle: 'bg-blue-500',
      trail: 'bg-green-500',
      natación: 'bg-cyan-500',
      triatlón: 'bg-amber-500',
      duatlón: 'bg-pink-500',
      otro: 'bg-gray-500',
    };
    return colors[type] || colors.otro;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      máxima: 'bg-red-500',
      alta: 'bg-orange-500',
      media: 'bg-yellow-500',
      baja: 'bg-gray-400',
      ninguna: 'bg-gray-300',
    };
    return colors[priority] || colors.ninguna;
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      completar: 'Completar',
      tiempo: 'Hacer X tiempo',
      disfrutar: 'Disfrutar',
      ninguno: 'Sin objetivo',
    };
    return labels[goal] || goal;
  };

  const getBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      calle: 'border-l-blue-500',
      trail: 'border-l-green-500',
      natación: 'border-l-cyan-500',
      triatlón: 'border-l-amber-500',
      duatlón: 'border-l-pink-500',
      otro: 'border-l-gray-500',
    };
    return colors[type] || colors.otro;
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${getBorderColor(race.raceType)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge className={getRaceTypeColor(race.raceType)}>
              {t(`race.types.${race.raceType}`)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(race.priority)}>
              {t(`race.priorities.${race.priority}`)}
            </Badge>
            <Badge variant="secondary">
              🎯 {t(`race.goals.${race.goal}`)}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(race)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(race.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <h3 className="text-xl font-bold mt-2">{race.name}</h3>
        <p className="text-sm text-muted-foreground">
          {(() => {
            // Parse date correctly - PostgreSQL DATE comes as "YYYY-MM-DD"
            // Extract just the date part to avoid timezone issues
            const dateStr = race.date.split('T')[0]; // Get "YYYY-MM-DD" part
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day); // month is 0-indexed
            return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
          })()}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {(race.raceType === 'triatlón' || race.raceType === 'duatlón') ? (
          <>
            {race.raceType === 'triatlón' && race.swimmingDistance && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-cyan-600">🏊 {t('race.swimming')}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.distance')}:</span>
                    <span className="font-medium">{formatDistance(race.swimmingDistance.distance)}</span>
                  </div>
                  {race.swimmingDistance.actualDistance && race.swimmingDistance.actualDistance !== race.swimmingDistance.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                      <span className="font-medium">{formatDistance(race.swimmingDistance.actualDistance)}</span>
                    </div>
                  )}
                  {race.swimmingTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.time')}:</span>
                      <span className="font-medium">{formatTime(race.swimmingTime)}</span>
                    </div>
                  )}
                </div>
                {race.transition1Time && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">T1 ({t('race.swimming')} → {t('race.cycling')}):</span>
                    <span className="font-medium">{formatTime(race.transition1Time.time)}</span>
                  </div>
                )}
              </>
            )}

            {race.raceType === 'duatlón' && race.firstDisciplineData && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-blue-600">
                    {race.firstDiscipline === 'carrera' && '🏃'} 
                    {race.firstDiscipline === 'ciclismo' && '🚴'} 
                    {race.firstDiscipline === 'natación' && '🏊'} 
                    {' '}
                    {t('race.firstDiscipline')} ({t(`race.disciplines.${race.firstDiscipline}`)})
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.distance')}:</span>
                    <span className="font-medium">{formatDistance(race.firstDisciplineData.distance)}</span>
                  </div>
                  {race.firstDisciplineData.actualDistance && race.firstDisciplineData.actualDistance !== race.firstDisciplineData.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                      <span className="font-medium">{formatDistance(race.firstDisciplineData.actualDistance)}</span>
                    </div>
                  )}
                  {race.firstDisciplineTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.time')}:</span>
                      <span className="font-medium">{formatTime(race.firstDisciplineTime)}</span>
                    </div>
                  )}
                </div>
                {race.transition1Time && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">
                      T1 ({t(`race.disciplines.${race.firstDiscipline}`)} → {t(`race.disciplines.${race.secondDiscipline || 'ciclismo'}`)}):
                    </span>
                    <span className="font-medium">{formatTime(race.transition1Time.time)}</span>
                  </div>
                )}
              </>
            )}
            
            {/* Legacy support for old duathlon format */}
            {race.raceType === 'duatlón' && !race.firstDisciplineData && race.firstRunDistance && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-blue-600">🏃 {language === 'es' ? 'Primera Carrera' : 'First Run'}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.distance')}:</span>
                    <span className="font-medium">{formatDistance(race.firstRunDistance.distance)}</span>
                  </div>
                  {race.firstRunDistance.actualDistance && race.firstRunDistance.actualDistance !== race.firstRunDistance.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                      <span className="font-medium">{formatDistance(race.firstRunDistance.actualDistance)}</span>
                    </div>
                  )}
                  {race.firstRunTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.time')}:</span>
                      <span className="font-medium">{formatTime(race.firstRunTime)}</span>
                    </div>
                  )}
                </div>
                {race.transition1Time && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">T1 ({t('race.disciplines.carrera')} → {t('race.disciplines.ciclismo')}):</span>
                    <span className="font-medium">{formatTime(race.transition1Time.time)}</span>
                  </div>
                )}
              </>
            )}

            {/* Ciclismo para triatlón o si es primera o segunda disciplina en duatlón */}
            {race.cyclingDistance && (race.raceType === 'triatlón' || (race.raceType === 'duatlón' && (race.firstDiscipline === 'ciclismo' || race.secondDiscipline === 'ciclismo'))) && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-orange-600">
                    🚴 {t('race.cycling')}
                    {race.raceType === 'duatlón' && race.firstDiscipline === 'ciclismo' && ` (${t('race.firstDiscipline')})`}
                    {race.raceType === 'duatlón' && race.secondDiscipline === 'ciclismo' && ` (${t('race.secondDiscipline')})`}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.distance')}:</span>
                    <span className="font-medium">{formatDistance(race.cyclingDistance.distance)}</span>
                  </div>
                  {race.cyclingDistance.actualDistance && race.cyclingDistance.actualDistance !== race.cyclingDistance.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                      <span className="font-medium">{formatDistance(race.cyclingDistance.actualDistance)}</span>
                    </div>
                  )}
                  {race.cyclingTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.time')}:</span>
                      <span className="font-medium">{formatTime(race.cyclingTime)}</span>
                    </div>
                  )}
                </div>
                {race.transition2Time && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">
                      T2 ({race.raceType === 'triatlón' 
                        ? `${t('race.cycling')} → ${t('race.running')}` 
                        : `${t('race.cycling')} → ${t(`race.disciplines.${race.secondDiscipline || 'carrera'}`)}`}):
                    </span>
                    <span className="font-medium">{formatTime(race.transition2Time.time)}</span>
                  </div>
                )}
              </>
            )}
            
            {/* Segunda Disciplina para duatlón personalizable */}
            {race.raceType === 'duatlón' && race.secondDisciplineData && race.secondDiscipline !== 'ciclismo' && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-green-600">
                    {race.secondDiscipline === 'carrera' && '🏃'} 
                    {race.secondDiscipline === 'natación' && '🏊'} 
                    {' '}
                    {t('race.secondDiscipline')} ({t(`race.disciplines.${race.secondDiscipline}`)})
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.distance')}:</span>
                    <span className="font-medium">{formatDistance(race.secondDisciplineData.distance)}</span>
                  </div>
                  {race.secondDisciplineData.actualDistance && race.secondDisciplineData.actualDistance !== race.secondDisciplineData.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                      <span className="font-medium">{formatDistance(race.secondDisciplineData.actualDistance)}</span>
                    </div>
                  )}
                  {race.secondDisciplineTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('common.time')}:</span>
                      <span className="font-medium">{formatTime(race.secondDisciplineTime)}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Carrera solo para triatlón */}
            {race.runningDistance && race.raceType === 'triatlón' && (
              <div className="space-y-1 pb-2 border-b">
                <p className="text-sm font-semibold text-green-600">🏃 {t('race.running')}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('common.distance')}:</span>
                  <span className="font-medium">{formatDistance(race.runningDistance.distance)}</span>
                </div>
                {race.runningDistance.actualDistance && race.runningDistance.actualDistance !== race.runningDistance.distance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                    <span className="font-medium">{formatDistance(race.runningDistance.actualDistance)}</span>
                  </div>
                )}
                {race.runningTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.time')}:</span>
                    <span className="font-medium">{formatTime(race.runningTime)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Legacy support: Segunda Carrera para duatlón antiguo */}
            {race.runningDistance && race.raceType === 'duatlón' && !race.secondDisciplineData && (
              <div className="space-y-1 pb-2 border-b">
                <p className="text-sm font-semibold text-green-600">🏃 {language === 'es' ? 'Segunda Carrera' : 'Second Run'}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('common.distance')}:</span>
                  <span className="font-medium">{formatDistance(race.runningDistance.distance)}</span>
                </div>
                {race.runningDistance.actualDistance && race.runningDistance.actualDistance !== race.runningDistance.distance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                    <span className="font-medium">{formatDistance(race.runningDistance.actualDistance)}</span>
                  </div>
                )}
                {race.runningTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.time')}:</span>
                    <span className="font-medium">{formatTime(race.runningTime)}</span>
                  </div>
                )}
              </div>
            )}

            {race.targetTime && (
              <div className="flex justify-between text-sm pt-2 border-t-2 border-primary">
                <span className="font-semibold">{language === 'es' ? 'Tiempo Objetivo Total' : 'Total Target Time'}:</span>
                <span className="font-bold">{formatTime(race.targetTime)}</span>
              </div>
            )}

            {race.actualTime && (
              <div className="flex justify-between text-sm pt-1">
                <span className="font-semibold text-green-600">{language === 'es' ? 'Tiempo Real Total' : 'Total Actual Time'}:</span>
                <span className="font-bold text-green-600">{formatTime(race.actualTime)}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {race.isMultiDay && race.dayDistances && race.dayDistances.length > 0 ? (
              <>
                <div className="space-y-3 pb-2 border-b">
                  {race.dayDistances.map((dayDist, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">{t('common.day')} {dayDist.day}:</span>
                        <span className="font-medium">{formatDistance(dayDist.distance)}</span>
                      </div>
                      {dayDist.actualDistance && dayDist.actualDistance !== dayDist.distance && (
                        <div className="flex justify-between text-sm pl-4">
                          <span className="text-muted-foreground text-xs">{t('common.actualDistance')}:</span>
                          <span className="font-medium text-xs">{formatDistance(dayDist.actualDistance)}</span>
                        </div>
                      )}
                      {dayDist.elevation && (
                        <div className="flex justify-between text-sm pl-4">
                          <span className="text-muted-foreground text-xs">⛰️ {t('common.elevation')}:</span>
                          <span className="font-medium text-xs">{dayDist.elevation.toLocaleString()} m</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-1 pt-2 border-t">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{t('common.distance')} {t('common.total')}:</span>
                    <span>{formatDistance(race.distance)}</span>
                  </div>
                  {race.elevation && (
                    <div className="flex justify-between text-sm font-semibold">
                      <span>⛰️ {t('race.totalElevation')}:</span>
                      <span>{race.elevation.toLocaleString()} m</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('common.distance')}:</span>
                  <span className="font-medium">{formatDistance(race.distance)}</span>
                </div>

                {race.actualDistance && race.actualDistance !== race.distance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.actualDistance')}:</span>
                    <span className="font-medium">{formatDistance(race.actualDistance)}</span>
                  </div>
                )}
              </>
            )}

            {race.elevation && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">⛰️ {t('common.elevation')}:</span>
                <span className="font-medium">{race.elevation.toLocaleString()} m</span>
              </div>
            )}

            {race.targetTime && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('common.targetTime')}:</span>
                <span className="font-medium">{formatTime(race.targetTime)}</span>
              </div>
            )}

            {race.actualTime && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-semibold text-green-600">{t('common.actualTime')}:</span>
                <span className="font-bold text-green-600">{formatTime(race.actualTime)}</span>
              </div>
            )}
          </>
        )}

        {race.notes && (
          <div className="pt-3 border-t text-sm text-muted-foreground">
            <strong>Notas:</strong> {race.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
