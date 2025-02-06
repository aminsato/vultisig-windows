import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { OnBackProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenFailedState } from '../../keygen/shared/KeygenFailedState';
import { useKeygenMutation } from '../../keygen/shared/mutations/useKeygenMutation';
import { BackupFastVault } from './backup/BackupFastVault';
import { SetupFastVaultEducationSlides } from './SetupFastVaultEducationSlides';

type KeygenStepProps = OnBackProp & {
  onTryAgain: () => void;
};
export const SetupFastVaultCreationStep = ({ onTryAgain }: KeygenStepProps) => {
  const { mutate: start, ...mutationState } = useKeygenMutation();
  const { t } = useTranslation();
  const title = t('creating_vault');

  useEffect(start, [start]);

  return (
    <MatchQuery
      value={mutationState}
      success={vault => <BackupFastVault vault={vault} />}
      error={error => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <KeygenFailedState message={error.message} onTryAgain={onTryAgain} />
        </>
      )}
      pending={() => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <SetupFastVaultEducationSlides />
        </>
      )}
    />
  );
};
