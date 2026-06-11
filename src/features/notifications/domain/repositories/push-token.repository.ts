import { PushToken } from '../models/push-token.model';

export abstract class PushTokenRepository {
  abstract register(pushToken: PushToken): Promise<void>;
  abstract deactivate(userId: string, token: string): Promise<void>;
}
