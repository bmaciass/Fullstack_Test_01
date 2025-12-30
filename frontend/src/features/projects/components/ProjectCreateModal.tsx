import { Form, Input, Modal, message } from 'antd'
import { projectService } from '../../../shared/services'
import type { CreateProjectRequest, Project, UpdateProjectRequest } from '../../../shared/types'

export const ProjectCreateModal = (props: { isOpen: boolean, onSave: () => void, onCancel: () => void, project: Project | null }) => {
  const [form] = Form.useForm()
  const { isOpen, onCancel, onSave, project: editingProject } = props
  const editing = editingProject !== null

  if (editingProject) {
    form.setFieldsValue({
      name: editingProject.name,
      slug: editingProject.slug,
      description: editingProject.description
    })
  } else {
    form.resetFields()
  }

  const handleSubmit = async (values: CreateProjectRequest | UpdateProjectRequest) => {
    try {
      if (editingProject) {
        await projectService.update(editingProject.id, values)
        message.success('Project updated successfully')
      } else {
        await projectService.create(values as CreateProjectRequest)
        message.success('Project created successfully')
      }
      onSave()
      form.resetFields()
    } catch (error) {
      console.error(error)
      message.error(editing ? 'Failed to update project' : 'Failed to create project')
    }
  }

  return (
    <Modal
      title={editing ? 'Edit Project' : 'Create Project'}
      open={isOpen}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={editing ? 'Update' : 'Create'}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>
        <Form.Item
          name={'slug'}
          label={'Project Slug'}
          rules={[{ required: true, message: 'Please enter a project slug' }]}
        >
          <Input placeholder="Enter project slug" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} placeholder="Enter project description (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
