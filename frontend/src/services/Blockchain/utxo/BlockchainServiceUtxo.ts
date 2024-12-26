import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { UTXOSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { UtxoInfo } from '../../../gen/vultisig/keysign/v1/utxo_info_pb';
import { SpecificUtxo } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { toWalletCorePublicKey } from '../../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../../vault/publicKey/VaultPublicKey';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceUtxo
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
    const utxoSpecific = new UTXOSpecific();
    const transactionInfoSpecific: SpecificUtxo =
      obj.specificTransactionInfo as SpecificUtxo;
    switch (obj.transactionType) {
      case TransactionType.SEND:
        utxoSpecific.sendMaxAmount = (obj as ISendTransaction).sendMaxAmount;
        utxoSpecific.byteFee = transactionInfoSpecific.byteFee.toString() ?? '';

        payload.utxoInfo = transactionInfoSpecific.utxos.map(utxo => {
          return new UtxoInfo({
            hash: utxo.hash,
            amount: utxo.amount,
            index: utxo.index,
          });
        });

        payload.blockchainSpecific = {
          case: 'utxoSpecific',
          value: utxoSpecific,
        };
        break;

      // We will have to check how the swap-old transaction is structured for UTXO chains
      case TransactionType.SWAP:
        payload.blockchainSpecific = {
          case: 'utxoSpecific',
          value: utxoSpecific,
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
    const input = this.getBitcoinSigningInput(keysignPayload);
    const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish();
    const plan = this.walletCore.AnySigner.plan(inputData, this.coinType);
    input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan);
    return TW.Bitcoin.Proto.SigningInput.encode(input).finish();
  }

  public async getSignedTransaction(
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const publicKey = await toWalletCorePublicKey({
      walletCore: this.walletCore,
      chain: this.chain,
      value: vaultPublicKey,
    });
    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    const hashes = getPreSigningHashes({
      walletCore: this.walletCore,
      txInputData,
      chain: this.chain,
    });
    hashes.forEach(hash => {
      const signature = signatureProvider.getDerSignature(hash);
      if (signature === undefined) {
        return;
      }

      assertSignature({
        publicKey,
        message: hash,
        signature,
        signatureFormat: 'der',
      });

      allSignatures.add(signature);
      publicKeys.add(publicKey.data());
    });

    const compileWithSignatures =
      this.walletCore.TransactionCompiler.compileWithSignatures(
        this.coinType,
        txInputData,
        allSignatures,
        publicKeys
      );
    const output = TW.Bitcoin.Proto.SigningOutput.decode(compileWithSignatures);
    const result = new SignedTransactionResult(
      hexEncode({
        value: output.encoded,
        walletCore: this.walletCore,
      }),
      output.transactionId
    );
    return result;
  }

  // private methods
  getBitcoinSigningInput(
    keysignPayload: KeysignPayload
  ): TW.Bitcoin.Proto.SigningInput {
    if (keysignPayload.blockchainSpecific instanceof UTXOSpecific) {
      throw new Error('Invalid blockchain specific');
    }
    if (keysignPayload.coin === undefined) {
      throw new Error('Invalid coin');
    }
    const utxoSpecific = keysignPayload.blockchainSpecific as unknown as {
      case: 'utxoSpecific';
      value: UTXOSpecific;
    };
    const { byteFee, sendMaxAmount } = utxoSpecific.value;
    const input = TW.Bitcoin.Proto.SigningInput.create({
      hashType: this.walletCore.BitcoinScript.hashTypeForCoin(this.coinType),
      amount: Long.fromString(keysignPayload.toAmount),
      useMaxAmount: sendMaxAmount,
      toAddress: keysignPayload.toAddress,
      changeAddress: keysignPayload.coin?.address,
      byteFee: Long.fromString(byteFee),
      coinType: this.coinType.value,
    });
    const encoder = new TextEncoder();
    const memo = keysignPayload.memo || '';
    if (memo != '') {
      input.outputOpReturn = encoder.encode(keysignPayload.memo);
    }
    for (const utxo of keysignPayload.utxoInfo) {
      const lockScript = this.walletCore.BitcoinScript.lockScriptForAddress(
        keysignPayload.coin.address,
        this.coinType
      );
      switch (this.coinType) {
        case this.walletCore.CoinType.bitcoin:
        case this.walletCore.CoinType.litecoin: {
          const segWitPubKeyHash = lockScript.matchPayToWitnessPublicKeyHash();
          const redeemScript =
            this.walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(
              segWitPubKeyHash
            );
          input.scripts[
            hexEncode({
              value: segWitPubKeyHash,
              walletCore: this.walletCore,
            })
          ] = redeemScript.data();
          break;
        }
        case this.walletCore.CoinType.bitcoinCash:
        case this.walletCore.CoinType.dash:
        case this.walletCore.CoinType.dogecoin: {
          const keyHash = lockScript.matchPayToPubkeyHash();
          const redeemScriptPubKey =
            this.walletCore.BitcoinScript.buildPayToPublicKeyHash(keyHash);

          input.scripts[
            hexEncode({
              value: keyHash,
              walletCore: this.walletCore,
            })
          ] = redeemScriptPubKey.data();
          break;
        }
        default:
          throw new Error('Unsupported coin type');
      }
      const unspendTransaction = TW.Bitcoin.Proto.UnspentTransaction.create({
        amount: Long.fromString(utxo.amount.toString()),
        outPoint: TW.Bitcoin.Proto.OutPoint.create({
          hash: this.walletCore.HexCoding.decode(utxo.hash).reverse(),
          index: utxo.index,
          sequence: 0xffffffff,
        }),
        script: lockScript.data(),
      });
      input.utxo.push(unspendTransaction);
    }
    return input;
  }

  async getBitcoinTransactionPlan(
    keysignPayload: KeysignPayload
  ): Promise<TW.Bitcoin.Proto.TransactionPlan> {
    const input = await this.getPreSignedInputData(keysignPayload);
    const plan = this.walletCore.AnySigner.plan(input, this.coinType);
    return TW.Bitcoin.Proto.TransactionPlan.decode(plan);
  }
}
