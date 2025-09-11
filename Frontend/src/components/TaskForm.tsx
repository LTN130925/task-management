import { DatePicker, Form, Input, Modal, Select } from 'antd';
import { Task, TaskStatus } from '../types';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchUsersDropdowns } from '../api/tasks';

interface Props {
  open: boolean;
  loading?: boolean;
  initialValues?: Partial<Task>;
  onCancel: () => void;
  onSubmit: (values: Partial<Task>) => void;
}

export default function TaskForm({ open, loading, initialValues, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<Partial<Task>>();
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: initialValues?.title,
        content: initialValues?.content,
        status: initialValues?.status || 'initial',
        timeStart: initialValues?.timeStart ? (dayjs(initialValues.timeStart) as any) : undefined,
        timeFinish: initialValues?.timeFinish ? (dayjs(initialValues.timeFinish) as any) : undefined,
        listUsers: (initialValues as any)?.listUsers || [],
      } as any);
      // load dropdown options
      fetchUsersDropdowns()
        .then((res) => {
          const acc = (res?.data?.accounts || []).map((a: any) => ({ label: `${a.fullName} (admin)`, value: a._id }));
          const users = (res?.data?.users || []).map((u: any) => ({ label: u.fullName, value: u._id }));
          setUserOptions([...acc, ...users]);
        })
        .catch(() => {});
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      title={initialValues?._id ? 'Chỉnh sửa Task' : 'Tạo Task'}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((vals) => {
            const payload: Partial<Task> = {
              ...vals,
              timeStart: (vals as any).timeStart ? (vals as any).timeStart.toISOString?.() : undefined,
              timeFinish: (vals as any).timeFinish ? (vals as any).timeFinish.toISOString?.() : undefined,
              listUsers: (vals as any).listUsers || [],
            };
            onSubmit(payload);
          })
          .catch(() => {});
      }}
      okText={initialValues?._id ? 'Lưu' : 'Tạo'}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="content" label="Nội dung"> 
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" initialValue={'initial'}>
          <Select
            options={[
              { value: 'initial', label: 'initial' },
              { value: 'doing', label: 'doing' },
              { value: 'finish', label: 'finish' },
              { value: 'pending', label: 'pending' },
              { value: 'notFinish', label: 'notFinish' },
            ]}
          />
        </Form.Item>
        <Form.Item name="timeStart" label="Bắt đầu"> 
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="timeFinish" label="Kết thúc"> 
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="listUsers" label="Người tham gia">
          <Select
            mode="multiple"
            placeholder="Chọn người tham gia"
            options={userOptions}
            showSearch
            filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
