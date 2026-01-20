import React, { useState, useEffect, useMemo } from 'react';
import { Race } from '../types';
import { getRaces, deleteRace } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/context';
import { RaceCard } from '../components/RaceCard';
import { RaceTable } from '../components/RaceTable';
import { RaceForm } from '../components/RaceForm';
import { Calendar } from '../components/Calendar';
import { YearFilter } from '../components/YearFilter';
import { YearStats } from '../components/YearStats';
import { DisciplineFilter, getDisciplineTypes } from '../components/DisciplineFilter';
import { LanguageSelector } from '../components/LanguageSelector';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LogOut, Plus, Calendar as CalendarIcon, List, BarChart3, Download, LayoutGrid, Table } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export function Dashboard() {
  const { user, logout } = useAuth();
  const { t, language } = useI18n();
  const dateLocale = language === 'es' ? es : enUS;
  const [allRaces, setAllRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'stats'>('calendar');
  const [listViewType, setListViewType] = useState<'card' | 'table'>('card');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'distance' | null>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<'all' | 'running' | 'natación' | 'triatlón' | 'duatlón' | null>('all');

  const loadRaces = async () => {
    if (user) {
      try {
        setLoading(true);
        const userRaces = await getRaces(user.id);
        setAllRaces(userRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      } catch (error) {
        console.error('Error loading races:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRaces();
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
    
    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name, 'es');
            break;
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case 'distance':
            const getDistance = (race: Race): number => {
              if (race.raceType === 'triatlón' || race.raceType === 'duatlón') {
                let total = 0;
                if (race.swimmingDistance) total += race.swimmingDistance.distance;
                if (race.cyclingDistance) total += race.cyclingDistance.distance;
                if (race.runningDistance) total += race.runningDistance.distance;
                if (race.firstRunDistance) total += race.firstRunDistance.distance;
                if (race.firstDisciplineData) total += race.firstDisciplineData.distance;
                if (race.secondDisciplineData) total += race.secondDisciplineData.distance;
                return total;
              }
              return race.actualDistance || race.distance;
            };
            comparison = getDistance(a) - getDistance(b);
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }
    
    return filtered;
  }, [allRaces, selectedYear, selectedDiscipline, viewMode, sortBy, sortOrder]);

  const handleSort = (field: 'name' | 'date' | 'distance') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };


  const handleSave = async () => {
    await loadRaces();
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

  const handleDelete = async (id: string) => {
    if (window.confirm(t('errors.deleteError'))) {
      try {
        await deleteRace(id);
        await loadRaces();
      } catch (error) {
        console.error('Error deleting race:', error);
        alert(t('errors.deleteError'));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground mt-1">Hola, {user.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSelector />
              <div className="inline-flex rounded-lg border bg-muted p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {language === 'es' ? 'Calendario' : 'Calendar'}
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  {language === 'es' ? 'Lista' : 'List'}
                </Button>
                <Button
                  variant={viewMode === 'stats' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('stats')}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  {language === 'es' ? 'Estadísticas' : 'Statistics'}
                </Button>
              </div>
              <Button onClick={handleNewRace} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('dashboard.addRace')}
              </Button>
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {viewMode === 'list' && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-4">
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
              </div>
              <div className="inline-flex rounded-lg border bg-muted p-1">
                <Button
                  variant={listViewType === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setListViewType('card')}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  {language === 'es' ? 'Cards' : 'Cards'}
                </Button>
                <Button
                  variant={listViewType === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setListViewType('table')}
                  className="gap-2"
                >
                  <Table className="h-4 w-4" />
                  {language === 'es' ? 'Tabla' : 'Table'}
                </Button>
              </div>
            </div>
          </>
        )}

        {viewMode === 'stats' && (
          <YearFilter
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={setSelectedYear}
            showAll={false}
          />
        )}

        {viewMode === 'calendar' && (
          <div className="space-y-6">
            <Calendar races={filteredRaces} onDateClick={handleDateClick} />
            {selectedDate && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {language === 'es' 
                    ? `Carreras del ${format(selectedDate, "d 'de' MMMM", { locale: dateLocale })}`
                    : `Races on ${format(selectedDate, "MMMM d", { locale: dateLocale })}`}
                </h3>
                {filteredRaces.filter(r => {
                  const dateStr = r.date.split('T')[0];
                  const [year, month, day] = dateStr.split('-').map(Number);
                  const raceDate = new Date(year, month - 1, day);
                  return format(raceDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                }).length === 0 ? (
                  <p className="text-muted-foreground">
                    {language === 'es' ? 'No hay carreras programadas para esta fecha' : 'No races scheduled for this date'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filteredRaces
                      .filter(r => {
                        const dateStr = r.date.split('T')[0];
                        const [year, month, day] = dateStr.split('-').map(Number);
                        const raceDate = new Date(year, month - 1, day);
                        return format(raceDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      })
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
                  {language === 'es' 
                    ? `No tienes carreras registradas${selectedYear ? ` para ${selectedYear}` : ''}${selectedDiscipline !== 'all' && selectedDiscipline !== null ? ` de tipo ${selectedDiscipline}` : ''}.`
                    : `You have no registered races${selectedYear ? ` for ${selectedYear}` : ''}${selectedDiscipline !== 'all' && selectedDiscipline !== null ? ` of type ${selectedDiscipline}` : ''}.`}
                </p>
                <Button onClick={handleNewRace}>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'es' ? 'Crear tu primera carrera' : 'Create your first race'}
                </Button>
              </Card>
            ) : listViewType === 'card' ? (
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
            ) : (
              <Card className="p-0 overflow-hidden">
                <RaceTable
                  races={filteredRaces}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </Card>
            )}
          </div>
        )}

        {viewMode === 'stats' && (
          <div>
            {selectedYear ? (
              <YearStats races={allRaces} year={selectedYear} />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">{language === 'es' ? 'Selecciona un año para ver las estadísticas' : 'Select a year to view statistics'}</p>
              </Card>
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
