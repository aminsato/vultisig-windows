import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';

export const AddVaultsToFolderContainer: React.FC<
  ComponentWithChildrenProps
> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <VStack gap={8}>
      <Text weight="500" color="supporting" size={14}>
        {t('add_vaults_to_folder')}
      </Text>
      {children}
    </VStack>
  );
};
