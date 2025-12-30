import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../shared/constants'
import type { LoginRequest } from '../../../shared/types'
import { useAuth } from '../context/AuthContext'

export function LoginPage () {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login, error, clearError } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: LoginRequest) => {
    try {
      setLoading(true)
      clearError()
      await login(values)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      // Error is handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

      {error && (
        <Alert
          title="Login Failed"
          description={error}
          type="error"
          closable={
            { onClose: clearError }
          }
          className="mb-4"
        />
      )}

      <Form form={form} name="login" onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="your@email.com" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full"
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <span className="text-gray-600">Don't have an account? </span>
        <Link to={ROUTES.REGISTER} className="text-blue-600 hover:text-blue-800">
          Sign Up
        </Link>
      </div>
    </div>
  )
}
