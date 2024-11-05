import styled from 'styled-components';

import { toSizeUnit } from '../../lib/ui/css/toSizeUnit';
import { pageConfig } from './config';
import { PageSlice } from './PageSlice';

export const PageFooter = styled(PageSlice)`
  padding-bottom: ${toSizeUnit(pageConfig.verticalPadding)};
`;
