import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, message, Card, Button } from 'antd';
import axios from 'axios';

const { Title } = Typography;

interface Task {
  _id: string;
  title: string;
  status: string;
  content: string;
  timeStart?: string;
  timeFinish?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = '/api/v1/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch task list
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}`)
      .then((res) => {
        setTasks(res.data.data);
      })
      .catch(() => {
        message.error('Lỗi tải danh sách task');
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch task detail
  const fetchDetail = (id: string) => {
    setDetailLoading(true);
    axios
      .get(`${API_BASE}/detail/${id}`)
      .then((res) => {
        setSelectedTask(res.data.data);
      })
      .catch(() => {
        message.error('Lỗi tải chi tiết task');
      })
      .finally(() => setDetailLoading(false));
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          initial: 'default',
          doing: 'processing',
          finish: 'success',
          pending: 'warning',
          notFinish: 'error',
        };
        return (
          <span style={{ color: colorMap[status] ? undefined : '#888' }}>
            {status}
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Task) => (
        <Button type="link" onClick={() => fetchDetail(record._id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        Task Management
      </Title>
      <Card title="Danh sách Task" style={{ marginBottom: 32 }}>
        <Spin spinning={loading} tip="Đang tải...">
          <Table
            dataSource={tasks}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 8 }}
          />
        </Spin>
      </Card>
      {selectedTask && (
        <Card
          title={`Chi tiết Task: ${selectedTask.title}`}
          extra={
            <Button onClick={() => setSelectedTask(null)} type="link">
              Đóng
            </Button>
          }
          style={{ marginBottom: 32 }}
        >
          <Spin spinning={detailLoading} tip="Đang tải chi tiết...">
            <p>
              <b>Trạng thái:</b> {selectedTask.status}
            </p>
            <p>
              <b>Nội dung:</b> {selectedTask.content}
            </p>
            <p>
              <b>Bắt đầu:</b>{' '}
              {selectedTask.timeStart
                ? new Date(selectedTask.timeStart).toLocaleString()
                : '-'}
            </p>
            <p>
              <b>Kết thúc:</b>{' '}
              {selectedTask.timeFinish
                ? new Date(selectedTask.timeFinish).toLocaleString()
                : '-'}
            </p>
            <p>
              <b>Ngày tạo:</b>{' '}
              {selectedTask.createdAt
                ? new Date(selectedTask.createdAt).toLocaleString()
                : '-'}
            </p>
            <p>
              <b>Ngày cập nhật:</b>{' '}
              {selectedTask.updatedAt
                ? new Date(selectedTask.updatedAt).toLocaleString()
                : '-'}
            </p>
          </Spin>
        </Card>
      )}
    </div>
  );
}

export default App;
