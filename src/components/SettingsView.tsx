import React, { useState, useEffect } from "react";
import { ArrowLeft, Bell, BellOff, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { NativeBridge } from "../nativeBridge";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface SettingsViewProps {
  username: string;
  onGoBack: () => void;
}

export function SettingsView({ username, onGoBack }: SettingsViewProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/user/settings?username=${username}`);
      const data = await res.json();
      if (data.success) {
        setNotificationsEnabled(data.data.notificationsEnabled);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeUser = async () => {
    if (NativeBridge.isMobileApp()) {
      try {
        const expoPushToken = await NativeBridge.requestExpoToken();
        if (!expoPushToken) throw new Error("토큰 발급 실패");
        
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, expoPushToken })
        });
      } catch (err: any) {
        throw new Error("모바일 앱에서 알림을 켤 수 없습니다. " + err.message);
      }
    } else {
      // PC Browser / Web Push Logic
      if (!('serviceWorker' in navigator)) {
        throw new Error("Service Worker is not supported by this browser.");
      }
      
      let swRegistration = await navigator.serviceWorker.getRegistration();
      if (!swRegistration) {
        swRegistration = await navigator.serviceWorker.register('/sw.js');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error("알림 권한이 거부되었습니다.");
      }

      const res = await fetch('/api/notifications/vapidPublicKey');
      const vapidPublicKey = await res.text();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, subscription })
      });
    }
  };

  const handleToggleNotifications = async () => {
    setIsSaving(true);
    setMessage(null);
    const newValue = !notificationsEnabled;

    try {
      if (newValue) {
        await subscribeUser();
      }

      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, notificationsEnabled: newValue })
      });
      const data = await res.json();
      
      if (data.success) {
        setNotificationsEnabled(newValue);
        setMessage({ text: newValue ? "알림이 설정되었습니다." : "알림이 해제되었습니다.", type: 'success' });
      } else {
        throw new Error(data.errorMsg);
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "설정 변경에 실패했습니다.", type: 'error' });
      setNotificationsEnabled(notificationsEnabled); // Revert UI on failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.errorMsg);
      }
      const successMsg = NativeBridge.isMobileApp() 
        ? "테스트 알림이 발송되었습니다. 상단 알림창을 확인해주세요!" 
        : "테스트 알림이 발송되었습니다. PC 우측 하단(또는 우측 상단)을 확인해주세요!";
      setMessage({ text: successMsg, type: 'success' });
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "테스트 알림 발송에 실패했습니다.", type: 'error' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-xl mx-auto w-full"
    >
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">설정</h2>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* User Info Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4" />
              내 정보
            </h3>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">{username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">로그인된 계정</p>
                <p className="text-lg font-bold text-slate-800">{username}</p>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Bell className="w-4 h-4" />
              알림 설정
            </h3>
            
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">정기 학습 권장 알림</h4>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[280px]">
                    매일 아침 7시와 저녁 7시에 잊지 않고 학습할 수 있도록 알림을 보내드립니다.
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="h-6 w-11 bg-slate-200 rounded-full animate-pulse" />
                ) : (
                  <button
                    onClick={handleToggleNotifications}
                    disabled={isSaving}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
                      ${notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}
                      ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    role="switch"
                    aria-checked={notificationsEnabled}
                  >
                    <span
                      aria-hidden="true"
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                        transition duration-200 ease-in-out
                        ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                )}
              </div>

              {/* Test Button Section */}
              {notificationsEnabled && (
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    실제 알림이 어떻게 오는지 확인해 보세요.
                  </div>
                  <button
                    onClick={handleTestNotification}
                    disabled={isTesting}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                    테스트 알림 발송
                  </button>
                </div>
              )}

              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.type === 'success' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  {message.text}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
