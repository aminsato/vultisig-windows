import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { horizontalPadding } from '../../../../lib/ui/css/horizontalPadding';
import { takeWholeSpace } from '../../../../lib/ui/css/takeWholeSpace';
import {
  interactiveTextInput,
  textInputBorderRadius,
} from '../../../../lib/ui/css/textInput';
import { toSizeUnit } from '../../../../lib/ui/css/toSizeUnit';
import { text } from '../../../../lib/ui/text';
import { useFromAmount } from '../../state/fromAmount';
import { useFromCoin } from '../../state/fromCoin';
import { AmountContainer } from './AmountContainer';
import { AmountLabel } from './AmountLabel';
import { amountConfig } from './config';
import { FiatAmount } from './FiatAmount';

const Input = styled.input`
  ${takeWholeSpace};
  padding-top: ${toSizeUnit(amountConfig.inputPaddingTop)};
  ${horizontalPadding(amountConfig.horizontalPadding)}

  ${text({
    weight: 700,
    size: 20,
    family: 'mono',
    color: 'contrast',
  })}

  &::placeholder {
    ${text({
      color: 'shy',
    })}
  }

  background: transparent;

  ${textInputBorderRadius};

  ${interactiveTextInput};
`;

export const ManageFromAmount = () => {
  const [value, setValue] = useFromAmount();

  const [fromCoin] = useFromCoin();

  const valueAsString = value?.toString() ?? '';
  const [inputValue, setInputValue] = useState<string>(valueAsString);

  const { t } = useTranslation();

  return (
    <AmountContainer>
      <AmountLabel>{t('from')}</AmountLabel>
      {value !== null && <FiatAmount value={{ amount: value, ...fromCoin }} />}
      <Input
        type="number"
        placeholder={t('enter_amount')}
        onWheel={event => event.currentTarget.blur()}
        value={
          Number(valueAsString) === Number(inputValue)
            ? inputValue
            : valueAsString
        }
        onChange={({ currentTarget: { value } }) => {
          value = value.replace(/-/g, '');

          if (value === '') {
            setInputValue('');
            setValue?.(null);
            return;
          }

          const valueAsNumber = parseFloat(value);
          if (isNaN(valueAsNumber)) {
            return;
          }

          setInputValue(
            valueAsNumber.toString() !== value
              ? value
              : valueAsNumber.toString()
          );
          setValue?.(valueAsNumber);
        }}
      />
    </AmountContainer>
  );
};
