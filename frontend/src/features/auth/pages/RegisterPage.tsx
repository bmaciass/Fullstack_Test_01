import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../shared/constants'
import type { RegisterRequest } from '../../../shared/types'
import { useAuth } from '../context/AuthContext'

export function RegisterPage () {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { register, error, clearError } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: RegisterRequest) => {
    try {
      setLoading(true)
      clearError()
      await register(values)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      console.error(err)
      // Error is handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      {error && (
        <Alert
          title="Registration Failed"
          description={error}
          type="error"
          closable
          onClose={clearError}
          className="mb-4"
        />
      )}

      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[
            { required: true, message: 'Please input your first name!' },
            { min: 2, message: 'Name must be at least 2 characters!' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="John" size="large" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[
            { required: true, message: 'Please input your last name!' },
            { min: 2, message: 'Name must be at least 2 characters!' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Doe" size="large" />
        </Form.Item>

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
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Please input your username!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="johndoe" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator (_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match!'))
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full"
          >
            Sign Up
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <span className="text-gray-600">Already have an account? </span>
        <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-800">
          Sign In
        </Link>
      </div>
    </div>
  )
}
