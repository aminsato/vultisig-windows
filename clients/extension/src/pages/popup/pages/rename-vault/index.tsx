import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft } from '@clients/extension/src/icons'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import messageKeys from '@clients/extension/src/utils/message-keys'
import routeKeys from '@clients/extension/src/utils/route-keys'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Button, Form, Input } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const Component = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const goBack = useGoBack()

  const handleSubmit = (): void => {
    form
      .validateFields()
      .then(({ name }: VaultProps) => {
        getStoredVaults().then(vaults => {
          setStoredVaults(
            vaults.map(item => (item.active ? { ...item, name } : item))
          )

          goBack(routeKeys.settings.vault)
        })
      })
      .catch(() => {})
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      form.setFieldsValue(vault)
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidMount, [])

  return (
    <div className="layout rename-vault-page">
      <div className="header">
        <span className="heading">{t(messageKeys.RENAME_VAULT)}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.settings.root)}
        />
      </div>
      <div className="content">
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item<VaultProps> name="name" rules={[{ required: true }]}>
            <Input placeholder={t(messageKeys.NAME)} />
          </Form.Item>
          <Button htmlType="submit" />
        </Form>
      </div>
      <div className="footer">
        <Button onClick={handleSubmit} type="primary" shape="round" block>
          {t(messageKeys.SAVE)}
        </Button>
      </div>
    </div>
  )
}

export default Component
