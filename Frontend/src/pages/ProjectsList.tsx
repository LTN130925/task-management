import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Input,
  List,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tabs,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { fetchProjectDetail, fetchProjectMembers, fetchProjectTasks, fetchProjects, Project } from '../api/projects';
import { FilterOutlined } from '@ant-design/icons';
import MembersPanel from '../components/MembersPanel';

interface PaginationServer {
  currentPage?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
}

export default function ProjectsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string | ''>('');
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [total, setTotal] = useState(0);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortValue, setSortValue] = useState<'asc' | 'desc' | ''>('');

  // Detail modal
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Project | null>(null);
  const [members, setMembers] = useState<{ admin: any[]; user: any[] } | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const columns: ColumnsType<Project> = useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        render: (text, record) => (
          <a onClick={() => openDetail(record._id)}>{text}</a>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render: (v: string) => <Tag>{v}</Tag>,
      },
      { title: 'Deadline', dataIndex: 'deadline' },
      {
        title: 'Created by',
        dataIndex: ['createdBy', 'fullName'],
        render: (v: string) => v || '—',
      },
    ],
    []
  );

  async function load() {
    setLoading(true);
    try {
      const res = await fetchProjects({
        page,
        limit,
        keyword: keyword || undefined,
        status: status || undefined,
        deadline: deadline || undefined,
        sort_key: sortKey || undefined,
        sort_value: sortValue || undefined,
      });
      setData(res.data || []);
      const pg: PaginationServer = res.pagination || {};
      const explicitTotal = [
        pg.totalItems,
        (res as any).totalItems,
        (res as any).total,
      ].find((v) => typeof v === 'number' && v >= 0) as number | undefined;
      const totalFromPages = (pg.totalPages || 0) * (pg.limit || limit);
      const inferred = (page - 1) * limit + (res.data?.length || 0) + ((res.data?.length || 0) === limit ? 1 : 0);
      setTotal(Math.max(explicitTotal || 0, totalFromPages, inferred));
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tải dự án');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, deadline, sortKey, sortValue]);

  // Initialize from URL
  useEffect(() => {
    const sp = Object.fromEntries(searchParams.entries());
    if (sp.page) setPage(parseInt(sp.page));
    if (sp.limit) setLimit(parseInt(sp.limit));
    if (sp.keyword) setKeyword(sp.keyword);
    if (sp.status) setStatus(sp.status);
    if (sp.deadline) setDeadline(sp.deadline);
    if (sp.sort_key) setSortKey(sp.sort_key);
    if (sp.sort_value) setSortValue(sp.sort_value as 'asc' | 'desc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync
  useEffect(() => {
    const sp: Record<string, string> = {};
    if (page) sp.page = String(page);
    if (limit) sp.limit = String(limit);
    if (keyword) sp.keyword = keyword;
    if (status) sp.status = status;
    if (deadline) sp.deadline = deadline;
    if (sortKey) sp.sort_key = sortKey;
    if (sortValue) sp.sort_value = sortValue;
    setSearchParams(sp);
  }, [page, limit, keyword, status, deadline, sortKey, sortValue, setSearchParams]);

  const openDetail = async (id: string) => {
    try {
      const [d, m, t] = await Promise.all([
        fetchProjectDetail(id),
        fetchProjectMembers(id),
        fetchProjectTasks(id),
      ]);
      setDetail(d.data);
      setMembers(m.data || { admin: [], user: [] });
      setTasks(t.data || []);
      setOpen(true);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tải chi tiết');
    }
  };

  return (
    <Card title="Projects">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm theo tiêu đề/mô tả"
          allowClear
          enterButton={<FilterOutlined />}
          onSearch={() => load()}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 180 }}
          value={status || undefined}
          onChange={(v) => setStatus((v as string) || '')}
          options={[
            { value: 'initial', label: 'Initial' },
            { value: 'doing', label: 'Doing' },
            { value: 'finish', label: 'Finish' },
            { value: 'pending', label: 'Pending' },
            { value: 'notFinish', label: 'Not finish' },
          ]}
        />
        <DatePicker
          placeholder="Deadline"
          onChange={(d) => setDeadline(d ? d.format('YYYY-MM-DD') : undefined)}
          style={{ width: 180 }}
          value={deadline ? (dayjs(deadline) as any) : undefined}
        />
        <Select
          placeholder="Sort theo cột"
          allowClear
          style={{ width: 200 }}
          value={sortKey || undefined}
          onChange={(v) => setSortKey(v || '')}
          options={[{ value: 'title', label: 'Title' }, { value: 'deadline', label: 'Deadline' }]}
        />
        <Select
          placeholder="Thứ tự"
          allowClear
          style={{ width: 160 }}
          value={sortValue || undefined}
          onChange={(v) => setSortValue((v as any) || '')}
          options={[{ value: 'asc', label: 'Tăng dần' }, { value: 'desc', label: 'Giảm dần' }]}
        />
        <Button icon={<FilterOutlined />} onClick={load}>
          Lọc
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: [4, 8, 12, 20, 50] as any,
          showTotal: (t) => `Tổng ${t} project`,
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

      <Modal
        title={detail?.title || 'Chi tiết dự án'}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={720}
      >
        {detail && (
          <Tabs
            items={[
              {
                key: 'overview',
                label: 'Tổng quan',
                children: (
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Space size={24} wrap>
                      <Tag>{detail.status}</Tag>
                      <span><b>Deadline:</b> {detail.deadline || '—'}</span>
                      <span><b>Tạo bởi:</b> {detail.createdBy?.fullName || '—'}</span>
                    </Space>
                    {detail.description && (
                      <div>
                        <b>Mô tả:</b>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{detail.description}</div>
                      </div>
                    )}
                  </Space>
                ),
              },
              {
                key: 'members',
                label: 'Thành viên',
                children: <MembersPanel admin={members?.admin} user={members?.user} />,
              },
              {
                key: 'tasks',
                label: 'Tasks',
                children: (
                  <List
                    dataSource={tasks}
                    locale={{ emptyText: 'Chưa có task' }}
                    renderItem={(it: any) => (
                      <List.Item>
                        <Space>
                          <span>{it.title}</span>
                          <Tag>{it.status}</Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>
    </Card>
  );
}
