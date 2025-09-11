import { Button, Card, Form, Input, Typography, message } from 'antd';
import { otpPassword } from '../api/user';
import { Link, useNavigate } from 'react-router-dom';
import { setAuth } from '../store/auth';

export default function Otp() {
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; otp: string }) => {
    try {
      const res = await otpPassword(values);
      const { accessToken, refreshToken } = res;
      if (accessToken) setAuth(accessToken, refreshToken);
      message.success('Xác thực OTP thành công');
      navigate('/reset');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xác thực OTP thất bại');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}>
      <Card title="Nhập mã OTP" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}> 
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="Mã OTP" name="otp" rules={[{ required: true, message: 'Nhập mã OTP' }]}> 
            <Input placeholder="Nhập mã OTP" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Xác thực OTP
          </Button>
          <Typography.Paragraph style={{ marginTop: 12 }}>
            Chưa có OTP? <Link to="/forgot">Gửi lại</Link>
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
}
