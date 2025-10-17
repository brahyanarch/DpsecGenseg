// types.ts
export enum Estado {
  COMPLETADO = 'COMPLETADO',
  ENPROCESO = 'ENPROCESO',
  ARCHIVADO = 'ARCHIVADO',
  PENDIENTE = 'PENDIENTE'
}

export interface GetTasksQueryParams {
  page?: string;
  limit?: string;
  sort?: string;      // e.g., "datecreation:asc"
  search?: string;    // Keyword for 'nombre'
  estado?: Estado;    // Filter by enum state
}

// This type will be used for the Prisma `orderBy` option:cite[2]
export type SortOptions = {
  [key: string]: 'asc' | 'desc';
};