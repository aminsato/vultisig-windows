import { PartialMatch } from '../../../../lib/ui/base/PartialMatch';
import { chainKindRecord } from '../../../../model/chain';
import { useCurrentSendCoin } from '../../state/sendCoin';
import { ManageEvmFeeSettings } from './evm/ManageEvmFeeSettings';
import { ManageFeeSettingsFrame } from './ManageFeeSettingsFrame';
import { ManageUtxoFeeSettings } from './utxo/ManageUtxoFeeSettings';

export const ManageFeeSettings = () => {
  const [{ chain }] = useCurrentSendCoin();

  const chainKind = chainKindRecord[chain];

  return (
    <PartialMatch
      value={chainKind}
      if={{
        evm: () => (
          <ManageFeeSettingsFrame
            render={({ onClose }) => <ManageEvmFeeSettings onClose={onClose} />}
          />
        ),
        utxo: () => (
          <ManageFeeSettingsFrame
            render={({ onClose }) => (
              <ManageUtxoFeeSettings onClose={onClose} />
            )}
          />
        ),
      }}
    />
  );
};
