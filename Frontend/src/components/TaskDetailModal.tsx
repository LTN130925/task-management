import { Modal, Space, Tag, Tabs, message, Skeleton } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import MembersPanel from './MembersPanel';
import { Task, TaskStatus } from '../types';
import { fetchTaskDetail, fetchTaskSubtasks, fetchTaskUsers } from '../api/tasks';
import { Button, Card } from 'antd';
import SubtaskCard from './SubtaskCard';
import styles from './TaskDetailModal.module.css';

interface Props {
  open: boolean;
  taskId?: string | null;
  initialTask?: Partial<Task> | null;
  onClose: () => void;
}

export default function TaskDetailModal({ open, taskId, initialTask, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [members, setMembers] = useState<{ admin: any[]; user: any[] } | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const statusColor = (v: TaskStatus) =>
    v === 'finish' ? 'green' : v === 'doing' ? 'blue' : v === 'pending' ? 'orange' : v === 'notFinish' ? 'red' : 'default';

  useEffect(() => {
    // sync internal id with prop when opening / prop changes
    if (open) setCurrentId(taskId || null);
  }, [open, taskId]);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      if (!open || !currentId) return;
      setLoading(true);
      setDetail((initialTask as any) || null);
      setSubtasks([]);
      setMembers(null);
      try {
        // 1) Fetch detail first to know listUsers length
        const d = await fetchTaskDetail(currentId);
        if (canceled) return;
        setDetail(d.data);

        // 2) In parallel: always fetch subtasks; fetch members only if listUsers non-empty
        const needMembers = Array.isArray(d?.data?.listUsers) && d.data.listUsers.length > 0;
        const promises: Promise<any>[] = [fetchTaskSubtasks(currentId)];
        if (needMembers) promises.push(fetchTaskUsers(currentId));

        const results = await Promise.allSettled(promises);
        if (canceled) return;
        // results[0] -> subtasks
        const r0 = results[0];
        if (r0.status === 'fulfilled') setSubtasks(r0.value.data || []);
        else message.warning('Không tải được subtasks');

        if (needMembers) {
          const r1 = results[1];
          if (r1 && (r1 as PromiseFulfilledResult<any>).status === 'fulfilled') {
            setMembers((r1 as PromiseFulfilledResult<any>).value.data || { admin: [], user: [] });
          } else {
            message.warning('Không tải được thành viên');
            setMembers({ admin: [], user: [] });
          }
        } else {
          setMembers({ admin: [], user: [] });
        }
      } catch (e) {
        // If we have initialTask, keep modal open with that basic info; otherwise close
        if (initialTask) {
          message.warning('Không tải được chi tiết đầy đủ, hiển thị thông tin cơ bản');
        } else {
          message.error('Lỗi tải chi tiết Task');
          if (!canceled) onClose();
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, [open, currentId, onClose]);

  const renderSubtaskCards = (items: any[]): JSX.Element => {
    if (!items || !items.length) return <i>Không có subtask</i> as any;
    return (
      <div>
        {items.map((it) => (
          <SubtaskCard key={it._id} item={it} onOpenDetail={(id) => setCurrentId(id)} />
        ))}
      </div>
    );
  };

  return (
    <Modal
      title={detail?.title || 'Chi tiết Task'}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={760}
      confirmLoading={loading}
      destroyOnClose
      maskClosable
      keyboard
      afterClose={() => {
        setDetail(null);
        setSubtasks([]);
        setMembers(null);
      }}
    >
      {loading && !detail ? (
        <div className={styles.skeletonPad}>
          <Skeleton active title={{ width: 200 }} paragraph={{ rows: 2 }} />
          <div style={{ height: 12 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : detail ? (
        <Tabs
          items={[
            {
              key: 'overview',
              label: 'Tổng quan',
              children: (
                <Space size={16} direction="vertical" className={styles.fullWidth}>
                  <Space size={24} wrap>
                    <Tag color={statusColor(detail.status)}>{detail.status}</Tag>
                    <span>
                      <b>Bắt đầu:</b> {detail.timeStart}
                    </span>
                    <span>
                      <b>Kết thúc:</b> {detail.timeFinish}
                    </span>
                  </Space>
                  {detail.content && (
                    <div>
                      <b>Nội dung:</b>
                      <div className={styles.preWrap}>{detail.content}</div>
                    </div>
                  )}
                  <div>
                    <b>Subtasks:</b>
                    <div className={styles.mt8}>{renderSubtaskCards(subtasks)}</div>
                  </div>
                </Space>
              ),
            },
            {
              key: 'members',
              label: 'Thành viên',
              children: <MembersPanel admin={members?.admin} user={members?.user} />,
            },
          ]}
        />
      ) : null}
    </Modal>
  );
}
