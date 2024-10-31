import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { EditIcon } from '../../lib/ui/icons/EditIcon';
import { VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle';
import { VaultList } from './VaultList';

export const VaultsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <VStack flexGrow data-testid="VaultPage-Container">
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => navigate(makeAppPath('manageVaults'))}
          />
        }
        title={
          <PageHeaderToggleTitle
            value={true}
            onChange={() => {
              navigate(makeAppPath('vault'));
            }}
          >
            {t('vaults')}
          </PageHeaderToggleTitle>
        }
      />
      <VaultList />
    </VStack>
  );
};
