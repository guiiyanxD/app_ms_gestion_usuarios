import { gql } from '@apollo/client';
import { apolloClient } from '../../../../core/api/apollo.client';
import { Credentials } from '../../domain/models/credentials.model';
import { Session } from '../../domain/models/session.model';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginResponseDto } from '../dto/auth.dto';
import { toSession } from '../mappers/session.mapper';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      token
      firstName
      lastName
      email
    }
  }
`;

export class AuthRepositoryImpl extends AuthRepository {
  async login(credentials: Credentials): Promise<Session> {
    const { data } = await apolloClient.mutate<{ login: LoginResponseDto }>({
      mutation: LOGIN_MUTATION,
      variables: { email: credentials.email, password: credentials.password },
    });
    if (!data?.login) throw new Error('Respuesta inválida del servidor');
    return toSession(data.login);
  }
}
