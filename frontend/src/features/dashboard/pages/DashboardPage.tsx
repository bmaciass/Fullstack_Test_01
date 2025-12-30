import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Typography, message, Spin } from 'antd'
import {
  ProjectOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { authService } from '../../../shared/services/auth.service'
import type { UserStats } from '../../../shared/types'

const { Title } = Typography

export function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authService.getUserStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        message.error('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <p className="text-gray-600 mb-6">Welcome back! Here's an overview of your work.</p>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats?.projectsCount ?? 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={stats?.pendingTasksCount ?? 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="In Progress Tasks"
              value={stats?.inProgressTasksCount ?? 0}
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mt-6" title="Quick Actions">
        <p className="text-gray-600">
          Start by creating a new project or adding tasks to existing projects.
        </p>
      </Card>
    </div>
  )
}
