import { recommendedPeers, requiredPeers } from '@core/mpc/peers/config'
import { range } from '@lib/utils/array/range'
import { BrowserOpenURL } from '@wailsapp/runtime'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Match } from '../../../../lib/ui/base/Match'
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps'
import { useBoolean } from '../../../../lib/ui/hooks/useBoolean'
import { CloseIcon } from '../../../../lib/ui/icons/CloseIcon'
import { CloudOffIcon } from '../../../../lib/ui/icons/CloudOffIcon'
import { InfoIcon } from '../../../../lib/ui/icons/InfoIcon'
import { VStack } from '../../../../lib/ui/layout/Stack'
import { TakeWholeSpaceCenterContent } from '../../../../lib/ui/layout/TakeWholeSpaceCenterContent'
import { Spinner } from '../../../../lib/ui/loaders/Spinner'
import { OnBackProp, OnForwardProp } from '../../../../lib/ui/props'
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery'
import { Text } from '../../../../lib/ui/text'
import { InitiatingDevice } from '../../../../mpc/peers/InitiatingDevice'
import { PeerDiscoveryFormFooter } from '../../../../mpc/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '../../../../mpc/peers/PeerPlaceholder'
import { PeersContainer } from '../../../../mpc/peers/PeersContainer'
import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { PageHeader } from '../../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle'
import { StrictText } from '../../../deposit/DepositVerify/DepositVerify.styled'
import { CurrentPeersCorrector } from '../../../keygen/shared/peerDiscovery/CurrentPeersCorrector'
import { DownloadKeygenQrCode } from '../../../keygen/shared/peerDiscovery/DownloadKeygenQrCode'
import { KeygenPeerDiscoveryQrCode } from '../../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryQrCode'
import { usePeerOptionsQuery } from '../../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery'
import { useSelectedPeers } from '../../../keysign/shared/state/selectedPeers'
import { useJoinKeygenUrlQuery } from '../../peers/queries/useJoinKeygenUrlQuery'
import { SecureVaultKeygenOverlay } from '../components/SecureVaultKeygenOverlay'
import { SecureVaultPeerOption } from '../components/SecureVaultPeerOption'
import {
  CloseIconWrapper,
  CloudOffWrapper,
  ContentWrapper,
  InfoIconWrapperForBanner,
  LocalPillWrapper,
  PageWrapper,
  PillWrapper,
} from './SecureVaultKeygenPeerDiscoveryStep.styles'

const educationUrl =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'

export const SecureVaultKeygenPeerDiscoveryStep = ({
  onForward,
  onBack,
}: OnForwardProp & OnBackProp) => {
  const [overlayShown, setHasShownOverlay] = useState(true)
  const [serverType] = useMpcServerType()
  const [showWarning, { toggle }] = useBoolean(true)
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
      <PageWrapper
        as="form"
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
        justifyContent="space-between"
      >
        <VStack justifyContent="center" alignItems="center" gap={40}>
          <MatchQuery
            value={joinUrlQuery}
            success={value => <KeygenPeerDiscoveryQrCode value={value} />}
            pending={() => (
              <TakeWholeSpaceCenterContent>
                <Spinner />
              </TakeWholeSpaceCenterContent>
            )}
            error={() => (
              <TakeWholeSpaceCenterContent>
                <StrictText>{t('failed_to_generate_qr_code')}</StrictText>
              </TakeWholeSpaceCenterContent>
            )}
          />
          <ContentWrapper gap={24} alignItems="center">
            <Match
              value={serverType}
              local={() => (
                <LocalPillWrapper alignItems="center">
                  <CloudOffWrapper>
                    <CloudOffIcon />
                  </CloudOffWrapper>
                  <Text size={13} weight={500} color="shy">
                    {t('localMode')}
                  </Text>
                </LocalPillWrapper>
              )}
              relay={() =>
                showWarning && (
                  <PillWrapper gap={12} alignItems="center">
                    <InfoIconWrapperForBanner>
                      <InfoIcon />
                    </InfoIconWrapperForBanner>
                    <Text weight={500} color="shy" size={13}>
                      {t('scanQrInstruction')}
                    </Text>
                    <CloseIconWrapper
                      role="button"
                      tabIndex={0}
                      onClick={toggle}
                    >
                      <CloseIcon />
                    </CloseIconWrapper>
                  </PillWrapper>
                )
              }
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
                          <SecureVaultPeerOption key={value} value={value} />
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
          </ContentWrapper>
        </VStack>
        <PeerDiscoveryFormFooter isDisabled={isDisabled} />
        {overlayShown && (
          <SecureVaultKeygenOverlay
            onCompleted={() => setHasShownOverlay(false)}
          />
        )}
      </PageWrapper>
    </>
  )
}
