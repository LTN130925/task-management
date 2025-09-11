import { Button, Card, Form, Input, Typography, message } from 'antd';
import { forgotPassword } from '../api/user';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    try {
      await forgotPassword(values);
      message.success('Đã gửi OTP vào email');
      navigate('/otp');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Gửi OTP thất bại');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}>
      <Card title="Quên mật khẩu" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}> 
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Gửi OTP
          </Button>
          <Typography.Paragraph style={{ marginTop: 12 }}>
            Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
}
