import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { safeDate } from '../lib/utils';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const navigate = useNavigate();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        }
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    const handleSoundChange = () => {
      playNotificationSound();
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);
    window.addEventListener('sound-changed', handleSoundChange);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('sound-changed', handleSoundChange);
    };
  }, []);

  useEffect(() => {
    // Request notification permission on mount if default
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }

    fetchNotifications();

    // Subscribe to new orders
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('New order received:', payload);
          setUnreadCount(prev => prev + 1);
          setNotifications(prev => [payload.new, ...prev]);
          
          // Play sound
          playNotificationSound();

          // Show system notification
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('طلب جديد!', {
                body: `طلب جديد #${payload.new.order_number || ''} من ${payload.new.customer_first_name || 'عميل'}`,
                icon: '/vite.svg', // Fallback icon
                tag: 'new-order'
              });
            } catch (e) {
              console.error('Notification error:', e);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        }
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const soundType = localStorage.getItem('notificationSound') || 'glass';
      const now = ctx.currentTime;

      if (soundType === 'bell') {
        // Classic Bell
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
        
        osc.start(now);
        osc.stop(now + 1);
      } else if (soundType === 'digital') {
        // Digital Beep (Two tones)
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.setValueAtTime(0.1, now + 0.1);
        gain.gain.setValueAtTime(0, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (soundType === 'subtle') {
        // Subtle Click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
      } else {
        // Default: Glass (Soft)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.start(now);
        osc.stop(now + 1.5);
      }
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  };

  const requestPermission = () => {
    Notification.requestPermission().then(setPermission);
    playNotificationSound(); // Test sound
  };

  const fetchNotifications = async () => {
    try {
      // Fetch unread orders. Assuming 'is_read' column exists.
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data);
        // Count total unread
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        
        setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    }
  };

  const markAsRead = async (orderId: string) => {
    try {
      await supabase.from('orders').update({ is_read: true }).eq('id', orderId);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.filter(n => n.id !== orderId));
      setIsOpen(false);
      navigate('/orders'); // Navigate to orders page
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase.from('orders').update({ is_read: true }).eq('is_read', false);
      setUnreadCount(0);
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">الإشعارات</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            {permission !== 'granted' && (
              <div className="p-3 bg-blue-50 border-b border-blue-100">
                <button 
                  onClick={requestPermission}
                  className="w-full py-2 px-3 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell size={14} />
                  تفعيل التنبيهات الصوتية
                </button>
              </div>
            )}
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      onClick={() => markAsRead(notification.id)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 items-start"
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">طلب جديد #{notification.order_number}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          من {notification.customer_first_name} {notification.customer_last_name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-mono">
                          {format(safeDate(notification.created_at), 'HH:mm - d MMM', { locale: ar })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                  لا توجد إشعارات جديدة
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
