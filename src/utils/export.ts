import { Race } from '../types';

export function exportRacesToCSV(races: Race[], filename: string = 'carreras') {
  // Headers del CSV
  const headers = [
    'Nombre',
    'Fecha',
    'Tipo de Carrera',
    'Distancia (km)',
    'Distancia Real (km)',
    'Tiempo Objetivo',
    'Tiempo Real',
    'Prioridad',
    'Objetivo',
    'Notas'
  ];

  // Convertir carreras a filas CSV
  const rows = races.map(race => {
    const formatDistance = (meters: number | undefined) => {
      if (!meters) return '';
      return (meters / 1000).toFixed(2);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    return [
      race.name || '',
      formatDate(race.date),
      race.raceType || '',
      formatDistance(race.distance),
      formatDistance(race.actualDistance),
      race.targetTime || '',
      race.actualTime || '',
      race.priority || '',
      race.goal || '',
      race.notes || ''
    ];
  });

  // Crear contenido CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Escapar comillas y envolver en comillas si contiene comas o comillas
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
