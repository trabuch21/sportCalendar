import React from 'react';
import { Race } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
      montaña: 'bg-purple-500',
      postas: 'bg-orange-500',
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
      montaña: 'border-l-purple-500',
      postas: 'border-l-orange-500',
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
              {race.raceType.charAt(0).toUpperCase() + race.raceType.slice(1)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(race.priority)}>
              {race.priority.charAt(0).toUpperCase() + race.priority.slice(1)}
            </Badge>
            <Badge variant="secondary">
              🎯 {getGoalLabel(race.goal)}
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
          {format(new Date(race.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {(race.raceType === 'triatlón' || race.raceType === 'duatlón') ? (
          <>
            {race.raceType === 'triatlón' && race.swimmingDistance && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-cyan-600">🏊 Natación</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distancia:</span>
                    <span className="font-medium">{formatDistance(race.swimmingDistance.distance)}</span>
                  </div>
                  {race.swimmingDistance.actualDistance && race.swimmingDistance.actualDistance !== race.swimmingDistance.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Distancia Real:</span>
                      <span className="font-medium">{formatDistance(race.swimmingDistance.actualDistance)}</span>
                    </div>
                  )}
                  {race.swimmingTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiempo:</span>
                      <span className="font-medium">{formatTime(race.swimmingTime)}</span>
                    </div>
                  )}
                </div>
                {race.transition1Time && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">T1 (Natación → Ciclismo):</span>
                    <span className="font-medium">{formatTime(race.transition1Time.time)}</span>
                  </div>
                )}
              </>
            )}

            {race.raceType === 'duatlón' && race.firstRunDistance && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-blue-600">🏃 Primera Carrera</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distancia:</span>
                    <span className="font-medium">{formatDistance(race.firstRunDistance.distance)}</span>
                  </div>
                  {race.firstRunDistance.actualDistance && race.firstRunDistance.actualDistance !== race.firstRunDistance.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Distancia Real:</span>
                      <span className="font-medium">{formatDistance(race.firstRunDistance.actualDistance)}</span>
                    </div>
                  )}
                  {race.firstRunTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiempo:</span>
                      <span className="font-medium">{formatTime(race.firstRunTime)}</span>
                    </div>
                  )}
                </div>
                {race.transition1Time && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">T1 (Carrera → Ciclismo):</span>
                    <span className="font-medium">{formatTime(race.transition1Time.time)}</span>
                  </div>
                )}
              </>
            )}

            {race.cyclingDistance && (
              <>
                <div className="space-y-1 pb-2 border-b">
                  <p className="text-sm font-semibold text-orange-600">🚴 Ciclismo</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distancia:</span>
                    <span className="font-medium">{formatDistance(race.cyclingDistance.distance)}</span>
                  </div>
                  {race.cyclingDistance.actualDistance && race.cyclingDistance.actualDistance !== race.cyclingDistance.distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Distancia Real:</span>
                      <span className="font-medium">{formatDistance(race.cyclingDistance.actualDistance)}</span>
                    </div>
                  )}
                  {race.cyclingTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiempo:</span>
                      <span className="font-medium">{formatTime(race.cyclingTime)}</span>
                    </div>
                  )}
                </div>
                {race.transition2Time && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">T2 (Ciclismo → Carrera):</span>
                    <span className="font-medium">{formatTime(race.transition2Time.time)}</span>
                  </div>
                )}
              </>
            )}

            {race.runningDistance && (
              <div className="space-y-1 pb-2 border-b">
                <p className="text-sm font-semibold text-green-600">🏃 {race.raceType === 'triatlón' ? 'Carrera' : 'Segunda Carrera'}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distancia:</span>
                  <span className="font-medium">{formatDistance(race.runningDistance.distance)}</span>
                </div>
                {race.runningDistance.actualDistance && race.runningDistance.actualDistance !== race.runningDistance.distance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distancia Real:</span>
                    <span className="font-medium">{formatDistance(race.runningDistance.actualDistance)}</span>
                  </div>
                )}
                {race.runningTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiempo:</span>
                    <span className="font-medium">{formatTime(race.runningTime)}</span>
                  </div>
                )}
              </div>
            )}

            {race.targetTime && (
              <div className="flex justify-between text-sm pt-2 border-t-2 border-primary">
                <span className="font-semibold">Tiempo Objetivo Total:</span>
                <span className="font-bold">{formatTime(race.targetTime)}</span>
              </div>
            )}

            {race.actualTime && (
              <div className="flex justify-between text-sm pt-1">
                <span className="font-semibold text-green-600">Tiempo Real Total:</span>
                <span className="font-bold text-green-600">{formatTime(race.actualTime)}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distancia:</span>
              <span className="font-medium">{formatDistance(race.distance)}</span>
            </div>

            {race.actualDistance && race.actualDistance !== race.distance && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distancia Real:</span>
                <span className="font-medium">{formatDistance(race.actualDistance)}</span>
              </div>
            )}

            {race.targetTime && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiempo Objetivo:</span>
                <span className="font-medium">{formatTime(race.targetTime)}</span>
              </div>
            )}

            {race.actualTime && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-semibold text-green-600">Tiempo Real:</span>
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
