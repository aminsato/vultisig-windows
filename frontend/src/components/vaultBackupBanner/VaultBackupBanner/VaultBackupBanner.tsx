import { useTranslation } from 'react-i18next';

import { ChevronRightIcon } from '../../../lib/ui/icons/ChevronRightIcon';
import { TriangleAlertIcon } from '../../../lib/ui/icons/TriangleAlertIcon';
import { Text } from '../../../lib/ui/text';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import {
  ChevronIconWrapper,
  ContentWrapperButton,
} from './VaultBackupBanner.styles';

const VaultBackupBanner = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  return (
    <ContentWrapperButton
      onClick={() => navigate('vaultBackup')}
      data-testid="VaultBackupBanner-Content"
    >
      <TriangleAlertIcon height={24} width={24} />
      <Text color="regular" size={14} weight="500">
        {t('vault_backup_banner_title')}
      </Text>
      <ChevronIconWrapper>
        <ChevronRightIcon size={24} />
      </ChevronIconWrapper>
    </ContentWrapperButton>
  );
};

export default VaultBackupBanner;
