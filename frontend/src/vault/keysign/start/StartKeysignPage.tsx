import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep';
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep';
import { MediatorManager } from '../../keygen/shared/peerDiscovery/MediatorManager';
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { GeneratedHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../../setup/state/serverUrlDerivedFromServerType';
import { useAssertCurrentVault } from '../../state/useCurrentVault';
import { KeysignMsgsGuard } from '../join/KeysignMsgsGuard';
import { KeysignSigningStep } from '../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../shared/state/keysignPayload';
import { PeersSelectionRecordProvider } from '../shared/state/selectedPeers';
import { KeysignPeerDiscoveryStep } from './peerDiscovery/KeysignPeerDiscoveryStep';

const keysignSteps = ['joinSession', 'peers', 'session', 'sign'] as const;

export const StartKeysignPage = () => {
  const { keysignPayload } = useAppPathState<'keysign'>();

  const { local_party_id } = useAssertCurrentVault();

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(keysignSteps);

  return (
    <CurrentLocalPartyIdProvider value={local_party_id}>
      <KeysignPayloadProvider value={keysignPayload}>
        <KeysignMsgsGuard>
          <GeneratedServiceNameProvider>
            <PeersSelectionRecordProvider initialValue={{}}>
              <GeneratedSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <CurrentServerTypeProvider initialValue="relay">
                    <ServerUrlDerivedFromServerTypeProvider>
                      <MediatorManager />
                      <Match
                        value={step}
                        joinSession={() => (
                          <JoinKeygenSessionStep onForward={toNextStep} />
                        )}
                        peers={() => (
                          <KeysignPeerDiscoveryStep onForward={toNextStep} />
                        )}
                        session={() => (
                          <KeygenStartSessionStep
                            onForward={toNextStep}
                            onBack={toPreviousStep}
                          />
                        )}
                        sign={() => (
                          <KeysignSigningStep onBack={() => setStep('peers')} />
                        )}
                      />
                    </ServerUrlDerivedFromServerTypeProvider>
                  </CurrentServerTypeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedSessionIdProvider>
            </PeersSelectionRecordProvider>
          </GeneratedServiceNameProvider>
        </KeysignMsgsGuard>
      </KeysignPayloadProvider>
    </CurrentLocalPartyIdProvider>
  );
};
