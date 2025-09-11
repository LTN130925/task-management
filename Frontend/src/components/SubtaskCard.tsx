import { Card, Space, Tag, Button } from 'antd';
import React from 'react';
import styles from './SubtaskCard.module.css';

export type Subtask = {
  _id: string;
  title: string;
  status: 'initial' | 'doing' | 'finish' | 'pending' | 'notFinish';
  content?: string;
  timeStart?: string;
  timeFinish?: string;
  childs?: Subtask[];
};

interface Props {
  item: Subtask;
  onOpenDetail?: (id: string) => void;
}

const statusColor = (v: Subtask['status']) =>
  v === 'finish' ? 'green' : v === 'doing' ? 'blue' : v === 'pending' ? 'orange' : v === 'notFinish' ? 'red' : 'default';

export default function SubtaskCard({ item, onOpenDetail }: Props) {
  return (
    <div className={styles.cardWrap}>
      <Card
        size="small"
        title={
          <Space>
            <span>{item.title}</span>
            <Tag color={statusColor(item.status)}>{item.status}</Tag>
          </Space>
        }
        extra={onOpenDetail ? <Button size="small" onClick={() => onOpenDetail(item._id)}>Chi tiết</Button> : undefined}
      >
        <div>
          {item.content && <div className={styles.muted}>{item.content}</div>}
          <Space size={24} wrap>
            <span>
              <b>Bắt đầu:</b> {item.timeStart}
            </span>
            <span>
              <b>Kết thúc:</b> {item.timeFinish}
            </span>
          </Space>
          {item.childs && item.childs.length > 0 && (
            <div className={styles.nested}>
              {item.childs.map((c) => (
                <SubtaskCard key={c._id} item={c} onOpenDetail={onOpenDetail} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
