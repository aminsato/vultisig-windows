import { recommendedPeers, requiredPeers } from '@core/mpc/peers/config'
import { range } from '@lib/utils/array/range'
import { BrowserOpenURL } from '@wailsapp/runtime'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Match } from '../../../lib/ui/base/Match'
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps'
import { InfoIcon } from '../../../lib/ui/icons/InfoIcon'
import { VStack } from '../../../lib/ui/layout/Stack'
import { OnBackProp, OnForwardProp } from '../../../lib/ui/props'
import { QueryBasedQrCode } from '../../../lib/ui/qr/QueryBasedQrCode'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { Text } from '../../../lib/ui/text'
import { InitiatingDevice } from '../../../mpc/peers/InitiatingDevice'
import { PeerOption } from '../../../mpc/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '../../../mpc/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '../../../mpc/peers/PeerPlaceholder'
import { PeerRequirementsInfo } from '../../../mpc/peers/PeerRequirementsInfo'
import { PeersContainer } from '../../../mpc/peers/PeersContainer'
import { PeersManagerFrame } from '../../../mpc/peers/PeersManagerFrame'
import { MpcLocalServerIndicator } from '../../../mpc/serverType/MpcLocalServerIndicator'
import { useMpcServerType } from '../../../mpc/serverType/state/mpcServerType'
import { FitPageContent } from '../../../ui/page/PageContent'
import { PageFormFrame } from '../../../ui/page/PageFormFrame'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { CurrentPeersCorrector } from '../../keygen/shared/peerDiscovery/CurrentPeersCorrector'
import { DownloadKeygenQrCode } from '../../keygen/shared/peerDiscovery/DownloadKeygenQrCode'
import { usePeerOptionsQuery } from '../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery'
import { useSelectedPeers } from '../../keysign/shared/state/selectedPeers'
import { useJoinKeygenUrlQuery } from '../peers/queries/useJoinKeygenUrlQuery'
import { SecureVaultKeygenOverlay } from './components/SecureVaultKeygenOverlay'

const educationUrl =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'

export const SetupSecureVaultPeerDiscoveryStep = ({
  onForward,
  onBack,
}: OnForwardProp & OnBackProp) => {
  const [overlayShown, setHasShownOverlay] = useState(true)
  const [serverType] = useMpcServerType()
  const { t } = useTranslation()
  const joinUrlQuery = useJoinKeygenUrlQuery()
  const selectedPeers = useSelectedPeers()
  const peerOptionsQuery = usePeerOptionsQuery()

  const isDisabled = useMemo(() => {
    if (selectedPeers.length < requiredPeers) {
      return t('select_n_devices', { count: requiredPeers })
    }
  }, [selectedPeers.length, t])

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('scan_qr')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <MatchQuery
            value={joinUrlQuery}
            success={value => (
              <>
                <PageHeaderIconButton
                  onClick={() => {
                    BrowserOpenURL(educationUrl)
                  }}
                  icon={<InfoIcon />}
                />
                <DownloadKeygenQrCode value={value} />
              </>
            )}
          />
        }
      />
      <FitPageContent
        as="form"
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <PageFormFrame>
          <PeersManagerFrame>
            <QueryBasedQrCode value={joinUrlQuery} />
            <VStack fullWidth gap={24} alignItems="center">
              <Match
                value={serverType}
                local={() => <MpcLocalServerIndicator />}
                relay={() => <PeerRequirementsInfo />}
              />
              <VStack fullWidth gap={24}>
                <Text color="contrast" size={22} weight="500">
                  {t('devicesStatus', {
                    currentPeers: selectedPeers.length + 1,
                  })}
                </Text>
                <CurrentPeersCorrector />
                <PeersContainer>
                  <InitiatingDevice />
                  <MatchQuery
                    value={peerOptionsQuery}
                    success={peerOptions => {
                      return (
                        <>
                          {peerOptions.map(value => (
                            <PeerOption key={value} value={value} />
                          ))}
                          {range(recommendedPeers - peerOptions.length).map(
                            index => (
                              <PeerPlaceholder key={index}>
                                {t('scanWithDevice', {
                                  deviceNumber: index + peerOptions.length + 1,
                                })}
                              </PeerPlaceholder>
                            )
                          )}
                          {peerOptions.length >= recommendedPeers && (
                            <PeerPlaceholder>
                              {t('optionalDevice')}
                            </PeerPlaceholder>
                          )}
                        </>
                      )
                    }}
                  />
                </PeersContainer>
              </VStack>
            </VStack>
          </PeersManagerFrame>
          <PeerDiscoveryFormFooter isDisabled={isDisabled} />
        </PageFormFrame>
      </FitPageContent>
      {overlayShown && (
        <SecureVaultKeygenOverlay
          onCompleted={() => setHasShownOverlay(false)}
        />
      )}
    </>
  )
}
