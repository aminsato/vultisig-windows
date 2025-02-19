import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { Reshare, StartKeygen } from '../../../../../wailsjs/go/tss/TssService'
import { useMpcLib } from '../../../../mpc/state/mpcLib'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { KeygenType } from '../../KeygenType'
import { useCurrentKeygenType } from '../../state/currentKeygenType'
import { useCurrentKeygenVault } from '../../state/currentKeygenVault'
import { useCurrentServerUrl } from '../../state/currentServerUrl'
import { useCurrentSessionId } from '../state/currentSessionId'

export const useKeygenMutation = () => {
  const keygenType = useCurrentKeygenType()

  const serverUrl = useCurrentServerUrl()

  const encryptionKeyHex = useCurrentHexEncryptionKey()

  const sessionId = useCurrentSessionId()

  const vault = useCurrentKeygenVault()

  const mpcLib = useMpcLib()

  return useMutation({
    mutationFn: async () =>
      match(keygenType, {
        [KeygenType.Keygen]: () => {
          return match(mpcLib, {
            GG20: () =>
              StartKeygen(
                vault.name,
                vault.local_party_id,
                sessionId,
                vault.hex_chain_code,
                encryptionKeyHex,
                serverUrl
              ),
            DKLS: () => {
              throw new Error('DKLS is not supported yet')
            },
          })
        },
        [KeygenType.Reshare]: () =>
          Reshare(vault, sessionId, encryptionKeyHex, serverUrl),
      }),
  })
}
