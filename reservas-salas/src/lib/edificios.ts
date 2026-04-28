/**
 * Jerarquía real de espacios de la Universidad Autónoma de Occidente (Campus
 * Valle del Lilí). Cada edificio tiene reglas distintas para componer el
 * nombre y ubicación de una sala reservable.
 *
 * Ver `informacionUAO.txt` en la raíz del proyecto.
 */

export type TipoEdificio =
  | 'AULAS'     // 4 edificios con múltiples salones por piso, numeración 3 dígitos
  | 'TORREON'   // 5 torreones — un torreón por piso del campus, sin sub-salones
  | 'CRAI'      // biblioteca con salas nombradas (CELEE, Estudio 1, etc.)
  | 'ALA_SUR'   // oficinas + salas de juntas con nombre descriptivo
  | 'ALA_NORTE' // NOTA: Ala Norte es una extensión inventada para fines académicos; no aparece en informacionUAO.txt
  | 'CENTRAL'   // auditorios y salones específicos
  | 'BIENESTAR'; // salones de arte/cultura

export interface Edificio {
  id: string;       // identificador estable (para <select value>)
  label: string;    // cómo se muestra al usuario
  tipo: TipoEdificio;
}

export const EDIFICIOS: Edificio[] = [
  { id: 'AULAS_1', label: 'Aulas 1', tipo: 'AULAS' },
  { id: 'AULAS_2', label: 'Aulas 2', tipo: 'AULAS' },
  { id: 'AULAS_3', label: 'Aulas 3', tipo: 'AULAS' },
  { id: 'AULAS_4', label: 'Aulas 4', tipo: 'AULAS' },
  { id: 'TORREON_0', label: 'Torreón 0 (semi-subterráneo)', tipo: 'TORREON' },
  { id: 'TORREON_1', label: 'Torreón 1', tipo: 'TORREON' },
  { id: 'TORREON_2', label: 'Torreón 2', tipo: 'TORREON' },
  { id: 'TORREON_3', label: 'Torreón 3', tipo: 'TORREON' },
  { id: 'TORREON_4', label: 'Torreón 4', tipo: 'TORREON' },
  { id: 'CRAI', label: 'CRAI (biblioteca)', tipo: 'CRAI' },
  { id: 'ALA_SUR', label: 'Ala Sur', tipo: 'ALA_SUR' },
  // Ala Norte: edificio inventado para cubrir casos de posgrado e investigación (no está en informacionUAO.txt)
  { id: 'ALA_NORTE', label: 'Ala Norte', tipo: 'ALA_NORTE' },
  { id: 'CENTRAL', label: 'Edificio Central', tipo: 'CENTRAL' },
  { id: 'BIENESTAR', label: 'Edificio de Bienestar', tipo: 'BIENESTAR' },
];

/**
 * Máximo número de salón permitido por piso en edificios tipo AULAS.
 * - Pisos 1, 2 y 3: salones del 01 al 08.
 * - Piso 4:         salones del 01 al 12.
 *
 * Ejemplo: piso 2 → salones del 01 al 08 | piso 4 → salones del 01 al 12.
 */
export const AULAS_MAX_SALONES: Record<number, number> = {
  1: 8,
  2: 8,
  3: 8,
  4: 12,
};

/**
 * Retorna el máximo número de salón permitido para un edificio y piso dados.
 * Solo aplica a edificios tipo AULAS. Retorna null para otros tipos.
 */
export function getMaxSalonesPorPiso(edificioId: string, piso: string): number | null {
  const edificio = getEdificio(edificioId);
  if (!edificio || edificio.tipo !== 'AULAS') return null;
  const pisoNum = Number(piso);
  return AULAS_MAX_SALONES[pisoNum] ?? null;
}

/**
 * Parsea una ubicación del formato "Aulas N, Piso P, Salón SS" y retorna
 * sus partes. Retorna null si el formato no coincide.
 */

export function parseUbicacionAula(ubicacion: string): {
  edificioLabel: string; // "Aulas 3"
  piso: number;          // 2
  numero: number;        // 5
} | null {
  const match = ubicacion.match(/^(Aulas\s+\d+),\s*Piso\s+(\d+),\s*Sal[oó]n\s+(\d+)$/i);
  if (!match) return null;
  return {
    edificioLabel: match[1].trim(),
    piso: Number(match[2]),
    numero: Number(match[3]),
  };
}

/**
 * Verifica que una ubicación corresponde a un Torreón válido de la UAO.
 * Los Torreones son espacios únicos por piso — no tienen número de salón.
 * Retorna el número del torreón (0–4) o null si el formato no coincide.
 */
export function parseTorreon(ubicacion: string): number | null {
  const match = ubicacion.match(/^Torre[oó]n\s+(\d+),\s*Piso\s+\d+$/i);
  if (!match) return null;
  const num = Number(match[1]);
  // Solo existen Torreones 0, 1, 2, 3 y 4
  if (num < 0 || num > 4) return null;
  return num;
}

/** Lista de nombres de edificio para filtros en el catálogo (match sobre ubicacion). */
export const EDIFICIOS_UAO: string[] = EDIFICIOS.map((e) => {
  // Usamos el prefijo que aparece en ubicaciones reales.
  if (e.tipo === 'TORREON') return e.label.split(' (')[0]; // "Torreón 0"
  if (e.id === 'CRAI') return 'CRAI';
  if (e.id === 'BIENESTAR') return 'Bienestar';
  return e.label;
});

export function getEdificio(id: string): Edificio | undefined {
  return EDIFICIOS.find((e) => e.id === id);
}

/** Número de piso implícito para Torreones (el N del torreón). */
export function pisoDeTorreon(id: string): number {
  return Number(id.replace('TORREON_', ''));
}

/** Compone nombre único del salón según el tipo de edificio. */
export function componerNombre(params: {
  edificioId: string;
  piso?: string;
  numero?: string;
  descripcion?: string; // para CRAI/Ala Sur/Central/Bienestar
}): string | null {
  const edificio = getEdificio(params.edificioId);
  if (!edificio) return null;

  switch (edificio.tipo) {
    case 'AULAS': {
      if (!params.piso || !params.numero) return null;
      const nn = params.numero.padStart(2, '0');
      return `${edificio.label} - ${params.piso}${nn}`;
    }
    case 'TORREON':
      // Torreón N es el espacio único en el piso N del campus
      return edificio.label.split(' (')[0];
    case 'CRAI':
    case 'ALA_SUR':
    case 'ALA_NORTE':
    case 'CENTRAL':
    case 'BIENESTAR': {
      if (!params.descripcion) return null;
      const prefijo =
        edificio.tipo === 'CRAI' ? 'CRAI' :
          edificio.tipo === 'ALA_SUR' ? 'Ala Sur' :
            edificio.tipo === 'ALA_NORTE' ? 'Ala Norte' :
              edificio.tipo === 'CENTRAL' ? 'Central' : 'Bienestar';
      return `${prefijo} · ${params.descripcion.trim()}`;
    }
  }
}

/** Compone ubicación descriptiva para mostrar en la UI y guardar en BD. */
export function componerUbicacion(params: {
  edificioId: string;
  piso?: string;
  numero?: string;
  descripcion?: string;
}): string | null {
  const edificio = getEdificio(params.edificioId);
  if (!edificio) return null;

  switch (edificio.tipo) {
    case 'AULAS': {
      if (!params.piso || !params.numero) return null;
      return `${edificio.label}, Piso ${params.piso}, Salón ${params.numero.padStart(2, '0')}`;
    }
    case 'TORREON':
      return `${edificio.label.split(' (')[0]}, Piso ${pisoDeTorreon(edificio.id)}`;
    case 'CRAI':
    case 'ALA_SUR':
    case 'ALA_NORTE':
    case 'CENTRAL':
    case 'BIENESTAR': {
      if (!params.piso) return null;
      const baseLabel = edificio.label.split(' (')[0];
      return `${baseLabel}, Piso ${params.piso}`;
    }
  }
}
