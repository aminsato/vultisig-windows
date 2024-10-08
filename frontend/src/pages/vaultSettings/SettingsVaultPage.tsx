import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime';
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import DiscordIcon from '../../lib/ui/icons/DiscordIcon';
import GithubIcon from '../../lib/ui/icons/GithubIcon';
import TwitterIcon from '../../lib/ui/icons/TwitterIcon';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useVaultSettingsQuery } from '../../vault/queries/useVaultSettingsQuery';
import {
  settingsItems,
  VULTISIG_DISCORD_LINK,
  VULTISIG_GITHUB_LINK,
  VULTISIG_PRIVACY_POLICY_LINK,
  VULTISIG_SHARE_APP_LINK,
  VULTISIG_TERMS_OF_SERVICE_LINK,
  VULTISIG_TWITTER_LINK,
} from './constants';
import {
  Container,
  Footer,
  ListItemPanel,
  StyledPageSlice,
  StyledVStack,
} from './SettingsVaultPage.styles';

const SettingsVaultPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: vaultSettings } = useVaultSettingsQuery();
  const { currency, languageUI } = vaultSettings;

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        hasBorder
        title={
          <PageHeaderTitle>{t('vault_settings_page_title')}</PageHeaderTitle>
        }
      />
      <ScrollableFlexboxFiller>
        <StyledPageSlice data-testid="SettingsVaultPage-Container" flexGrow>
          <VStack flexGrow>
            {settingsItems.map(({ sectionTitleKey, items }, index) => (
              <StyledVStack key={index} gap={12}>
                {sectionTitleKey && (
                  <Text weight={500} color="contrast">
                    {t(sectionTitleKey)}
                  </Text>
                )}
                {items.map(({ id, titleKey, icon: Icon, path }) => (
                  <UnstyledButton
                    key={id}
                    onClick={() => {
                      if (id === 'privacy-policy') {
                        BrowserOpenURL(VULTISIG_PRIVACY_POLICY_LINK);
                      } else if (id === 'terms-of-service') {
                        BrowserOpenURL(VULTISIG_TERMS_OF_SERVICE_LINK);
                      } else if (id === 'share-app') {
                        BrowserOpenURL(VULTISIG_SHARE_APP_LINK);
                      } else {
                        navigate(path);
                      }
                    }}
                  >
                    <ListItemPanel>
                      <HStack
                        fullWidth
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <HStack gap={12}>
                          <Icon />
                          <Text>{t(titleKey)}</Text>
                        </HStack>
                        {id === 'language' || id === 'currency' ? (
                          <HStack gap={8} alignItems="center">
                            <Text size={14} color="contrast">
                              {id === 'language' ? languageUI : currency}
                            </Text>
                            <ChevronRightIcon />
                          </HStack>
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </HStack>
                    </ListItemPanel>
                  </UnstyledButton>
                ))}
              </StyledVStack>
            ))}
          </VStack>
          <Footer>
            <HStack gap={24}>
              <UnstyledButton
                onClick={() => BrowserOpenURL(VULTISIG_GITHUB_LINK)}
              >
                <GithubIcon />
              </UnstyledButton>
              <UnstyledButton
                onClick={() => BrowserOpenURL(VULTISIG_TWITTER_LINK)}
              >
                <TwitterIcon />
              </UnstyledButton>
              <UnstyledButton
                onClick={() => BrowserOpenURL(VULTISIG_DISCORD_LINK)}
              >
                <DiscordIcon />
              </UnstyledButton>
            </HStack>
            <VStack alignItems="center">
              <Text size={14} color="primary" weight="600">
                {t('settings_vault_page_footer')}
                {__APP_VERSION__}
              </Text>
              <Text size={14} color="primary" weight="600">
                (BUILD {__APP_BUILD__})
              </Text>
            </VStack>
          </Footer>
        </StyledPageSlice>
      </ScrollableFlexboxFiller>
    </Container>
  );
};

export default SettingsVaultPage;
