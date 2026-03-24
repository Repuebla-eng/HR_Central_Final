
import type { EvaluationStatus } from '@/lib/types';

export const getStatusVariant = (status: EvaluationStatus) => {
    switch (status) {
      case 'Completada': return 'default';
      case 'Pendiente': return 'secondary';
      default: return 'outline';
    }
  }
