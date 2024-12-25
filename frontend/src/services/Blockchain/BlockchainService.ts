import { WalletCore } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../wailsjs/go/models';
import { getCoinType } from '../../chain/walletCore/getCoinType';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../model/chain';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
} from '../../model/transaction';
import { AddressServiceFactory } from '../Address/AddressServiceFactory';
import { IAddressService } from '../Address/IAddressService';
import { IBlockchainService } from './IBlockchainService';
import { SignedTransactionResult } from './signed-transaction-result';

export class BlockchainService implements IBlockchainService {
  chain: Chain;
  walletCore: WalletCore;
  coinType: CoinType;
  addressService: IAddressService;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
    this.coinType = getCoinType({ walletCore, chain });
    this.addressService = AddressServiceFactory.createAddressService(
      this.chain,
      walletCore
    );
  }

  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload = new KeysignPayload({
      ...obj,
      toAmount: BigInt(
        Math.round(obj.amount * 10 ** obj.coin.decimals)
      ).toString(),
      vaultLocalPartyId: localPartyId,
      vaultPublicKeyEcdsa: publicKeyEcdsa,
    });

    return payload;
  }

  getPreSignedInputData(_keysignPayload: KeysignPayload): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  getSignedTransaction(
    _vaultHexPublicKey: string,
    _vaultHexChainCode: string,
    _txInputData: Uint8Array,
    _signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    throw new Error('Method not implemented.');
  }
}
