import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';
import { Erc20ApprovePayload } from '../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { SwapPayloadType } from '../gen/vultisig/keysign/v1/keysign_message_pb';
import { THORChainSwapPayload } from '../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';
import { SpecificTransactionInfo } from './specific-transaction-info';

export enum TransactionType {
  SEND = 'send',
  SWAP = 'swap',
  DEPOSIT = 'deposit',
  VOTE = 'vote',
}

export interface ITransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  memo: string;
  coin: Coin;
  transactionType: TransactionType;
  specificTransactionInfo?: SpecificTransactionInfo;
}

export interface ISendTransaction extends ITransaction {
  sendMaxAmount: boolean;
  transactionType: TransactionType.SEND;
}

export interface IDepositTransaction extends ITransaction {
  transactionType: TransactionType.DEPOSIT;
}

// TODO: We will need to add more fields to this interface
export interface ISwapTransaction extends ITransaction {
  transactionType: TransactionType.SWAP;
  sendMaxAmount: boolean;
  swapPayload: {
    value: THORChainSwapPayload;
    case: SwapPayloadType;
  };
  erc20ApprovePayload?: Erc20ApprovePayload;
}

export function getDefaultSendTransaction(): ISendTransaction {
  return {
    fromAddress: '',
    toAddress: '',
    amount: 0,
    memo: '',
    sendMaxAmount: false,
    coin: new Coin(),
    transactionType: TransactionType.SEND,
    specificTransactionInfo: undefined,
  };
}

// export function getDefaultSwapTransaction(): ISwapTransaction {
//   return {
//     fromAddress: '',
//     toAddress: '',
//     amount: 0,
//     memo: '',
//     transactionType: TransactionType.SWAP,
//     specificTransactionInfo: undefined,
//     sendMaxAmount: false,
//     coin: new Coin(),
//     swapPayload: {
//       fromAddress: ''
//     }
//   };
// }
