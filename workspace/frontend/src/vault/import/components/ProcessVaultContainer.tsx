import { storage } from '../../../../wailsjs/go/models';
import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { Vault } from '../../../gen/vultisig/vault/v1/vault_pb';
import { ValueTransfer } from '../../../lib/ui/base/ValueTransfer';
import { ValueProp } from '../../../lib/ui/props';
import { fromBase64 } from '@lib/utils/fromBase64';
import { pipe } from '@lib/utils/pipe';
import { toStorageVault } from '../../utils/storageVault';
import { DecryptVaultContainerStep } from './DecryptVaultContainerStep';
import { SaveImportedVaultStep } from './SaveImportedVaultStep';

export const ProcessVaultContainer = ({ value }: ValueProp<VaultContainer>) => {
  const { vault: vaultAsBase64String, isEncrypted } = value;
  if (isEncrypted) {
    return (
      <ValueTransfer<storage.Vault>
        from={({ onFinish }) => (
          <DecryptVaultContainerStep
            value={vaultAsBase64String}
            onFinish={onFinish}
          />
        )}
        to={({ value }) => <SaveImportedVaultStep value={value} />}
      />
    );
  }

  const vault = pipe(
    vaultAsBase64String,
    fromBase64,
    v => new Uint8Array(v),
    Vault.fromBinary,
    toStorageVault
  );

  return <SaveImportedVaultStep value={vault} />;
};
