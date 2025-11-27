import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, List, Avatar, Typography, Space, Card, Button, Spin } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, LoadingOutlined } from '@ant-design/icons';

const { Content, Footer } = Layout;
const { Text } = Typography;

const ChatInterface = ({ onSendMessage }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hola, soy tu Agente Orquestador. 🚜\n\nEscribe "/investigar [Marca] [Modelo]" para iniciar la minería automática.',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para añadir mensajes de LOG desde el padre
  const addLogMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'assistant',
      content: text,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Pasamos 'addLogMessage' como callback al padre
      const finalResponse = await onSendMessage(currentInput, addLogMessage);
      
      if (finalResponse) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'assistant',
          content: finalResponse,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ height: 'calc(100vh - 140px)', background: 'transparent' }}>
      <Content style={{ overflowY: 'auto', paddingBottom: '20px' }}>
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={(item) => {
            const isUser = item.role === 'user';
            return (
              <List.Item style={{ border: 'none', padding: '10px 0' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', padding: '0 20px' }}>
                  <Space align="start" style={{ flexDirection: isUser ? 'row-reverse' : 'row', maxWidth: '80%' }}>
                    <Avatar icon={isUser ? <UserOutlined /> : <RobotOutlined />} style={{ backgroundColor: isUser ? '#1890ff' : '#52c41a' }} />
                    <Card size="small" style={{ borderRadius: '12px', backgroundColor: isUser ? '#1890ff' : '#333', color: 'white', border: '1px solid #444' }}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                    </Card>
                  </Space>
                </div>
              </List.Item>
            );
          }}
        />
        {loading && (
            <div style={{ padding: '0 20px', marginTop: '10px' }}>
                 <Space>
                    <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                    <div style={{ backgroundColor: '#333', padding: '8px 12px', borderRadius: '12px', border: '1px solid #444' }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} />
                        <Text style={{ color: 'white', marginLeft: 10 }}>Trabajando...</Text>
                    </div>
                 </Space>
            </div>
        )}
        <div ref={messagesEndRef} />
      </Content>

      <Footer style={{ padding: '20px', background: 'transparent' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input size="large" value={input} onChange={(e) => setInput(e.target.value)} onPressEnter={handleSend} disabled={loading} />
          <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleSend} loading={loading}>Enviar</Button>
        </Space.Compact>
      </Footer>
    </Layout>
  );
};

export default ChatInterface;