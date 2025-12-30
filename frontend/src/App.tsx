import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth'
import { router } from './routes'

function App () {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
