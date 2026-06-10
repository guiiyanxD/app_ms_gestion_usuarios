export interface PushToken {
  readonly userId: string;
  readonly token: string;
  readonly platform: 'android' | 'ios';
}
