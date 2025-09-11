import { Card, List, Space, Select } from 'antd';
import { useMemo, useState } from 'react';

interface MembersPanelProps {
  admin?: Array<{ _id: string; fullName: string }>;
  user?: Array<{ _id: string; fullName: string }>;
}

export default function MembersPanel({ admin = [], user = [] }: MembersPanelProps) {
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');
  const showAdmin = filter === 'all' || filter === 'admin';
  const showUser = filter === 'all' || filter === 'user';

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Select
        value={filter}
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ]}
        onChange={(v) => setFilter(v as any)}
        style={{ width: 200 }}
      />
      <Space align="start" size={24} style={{ width: '100%' }} wrap>
        {showAdmin && (
          <Card title="Admin" size="small" style={{ flex: 1, minWidth: 260 }}>
            <List
              dataSource={admin}
              locale={{ emptyText: 'Không có' }}
              renderItem={(it) => <List.Item key={it._id}>{it.fullName}</List.Item>}
            />
          </Card>
        )}
        {showUser && (
          <Card title="User" size="small" style={{ flex: 1, minWidth: 260 }}>
            <List
              dataSource={user}
              locale={{ emptyText: 'Không có' }}
              renderItem={(it) => <List.Item key={it._id}>{it.fullName}</List.Item>}
            />
          </Card>
        )}
      </Space>
    </Space>
  );
}
