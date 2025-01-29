import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../../wailsjs/go/models';
import {
  ComponentWithValueProps,
  ValueFinishProps,
} from '../../../lib/ui/props';
import { decryptDatBackup } from '../utils/decryptDatBackup';
import { fromDatBackupString } from '../utils/fromDatBackupString';
import { DecryptVaultView } from './DecryptVaultView';

export const DecryptVaultStep = ({
  value,
  onFinish,
}: ComponentWithValueProps<ArrayBuffer> & ValueFinishProps<storage.Vault>) => {
  const { mutate, error, isPending } = useMutation({
    mutationFn: async (password: string) => {
      const decrypted = await decryptDatBackup({
        backup: value,
        password,
      });

      const valueAsString = new TextDecoder().decode(decrypted);

      return fromDatBackupString(valueAsString);
    },
    onSuccess: onFinish,
  });

  return (
    <DecryptVaultView isPending={isPending} error={error} onSubmit={mutate} />
  );
};
