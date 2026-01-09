import React from 'react';
import { Race } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from './ui/badge';

interface RaceTableProps {
  races: Race[];
  onEdit: (race: Race) => void;
  onDelete: (id: string) => void;
  sortBy: 'name' | 'date' | 'distance' | null;
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'date' | 'distance') => void;
}

export function RaceTable({ races, onEdit, onDelete, sortBy, sortOrder, onSort }: RaceTableProps) {
  const formatDistance = (race: Race): string => {
    if (race.raceType === 'triatlón' || race.raceType === 'duatlón') {
      // Calculate total distance for multi-discipline races
      let total = 0;
      if (race.swimmingDistance) total += race.swimmingDistance.distance;
      if (race.cyclingDistance) total += race.cyclingDistance.distance;
      if (race.runningDistance) total += race.runningDistance.distance;
      if (race.firstRunDistance) total += race.firstRunDistance.distance;
      if (race.firstDisciplineData) total += race.firstDisciplineData.distance;
      if (race.secondDisciplineData) total += race.secondDisciplineData.distance;
      return total >= 1000 ? `${(total / 1000).toFixed(1)} km` : `${total} m`;
    }
    const dist = race.actualDistance || race.distance;
    return dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
    return timeStr;
  };

  const getSortIcon = (field: 'name' | 'date' | 'distance') => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  if (races.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay carreras para mostrar
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-4 font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('name')}
                className="h-auto p-0 font-semibold hover:bg-transparent -ml-4"
              >
                Nombre
                {getSortIcon('name')}
              </Button>
            </th>
            <th className="text-left p-4 font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('date')}
                className="h-auto p-0 font-semibold hover:bg-transparent -ml-4"
              >
                Fecha
                {getSortIcon('date')}
              </Button>
            </th>
            <th className="text-left p-4 font-semibold">
              Tipo
            </th>
            <th className="text-left p-4 font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('distance')}
                className="h-auto p-0 font-semibold hover:bg-transparent -ml-4"
              >
                Distancia
                {getSortIcon('distance')}
              </Button>
            </th>
            <th className="text-left p-4 font-semibold">Tiempo Objetivo</th>
            <th className="text-left p-4 font-semibold">Tiempo Real</th>
            <th className="text-left p-4 font-semibold">Prioridad</th>
            <th className="text-right p-4 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {races.map((race) => (
            <tr key={race.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="p-4">
                <div className="font-medium">{race.name}</div>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  {format(new Date(race.date), "d 'de' MMMM, yyyy", { locale: es })}
                </div>
              </td>
              <td className="p-4">
                <Badge variant="outline">
                  {race.raceType.charAt(0).toUpperCase() + race.raceType.slice(1)}
                </Badge>
              </td>
              <td className="p-4">
                <div className="text-sm font-medium">{formatDistance(race)}</div>
              </td>
              <td className="p-4">
                <div className="text-sm text-muted-foreground">
                  {race.targetTime ? formatTime(race.targetTime) : '-'}
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm font-medium">
                  {race.actualTime ? formatTime(race.actualTime) : '-'}
                </div>
              </td>
              <td className="p-4">
                <Badge
                  variant={
                    race.priority === 'máxima' ? 'default' :
                    race.priority === 'alta' ? 'default' :
                    race.priority === 'media' ? 'secondary' : 'outline'
                  }
                >
                  {race.priority.charAt(0).toUpperCase() + race.priority.slice(1)}
                </Badge>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(race)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(race.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
