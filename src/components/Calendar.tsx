import React, { useState } from 'react';
import { Race } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useI18n } from '../i18n/context';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps {
  races: Race[];
  onDateClick: (date: Date) => void;
}

export function Calendar({ races, onDateClick }: CalendarProps) {
  const { t, language } = useI18n();
  const dateLocale = language === 'es' ? es : enUS;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const weekDays = language === 'es' 
    ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);
  const daysToPrepend = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const getRacesForDate = (date: Date) => {
    return races.filter(race => {
      // Parse date correctly - PostgreSQL DATE comes as "YYYY-MM-DD"
      const dateStr = race.date.split('T')[0]; // Get "YYYY-MM-DD" part
      const [year, month, day] = dateStr.split('-').map(Number);
      const raceDate = new Date(year, month - 1, day); // month is 0-indexed
      return isSameDay(raceDate, date);
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              {language === 'es' ? 'Hoy' : 'Today'}
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {Array.from({ length: daysToPrepend }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {daysInMonth.map(day => {
            const dayRaces = getRacesForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className={`
                  aspect-square border-2 rounded-lg p-2 transition-all hover:bg-accent hover:border-primary
                  ${isToday ? 'bg-primary/10 border-primary font-bold' : 'border-border'}
                  ${dayRaces.length > 0 ? 'bg-green-50 dark:bg-green-950 border-green-500' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {dayRaces.length > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mt-1">
                      {dayRaces.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
