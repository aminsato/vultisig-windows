import { useNavigate } from 'react-router-dom';

import { VStack } from '../../../lib/ui/layout/Stack';
import { makeAppPath } from '../../../navigation';
import { PageFooter } from '../../../ui/page/PageFooter';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useFolderVaults } from '../../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../../vault/utils/storageVault';
import { FinishEditing } from '../../components/FinishEditing';
import { VaultGroupsContainer } from '../../components/VaultGroupsContainer';
import { VaultListItem } from '../../components/VaultListItem';
import { AddVaultsToFolder } from '../../manage/AddVaultsToFolder';
import { useCurrentVaultFolder } from '../state/currentVaultFolder';
import { DeleteVaultFolder } from './DeleteVaultFolder';

export const ManageVaultFolderPage = () => {
  const navigate = useNavigate();
  const { id, name } = useCurrentVaultFolder();

  const vaults = useFolderVaults(id);

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <FinishEditing
            onClick={() => navigate(makeAppPath('vaultFolder', { id }))}
          />
        }
        title={<PageHeaderTitle>{name}</PageHeaderTitle>}
      />
      <VaultGroupsContainer>
        <VStack gap={8}>
          {vaults.map((vault, index) => (
            <VaultListItem
              key={index}
              id={getStorageVaultId(vault)}
              name={vault.name}
            />
          ))}
        </VStack>
        <AddVaultsToFolder />
      </VaultGroupsContainer>
      <PageFooter>
        <DeleteVaultFolder />
      </PageFooter>
    </>
  );
};
