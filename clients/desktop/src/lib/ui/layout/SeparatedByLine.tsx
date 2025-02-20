import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { toSizeUnit } from '../css/toSizeUnit'
import { VStack } from './Stack'

export const SeparatedByLine = styled(VStack)`
  > *:not(:last-child) {
    border-bottom: 1px solid ${getColor('mistExtra')};
    padding-bottom: ${({ gap = 0 }) => toSizeUnit(gap)};
  }
`
