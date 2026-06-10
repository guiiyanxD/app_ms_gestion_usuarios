import { gql } from '@apollo/client';
import { apolloClient } from '../../../../core/api/apollo.client';
import { FixedAssetOption } from '../../domain/models/catalog.model';

const GET_ALL_FIXED_ASSETS = gql`
  query GetAllFixedAssets($offset: Int!, $limit: Int!) {
    getAllFixedAssets(offset: $offset, limit: $limit) {
      content { id name category location }
    }
  }
`;

export async function fetchFixedAssetOptions(): Promise<FixedAssetOption[]> {
  const { data } = await apolloClient.query<{
    getAllFixedAssets: { content: FixedAssetOption[] };
  }>({
    query: GET_ALL_FIXED_ASSETS,
    variables: { offset: 0, limit: 200 },
    fetchPolicy: 'cache-first',
  });
  if (!data) return [];
  return data.getAllFixedAssets.content;
}
