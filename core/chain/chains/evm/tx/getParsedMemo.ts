import { Interface } from "ethers";
import axios from "axios";

import { KeysignPayload } from "@core/communication/vultisig/keysign/v1/keysign_message_pb";

export interface ParsedMemoParams {
  functionSignature: string;
  functionArguments: string;
}

const processDecodedData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map((item) => processDecodedData(item));
  } else if (typeof data === "bigint") {
    return data.toString();
  } else if (typeof data === "object" && data !== null) {
    if (data.toString && (data._isBigNumber || typeof data === "bigint")) {
      return data.toString();
    }
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = processDecodedData(data[key]);
      return acc;
    }, {} as any);
  }
  return data;
};

export const getParsedMemo = async (
  memo: KeysignPayload["memo"],
): Promise<ParsedMemoParams | undefined> => {
  if (!memo || memo === "0x") {
    return undefined;
  } else {
    const hexSignature = memo.slice(0, 10); // "0x" + 8 hex chars

    return axios
      .get<{ results: { text_signature: string }[] }>(
        `https://www.4byte.directory/api/v1/signatures/?format=json&hex_signature=${hexSignature}&ordering=created_at`,
      )
      .then(({ data }) => {
        if (data.results?.length) {
          const [result] = data.results;
          const textSignature = result.text_signature;

          if (textSignature) {
            const abi = new Interface([`function ${textSignature}`]);
            const [fragment] = textSignature.split("(");

            try {
              const decodedData = abi.decodeFunctionData(fragment, memo);
              const processedData = processDecodedData(decodedData);

              return {
                functionArguments: JSON.stringify(processedData, null, 2),
                functionSignature: textSignature,
              };
            } catch (error) {
              return undefined;
            }
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      })
      .catch(() => undefined);
  }
};
