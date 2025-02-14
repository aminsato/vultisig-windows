import { EvmChain } from "@core/chain/Chain";
import { getEvmClient } from "@core/chain/chains/evm/client";
import { assertErrorMessage } from "@lib/utils/error/assertErrorMessage";
import { isInError } from "@lib/utils/error/isInError";
import { TW } from "@trustwallet/wallet-core";
import { ExecuteTxResolver } from "./ExecuteTxResolver";
import { keccak256 } from "viem";

export const executeEvmTx: ExecuteTxResolver<EvmChain> = async ({
  walletCore,
  chain,
  compiledTx,
}) => {
  const { errorMessage, encoded } =
    TW.Ethereum.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(errorMessage);

  const rawTx = walletCore.HexCoding.encode(encoded);
  const txHash = keccak256(encoded);

  const publicClient = getEvmClient(chain);

  try {
    const hash = await publicClient.sendRawTransaction({
      serializedTransaction: rawTx as `0x${string}`,
    });
    return hash;
  } catch (error) {
    const isAlreadyBroadcast = isInError(
      error,
      "already known",
      "transaction is temporarily banned",
      "nonce too low",
      "transaction already exists",
    );

    if (isAlreadyBroadcast) {
      return txHash;
    }

    throw error;
  }
};
