import { useState, useEffect, useRef } from 'react';
import { Bell, User, Menu, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Sound for notifications
const DING_SOUND = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVREOEzHbGptxp14pM/gCRpVMRqARpz5dbqcjUACoZ1h60/Wkxl66h509659jP5vRO86762/48dc5243724837d659372+153252257";

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  message: string;
  time: Date;
  read: boolean;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Subscribe to new orders
    const subscription = supabase
      .channel('header-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: `طلب جديد #${newOrder.order_number || newOrder.id.slice(0, 8)} من ${newOrder.customer_first_name || ''} ${newOrder.customer_last_name || ''}`,
          time: new Date(),
          read: false,
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        playNotificationSound();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    } else {
      const audio = new Audio(DING_SOUND);
      audioRef.current = audio;
      audio.play().catch(e => console.error("Audio play failed", e));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          {/* Breadcrumbs or Page Title could go here */}
          <h2 className="text-gray-500 text-sm font-medium hidden md:block">لوحة التحكم / نظرة عامة</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="relative p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50"
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">الإشعارات</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    مسح الكل
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    لا توجد إشعارات جديدة
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-2 border-r border-gray-100 pr-4">
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-gray-900">المدير العام</p>
            <p className="text-xs text-gray-500">مشرف النظام</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {isNotificationOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}
    </header>
  );
}
