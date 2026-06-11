import { axiosClient } from '../../../../core/api/axios.client';
import '../../../../core/api/axios.interceptor';
import { FixedAssetOption } from '../../domain/models/catalog.model';

interface ActivoRestDto {
  readonly id: string;
  readonly codigo: string;
  readonly name: string;
  readonly description?: string;
  readonly location?: string;
  readonly category?: string;
  readonly status?: string;
  readonly areaName?: string;
  readonly categoryName?: string;
}

interface ActivosResponse {
  readonly success: boolean;
  readonly data: ActivoRestDto[];
}

function toFixedAssetOption(dto: ActivoRestDto): FixedAssetOption {
  return {
    id: dto.id,
    codigo: dto.codigo,
    name: dto.name,
    category: dto.categoryName ?? dto.category ?? '',
    location: dto.areaName ?? dto.location ?? '',
  };
}

export async function fetchFixedAssetOptions(): Promise<FixedAssetOption[]> {
  const { data } = await axiosClient.get<ActivosResponse>('/activos');
  if (!data.success) return [];
  return data.data.map(toFixedAssetOption);
}
