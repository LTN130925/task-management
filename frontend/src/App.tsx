import React, { useEffect, useState } from 'react';
import {
  Table,
  Typography,
  Spin,
  message,
  Card,
  Button,
  Select,
  Row,
  Col,
  Pagination,
} from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

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

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'initial', label: 'Initial' },
  { value: 'doing', label: 'Doing' },
  { value: 'finish', label: 'Finish' },
  { value: 'pending', label: 'Pending' },
  { value: 'notFinish', label: 'Not Finish' },
];

const SORT_FIELDS = [
  { value: 'title', label: 'Tiêu đề' },
  { value: 'status', label: 'Trạng thái' },
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
  { value: 'timeStart', label: 'Thời gian bắt đầu' },
  { value: 'timeFinish', label: 'Thời gian kết thúc' },
];
const SORT_ORDERS = [
  { value: 'asc', label: 'Tăng dần' },
  { value: 'desc', label: 'Giảm dần' },
];

const PAGE_SIZE = 5;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  // Fetch task list
  const fetchTasks = (
    status = '',
    sort_key = 'title',
    sort_value = 'desc',
    pageNum = 1
  ) => {
    setLoading(true);
    let url = API_BASE;
    const params = [];
    if (status) params.push(`status=${status}`);
    if (sort_key && sort_value) {
      params.push(`sort_key=${sort_key}`);
      params.push(`sort_value=${sort_value}`);
    }
    params.push(`page=${pageNum}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    axios
      .get(url)
      .then((res) => {
        setTasks(res.data.data);
        setTotalPage(Number(res.data.pagination.totalPage));
        // KHÔNG setPage từ backend nữa!
      })
      .catch(() => {
        message.error('Lỗi tải danh sách task');
      })
      .finally(() => setLoading(false));
  };

  // Khi filter, sort thay đổi thì về trang 1 (KHÔNG fetchTasks ở đây)
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [statusFilter, sortField, sortOrder]);

  // Khi page hoặc filter, sort thay đổi thì gọi fetchTasks
  useEffect(() => {
    fetchTasks(statusFilter, sortField, sortOrder, page);
    // eslint-disable-next-line
  }, [page, statusFilter, sortField, sortOrder]);

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
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <b>Lọc theo trạng thái:</b>
            <Select
              style={{ width: 180, marginLeft: 12 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              {STATUS_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <b>Sắp xếp:</b>
            <Select
              style={{ width: 180, marginLeft: 12 }}
              value={sortField}
              onChange={setSortField}
            >
              {SORT_FIELDS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 120, marginLeft: 8 }}
              value={sortOrder}
              onChange={setSortOrder}
            >
              {SORT_ORDERS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Spin spinning={loading} tip="Đang tải...">
          <Table
            dataSource={tasks}
            columns={columns}
            rowKey="_id"
            pagination={false}
          />
          {/* Hiển thị phân trang đẹp với Ant Design Pagination */}
          {totalPage > 1 && (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Pagination
                current={page}
                total={totalPage * PAGE_SIZE}
                pageSize={PAGE_SIZE}
                onChange={setPage}
                showSizeChanger={false}
                className="custom-pagination"
              />
            </div>
          )}
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
