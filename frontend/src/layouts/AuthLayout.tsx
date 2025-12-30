import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

const { Content } = Layout

export function AuthLayout() {
  return (
    <Layout className="min-h-screen">
      <Content className="flex place-content-center p-6">
        <div className="max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Project Manager</h1>
            <p className="text-gray-600">Manage your projects and tasks efficiently</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Outlet />
          </div>
        </div>
      </Content>
    </Layout>
  )
}
