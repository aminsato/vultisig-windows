// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file vultisig/keysign/v1/blockchain_specific.proto (package vultisig.keysign.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file vultisig/keysign/v1/blockchain_specific.proto.
 */
export const file_vultisig_keysign_v1_blockchain_specific: GenFile = /*@__PURE__*/
  fileDesc("Ci12dWx0aXNpZy9rZXlzaWduL3YxL2Jsb2NrY2hhaW5fc3BlY2lmaWMucHJvdG8SE3Z1bHRpc2lnLmtleXNpZ24udjEiOQoMVVRYT1NwZWNpZmljEhAKCGJ5dGVfZmVlGAEgASgJEhcKD3NlbmRfbWF4X2Ftb3VudBgCIAEoCCJnChBFdGhlcmV1bVNwZWNpZmljEhsKE21heF9mZWVfcGVyX2dhc193ZWkYASABKAkSFAoMcHJpb3JpdHlfZmVlGAIgASgJEg0KBW5vbmNlGAMgASgDEhEKCWdhc19saW1pdBgEIAEoCSJeChFUSE9SQ2hhaW5TcGVjaWZpYxIWCg5hY2NvdW50X251bWJlchgBIAEoBBIQCghzZXF1ZW5jZRgCIAEoBBILCgNmZWUYAyABKAQSEgoKaXNfZGVwb3NpdBgEIAEoCCJRChFNQVlBQ2hhaW5TcGVjaWZpYxIWCg5hY2NvdW50X251bWJlchgBIAEoBBIQCghzZXF1ZW5jZRgCIAEoBBISCgppc19kZXBvc2l0GAMgASgIIuUBCg5Db3Ntb3NTcGVjaWZpYxIWCg5hY2NvdW50X251bWJlchgBIAEoBBIQCghzZXF1ZW5jZRgCIAEoBBILCgNnYXMYAyABKAQSPgoQdHJhbnNhY3Rpb25fdHlwZRgEIAEoDjIkLnZ1bHRpc2lnLmtleXNpZ24udjEuVHJhbnNhY3Rpb25UeXBlEkcKEGliY19kZW5vbV90cmFjZXMYBSABKAsyKC52dWx0aXNpZy5rZXlzaWduLnYxLkNvc21vc0liY0Rlbm9tVHJhY2VIAIgBAUITChFfaWJjX2Rlbm9tX3RyYWNlcyJNChNDb3Ntb3NJYmNEZW5vbVRyYWNlEgwKBHBhdGgYASABKAkSEgoKYmFzZV9kZW5vbRgCIAEoCRIUCgxsYXRlc3RfYmxvY2sYAyABKAkigQIKDlNvbGFuYVNwZWNpZmljEhkKEXJlY2VudF9ibG9ja19oYXNoGAEgASgJEhQKDHByaW9yaXR5X2ZlZRgCIAEoCRIqCh1mcm9tX3Rva2VuX2Fzc29jaWF0ZWRfYWRkcmVzcxgDIAEoCUgAiAEBEigKG3RvX3Rva2VuX2Fzc29jaWF0ZWRfYWRkcmVzcxgEIAEoCUgBiAEBEhcKCnByb2dyYW1faWQYBSABKAhIAogBAUIgCh5fZnJvbV90b2tlbl9hc3NvY2lhdGVkX2FkZHJlc3NCHgocX3RvX3Rva2VuX2Fzc29jaWF0ZWRfYWRkcmVzc0INCgtfcHJvZ3JhbV9pZCKjAQoQUG9sa2Fkb3RTcGVjaWZpYxIZChFyZWNlbnRfYmxvY2tfaGFzaBgBIAEoCRINCgVub25jZRgCIAEoBBIcChRjdXJyZW50X2Jsb2NrX251bWJlchgDIAEoCRIUCgxzcGVjX3ZlcnNpb24YBCABKA0SGwoTdHJhbnNhY3Rpb25fdmVyc2lvbhgFIAEoDRIUCgxnZW5lc2lzX2hhc2gYBiABKAkihAEKB1N1aUNvaW4SEQoJY29pbl90eXBlGAEgASgJEhYKDmNvaW5fb2JqZWN0X2lkGAIgASgJEg8KB3ZlcnNpb24YAyABKAkSDgoGZGlnZXN0GAQgASgJEg8KB2JhbGFuY2UYBSABKAkSHAoUcHJldmlvdXNfdHJhbnNhY3Rpb24YBiABKAkiVwoLU3VpU3BlY2lmaWMSGwoTcmVmZXJlbmNlX2dhc19wcmljZRgBIAEoCRIrCgVjb2lucxgCIAMoCzIcLnZ1bHRpc2lnLmtleXNpZ24udjEuU3VpQ29pbiJNCgtUb25TcGVjaWZpYxIXCg9zZXF1ZW5jZV9udW1iZXIYASABKAQSEQoJZXhwaXJlX2F0GAIgASgEEhIKCmJvdW5jZWFibGUYAyABKAgiLwoOUmlwcGxlU3BlY2lmaWMSEAoIc2VxdWVuY2UYASABKAQSCwoDZ2FzGAIgASgEIpMCCgxUcm9uU3BlY2lmaWMSEQoJdGltZXN0YW1wGAEgASgEEhIKCmV4cGlyYXRpb24YAiABKAQSHgoWYmxvY2tfaGVhZGVyX3RpbWVzdGFtcBgDIAEoBBIbChNibG9ja19oZWFkZXJfbnVtYmVyGAQgASgEEhwKFGJsb2NrX2hlYWRlcl92ZXJzaW9uGAUgASgEEiEKGWJsb2NrX2hlYWRlcl90eF90cmllX3Jvb3QYBiABKAkSIAoYYmxvY2tfaGVhZGVyX3BhcmVudF9oYXNoGAcgASgJEiQKHGJsb2NrX2hlYWRlcl93aXRuZXNzX2FkZHJlc3MYCCABKAkSFgoOZ2FzX2VzdGltYXRpb24YCSABKAQqbQoPVHJhbnNhY3Rpb25UeXBlEiAKHFRSQU5TQUNUSU9OX1RZUEVfVU5TUEVDSUZJRUQQABIZChVUUkFOU0FDVElPTl9UWVBFX1ZPVEUQARIdChlUUkFOU0FDVElPTl9UWVBFX1BST1BPU0FMEAJCVAoTdnVsdGlzaWcua2V5c2lnbi52MVo4Z2l0aHViLmNvbS92dWx0aXNpZy9jb21tb25kYXRhL2dvL3Z1bHRpc2lnL2tleXNpZ24vdjE7djG6AgJWU2IGcHJvdG8z");

/**
 * @generated from message vultisig.keysign.v1.UTXOSpecific
 */
export type UTXOSpecific = Message<"vultisig.keysign.v1.UTXOSpecific"> & {
  /**
   * @generated from field: string byte_fee = 1;
   */
  byteFee: string;

  /**
   * @generated from field: bool send_max_amount = 2;
   */
  sendMaxAmount: boolean;
};

/**
 * Describes the message vultisig.keysign.v1.UTXOSpecific.
 * Use `create(UTXOSpecificSchema)` to create a new message.
 */
export const UTXOSpecificSchema: GenMessage<UTXOSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 0);

/**
 * @generated from message vultisig.keysign.v1.EthereumSpecific
 */
export type EthereumSpecific = Message<"vultisig.keysign.v1.EthereumSpecific"> & {
  /**
   * @generated from field: string max_fee_per_gas_wei = 1;
   */
  maxFeePerGasWei: string;

  /**
   * @generated from field: string priority_fee = 2;
   */
  priorityFee: string;

  /**
   * @generated from field: int64 nonce = 3;
   */
  nonce: bigint;

  /**
   * @generated from field: string gas_limit = 4;
   */
  gasLimit: string;
};

/**
 * Describes the message vultisig.keysign.v1.EthereumSpecific.
 * Use `create(EthereumSpecificSchema)` to create a new message.
 */
export const EthereumSpecificSchema: GenMessage<EthereumSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 1);

/**
 * @generated from message vultisig.keysign.v1.THORChainSpecific
 */
export type THORChainSpecific = Message<"vultisig.keysign.v1.THORChainSpecific"> & {
  /**
   * @generated from field: uint64 account_number = 1;
   */
  accountNumber: bigint;

  /**
   * @generated from field: uint64 sequence = 2;
   */
  sequence: bigint;

  /**
   * @generated from field: uint64 fee = 3;
   */
  fee: bigint;

  /**
   * @generated from field: bool is_deposit = 4;
   */
  isDeposit: boolean;
};

/**
 * Describes the message vultisig.keysign.v1.THORChainSpecific.
 * Use `create(THORChainSpecificSchema)` to create a new message.
 */
export const THORChainSpecificSchema: GenMessage<THORChainSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 2);

/**
 * @generated from message vultisig.keysign.v1.MAYAChainSpecific
 */
export type MAYAChainSpecific = Message<"vultisig.keysign.v1.MAYAChainSpecific"> & {
  /**
   * @generated from field: uint64 account_number = 1;
   */
  accountNumber: bigint;

  /**
   * @generated from field: uint64 sequence = 2;
   */
  sequence: bigint;

  /**
   * @generated from field: bool is_deposit = 3;
   */
  isDeposit: boolean;
};

/**
 * Describes the message vultisig.keysign.v1.MAYAChainSpecific.
 * Use `create(MAYAChainSpecificSchema)` to create a new message.
 */
export const MAYAChainSpecificSchema: GenMessage<MAYAChainSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 3);

/**
 * @generated from message vultisig.keysign.v1.CosmosSpecific
 */
export type CosmosSpecific = Message<"vultisig.keysign.v1.CosmosSpecific"> & {
  /**
   * @generated from field: uint64 account_number = 1;
   */
  accountNumber: bigint;

  /**
   * @generated from field: uint64 sequence = 2;
   */
  sequence: bigint;

  /**
   * @generated from field: uint64 gas = 3;
   */
  gas: bigint;

  /**
   * @generated from field: vultisig.keysign.v1.TransactionType transaction_type = 4;
   */
  transactionType: TransactionType;

  /**
   * @generated from field: optional vultisig.keysign.v1.CosmosIbcDenomTrace ibc_denom_traces = 5;
   */
  ibcDenomTraces?: CosmosIbcDenomTrace;
};

/**
 * Describes the message vultisig.keysign.v1.CosmosSpecific.
 * Use `create(CosmosSpecificSchema)` to create a new message.
 */
export const CosmosSpecificSchema: GenMessage<CosmosSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 4);

/**
 * @generated from message vultisig.keysign.v1.CosmosIbcDenomTrace
 */
export type CosmosIbcDenomTrace = Message<"vultisig.keysign.v1.CosmosIbcDenomTrace"> & {
  /**
   * @generated from field: string path = 1;
   */
  path: string;

  /**
   * @generated from field: string base_denom = 2;
   */
  baseDenom: string;

  /**
   * @generated from field: string latest_block = 3;
   */
  latestBlock: string;
};

/**
 * Describes the message vultisig.keysign.v1.CosmosIbcDenomTrace.
 * Use `create(CosmosIbcDenomTraceSchema)` to create a new message.
 */
export const CosmosIbcDenomTraceSchema: GenMessage<CosmosIbcDenomTrace> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 5);

/**
 * @generated from message vultisig.keysign.v1.SolanaSpecific
 */
export type SolanaSpecific = Message<"vultisig.keysign.v1.SolanaSpecific"> & {
  /**
   * @generated from field: string recent_block_hash = 1;
   */
  recentBlockHash: string;

  /**
   * @generated from field: string priority_fee = 2;
   */
  priorityFee: string;

  /**
   * @generated from field: optional string from_token_associated_address = 3;
   */
  fromTokenAssociatedAddress?: string;

  /**
   * @generated from field: optional string to_token_associated_address = 4;
   */
  toTokenAssociatedAddress?: string;

  /**
   * @generated from field: optional bool program_id = 5;
   */
  programId?: boolean;
};

/**
 * Describes the message vultisig.keysign.v1.SolanaSpecific.
 * Use `create(SolanaSpecificSchema)` to create a new message.
 */
export const SolanaSpecificSchema: GenMessage<SolanaSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 6);

/**
 * @generated from message vultisig.keysign.v1.PolkadotSpecific
 */
export type PolkadotSpecific = Message<"vultisig.keysign.v1.PolkadotSpecific"> & {
  /**
   * @generated from field: string recent_block_hash = 1;
   */
  recentBlockHash: string;

  /**
   * @generated from field: uint64 nonce = 2;
   */
  nonce: bigint;

  /**
   * @generated from field: string current_block_number = 3;
   */
  currentBlockNumber: string;

  /**
   * @generated from field: uint32 spec_version = 4;
   */
  specVersion: number;

  /**
   * @generated from field: uint32 transaction_version = 5;
   */
  transactionVersion: number;

  /**
   * @generated from field: string genesis_hash = 6;
   */
  genesisHash: string;
};

/**
 * Describes the message vultisig.keysign.v1.PolkadotSpecific.
 * Use `create(PolkadotSpecificSchema)` to create a new message.
 */
export const PolkadotSpecificSchema: GenMessage<PolkadotSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 7);

/**
 * @generated from message vultisig.keysign.v1.SuiCoin
 */
export type SuiCoin = Message<"vultisig.keysign.v1.SuiCoin"> & {
  /**
   * @generated from field: string coin_type = 1;
   */
  coinType: string;

  /**
   * @generated from field: string coin_object_id = 2;
   */
  coinObjectId: string;

  /**
   * @generated from field: string version = 3;
   */
  version: string;

  /**
   * @generated from field: string digest = 4;
   */
  digest: string;

  /**
   * @generated from field: string balance = 5;
   */
  balance: string;

  /**
   * @generated from field: string previous_transaction = 6;
   */
  previousTransaction: string;
};

/**
 * Describes the message vultisig.keysign.v1.SuiCoin.
 * Use `create(SuiCoinSchema)` to create a new message.
 */
export const SuiCoinSchema: GenMessage<SuiCoin> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 8);

/**
 * @generated from message vultisig.keysign.v1.SuiSpecific
 */
export type SuiSpecific = Message<"vultisig.keysign.v1.SuiSpecific"> & {
  /**
   * @generated from field: string reference_gas_price = 1;
   */
  referenceGasPrice: string;

  /**
   * @generated from field: repeated vultisig.keysign.v1.SuiCoin coins = 2;
   */
  coins: SuiCoin[];
};

/**
 * Describes the message vultisig.keysign.v1.SuiSpecific.
 * Use `create(SuiSpecificSchema)` to create a new message.
 */
export const SuiSpecificSchema: GenMessage<SuiSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 9);

/**
 * @generated from message vultisig.keysign.v1.TonSpecific
 */
export type TonSpecific = Message<"vultisig.keysign.v1.TonSpecific"> & {
  /**
   * @generated from field: uint64 sequence_number = 1;
   */
  sequenceNumber: bigint;

  /**
   * @generated from field: uint64 expire_at = 2;
   */
  expireAt: bigint;

  /**
   * @generated from field: bool bounceable = 3;
   */
  bounceable: boolean;
};

/**
 * Describes the message vultisig.keysign.v1.TonSpecific.
 * Use `create(TonSpecificSchema)` to create a new message.
 */
export const TonSpecificSchema: GenMessage<TonSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 10);

/**
 * @generated from message vultisig.keysign.v1.RippleSpecific
 */
export type RippleSpecific = Message<"vultisig.keysign.v1.RippleSpecific"> & {
  /**
   * @generated from field: uint64 sequence = 1;
   */
  sequence: bigint;

  /**
   * @generated from field: uint64 gas = 2;
   */
  gas: bigint;
};

/**
 * Describes the message vultisig.keysign.v1.RippleSpecific.
 * Use `create(RippleSpecificSchema)` to create a new message.
 */
export const RippleSpecificSchema: GenMessage<RippleSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 11);

/**
 * @generated from message vultisig.keysign.v1.TronSpecific
 */
export type TronSpecific = Message<"vultisig.keysign.v1.TronSpecific"> & {
  /**
   * @generated from field: uint64 timestamp = 1;
   */
  timestamp: bigint;

  /**
   * @generated from field: uint64 expiration = 2;
   */
  expiration: bigint;

  /**
   * @generated from field: uint64 block_header_timestamp = 3;
   */
  blockHeaderTimestamp: bigint;

  /**
   * @generated from field: uint64 block_header_number = 4;
   */
  blockHeaderNumber: bigint;

  /**
   * @generated from field: uint64 block_header_version = 5;
   */
  blockHeaderVersion: bigint;

  /**
   * @generated from field: string block_header_tx_trie_root = 6;
   */
  blockHeaderTxTrieRoot: string;

  /**
   * @generated from field: string block_header_parent_hash = 7;
   */
  blockHeaderParentHash: string;

  /**
   * @generated from field: string block_header_witness_address = 8;
   */
  blockHeaderWitnessAddress: string;

  /**
   * @generated from field: uint64 gas_estimation = 9;
   */
  gasEstimation: bigint;
};

/**
 * Describes the message vultisig.keysign.v1.TronSpecific.
 * Use `create(TronSpecificSchema)` to create a new message.
 */
export const TronSpecificSchema: GenMessage<TronSpecific> = /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_blockchain_specific, 12);

/**
 * @generated from enum vultisig.keysign.v1.TransactionType
 */
export enum TransactionType {
  /**
   * @generated from enum value: TRANSACTION_TYPE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: TRANSACTION_TYPE_VOTE = 1;
   */
  VOTE = 1,

  /**
   * @generated from enum value: TRANSACTION_TYPE_PROPOSAL = 2;
   */
  PROPOSAL = 2,
}

/**
 * Describes the enum vultisig.keysign.v1.TransactionType.
 */
export const TransactionTypeSchema: GenEnum<TransactionType> = /*@__PURE__*/
  enumDesc(file_vultisig_keysign_v1_blockchain_specific, 0);

