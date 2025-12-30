import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { Button, List, message, Modal, Popconfirm, Select, Space, Spin, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { projectService, userService } from '../../../shared/services'
import type { Project, UserSummary } from '../../../shared/types'

interface ProjectMembersModalProps {
  isOpen: boolean
  project: Project | null
  onClose: () => void
}

export function ProjectMembersModal({ isOpen, project, onClose }: ProjectMembersModalProps) {
  const [members, setMembers] = useState<UserSummary[]>([])
  const [allUsers, setAllUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && project) {
      fetchData()
    }
  }, [isOpen, project])

  const fetchData = async () => {
    if (!project) return

    try {
      setLoading(true)
      const [membersData, usersData] = await Promise.all([
        projectService.getMembers(project.id),
        userService.list({ limit: 100 }),
      ])
      setMembers(membersData)
      setAllUsers(usersData.users)
    } catch (error) {
      console.error(error)
      message.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserEmail || !project) return

    try {
      setAddingMember(true)
      await projectService.addMember(project.id, { email: selectedUserEmail })
      message.success('Member added successfully')
      setSelectedUserEmail(null)
      await fetchData()
    } catch (error) {
      console.error(error)
      message.error('Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberEmail: string) => {
    if (!project) return

    try {
      setRemovingEmail(memberEmail)
      await projectService.removeMember(project.id, memberEmail)
      message.success('Member removed successfully')
      await fetchData()
    } catch (error) {
      console.error(error)
      message.error('Failed to remove member')
    } finally {
      setRemovingEmail(null)
    }
  }

  const availableUsers = allUsers.filter(
    (user) => !members.some((member) => member.email === user.email)
  )

  return (
    <Modal
      title={`Manage Members - ${project?.name || ''}`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          {/* Add Member Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="text-sm font-medium mb-3">Add Member</h3>
            <Space.Compact style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select a user to add"
                value={selectedUserEmail}
                onChange={setSelectedUserEmail}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableUsers.map((user) => ({
                  value: user.email,
                  label: `${user.fullName || user.username} (${user.email})`,
                }))}
                disabled={addingMember}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddMember}
                disabled={!selectedUserEmail || addingMember}
                loading={addingMember}
              >
                Add
              </Button>
            </Space.Compact>
          </div>

          {/* Current Members List */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Current Members ({members.length})
            </h3>
            <List
              dataSource={members}
              locale={{ emptyText: 'No members yet' }}
              renderItem={(member) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      key="remove"
                      title="Remove member"
                      description={`Are you sure you want to remove ${member.fullName || member.username}?`}
                      onConfirm={() => handleRemoveMember(member.email)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        loading={removingEmail === member.email}
                        disabled={!!removingEmail}
                      >
                        Remove
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Tag icon={<UserOutlined />} color="blue">
                        {member.username}
                      </Tag>
                    }
                    title={member.fullName || member.username}
                    description={member.email}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
