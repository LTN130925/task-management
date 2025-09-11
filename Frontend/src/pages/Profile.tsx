import { useEffect, useState } from 'react';
import { Avatar, Button, Card, Form, Input, Space, Upload, message } from 'antd';
import { getProfile, editProfile } from '../api/user';

export default function Profile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        const u = res.data || {};
        form.setFieldsValue({ fullName: u.fullName, email: u.email, phone: u.phone });
        setAvatarUrl(u.avatar);
      } catch (err: any) {
        message.error(err?.response?.data?.message || 'Lỗi tải hồ sơ');
      }
    })();
  }, [form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const fd = new FormData();
      if (values.fullName) fd.append('fullName', values.fullName);
      if (values.phone) fd.append('phone', values.phone);
      if (file) fd.append('avatar', file);
      const res = await editProfile(fd);
      message.success('Cập nhật hồ sơ thành công');
      if (res.data?.avatar) setAvatarUrl(res.data.avatar);
      setFile(null);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Thông tin cá nhân" loading={loading}>
      <Space align="start" size={24} wrap>
        <Space direction="vertical" align="center">
          <Avatar size={96} src={avatarUrl} />
          <Upload
            beforeUpload={(f) => {
              setFile(f);
              const url = URL.createObjectURL(f);
              setAvatarUrl(url);
              return false;
            }}
            showUploadList={false}
            maxCount={1}
          >
            <Button>Chọn ảnh đại diện</Button>
          </Upload>
        </Space>

        <Form form={form} layout="vertical" onFinish={onFinish} style={{ minWidth: 320 }}>
          <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: 'Nhập họ tên' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone"> 
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
        </Form>
      </Space>
    </Card>
  );
}
