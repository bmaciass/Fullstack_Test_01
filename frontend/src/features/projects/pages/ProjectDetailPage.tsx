import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  List,
  Modal,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  type TableProps,
  Tag,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../../shared/constants'
import { projectService, taskService, userService } from '../../../shared/services'
import type {
  CreateTaskRequest,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
  UserSummary,
} from '../../../shared/types'
import { formatDate, formatEnumValue } from '../../../shared/utils'
import { ProjectMembersModal } from '../components/ProjectMembersModal'

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'default',
  medium: 'warning',
  high: 'error',
}

export function ProjectDetailPage () {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form] = Form.useForm()

  // Task members management state
  const [assignedUsers, setAssignedUsers] = useState<UserSummary[]>([])
  const [projectMembers, setProjectMembers] = useState<UserSummary[]>([])
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null)
  const [assigningUser, setAssigningUser] = useState(false)
  const [unassigningEmail, setUnassigningEmail] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchProject()
      fetchTasks()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const data = await projectService.getById(Number(id))
      setProject(data)
      // Fetch project members for task assignment
      const members = await projectService.getMembers(data.id)
      setProjectMembers(members)
    } catch (error) {
      console.error(error)
      message.error('Failed to fetch project')
      navigate(ROUTES.PROJECTS)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const data = await taskService.list({ projectId: Number(id) })
      setTasks(data.tasks)
    } catch (error) {
      console.error(error)
      message.error('Failed to fetch tasks')
    }
  }

  const fetchAssignedUsers = async (taskId: number) => {
    try {
      const users = await taskService.getAssignedUsers(taskId)
      setAssignedUsers(users)
    } catch (error) {
      console.error(error)
      message.error('Failed to fetch assigned users')
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setAssignedUsers([])
    setSelectedUserEmail(null)
    form.resetFields()
    form.setFieldsValue({ projectId: Number(id) })
    setIsTaskModalOpen(true)
  }

  const handleEditTask = async (task: Task) => {
    setEditingTask(task)
    form.setFieldsValue({
      name: task.name,
      description: task.description,
      status: task.status,
      priority: task.priority,
    })
    setIsTaskModalOpen(true)
    // Fetch assigned users for this task
    await fetchAssignedUsers(task.id)
  }

  const handleAssignUser = async () => {
    if (!selectedUserEmail || !editingTask) return

    try {
      setAssigningUser(true)
      await taskService.assignUser(editingTask.id, selectedUserEmail)
      message.success('User assigned successfully')
      setSelectedUserEmail(null)
      await fetchAssignedUsers(editingTask.id)
      await fetchTasks()
    } catch (error) {
      console.error(error)
      message.error('Failed to assign user')
    } finally {
      setAssigningUser(false)
    }
  }

  const handleUnassignUser = async (userEmail: string) => {
    if (!editingTask) return

    try {
      setUnassigningEmail(userEmail)
      await taskService.unassignUser(editingTask.id, userEmail)
      message.success('User unassigned successfully')
      await fetchAssignedUsers(editingTask.id)
      await fetchTasks()
    } catch (error) {
      console.error(error)
      message.error('Failed to unassign user')
    } finally {
      setUnassigningEmail(null)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.delete(taskId)
      message.success('Task deleted successfully')
      fetchTasks()
    } catch (error) {
      console.error(error)
      message.error('Failed to delete task')
    }
  }

  const handleTaskSubmit = async (values: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, values)
        message.success('Task updated successfully')
      } else {
        await taskService.create({ ...values, projectId: Number(id) } as CreateTaskRequest)
        message.success('Task created successfully')
      }
      setIsTaskModalOpen(false)
      fetchTasks()
      form.resetFields()
    } catch (error) {
      console.error(error)
      message.error(editingTask ? 'Failed to update task' : 'Failed to create task')
    }
  }

  const handleEditProject = () => {
    // Navigate back to projects page with edit modal (could be improved)
    navigate(ROUTES.PROJECTS)
  }

  const handleDeleteProject = async () => {
    if (!project) return
    try {
      await projectService.delete(project.id)
      message.success('Project deleted successfully')
      navigate(ROUTES.PROJECTS)
    } catch (error) {
      console.error(error)
      message.error('Failed to delete project')
    }
  }

  const taskColumns: TableProps<Task>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={STATUS_COLORS[status]}>{formatEnumValue(status)}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => (
        <Tag color={PRIORITY_COLORS[priority]}>{formatEnumValue(priority)}</Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: date =>
        date ? formatDate(date) : <span className="text-gray-400">No due date</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditTask(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => handleDeleteTask(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (!project && !loading) {
    return null
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTES.PROJECTS)}
          className="mb-2 px-0"
        >
          Back to Projects
        </Button>
      </div>

      {/* Project Details Card */}
      <Card loading={loading} className="mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{project?.name}</h1>
            <Descriptions column={2}>
              <Descriptions.Item label="Description">
                {project?.description || <span className="text-gray-400">No description</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Slug">
                <Tag color="blue">{project?.slug}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Members">
                <Tag icon={<TeamOutlined />} color="blue">
                  {project?.memberCount || 0} members
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {project?.createdAt ? formatDate(project.createdAt) : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEditProject}>
              Edit
            </Button>
            <Button icon={<UserOutlined />} onClick={() => setIsMembersModalOpen(true)}>
              Members
            </Button>
            <Popconfirm
              title="Delete project"
              description="Are you sure you want to delete this project? All tasks will remain but will need to be reassigned."
              onConfirm={handleDeleteProject}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>

      {/* Tasks Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Tasks</h2>
            <p className="text-gray-600">Manage tasks for this project</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
            New Task
          </Button>
        </div>

        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Task Create/Edit Modal */}
      <Modal
        title={editingTask ? 'Edit Task' : 'Create Task'}
        open={isTaskModalOpen}
        onCancel={() => setIsTaskModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingTask ? 'Update' : 'Create'}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleTaskSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a task name' }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Enter task description (optional)" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="pending">
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="in_progress">In Progress</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="priority" label="Priority" initialValue="medium">
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
            </Select>
          </Form.Item>
        </Form>

        {/* Task Members Section (only for editing existing tasks) */}
        {editingTask && (
          <>
            <Divider />
            <div>
              <h3 className="text-sm font-medium mb-3">Assigned Users</h3>

              {/* Add User Section */}
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 mb-2">Assign Project Member</p>
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select a project member to assign"
                    value={selectedUserEmail}
                    onChange={setSelectedUserEmail}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={projectMembers
                      .filter(member => !assignedUsers.some(assigned => assigned.email === member.email))
                      .map(member => ({
                        value: member.email,
                        label: `${member.fullName || member.username} (${member.email})`,
                      }))}
                    disabled={assigningUser}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAssignUser}
                    disabled={!selectedUserEmail || assigningUser}
                    loading={assigningUser}
                  >
                    Assign
                  </Button>
                </Space.Compact>
              </div>

              {/* Assigned Users List */}
              <List
                dataSource={assignedUsers}
                locale={{ emptyText: 'No users assigned yet' }}
                renderItem={(user) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="unassign"
                        title="Unassign user"
                        description={`Are you sure you want to unassign ${user.fullName || user.username}?`}
                        onConfirm={() => handleUnassignUser(user.email)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          loading={unassigningEmail === user.email}
                          disabled={!!unassigningEmail}
                          size="small"
                        >
                          Unassign
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Tag icon={<UserOutlined />} color="blue">
                          {user.username}
                        </Tag>
                      }
                      title={user.fullName || user.username}
                      description={user.email}
                    />
                  </List.Item>
                )}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Members Modal */}
      {project && (
        <ProjectMembersModal
          isOpen={isMembersModalOpen}
          project={project}
          onClose={() => {
            setIsMembersModalOpen(false)
            fetchProject() // Refresh project to update member count
          }}
        />
      )}
    </div>
  )
}
