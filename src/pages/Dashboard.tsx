import React, { useState, useEffect, useMemo } from 'react';
import { Race } from '../types';
import { getRaces, deleteRace } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { RaceCard } from '../components/RaceCard';
import { RaceForm } from '../components/RaceForm';
import { Calendar } from '../components/Calendar';
import { YearFilter } from '../components/YearFilter';
import { YearStats } from '../components/YearStats';
import { DisciplineFilter, getDisciplineTypes } from '../components/DisciplineFilter';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LogOut, Plus, Calendar as CalendarIcon, List, BarChart3, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [allRaces, setAllRaces] = useState<Race[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'stats' | 'completed'>('calendar');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<'all' | 'running' | 'natación' | 'triatlón' | 'duatlón' | null>('all');

  useEffect(() => {
    if (user) {
      const userRaces = getRaces(user.id);
      setAllRaces(userRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
  }, [user]);

  const availableYears = useMemo(() => {
    const years = new Set(allRaces.map(r => new Date(r.date).getFullYear()));
    return Array.from(years);
  }, [allRaces]);

  const filteredRaces = useMemo(() => {
    let filtered = allRaces;
    
    if (selectedYear !== null) {
      filtered = filtered.filter(r => new Date(r.date).getFullYear() === selectedYear);
    }
    
    if (viewMode === 'list' && selectedDiscipline !== 'all' && selectedDiscipline !== null) {
      const disciplineTypes = getDisciplineTypes(selectedDiscipline);
      if (disciplineTypes.length > 0) {
        filtered = filtered.filter(r => disciplineTypes.includes(r.raceType));
      }
    }
    
    return filtered;
  }, [allRaces, selectedYear, selectedDiscipline, viewMode]);

  const completedRaces = useMemo(() => {
    return allRaces.filter(r => r.actualTime).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allRaces]);

  const handleSave = () => {
    if (user) {
      const userRaces = getRaces(user.id);
      setAllRaces(userRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
    setShowForm(false);
    setEditingRace(undefined);
    setSelectedDate(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRace(undefined);
  };

  const handleEdit = (race: Race) => {
    setEditingRace(race);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta carrera?')) {
      deleteRace(id);
      if (user) {
        const userRaces = getRaces(user.id);
        setAllRaces(userRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingRace(undefined);
    setShowForm(true);
  };

  const handleNewRace = () => {
    setSelectedDate(null);
    setEditingRace(undefined);
    setShowForm(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Calendario de Carreras</h1>
              <p className="text-muted-foreground mt-1">Hola, {user.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border bg-muted p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendario
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Lista
                </Button>
                <Button
                  variant={viewMode === 'stats' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('stats')}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Estadísticas
                </Button>
                <Button
                  variant={viewMode === 'completed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('completed')}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completadas
                </Button>
              </div>
              <Button onClick={handleNewRace} className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Carrera
              </Button>
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {viewMode === 'list' && (
          <>
            <DisciplineFilter
              selectedDiscipline={selectedDiscipline}
              onDisciplineChange={setSelectedDiscipline}
            />
            <YearFilter
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={setSelectedYear}
              showAll={true}
            />
          </>
        )}

        {(viewMode === 'stats' || viewMode === 'completed') && (
          <YearFilter
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={setSelectedYear}
            showAll={viewMode === 'completed'}
          />
        )}

        {viewMode === 'calendar' && (
          <div className="space-y-6">
            <Calendar races={filteredRaces} onDateClick={handleDateClick} />
            {selectedDate && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Carreras del {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </h3>
                {filteredRaces.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')).length === 0 ? (
                  <p className="text-muted-foreground">No hay carreras programadas para esta fecha</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filteredRaces
                      .filter(r => format(new Date(r.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
                      .map(race => (
                        <RaceCard
                          key={race.id}
                          race={race}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div>
            {filteredRaces.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No tienes carreras registradas{selectedYear ? ` para ${selectedYear}` : ''}{selectedDiscipline !== 'all' && selectedDiscipline !== null ? ` de tipo ${selectedDiscipline}` : ''}.
                </p>
                <Button onClick={handleNewRace}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear tu primera carrera
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRaces.map(race => (
                  <RaceCard
                    key={race.id}
                    race={race}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'stats' && (
          <div>
            {selectedYear ? (
              <YearStats races={allRaces} year={selectedYear} />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Selecciona un año para ver las estadísticas</p>
              </Card>
            )}
          </div>
        )}

        {viewMode === 'completed' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Todas las Carreras Completadas</h2>
            {completedRaces.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Aún no has completado ninguna carrera.</p>
              </Card>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  Total: {completedRaces.length} carrera{completedRaces.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedRaces.map(race => (
                    <RaceCard
                      key={race.id}
                      race={race}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {showForm && (
        <RaceForm
          race={editingRace}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
