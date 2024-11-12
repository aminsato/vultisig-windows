import { storage } from '../../../../wailsjs/go/models';
import { ComponentWithOptionsProps, InputProps } from '../../../lib/ui/props';
import { without } from '../../../lib/utils/array/without';
import { CurrentVaultProvider } from '../../../vault/state/currentVault';
import { getStorageVaultId } from '../../../vault/utils/storageVault';
import { AddVaultsToFolderContainer } from './AddVaultsToFolderContainer';
import { FolderVaultOption } from './FolderVaultOption';

type FolderVaultsInputProps = InputProps<string[]> &
  ComponentWithOptionsProps<storage.Vault>;

export const FolderVaultsInput: React.FC<FolderVaultsInputProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <AddVaultsToFolderContainer>
      {options.map(vault => {
        const vaultId = getStorageVaultId(vault);

        return (
          <CurrentVaultProvider value={vault} key={vaultId}>
            <FolderVaultOption
              value={value.includes(vaultId)}
              onChange={item =>
                onChange(item ? [...value, vaultId] : without(value, vaultId))
              }
              key={vaultId}
            />
          </CurrentVaultProvider>
        );
      })}
    </AddVaultsToFolderContainer>
  );
};
