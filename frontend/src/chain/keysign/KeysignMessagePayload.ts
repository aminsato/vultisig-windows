import { CustomMessagePayload } from '../../gen/vultisig/keysign/v1/custom_message_payload_pb';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';

export const keysignMessagePayloadTypes = ['custom', 'keysign'] as const;
export type KeysignMessagePayloadType =
  (typeof keysignMessagePayloadTypes)[number];

interface KeysignMessagePayloadMap {
  custom: CustomMessagePayload;
  keysign: KeysignPayload;
}

export type KeysignMessagePayload = {
  [T in KeysignMessagePayloadType]: { [K in T]: KeysignMessagePayloadMap[T] };
}[KeysignMessagePayloadType];
