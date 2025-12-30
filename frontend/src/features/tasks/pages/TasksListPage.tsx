import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
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
import { projectService, taskService } from '../../../shared/services'
import type {
  CreateTaskRequest,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
} from '../../../shared/types'
import { formatDate, formatEnumValue } from '../../../shared/utils'

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

export function TasksListPage () {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.list()
      setTasks(data.tasks)
    } catch (error) {
      message.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await projectService.list()
      setProjects(response.projects)
    } catch (error) {
      console.error('Failed to fetch projects')
    }
  }

  const handleCreate = () => {
    setEditingTask(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    form.setFieldsValue({
      title: task.name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await taskService.delete(id)
      message.success('Task deleted successfully')
      fetchTasks()
    } catch (error) {
      message.error('Failed to delete task')
    }
  }

  const handleSubmit = async (values: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, values)
        message.success('Task updated successfully')
      } else {
        await taskService.create(values as CreateTaskRequest)
        message.success('Task created successfully')
      }
      setIsModalOpen(false)
      fetchTasks()
      form.resetFields()
    } catch (error) {
      message.error(editingTask ? 'Failed to update task' : 'Failed to create task')
    }
  }

  const columns: TableProps<Task>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
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
      title: 'Project',
      dataIndex: 'projectId',
      key: 'project',
      render: (projectId: number) => {
        const project = projects.find(p => p.id === projectId)
        return project?.name || `Project #${projectId}`
      },
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
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record.id)}
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-gray-600">Manage tasks across all your projects</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Task
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTask ? 'Edit Task' : 'Create Task'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingTask ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter a task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Enter task description (optional)" />
          </Form.Item>

          <Form.Item
            name="projectId"
            label="Project"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select placeholder="Select a project">
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.name}
                </Select.Option>
              ))}
            </Select>
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
      </Modal>
    </div>
  )
}
