import { PlusOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, List, message, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectService } from '../../../shared/services'
import type { Project } from '../../../shared/types'
import { ProjectCreateModal } from '../components/ProjectCreateModal'

export function ProjectsListPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectService.list({ includeDeleted: false })
      setProjects(response.projects)
    } catch (error) {
      console.error(error)
      message.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsModalOpen(true)
  }

  const onSave = () => {
    setIsModalOpen(false)
    fetchProjects()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-600">Manage your projects and collaborate with your team</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Project
        </Button>
      </div>

      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={projects}
        pagination={{ pageSize: 10 }}
        renderItem={project => (
          <List.Item
            className="cursor-pointer hover:bg-gray-50 transition-colors px-4 py-3 rounded-lg"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <List.Item.Meta
              title={<span className="text-lg font-semibold">{project.name}</span>}
              description={
                <div className="space-y-2">
                  <div>{project.description || <span className="text-gray-400">No description</span>}</div>
                  <div className="flex gap-2">
                    <Tag color="blue">{project.slug}</Tag>
                    <Tag icon={<TeamOutlined />} color="blue">
                      {project.memberCount || 0} members
                    </Tag>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <ProjectCreateModal
        isOpen={isModalOpen}
        onSave={onSave}
        onCancel={() => setIsModalOpen(false)}
        project={null}
      />
    </div>
  )
}
