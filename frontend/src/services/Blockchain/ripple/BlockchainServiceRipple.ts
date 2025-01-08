import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { Chain } from '../../../model/chain';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceRipple
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;

    if (keysignPayload.coin?.chain !== Chain.Ripple) {
      console.error('Coin is not Ripple');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
      throw new Error('Coin is not Ripple');
    }

    const { gas, sequence } = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'rippleSpecific'
    );

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
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const walletCore = this.walletCore;

    const publicKeyData = publicKey.data();

    const allSignatures = walletCore.DataVector.create();
    const publicKeys = walletCore.DataVector.create();

    const [dataHash] = getPreSigningHashes({
      walletCore,
      txInputData,
      chain: this.chain,
    });

    const signatureProvider = new SignatureProvider(walletCore, signatures);
    const signature = signatureProvider.getDerSignature(dataHash);

    assertSignature({
      publicKey,
      message: dataHash,
      signature,
      signatureFormat: 'der',
    });

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

    assertErrorMessage(errorMessage);

    const result = new SignedTransactionResult(
      stripHexPrefix(this.walletCore.HexCoding.encode(encoded)),
      '',
      undefined
    );
    return result;
  }
}
