import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import useVersionCheck from '../../lib/hooks/useVersionCheck';
import { Text } from '../../lib/ui/text';
import { appPaths } from '../../navigation';
import { ProductLogo } from '../../ui/logo/ProductLogo';
import {
  FixedWrapper,
  StyledButton,
  StyledModalCloseButton,
} from './UpdatedAvailablePopup.styles';

const UpdateAvailablePopup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    localVersion,
    latestVersion,
    updateAvailable,
    localError,
    remoteError,
    isLoading,
  } = useVersionCheck();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isError = localError || remoteError;
    if (!isLoading && !isError && updateAvailable) {
      setIsOpen(true);
    } else if (isLoading || isError) {
      setIsOpen(false);
    }
  }, [isLoading, localError, remoteError, updateAvailable]);

  if (!isOpen) {
    return null;
  }

  return (
    <FixedWrapper>
      <StyledModalCloseButton onClick={() => setIsOpen(false)} />
      <ProductLogo fontSize={200} />
      <Text size={14} color="contrast" weight={500}>
        {t('updatePopup.updateAvailableMessage', {
          latestVersion,
          localVersion,
        })}
      </Text>
      <StyledButton onClickCapture={() => navigate(appPaths.checkUpdate)}>
        {t('updatePopup.updateButton')}
      </StyledButton>
    </FixedWrapper>
  );
};

export default UpdateAvailablePopup;
