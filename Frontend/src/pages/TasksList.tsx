import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Modal,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tabs,
  message,
} from 'antd';
import { DeleteOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '../api/client';
import { Task, TaskStatus } from '../types';
import TaskForm from '../components/TaskForm';
import {
  changeMulti,
  changeTaskStatus,
  createTask,
  deleteTask,
  editTask,
  fetchTaskDetail,
  fetchTaskSubtasks,
  fetchTaskUsers,
} from '../api/tasks';
import type { CSSProperties } from 'react';
import MembersPanel from '../components/MembersPanel';
import TaskDetailModal from '../components/TaskDetailModal';

interface PaginationServer {
  page?: number;
  currentPage?: number;
  limit: number;
  totalItems?: number;
  totalPages?: number;
}

export default function TasksList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [total, setTotal] = useState(0);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortValue, setSortValue] = useState<'asc' | 'desc' | ''>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Detail modal state
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Modal form state
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const columns: ColumnsType<Task> = useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        render: (text, record) => (
          <Button type="link" onClick={() => handleOpenDetail(record._id)} style={{ padding: 0 }}>
            {text}
          </Button>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render: (v: TaskStatus) => (
          <Tag
            color={
              v === 'finish'
                ? 'green'
                : v === 'doing'
                ? 'blue'
                : v === 'pending'
                ? 'orange'
                : v === 'notFinish'
                ? 'red'
                : 'default'
            }
          >
            {v}
          </Tag>
        ),
      },
      { title: 'Start', dataIndex: 'timeStart' },
      { title: 'Finish', dataIndex: 'timeFinish' },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Select
              size="small"
              placeholder="Đổi trạng thái"
              style={{ width: 140 }}
              onChange={(v) => handleChangeStatus(record._id, v as TaskStatus)}
              options={[
                { value: 'initial', label: 'initial' },
                { value: 'doing', label: 'doing' },
                { value: 'finish', label: 'finish' },
                { value: 'pending', label: 'pending' },
                { value: 'notFinish', label: 'notFinish' },
              ]}
            />
            <Button size="small" onClick={() => openEdit(record)}>
              Sửa
            </Button>
            <Popconfirm
              title="Xóa task này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button size="small" danger>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/tasks', {
        params: {
          page,
          limit,
          keyword: keyword || undefined,
          status: status || undefined,
          sort_key: sortKey || undefined,
          sort_value: sortValue || undefined,
        },
      });
      setData(res.data.data);
      const pg: PaginationServer = res.data.pagination || {} as any;
      // Prefer explicit totals from various common fields
      const explicitTotals = [
        (pg as any).totalItems,
        (pg as any).total,
        (res.data as any).totalItems,
        (res.data as any).total,
        (res.data as any).count,
      ].find((v) => typeof v === 'number' && v >= 0) as number | undefined;

      const totalFromPages = (pg?.totalPages || 0) * (pg?.limit || limit);
      const currentCount: number = Array.isArray(res.data.data) ? res.data.data.length : 0;
      // Minimal inferred total: what we already saw + maybe 1 more if page is full
      const inferredMinimal = (page - 1) * limit + currentCount + (currentCount === limit ? 1 : 0);
      const finalTotal = Math.max(
        Number.isFinite(explicitTotals as number) ? (explicitTotals as number) : 0,
        totalFromPages,
        inferredMinimal
      );
      setTotal(finalTotal);
      // If backend returns currentPage, keep FE in sync
      if (pg && typeof pg.currentPage === 'number' && pg.currentPage !== page) {
        setPage(pg.currentPage);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Initialize state from URL on first mount
    const sp = Object.fromEntries(searchParams.entries());
    if (sp.page) setPage(parseInt(sp.page));
    if (sp.limit) setLimit(parseInt(sp.limit));
    if (sp.keyword) setKeyword(sp.keyword);
    if (sp.status) setStatus(sp.status as TaskStatus);
    if (sp.sort_key) setSortKey(sp.sort_key);
    if (sp.sort_value) setSortValue(sp.sort_value as 'asc' | 'desc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync when states change
  useEffect(() => {
    const sp: Record<string, string> = {};
    if (page) sp.page = String(page);
    if (limit) sp.limit = String(limit);
    if (keyword) sp.keyword = keyword;
    if (status) sp.status = status;
    if (sortKey) sp.sort_key = sortKey;
    if (sortValue) sp.sort_value = sortValue;
    setSearchParams(sp);
  }, [page, limit, keyword, status, sortKey, sortValue, setSearchParams]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, sortKey, sortValue]);

  // Handlers
  const handleChangeStatus = async (id: string, s: TaskStatus) => {
    try {
      await changeTaskStatus(id, s);
      message.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi xóa');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleSubmitForm = async (vals: Partial<Task>) => {
    setFormLoading(true);
    try {
      if (editing?._id) {
        await editTask(editing._id, vals);
        message.success('Cập nhật thành công');
      } else {
        await createTask(vals);
        message.success('Tạo thành công');
      }
      setFormOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi lưu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulk = async (key: string, value: any) => {
    if (!selectedRowKeys.length) {
      message.warning('Chọn ít nhất 1 task');
      return;
    }
    try {
      await changeMulti(selectedRowKeys as string[], key, value);
      message.success('Cập nhật hàng loạt thành công');
      setSelectedRowKeys([]);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleOpenDetail = (id: string) => {
    setSelectedTaskId(id);
    setOpenDetail(true);
  };

  // Recursive renderer for subtask cards
  const statusColor = (v: TaskStatus) =>
    v === 'finish' ? 'green' : v === 'doing' ? 'blue' : v === 'pending' ? 'orange' : v === 'notFinish' ? 'red' : 'default';

  const cardStyle: CSSProperties = { marginBottom: 12 };
  const nestedStyle: CSSProperties = { borderLeft: '2px dashed #eee', paddingLeft: 12, marginTop: 8 };

  const renderSubtaskCards = (items: any[]) => {
    if (!items || !items.length) return <i>Không có subtask</i>;
    return (
      <div>
        {items.map((it) => (
          <div key={it._id} style={cardStyle}>
            <Card
              size="small"
              title={
                <Space>
                  <span>{it.title}</span>
                  <Tag color={statusColor(it.status as TaskStatus)}>{it.status}</Tag>
                </Space>
              }
              extra={<Button size="small" onClick={() => handleOpenDetail(it._id)}>Chi tiết</Button>}
            >
              <div>
                {it.content && (
                  <div style={{ color: '#666', marginBottom: 8 }}>{it.content}</div>
                )}
                <Space size={24} wrap>
                  <span><b>Bắt đầu:</b> {it.timeStart}</span>
                  <span><b>Kết thúc:</b> {it.timeFinish}</span>
                </Space>
                {it.childs && it.childs.length > 0 && (
                  <div style={nestedStyle}>{renderSubtaskCards(it.childs)}</div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card
      title="Tasks"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo Task
        </Button>
      }
    >
      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Input.Search
          placeholder="Tìm theo tiêu đề"
          allowClear
          enterButton={<FilterOutlined />}
          onSearch={() => fetchData()}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 260 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 200 }}
          value={status || undefined}
          onChange={(v) => setStatus((v as TaskStatus) || '')}
          options={[
            { value: 'initial', label: 'Initial' },
            { value: 'doing', label: 'Doing' },
            { value: 'finish', label: 'Finish' },
            { value: 'pending', label: 'Pending' },
            { value: 'notFinish', label: 'Not finish' },
          ]}
        />
        <Select
          placeholder="Sort theo cột"
          allowClear
          style={{ width: 200 }}
          value={sortKey || undefined}
          onChange={(v) => setSortKey(v || '')}
          options={[
            { value: 'title', label: 'Title' },
            { value: 'timeStart', label: 'Time start' },
            { value: 'timeFinish', label: 'Time finish' },
          ]}
        />
        <Select
          placeholder="Thứ tự"
          allowClear
          style={{ width: 160 }}
          value={sortValue || undefined}
          onChange={(v) => setSortValue((v as any) || '')}
          options={[
            { value: 'asc', label: 'Tăng dần' },
            { value: 'desc', label: 'Giảm dần' },
          ]}
        />
        <Button icon={<FilterOutlined />} onClick={fetchData}>
          Lọc
        </Button>

        <span style={{ flex: 1 }} />

        <Select
          placeholder="Đổi trạng thái hàng loạt"
          style={{ width: 240 }}
          onChange={(v) => handleBulk('status', v)}
          options={[
            { value: 'initial', label: 'Initial' },
            { value: 'doing', label: 'Doing' },
            { value: 'finish', label: 'Finish' },
            { value: 'pending', label: 'Pending' },
            { value: 'notFinish', label: 'Not finish' },
          ]}
        />
        <Popconfirm
          title="Xóa các task đã chọn?"
          onConfirm={() => handleBulk('deleted', true)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />}>Xóa hàng loạt</Button>
        </Popconfirm>
      </Space>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={data}
        columns={columns}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: [4, 8, 12, 20, 50] as any,
          showTotal: (t) => `Tổng ${t} task`,
          onChange: (p, ps) => {
            setPage(p);
            setLimit(ps);
          },
          onShowSizeChange: (_, ps) => {
            setPage(1);
            setLimit(ps);
          },
        }}
      />

      <TaskForm
        open={formOpen}
        loading={formLoading}
        initialValues={editing || undefined}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmitForm}
      />

      <TaskDetailModal
        open={openDetail}
        taskId={selectedTaskId}
        initialTask={data.find((t) => t._id === selectedTaskId) || null}
        onClose={() => {
          setOpenDetail(false);
          setSelectedTaskId(null);
        }}
      />
    </Card>
  );
}
