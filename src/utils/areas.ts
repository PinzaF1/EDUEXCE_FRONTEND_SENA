// Utilidades para nombres canónicos de áreas usadas en todo el frontend

export type AreaKey =
  | 'Lectura Critica'
  | 'Matematicas'
  | 'Sociales y Ciudadanas'
  | 'Ciencias Naturales'
  | 'Ingles';

export const AREAS_ORDER: AreaKey[] = [
  'Lectura Critica',
  'Matematicas',
  'Sociales y Ciudadanas',
  'Ciencias Naturales',
  'Ingles',
];

export const AREA_COLORS: Record<AreaKey, string> = {
  'Lectura Critica': '#3b82f6',
  Matematicas: '#ef4444',
  'Sociales y Ciudadanas': '#f59e0b',
  'Ciencias Naturales': '#10b981',
  Ingles: '#8b5cf6',
};

// Mapa de nombres legibles (con acentos) si se necesita mostrar otra variante
export const AREA_LABELS: Record<AreaKey, string> = {
  'Lectura Critica': 'Lectura Crítica',
  Matematicas: 'Matemáticas',
  'Sociales y Ciudadanas': 'Sociales y Ciudadanas',
  'Ciencias Naturales': 'Ciencias Naturales',
  Ingles: 'Inglés',
};

function stripAccents(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

export const normalizeArea = (raw: string | null | undefined): AreaKey | null => {
  const s = stripAccents(String(raw || ''));
  if (!s) return null;
  if (s.includes('lect') || s.includes('leng')) return 'Lectura Critica';
  if (s.includes('mate')) return 'Matematicas';
  if (s.includes('social')) return 'Sociales y Ciudadanas';
  if (s.includes('cien')) return 'Ciencias Naturales';
  if (s.includes('ingl')) return 'Ingles';
  return null;
};
