import { Button, Card, Form, Input, Typography, message } from 'antd';
import api from '../api/client';
import { setAuth } from '../store/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const res = await api.post('/api/v1/user/login', values);
      const { accessToken, refreshToken } = res.data;
      setAuth(accessToken, refreshToken);
      message.success('Đăng nhập thành công');
      const from = location.state?.from?.pathname || '/tasks';
      navigate(from, { replace: true });
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}>
      <Card title="Đăng nhập" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Nhập email' }]}> 
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}> 
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
          <Typography.Paragraph style={{ marginTop: 12 }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            <br />
            Quên mật khẩu? <Link to="/forgot">Gửi OTP</Link>
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
}
