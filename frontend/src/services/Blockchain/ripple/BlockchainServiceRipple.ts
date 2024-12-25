import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { RippleSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import { SpecificRipple } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceRipple
  extends BlockchainService
  implements IBlockchainService
{
  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload: KeysignPayload = super.createKeysignPayload(
      obj,
      localPartyId,
      publicKeyEcdsa
    );
    const rippleSpecific = new RippleSpecific();

    const transactionInfoSpecific: SpecificRipple =
      obj.specificTransactionInfo as SpecificRipple;

    switch (obj.transactionType) {
      case TransactionType.SEND:
        rippleSpecific.gas = BigInt(transactionInfoSpecific?.fee || 0);
        rippleSpecific.sequence = BigInt(
          transactionInfoSpecific?.sequence || 0
        );

        payload.blockchainSpecific = {
          case: 'rippleSpecific',
          value: rippleSpecific,
        };
        break;

      // We will have to check how the swap-old transaction is structured for UTXO chains
      case TransactionType.SWAP:
        payload.blockchainSpecific = {
          case: 'rippleSpecific',
          value: rippleSpecific,
        };
        break;

      default:
        throw new Error(`Unsupported transaction type: ${obj.transactionType}`);
    }

    return payload;
  }

  isTHORChainSpecific(obj: any): boolean {
    console.error('Method not implemented.', obj);
    throw new Error('Method not implemented.');
  }

  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: any
  ): Uint8Array {
    console.error('Method not implemented.', keysignPayload, signingInput);
    throw new Error('Method not implemented.');
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    if (keysignPayload.blockchainSpecific instanceof RippleSpecific) {
      throw new Error('Invalid blockchain specific');
    }

    const walletCore = this.walletCore;

    if (keysignPayload.coin?.chain !== Chain.Ripple) {
      console.error('Coin is not Ripple');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
      throw new Error('Coin is not Ripple');
    }

    const transactionInfoSpecific =
      keysignPayload.blockchainSpecific as unknown as {
        case: 'rippleSpecific';
        value: RippleSpecific;
      };

    const { gas, sequence } = transactionInfoSpecific.value;

    if (!transactionInfoSpecific) {
      console.error(
        'getPreSignedInputData fail to get Ripple transaction information from RPC'
      );
      throw new Error(
        'getPreSignedInputData fail to get Ripple transaction information from RPC'
      );
    }

    if (!keysignPayload.coin) {
      console.error('keysignPayload.coin is undefined');
      throw new Error('keysignPayload.coin is undefined');
    }

    const pubKeyData = Buffer.from(
      keysignPayload?.coin?.hexPublicKey || '',
      'hex'
    );
    if (!pubKeyData) {
      console.error('invalid hex public key');
      throw new Error('invalid hex public key');
    }

    const toAddress = walletCore.AnyAddress.createWithString(
      keysignPayload.toAddress,
      this.coinType
    );

    if (!toAddress) {
      console.error('invalid to address');
      throw new Error('invalid to address');
    }

    try {
      const input = TW.Ripple.Proto.SigningInput.create({
        account: keysignPayload?.coin?.address,
        fee: Long.fromString(gas.toString()),
        sequence: Number(sequence),
        publicKey: new Uint8Array(pubKeyData),
        opPayment: TW.Ripple.Proto.OperationPayment.create({
          destination: keysignPayload.toAddress,
          amount: Long.fromString(keysignPayload.toAmount),
          destinationTag: keysignPayload.memo
            ? Long.fromString(keysignPayload.memo)
            : undefined,
        }),
      });

      return TW.Ripple.Proto.SigningInput.encode(input).finish();
    } catch (e: any) {
      console.error('Error in getPreSignedInputData:', e);
      throw new Error(e.message);
    }
  }

  async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const walletCore = this.walletCore;
    const addressService = AddressServiceFactory.createAddressService(
      this.chain,
      walletCore
    );
    const publicKey = await addressService.getPublicKey(
      vaultHexPublicKey,
      '',
      vaultHexChainCode
    );
    const publicKeyData = publicKey.data();

    try {
      const allSignatures = walletCore.DataVector.create();
      const publicKeys = walletCore.DataVector.create();

      const [dataHash] = getPreSigningHashes({
        walletCore,
        txInputData,
        chain: this.chain,
      });

      const signatureProvider = new SignatureProvider(walletCore, signatures);
      const signature = signatureProvider.getDerSignature(dataHash);

      if (!publicKey.verifyAsDER(signature, dataHash)) {
        console.error('fail to verify signature');
        throw new Error('fail to verify signature');
      }

      allSignatures.add(signature);
      publicKeys.add(publicKeyData);

      const compileWithSignatures =
        walletCore.TransactionCompiler.compileWithSignatures(
          this.coinType,
          txInputData,
          allSignatures,
          publicKeys
        );

      const { encoded, errorMessage } = TW.Ripple.Proto.SigningOutput.decode(
        compileWithSignatures
      );

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      const result = new SignedTransactionResult(
        stripHexPrefix(this.walletCore.HexCoding.encode(encoded)),
        '',
        undefined
      );
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
