// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file vultisig/vault/v1/vault_container.proto (package vultisig.vault.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type {
  BinaryReadOptions,
  FieldList,
  JsonReadOptions,
  JsonValue,
  PartialMessage,
  PlainMessage,
} from '@bufbuild/protobuf';
import { Message, proto3, protoInt64 } from '@bufbuild/protobuf';

/**
 * @generated from message vultisig.vault.v1.VaultContainer
 */
export class VaultContainer extends Message<VaultContainer> {
  /**
   * version of data format
   *
   * @generated from field: uint64 version = 1;
   */
  version = protoInt64.zero;

  /**
   * vault contained the container
   *
   * @generated from field: string vault = 2;
   */
  vault = '';

  /**
   * is vault encrypted with password
   *
   * @generated from field: bool is_encrypted = 3;
   */
  isEncrypted = false;

  constructor(data?: PartialMessage<VaultContainer>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'vultisig.vault.v1.VaultContainer';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'version', kind: 'scalar', T: 4 /* ScalarType.UINT64 */ },
    { no: 2, name: 'vault', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 3, name: 'is_encrypted', kind: 'scalar', T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): VaultContainer {
    return new VaultContainer().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): VaultContainer {
    return new VaultContainer().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): VaultContainer {
    return new VaultContainer().fromJsonString(jsonString, options);
  }

  static equals(
    a: VaultContainer | PlainMessage<VaultContainer> | undefined,
    b: VaultContainer | PlainMessage<VaultContainer> | undefined
  ): boolean {
    return proto3.util.equals(VaultContainer, a, b);
  }
}
