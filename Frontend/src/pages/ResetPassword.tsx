import { Button, Card, Form, Input, Typography, message } from 'antd';
import { resetPassword } from '../api/user';
import { useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();

  const onFinish = async (values: { password: string; confirm: string }) => {
    try {
      if (values.password !== values.confirm) {
        message.warning('Mật khẩu nhập lại không khớp');
        return;
      }
      await resetPassword({ password: values.password });
      message.success('Đổi mật khẩu thành công');
      navigate('/tasks');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}>
      <Card title="Đặt lại mật khẩu" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Mật khẩu mới" name="password" rules={[{ required: true, message: 'Nhập mật khẩu mới' }]}> 
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item label="Nhập lại mật khẩu" name="confirm" rules={[{ required: true, message: 'Nhập lại mật khẩu' }]}> 
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đặt lại mật khẩu
          </Button>
          <Typography.Paragraph style={{ marginTop: 12 }}>
            Quên OTP? <Link to="/forgot">Gửi lại</Link>
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
}
