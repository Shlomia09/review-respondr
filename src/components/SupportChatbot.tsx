import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: {
    type: string;
    data: any;
    executed?: boolean;
  };
}

interface SupportChatbotProps {
  className?: string;
}

export function SupportChatbot({ className = '' }: SupportChatbotProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate unique conversation ID
      const newConversationId = crypto.randomUUID();
      setConversationId(newConversationId);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `שלום! אני עוזר REVAI החכם 🤖\n\nאני יכול לעזור לך עם:\n\n✨ יצירת ביקורות לדוגמה\n📊 סטטיסטיקות מהירות\n🤖 יצירת תגובות AI\n⚙️ הגדרות המערכת\n🔗 חיבור פלטפורמות\n📱 תזמון פוסטים חברתיים\n\nמה תרצה לעשות היום?`,
        timestamp: new Date().toISOString()
      };

      setMessages([welcomeMessage]);
      setIsInitialized(true);

    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה באתחול הצ\'אט',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !conversationId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase.functions.invoke('ai-support-chat', {
        body: {
          message: userMessage.content,
          conversationId,
          context: {
            userId: user.id
          }
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        action: data.action
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show action feedback if action was executed
      if (data.action) {
        showActionFeedback(data.action);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'מצטער, קרתה שגיאה. אנא נסה שוב.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת ההודעה',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showActionFeedback = (action: any) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      info: Info
    };

    const colors = {
      success: 'text-green-600',
      error: 'text-red-600', 
      info: 'text-blue-600'
    };

    const Icon = icons[action.type as keyof typeof icons] || Info;
    const colorClass = colors[action.type as keyof typeof colors] || 'text-blue-600';

    toast({
      title: 'פעולה בוצעה',
      description: (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          <span>{action.message}</span>
        </div>
      ),
      variant: action.type === 'error' ? 'destructive' : 'default'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    initializeChat();
  };

  const getMessageIcon = (role: string) => {
    return role === 'user' ? (
      <User className="h-5 w-5 text-primary" />
    ) : (
      <Bot className="h-5 w-5 text-green-600" />
    );
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const renderQuickActions = () => {
    const quickActions = [
      { label: 'צור ביקורת לדוגמה', message: 'צור לי ביקורת חדשה לבדיקה' },
      { label: 'הצג סטטיסטיקות', message: 'הצג לי את הסטטיסטיקות שלי' },
      { label: 'צור תגובה AI', message: 'צור תגובה אוטומטית לביקורת האחרונה' },
      { label: 'עזרה בהתחברות', message: 'איך אני מתחבר לפלטפורמות?' }
    ];

    return (
      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground mb-2">פעולות מהירות:</p>
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
              onClick={() => setInputMessage(action.message)}
            >
              {action.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">מתחיל צ'אט...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            עוזר REVAI החכם
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.role)}
                  </div>
                )}
                
                <div className={`
                  max-w-[80%] rounded-lg p-3 text-sm
                  ${message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-12' 
                    : 'bg-muted mr-12'
                  }
                `}>
                  <div className="whitespace-pre-wrap">
                    {formatMessage(message.content)}
                  </div>
                  
                  {message.action && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <Badge variant="secondary" className="text-xs">
                        פעולה: {message.action.type}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.role)}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Bot className="h-5 w-5 text-green-600 mt-1" />
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">מחשב תשובה...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {renderQuickActions()}
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="כתוב הודעה..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}