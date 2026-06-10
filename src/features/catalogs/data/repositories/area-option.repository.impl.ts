import { axiosClient } from '../../../../core/api/axios.client';
import '../../../../core/api/axios.interceptor';
import { AreaOption } from '../../domain/models/catalog.model';

interface AreasResponse {
  success: boolean;
  data: Array<{ id: number; codigo: string; nombre: string }>;
}

export async function fetchAreaOptions(): Promise<AreaOption[]> {
  const { data } = await axiosClient.get<AreasResponse>('/catalogo/areas');
  return data.data;
}
