import {
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, Menu, type MenuProps } from 'antd'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { ROUTES } from '../shared/constants'

const { Header, Sider, Content } = Layout

export function MainLayout () {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  const menuItems: MenuProps['items'] = [
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardOutlined />,
      label: <Link to={ROUTES.DASHBOARD}>Dashboard</Link>,
    },
    {
      key: ROUTES.PROJECTS,
      icon: <ProjectOutlined />,
      label: <Link to={ROUTES.PROJECTS}>Projects</Link>,
    },
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} className="!bg-gray-800">
        <div className="h-16 flex items-center justify-center text-white text-xl font-bold">
          {collapsed ? 'PM' : 'Project Manager'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="!bg-gray-800"
        />
      </Sider>
      <Layout>
        <Header className="!bg-white !px-6 flex items-center justify-between border-b border-gray-200">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span className="font-medium" style={{color: 'white'}}>
                {user ? `${user.firstName} ${user.lastName}` : ''}
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg min-h-[280px]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
