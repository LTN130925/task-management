import { Button, Card, Form, Input, Typography, message } from 'antd';
import { register } from '../api/user';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const onFinish = async (values: { fullName: string; email: string; password: string; confirmPassword: string }) => {
    try {
      if (values.password !== values.confirmPassword) {
        message.warning('Mật khẩu nhập lại không khớp');
        return;
      }
      await register(values);
      message.success('Đăng ký thành công, vui lòng đăng nhập');
      navigate('/login');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}>
      <Card title="Đăng ký" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: 'Nhập họ tên' }]}> 
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}> 
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}> 
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item label="Nhập lại mật khẩu" name="confirmPassword" dependencies={["password"]} rules={[{ required: true, message: 'Nhập lại mật khẩu' }]}> 
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng ký
          </Button>
          <Typography.Paragraph style={{ marginTop: 12 }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
}
