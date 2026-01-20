import React, { useState, useEffect } from 'react';
import { Race, RaceType, RacePriority, RaceGoal, DuathlonDiscipline, DayDistance } from '../types';
import { saveRace, generateId } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface RaceFormProps {
  race?: Race;
  onSave: () => void;
  onCancel: () => void;
}

const RACE_TYPES: RaceType[] = ['calle', 'trail', 'postas', 'natación', 'triatlón', 'duatlón', 'otro'];
const PRIORITIES: RacePriority[] = ['máxima', 'alta', 'media', 'baja', 'ninguna'];
const GOALS: RaceGoal[] = ['completar', 'tiempo', 'disfrutar', 'ninguno'];

export function RaceForm({ race, onSave, onCancel }: RaceFormProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    raceType: 'calle' as RaceType,
    distance: '',
    actualDistance: '',
    isMultiDay: false,
    dayDistances: [] as Array<{ day: number; distance: string; actualDistance: string; elevation: string }>,
    elevation: '',
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
    // Duathlon customizable disciplines
    firstDiscipline: 'carrera' as DuathlonDiscipline,
    secondDiscipline: 'ciclismo' as DuathlonDiscipline,
    firstDisciplineDistance: '',
    firstDisciplineActualDistance: '',
    secondDisciplineDistance: '',
    secondDisciplineActualDistance: '',
    firstDisciplineTime: '',
    secondDisciplineTime: '',
  });

  useEffect(() => {
    if (race) {
      setFormData({
        name: race.name,
        date: race.date.split('T')[0],
        raceType: race.raceType,
        distance: (race.distance / 1000).toString(),
        actualDistance: race.actualDistance ? (race.actualDistance / 1000).toString() : '',
        isMultiDay: race.isMultiDay || false,
        dayDistances: race.dayDistances ? race.dayDistances.map(dd => ({
          day: dd.day,
          distance: (dd.distance / 1000).toString(),
          actualDistance: dd.actualDistance ? (dd.actualDistance / 1000).toString() : '',
          elevation: dd.elevation ? dd.elevation.toString() : '',
        })) : [],
        elevation: race.elevation ? race.elevation.toString() : '',
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
        // Duathlon customizable disciplines
        firstDiscipline: race.firstDiscipline || (race.firstRunDistance ? 'carrera' : 'carrera') as DuathlonDiscipline,
        secondDiscipline: race.secondDiscipline || (race.runningDistance ? 'carrera' : 'ciclismo') as DuathlonDiscipline,
        firstDisciplineDistance: race.firstDisciplineData?.distance ? (race.firstDisciplineData.distance / 1000).toString() : (race.firstRunDistance ? (race.firstRunDistance.distance / 1000).toString() : ''),
        firstDisciplineActualDistance: race.firstDisciplineData?.actualDistance ? (race.firstDisciplineData.actualDistance / 1000).toString() : (race.firstRunDistance?.actualDistance ? (race.firstRunDistance.actualDistance / 1000).toString() : ''),
        secondDisciplineDistance: race.secondDisciplineData?.distance ? (race.secondDisciplineData.distance / 1000).toString() : (race.runningDistance ? (race.runningDistance.distance / 1000).toString() : ''),
        secondDisciplineActualDistance: race.secondDisciplineData?.actualDistance ? (race.secondDisciplineData.actualDistance / 1000).toString() : (race.runningDistance?.actualDistance ? (race.runningDistance.actualDistance / 1000).toString() : ''),
        firstDisciplineTime: race.firstDisciplineTime || race.firstRunTime || '',
        secondDisciplineTime: race.secondDisciplineTime || race.runningTime || '',
      });
    }
  }, [race]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate multi-day race has at least one day with distance
    if (formData.isMultiDay) {
      const validDays = formData.dayDistances.filter(dd => dd.distance && parseFloat(dd.distance.replace(',', '.')) > 0);
      if (validDays.length === 0) {
        alert('Por favor, agrega al menos un día con distancia para carreras multi-día.');
        return;
      }
    }

    setSaving(true);

    try {
      const isMultiDiscipline = formData.raceType === 'triatlón' || formData.raceType === 'duatlón';
      
      // Calculate total distance and elevation for multi-day races
      let totalDistance = 0;
      let totalElevation = 0;
      let dayDistancesArray: DayDistance[] | undefined = undefined;
      
      if (formData.isMultiDay && formData.dayDistances.length > 0) {
        dayDistancesArray = formData.dayDistances
          .filter(dd => dd.distance && parseFloat(dd.distance.replace(',', '.')) > 0)
          .map((dd, index) => {
            const elevation = (formData.raceType === 'trail' && dd.elevation) ? parseInt(dd.elevation) : undefined;
            if (elevation) {
              totalElevation += elevation;
            }
            return {
              day: dd.day || index + 1,
              distance: parseFloat(dd.distance.replace(',', '.')) * 1000,
              actualDistance: dd.actualDistance ? parseFloat(dd.actualDistance.replace(',', '.')) * 1000 : undefined,
              elevation: elevation,
            };
          });
        totalDistance = dayDistancesArray.reduce((sum, dd) => sum + dd.distance, 0);
      } else if (!isMultiDiscipline && !formData.isMultiDay) {
        totalDistance = formData.distance ? parseFloat(formData.distance.replace(',', '.')) * 1000 : 0;
      }
      
      // Calculate elevation: for multi-day trail races use total, for single-day use form field
      const finalElevation = formData.isMultiDay && formData.raceType === 'trail'
        ? (totalElevation > 0 ? totalElevation : undefined)
        : (formData.raceType === 'trail' && formData.elevation ? parseInt(formData.elevation) : undefined);
      
      const raceData: Race = {
        id: race?.id || generateId(),
        userId: user.id,
        name: formData.name,
        date: new Date(formData.date + 'T00:00:00').toISOString(),
        raceType: formData.raceType,
        distance: totalDistance,
        actualDistance: formData.isMultiDay 
          ? undefined // For multi-day, actualDistance is per day
          : (!isMultiDiscipline && formData.actualDistance ? parseFloat(formData.actualDistance.replace(',', '.').replace(/[^0-9.]/g, '')) * 1000 : undefined),
        isMultiDay: formData.isMultiDay || undefined,
        dayDistances: dayDistancesArray,
        elevation: finalElevation,
        swimmingDistance: (formData.raceType === 'triatlón' && formData.swimmingDistance) ? {
          distance: parseFloat(formData.swimmingDistance) * 1000,
          actualDistance: formData.swimmingActualDistance ? parseFloat(formData.swimmingActualDistance) * 1000 : undefined,
        } : undefined,
        cyclingDistance: (formData.raceType === 'triatlón' && formData.cyclingDistance) ? {
          distance: parseFloat(formData.cyclingDistance) * 1000,
          actualDistance: formData.cyclingActualDistance ? parseFloat(formData.cyclingActualDistance) * 1000 : undefined,
        } : (formData.raceType === 'duatlón' && (formData.firstDiscipline === 'ciclismo' || formData.secondDiscipline === 'ciclismo')) ? {
          distance: formData.firstDiscipline === 'ciclismo' 
            ? parseFloat(formData.firstDisciplineDistance) * 1000
            : parseFloat(formData.secondDisciplineDistance) * 1000,
          actualDistance: formData.firstDiscipline === 'ciclismo'
            ? (formData.firstDisciplineActualDistance ? parseFloat(formData.firstDisciplineActualDistance) * 1000 : undefined)
            : (formData.secondDisciplineActualDistance ? parseFloat(formData.secondDisciplineActualDistance) * 1000 : undefined),
        } : undefined,
        firstRunDistance: (formData.raceType === 'duatlón' && formData.firstDiscipline === 'carrera' && formData.firstDisciplineDistance) ? {
          distance: parseFloat(formData.firstDisciplineDistance) * 1000,
          actualDistance: formData.firstDisciplineActualDistance ? parseFloat(formData.firstDisciplineActualDistance) * 1000 : undefined,
        } : undefined,
        runningDistance: (formData.raceType === 'triatlón' && formData.runningDistance) ? {
          distance: parseFloat(formData.runningDistance) * 1000,
          actualDistance: formData.runningActualDistance ? parseFloat(formData.runningActualDistance) * 1000 : undefined,
        } : undefined,
        // Duathlon customizable disciplines
        firstDiscipline: formData.raceType === 'duatlón' ? formData.firstDiscipline : undefined,
        secondDiscipline: formData.raceType === 'duatlón' ? formData.secondDiscipline : undefined,
        firstDisciplineData: (formData.raceType === 'duatlón' && formData.firstDisciplineDistance) ? {
          distance: parseFloat(formData.firstDisciplineDistance) * 1000,
          actualDistance: formData.firstDisciplineActualDistance ? parseFloat(formData.firstDisciplineActualDistance) * 1000 : undefined,
        } : undefined,
        secondDisciplineData: (formData.raceType === 'duatlón' && formData.secondDisciplineDistance) ? {
          distance: parseFloat(formData.secondDisciplineDistance) * 1000,
          actualDistance: formData.secondDisciplineActualDistance ? parseFloat(formData.secondDisciplineActualDistance) * 1000 : undefined,
        } : undefined,
        firstDisciplineTime: formData.raceType === 'duatlón' && formData.firstDisciplineTime ? formData.firstDisciplineTime : undefined,
        secondDisciplineTime: formData.raceType === 'duatlón' && formData.secondDisciplineTime ? formData.secondDisciplineTime : undefined,
        transition1Time: (isMultiDiscipline && formData.transition1Time) ? {
          time: formData.transition1Time,
        } : undefined,
        transition2Time: (isMultiDiscipline && formData.transition2Time) ? {
          time: formData.transition2Time,
        } : undefined,
        swimmingTime: (formData.raceType === 'triatlón' && formData.swimmingTime) ? formData.swimmingTime : undefined,
        cyclingTime: (formData.raceType === 'triatlón' && formData.cyclingTime) ? formData.cyclingTime : (formData.raceType === 'duatlón' && (formData.firstDiscipline === 'ciclismo' || formData.secondDiscipline === 'ciclismo')) ? (formData.firstDiscipline === 'ciclismo' ? formData.firstDisciplineTime : formData.secondDisciplineTime) : undefined,
        firstRunTime: (formData.raceType === 'duatlón' && formData.firstDiscipline === 'carrera' && formData.firstDisciplineTime) ? formData.firstDisciplineTime : undefined,
        runningTime: (formData.raceType === 'triatlón' && formData.runningTime) ? formData.runningTime : undefined,
        targetTime: formData.targetTime || undefined,
        actualTime: formData.actualTime || undefined,
        priority: formData.priority,
        goal: formData.goal,
        notes: formData.notes || undefined,
        createdAt: race?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveRace(raceData);
      onSave();
    } catch (error) {
      console.error('Error saving race:', error);
      alert('Error al guardar la carrera. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
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

          {/* Multi-day race option */}
          {(formData.raceType !== 'triatlón' && formData.raceType !== 'duatlón') && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isMultiDay"
                  checked={formData.isMultiDay}
                  onChange={(e) => {
                    const isMultiDay = e.target.checked;
                    setFormData({
                      ...formData,
                      isMultiDay,
                      dayDistances: isMultiDay && formData.dayDistances.length === 0 
                        ? [{ day: 1, distance: '', actualDistance: '', elevation: '' }]
                        : formData.dayDistances,
                    });
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor="isMultiDay" className="cursor-pointer">
                  Carrera de múltiples días (ej: El Cruce - 3 días)
                </Label>
              </div>

              {formData.isMultiDay && (
                <div className="space-y-3 pl-6 border-l-2">
                  <div className="flex items-center justify-between">
                    <Label>Distancias por día</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDay = formData.dayDistances.length + 1;
                        setFormData({
                          ...formData,
                          dayDistances: [...formData.dayDistances, { day: newDay, distance: '', actualDistance: '', elevation: '' }],
                        });
                      }}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Día
                    </Button>
                  </div>
                  {formData.dayDistances.map((dayDist, index) => (
                    <div key={index} className="space-y-3 border-b pb-3 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-semibold">Día {dayDist.day}</Label>
                        {formData.dayDistances.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newDayDistances = formData.dayDistances.filter((_, i) => i !== index);
                              // Renumber days
                              newDayDistances.forEach((dd, i) => {
                                dd.day = i + 1;
                              });
                              setFormData({ ...formData, dayDistances: newDayDistances });
                            }}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`dayDistance-${index}`}>Distancia (km) *</Label>
                          <Input
                            id={`dayDistance-${index}`}
                            type="number"
                            step="0.1"
                            value={dayDist.distance}
                            onChange={(e) => {
                              const newDayDistances = [...formData.dayDistances];
                              newDayDistances[index].distance = e.target.value;
                              setFormData({ ...formData, dayDistances: newDayDistances });
                            }}
                            placeholder="10"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`dayActualDistance-${index}`}>Distancia Real (km)</Label>
                          <Input
                            id={`dayActualDistance-${index}`}
                            type="number"
                            step="0.1"
                            value={dayDist.actualDistance}
                            onChange={(e) => {
                              const newDayDistances = [...formData.dayDistances];
                              newDayDistances[index].actualDistance = e.target.value;
                              setFormData({ ...formData, dayDistances: newDayDistances });
                            }}
                            placeholder="10.2"
                          />
                        </div>
                        {formData.raceType === 'trail' && (
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`dayElevation-${index}`}>⛰️ Altimetría Día {dayDist.day} (metros)</Label>
                            <Input
                              id={`dayElevation-${index}`}
                              type="number"
                              value={dayDist.elevation}
                              onChange={(e) => {
                                const newDayDistances = [...formData.dayDistances];
                                newDayDistances[index].elevation = e.target.value;
                                setFormData({ ...formData, dayDistances: newDayDistances });
                              }}
                              placeholder="Ej: 500"
                            />
                          </div>
                        )}
                      </div>
                      {formData.raceType === 'trail' && formData.dayDistances.some(dd => dd.elevation) && (
                        <div className="text-sm text-muted-foreground pt-1">
                          Altimetría Total: {formData.dayDistances.reduce((sum, dd) => sum + (parseInt(dd.elevation || '0') || 0), 0).toLocaleString()} m
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Elevation for trail races (only show for single-day races) */}
          {formData.raceType === 'trail' && !formData.isMultiDay && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="elevation">Altimetría Total (metros)</Label>
              <Input
                id="elevation"
                type="number"
                value={formData.elevation}
                onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                placeholder="Ej: 1500"
              />
              <p className="text-sm text-muted-foreground">
                Desnivel total acumulado de la carrera
              </p>
            </div>
          )}

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
                    <h3 className="text-lg font-semibold mb-4">Configuración de Disciplinas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstDiscipline">Primera Disciplina *</Label>
                        <Select
                          id="firstDiscipline"
                          value={formData.firstDiscipline}
                          onChange={(e) => setFormData({ ...formData, firstDiscipline: e.target.value as DuathlonDiscipline })}
                          required
                        >
                          <option value="carrera">🏃 Carrera</option>
                          <option value="ciclismo">🚴 Ciclismo</option>
                          <option value="natación">🏊 Natación</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondDiscipline">Segunda Disciplina *</Label>
                        <Select
                          id="secondDiscipline"
                          value={formData.secondDiscipline}
                          onChange={(e) => setFormData({ ...formData, secondDiscipline: e.target.value as DuathlonDiscipline })}
                          required
                        >
                          <option value="carrera">🏃 Carrera</option>
                          <option value="ciclismo">🚴 Ciclismo</option>
                          <option value="natación">🏊 Natación</option>
                        </Select>
                      </div>
                    </div>

                    {/* Primera Disciplina */}
                    <div className="border-t pt-4 mb-4">
                      <h3 className="text-lg font-semibold mb-4">
                        {formData.firstDiscipline === 'carrera' && '🏃'} 
                        {formData.firstDiscipline === 'ciclismo' && '🚴'} 
                        {formData.firstDiscipline === 'natación' && '🏊'} 
                        {' '}
                        Primera Disciplina ({formData.firstDiscipline === 'carrera' ? 'Carrera' : formData.firstDiscipline === 'ciclismo' ? 'Ciclismo' : 'Natación'})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstDisciplineDistance">
                            Distancia {formData.firstDiscipline === 'carrera' ? 'Carrera' : formData.firstDiscipline === 'ciclismo' ? 'Ciclismo' : 'Natación'} (km) *
                          </Label>
                          <Input
                            id="firstDisciplineDistance"
                            type="number"
                            step="0.1"
                            value={formData.firstDisciplineDistance}
                            onChange={(e) => setFormData({ ...formData, firstDisciplineDistance: e.target.value })}
                            placeholder={formData.firstDiscipline === 'carrera' ? '5' : formData.firstDiscipline === 'ciclismo' ? '40' : '1.5'}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="firstDisciplineActualDistance">Distancia Real (km)</Label>
                          <Input
                            id="firstDisciplineActualDistance"
                            type="number"
                            step="0.1"
                            value={formData.firstDisciplineActualDistance}
                            onChange={(e) => setFormData({ ...formData, firstDisciplineActualDistance: e.target.value })}
                            placeholder={formData.firstDiscipline === 'carrera' ? '5' : formData.firstDiscipline === 'ciclismo' ? '40' : '1.5'}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="firstDisciplineTime">
                          Tiempo {formData.firstDiscipline === 'carrera' ? 'Carrera' : formData.firstDiscipline === 'ciclismo' ? 'Ciclismo' : 'Natación'}
                        </Label>
                        <Input
                          id="firstDisciplineTime"
                          type="time"
                          step="1"
                          value={formData.firstDisciplineTime}
                          onChange={(e) => setFormData({ ...formData, firstDisciplineTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Ciclismo para triatlón o si es segunda disciplina en duatlón */}
              {(formData.raceType === 'triatlón' || (formData.raceType === 'duatlón' && (formData.firstDiscipline === 'ciclismo' || formData.secondDiscipline === 'ciclismo'))) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-orange-600">
                    🚴 Ciclismo
                    {formData.raceType === 'duatlón' && formData.firstDiscipline === 'ciclismo' && ' (Primera Disciplina)'}
                    {formData.raceType === 'duatlón' && formData.secondDiscipline === 'ciclismo' && ' (Segunda Disciplina)'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cyclingDistance">Distancia Ciclismo (km) *</Label>
                      <Input
                        id="cyclingDistance"
                        type="number"
                        step="0.1"
                        value={formData.raceType === 'duatlón' && formData.firstDiscipline === 'ciclismo' 
                          ? formData.firstDisciplineDistance 
                          : formData.raceType === 'duatlón' && formData.secondDiscipline === 'ciclismo'
                          ? formData.secondDisciplineDistance
                          : formData.cyclingDistance}
                        onChange={(e) => {
                          if (formData.raceType === 'duatlón' && formData.firstDiscipline === 'ciclismo') {
                            setFormData({ ...formData, firstDisciplineDistance: e.target.value });
                          } else if (formData.raceType === 'duatlón' && formData.secondDiscipline === 'ciclismo') {
                            setFormData({ ...formData, secondDisciplineDistance: e.target.value });
                          } else {
                            setFormData({ ...formData, cyclingDistance: e.target.value });
                          }
                        }}
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
                        value={formData.raceType === 'duatlón' && formData.firstDiscipline === 'ciclismo'
                          ? formData.firstDisciplineActualDistance
                          : formData.raceType === 'duatlón' && formData.secondDiscipline === 'ciclismo'
                          ? formData.secondDisciplineActualDistance
                          : formData.cyclingActualDistance}
                        onChange={(e) => {
                          if (formData.raceType === 'duatlón' && formData.firstDiscipline === 'ciclismo') {
                            setFormData({ ...formData, firstDisciplineActualDistance: e.target.value });
                          } else if (formData.raceType === 'duatlón' && formData.secondDiscipline === 'ciclismo') {
                            setFormData({ ...formData, secondDisciplineActualDistance: e.target.value });
                          } else {
                            setFormData({ ...formData, cyclingActualDistance: e.target.value });
                          }
                        }}
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
                      value={formData.raceType === 'duatlón' && formData.firstDiscipline === 'ciclismo'
                        ? formData.firstDisciplineTime
                        : formData.raceType === 'duatlón' && formData.secondDiscipline === 'ciclismo'
                        ? formData.secondDisciplineTime
                        : formData.cyclingTime}
                      onChange={(e) => {
                        if (formData.raceType === 'duatlón' && formData.firstDiscipline === 'ciclismo') {
                          setFormData({ ...formData, firstDisciplineTime: e.target.value });
                        } else if (formData.raceType === 'duatlón' && formData.secondDiscipline === 'ciclismo') {
                          setFormData({ ...formData, secondDisciplineTime: e.target.value });
                        } else {
                          setFormData({ ...formData, cyclingTime: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Segunda Disciplina para duatlón */}
              {formData.raceType === 'duatlón' && formData.secondDiscipline !== 'ciclismo' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">
                    {formData.secondDiscipline === 'carrera' && '🏃'} 
                    {formData.secondDiscipline === 'natación' && '🏊'} 
                    {' '}
                    Segunda Disciplina ({formData.secondDiscipline === 'carrera' ? 'Carrera' : 'Natación'})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondDisciplineDistance">
                        Distancia {formData.secondDiscipline === 'carrera' ? 'Carrera' : 'Natación'} (km) *
                      </Label>
                      <Input
                        id="secondDisciplineDistance"
                        type="number"
                        step="0.1"
                        value={formData.secondDisciplineDistance}
                        onChange={(e) => setFormData({ ...formData, secondDisciplineDistance: e.target.value })}
                        placeholder={formData.secondDiscipline === 'carrera' ? '5' : '1.5'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondDisciplineActualDistance">Distancia Real (km)</Label>
                      <Input
                        id="secondDisciplineActualDistance"
                        type="number"
                        step="0.1"
                        value={formData.secondDisciplineActualDistance}
                        onChange={(e) => setFormData({ ...formData, secondDisciplineActualDistance: e.target.value })}
                        placeholder={formData.secondDiscipline === 'carrera' ? '5' : '1.5'}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="secondDisciplineTime">
                      Tiempo {formData.secondDiscipline === 'carrera' ? 'Carrera' : 'Natación'}
                    </Label>
                    <Input
                      id="secondDisciplineTime"
                      type="time"
                      step="1"
                      value={formData.secondDisciplineTime}
                      onChange={(e) => setFormData({ ...formData, secondDisciplineTime: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Carrera para triatlón */}
              {formData.raceType === 'triatlón' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">🏃 Carrera</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="runningDistance">Distancia Carrera (km) *</Label>
                      <Input
                        id="runningDistance"
                        type="number"
                        step="0.1"
                        value={formData.runningDistance}
                        onChange={(e) => setFormData({ ...formData, runningDistance: e.target.value })}
                        placeholder="10"
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
                        placeholder="10"
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
              )}

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">⏱️ Transiciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transition1Time">
                      T1 - {
                        formData.raceType === 'triatlón' 
                          ? 'Natación → Ciclismo'
                          : formData.raceType === 'duatlón'
                          ? `${formData.firstDiscipline === 'carrera' ? 'Carrera' : formData.firstDiscipline === 'ciclismo' ? 'Ciclismo' : 'Natación'} → ${formData.secondDiscipline === 'ciclismo' ? 'Ciclismo' : formData.firstDiscipline === 'ciclismo' ? (formData.secondDiscipline === 'carrera' ? 'Carrera' : 'Natación') : 'Ciclismo'}`
                          : 'Carrera → Ciclismo'
                      }
                    </Label>
                    <Input
                      id="transition1Time"
                      type="time"
                      step="1"
                      value={formData.transition1Time}
                      onChange={(e) => setFormData({ ...formData, transition1Time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transition2Time">
                      T2 - {
                        formData.raceType === 'triatlón'
                          ? 'Ciclismo → Carrera'
                          : formData.raceType === 'duatlón'
                          ? `${formData.firstDiscipline === 'ciclismo' ? 'Ciclismo' : 'Ciclismo'} → ${formData.secondDiscipline === 'carrera' ? 'Carrera' : formData.secondDiscipline === 'natación' ? 'Natación' : 'Ciclismo'}`
                          : 'Ciclismo → Carrera'
                      }
                    </Label>
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
              {!formData.isMultiDay && (
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
              )}

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
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : race ? 'Actualizar' : 'Crear'} Carrera
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
