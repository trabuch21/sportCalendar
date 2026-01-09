import React, { useState, useEffect } from 'react';
import { Race, RaceType, RacePriority, RaceGoal } from '../types';
import { saveRace, generateId } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';

interface RaceFormProps {
  race?: Race;
  onSave: () => void;
  onCancel: () => void;
}

const RACE_TYPES: RaceType[] = ['calle', 'trail', 'montaña', 'postas', 'natación', 'triatlón', 'duatlón', 'otro'];
const PRIORITIES: RacePriority[] = ['máxima', 'alta', 'media', 'baja', 'ninguna'];
const GOALS: RaceGoal[] = ['completar', 'tiempo', 'disfrutar', 'ninguno'];

export function RaceForm({ race, onSave, onCancel }: RaceFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    raceType: 'calle' as RaceType,
    distance: '',
    actualDistance: '',
    swimmingDistance: '',
    swimmingActualDistance: '',
    cyclingDistance: '',
    cyclingActualDistance: '',
    firstRunDistance: '',
    firstRunActualDistance: '',
    runningDistance: '',
    runningActualDistance: '',
    transition1Time: '',
    transition2Time: '',
    swimmingTime: '',
    cyclingTime: '',
    firstRunTime: '',
    runningTime: '',
    targetTime: '',
    actualTime: '',
    priority: 'media' as RacePriority,
    goal: 'ninguno' as RaceGoal,
    notes: '',
  });

  useEffect(() => {
    if (race) {
      setFormData({
        name: race.name,
        date: race.date.split('T')[0],
        raceType: race.raceType,
        distance: (race.distance / 1000).toString(),
        actualDistance: race.actualDistance ? (race.actualDistance / 1000).toString() : '',
        swimmingDistance: race.swimmingDistance ? (race.swimmingDistance.distance / 1000).toString() : '',
        swimmingActualDistance: race.swimmingDistance?.actualDistance ? (race.swimmingDistance.actualDistance / 1000).toString() : '',
        cyclingDistance: race.cyclingDistance ? (race.cyclingDistance.distance / 1000).toString() : '',
        cyclingActualDistance: race.cyclingDistance?.actualDistance ? (race.cyclingDistance.actualDistance / 1000).toString() : '',
        firstRunDistance: race.firstRunDistance ? (race.firstRunDistance.distance / 1000).toString() : '',
        firstRunActualDistance: race.firstRunDistance?.actualDistance ? (race.firstRunDistance.actualDistance / 1000).toString() : '',
        runningDistance: race.runningDistance ? (race.runningDistance.distance / 1000).toString() : '',
        runningActualDistance: race.runningDistance?.actualDistance ? (race.runningDistance.actualDistance / 1000).toString() : '',
        transition1Time: race.transition1Time?.time || '',
        transition2Time: race.transition2Time?.time || '',
        swimmingTime: race.swimmingTime || '',
        cyclingTime: race.cyclingTime || '',
        firstRunTime: race.firstRunTime || '',
        runningTime: race.runningTime || '',
        targetTime: race.targetTime || '',
        actualTime: race.actualTime || '',
        priority: race.priority || 'media',
        goal: race.goal || 'ninguno',
        notes: race.notes || '',
      });
    }
  }, [race]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const isMultiDiscipline = formData.raceType === 'triatlón' || formData.raceType === 'duatlón';
    
    const raceData: Race = {
      id: race?.id || generateId(),
      userId: user.id,
      name: formData.name,
      date: new Date(formData.date + 'T00:00:00').toISOString(),
      raceType: formData.raceType,
      distance: isMultiDiscipline ? 0 : parseFloat(formData.distance) * 1000,
      actualDistance: !isMultiDiscipline && formData.actualDistance ? parseFloat(formData.actualDistance) * 1000 : undefined,
      swimmingDistance: (formData.raceType === 'triatlón' && formData.swimmingDistance) ? {
        distance: parseFloat(formData.swimmingDistance) * 1000,
        actualDistance: formData.swimmingActualDistance ? parseFloat(formData.swimmingActualDistance) * 1000 : undefined,
      } : undefined,
      cyclingDistance: (isMultiDiscipline && formData.cyclingDistance) ? {
        distance: parseFloat(formData.cyclingDistance) * 1000,
        actualDistance: formData.cyclingActualDistance ? parseFloat(formData.cyclingActualDistance) * 1000 : undefined,
      } : undefined,
      firstRunDistance: (formData.raceType === 'duatlón' && formData.firstRunDistance) ? {
        distance: parseFloat(formData.firstRunDistance) * 1000,
        actualDistance: formData.firstRunActualDistance ? parseFloat(formData.firstRunActualDistance) * 1000 : undefined,
      } : undefined,
      runningDistance: (isMultiDiscipline && formData.runningDistance) ? {
        distance: parseFloat(formData.runningDistance) * 1000,
        actualDistance: formData.runningActualDistance ? parseFloat(formData.runningActualDistance) * 1000 : undefined,
      } : undefined,
      transition1Time: (isMultiDiscipline && formData.transition1Time) ? {
        time: formData.transition1Time,
      } : undefined,
      transition2Time: (isMultiDiscipline && formData.transition2Time) ? {
        time: formData.transition2Time,
      } : undefined,
      swimmingTime: (formData.raceType === 'triatlón' && formData.swimmingTime) ? formData.swimmingTime : undefined,
      cyclingTime: (isMultiDiscipline && formData.cyclingTime) ? formData.cyclingTime : undefined,
      firstRunTime: (formData.raceType === 'duatlón' && formData.firstRunTime) ? formData.firstRunTime : undefined,
      runningTime: (isMultiDiscipline && formData.runningTime) ? formData.runningTime : undefined,
      targetTime: formData.targetTime || undefined,
      actualTime: formData.actualTime || undefined,
      priority: formData.priority,
      goal: formData.goal,
      notes: formData.notes || undefined,
      createdAt: race?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRace(raceData);
    onSave();
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent onClose={onCancel} className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{race ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Carrera *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Maratón de Buenos Aires"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raceType">Tipo de Carrera *</Label>
            <Select
              id="raceType"
              value={formData.raceType}
              onChange={(e) => setFormData({ ...formData, raceType: e.target.value as RaceType })}
              required
            >
              {RACE_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          {(formData.raceType === 'triatlón' || formData.raceType === 'duatlón') ? (
            <>
              {formData.raceType === 'triatlón' && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4 text-cyan-600">🏊 Natación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="swimmingDistance">Distancia Natación (km) *</Label>
                        <Input
                          id="swimmingDistance"
                          type="number"
                          step="0.1"
                          value={formData.swimmingDistance}
                          onChange={(e) => setFormData({ ...formData, swimmingDistance: e.target.value })}
                          placeholder="1.5"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="swimmingActualDistance">Distancia Real (km)</Label>
                        <Input
                          id="swimmingActualDistance"
                          type="number"
                          step="0.1"
                          value={formData.swimmingActualDistance}
                          onChange={(e) => setFormData({ ...formData, swimmingActualDistance: e.target.value })}
                          placeholder="1.5"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="swimmingTime">Tiempo Natación</Label>
                      <Input
                        id="swimmingTime"
                        type="time"
                        step="1"
                        value={formData.swimmingTime}
                        onChange={(e) => setFormData({ ...formData, swimmingTime: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.raceType === 'duatlón' && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">🏃 Primera Carrera</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstRunDistance">Distancia Primera Carrera (km) *</Label>
                        <Input
                          id="firstRunDistance"
                          type="number"
                          step="0.1"
                          value={formData.firstRunDistance}
                          onChange={(e) => setFormData({ ...formData, firstRunDistance: e.target.value })}
                          placeholder="5"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstRunActualDistance">Distancia Real (km)</Label>
                        <Input
                          id="firstRunActualDistance"
                          type="number"
                          step="0.1"
                          value={formData.firstRunActualDistance}
                          onChange={(e) => setFormData({ ...formData, firstRunActualDistance: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="firstRunTime">Tiempo Primera Carrera</Label>
                      <Input
                        id="firstRunTime"
                        type="time"
                        step="1"
                        value={formData.firstRunTime}
                        onChange={(e) => setFormData({ ...formData, firstRunTime: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 text-orange-600">🚴 Ciclismo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cyclingDistance">Distancia Ciclismo (km) *</Label>
                    <Input
                      id="cyclingDistance"
                      type="number"
                      step="0.1"
                      value={formData.cyclingDistance}
                      onChange={(e) => setFormData({ ...formData, cyclingDistance: e.target.value })}
                      placeholder="40"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cyclingActualDistance">Distancia Real (km)</Label>
                    <Input
                      id="cyclingActualDistance"
                      type="number"
                      step="0.1"
                      value={formData.cyclingActualDistance}
                      onChange={(e) => setFormData({ ...formData, cyclingActualDistance: e.target.value })}
                      placeholder="40"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="cyclingTime">Tiempo Ciclismo</Label>
                  <Input
                    id="cyclingTime"
                    type="time"
                    step="1"
                    value={formData.cyclingTime}
                    onChange={(e) => setFormData({ ...formData, cyclingTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 text-green-600">🏃 {formData.raceType === 'triatlón' ? 'Carrera' : 'Segunda Carrera'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="runningDistance">Distancia Carrera (km) *</Label>
                    <Input
                      id="runningDistance"
                      type="number"
                      step="0.1"
                      value={formData.runningDistance}
                      onChange={(e) => setFormData({ ...formData, runningDistance: e.target.value })}
                      placeholder={formData.raceType === 'triatlón' ? '10' : '5'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runningActualDistance">Distancia Real (km)</Label>
                    <Input
                      id="runningActualDistance"
                      type="number"
                      step="0.1"
                      value={formData.runningActualDistance}
                      onChange={(e) => setFormData({ ...formData, runningActualDistance: e.target.value })}
                      placeholder={formData.raceType === 'triatlón' ? '10' : '5'}
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="runningTime">Tiempo Carrera</Label>
                  <Input
                    id="runningTime"
                    type="time"
                    step="1"
                    value={formData.runningTime}
                    onChange={(e) => setFormData({ ...formData, runningTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">⏱️ Transiciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transition1Time">T1 - {formData.raceType === 'triatlón' ? 'Natación → Ciclismo' : 'Carrera → Ciclismo'}</Label>
                    <Input
                      id="transition1Time"
                      type="time"
                      step="1"
                      value={formData.transition1Time}
                      onChange={(e) => setFormData({ ...formData, transition1Time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transition2Time">T2 - Ciclismo → Carrera</Label>
                    <Input
                      id="transition2Time"
                      type="time"
                      step="1"
                      value={formData.transition2Time}
                      onChange={(e) => setFormData({ ...formData, transition2Time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">⏱️ Tiempos Totales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetTime">Tiempo Objetivo Total</Label>
                    <Input
                      id="targetTime"
                      type="time"
                      step="1"
                      value={formData.targetTime}
                      onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actualTime">Tiempo Real Total</Label>
                    <Input
                      id="actualTime"
                      type="time"
                      step="1"
                      value={formData.actualTime}
                      onChange={(e) => setFormData({ ...formData, actualTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distancia (km) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="42.2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualDistance">Distancia Real Corrida (km)</Label>
                  <Input
                    id="actualDistance"
                    type="number"
                    step="0.1"
                    value={formData.actualDistance}
                    onChange={(e) => setFormData({ ...formData, actualDistance: e.target.value })}
                    placeholder="42.5 (si te pasaste)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetTime">Tiempo Objetivo</Label>
                  <Input
                    id="targetTime"
                    type="time"
                    step="1"
                    value={formData.targetTime}
                    onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualTime">Tiempo Real</Label>
                  <Input
                    id="actualTime"
                    type="time"
                    step="1"
                    value={formData.actualTime}
                    onChange={(e) => setFormData({ ...formData, actualTime: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad *</Label>
              <Select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as RacePriority })}
                required
              >
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Objetivo *</Label>
              <Select
                id="goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as RaceGoal })}
                required
              >
                {GOALS.map(goal => (
                  <option key={goal} value={goal}>
                    {goal === 'completar' ? 'Completar' : goal === 'tiempo' ? 'Hacer X tiempo' : goal === 'disfrutar' ? 'Disfrutar' : 'Ninguno'}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones sobre la carrera..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {race ? 'Actualizar' : 'Crear'} Carrera
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
