import React, { useState, useEffect } from "react";
import { ArrowLeft, Bell, BellOff, User, Loader2, Trash2, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { NativeBridge } from "../nativeBridge";
import { useConfirmStore } from "../stores/confirmStore";
import { getTheme } from "../theme";

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
  currentTheme?: string;
  onGoBack: () => void;
  onLogout: () => void;
}

export function SettingsView({ username, currentTheme = "default", onGoBack, onLogout }: SettingsViewProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [ttsGender, setTtsGender] = useState<'female' | 'male'>('female');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const showAlert = useConfirmStore((state) => state.showAlert);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/user/settings?username=${username}`);
      const data = await res.json();
      if (data.success) {
        setNotificationsEnabled(data.data.notificationsEnabled);
        setTtsSpeed(data.data.ttsSpeed || "normal");
        setTtsGender(data.data.ttsGender || "female");
        // Also update localstorage so useSpeech is synced
        localStorage.setItem(`${username}_ttsSpeed`, data.data.ttsSpeed || "normal");
        localStorage.setItem(`${username}_ttsGender`, data.data.ttsGender || "female");
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

  const handleUpdateTtsSpeed = async (newSpeed: 'slow' | 'normal' | 'fast') => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ttsSpeed: newSpeed })
      });
      const data = await res.json();
      if (data.success) {
        setTtsSpeed(newSpeed);
        localStorage.setItem(`${username}_ttsSpeed`, newSpeed);
      } else {
        throw new Error(data.errorMsg);
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "설정 변경에 실패했습니다.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTtsGender = async (newGender: 'female' | 'male') => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ttsGender: newGender })
      });
      const data = await res.json();
      if (data.success) {
        setTtsGender(newGender);
        localStorage.setItem(`${username}_ttsGender`, newGender);
      } else {
        throw new Error(data.errorMsg);
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "설정 변경에 실패했습니다.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 계정을 삭제하시겠습니까? 지금까지 학습한 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.")) {
      return;
    }
    
    setIsDeleting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.errorMsg);
      }
      
      alert("계정이 성공적으로 삭제되었습니다.");
      onLogout(); // Call App.tsx to log out the user
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "계정 삭제 중 오류가 발생했습니다.", type: 'error' });
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showAlert("모든 필드를 입력해 주세요.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showAlert("새 비밀번호는 영문, 숫자, 특수문자를 혼합하여 8자 이상이어야 합니다.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.errorMsg);
      }
      await showAlert("비밀번호가 성공적으로 변경되었습니다.\n안전을 위해 다시 로그인해 주세요.");
      onLogout();
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const theme = getTheme(currentTheme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-xl mx-auto w-full"
    >
      <div className={`${theme.cardContainer} overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors duration-300 ${theme.cardHeaderBg} ${theme.tableBorder}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className={`p-2 -ml-2 rounded-full transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${theme.wordSubText}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className={`text-lg font-bold transition-colors duration-300 ${theme.breakdownKanjiMeaning}`}>설정</h2>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* User Info Section */}
          <section>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider ${theme.wordSubText}`}>
              <User className="w-4 h-4" />
              내 정보
            </h3>
            <div className={`rounded-2xl p-5 border flex items-center gap-4 transition-colors duration-300 ${theme.wordPanelBg} ${theme.tableBorder}`}>
              <div className="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-500">{username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme.wordSubText}`}>로그인된 계정</p>
                <p className={`text-lg font-bold ${theme.breakdownKanjiMeaning}`}>{username}</p>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider ${theme.wordSubText}`}>
              <Bell className="w-4 h-4" />
              알림 설정
            </h3>
            
            <div className={`rounded-2xl p-5 border transition-colors duration-300 ${theme.wordPanelBg} ${theme.tableBorder}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-base font-bold mb-1 ${theme.breakdownKanjiMeaning}`}>정기 학습 권장 알림</h4>
                  <p className={`text-sm leading-relaxed max-w-[280px] ${theme.wordSubText}`}>
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
                      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${notificationsEnabled 
                        ? (currentTheme === 'samurai' ? 'bg-red-800 focus:ring-red-850' 
                           : currentTheme === 'yokai' ? 'bg-sky-500 focus:ring-sky-500' 
                           : currentTheme === 'zen' ? 'bg-emerald-600 focus:ring-emerald-600' 
                           : currentTheme === 'chalkboard' ? 'bg-yellow-400 focus:ring-yellow-400' 
                           : 'bg-emerald-500 focus:ring-emerald-500')
                        : 'bg-slate-300 dark:bg-slate-700'}
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
 
              {message && (
                <div className={`mt-4 p-3 rounded-xl text-sm flex items-center gap-2 border ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500' 
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-500'
                }`}>
                  {message.type === 'success' ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <BellOff className="w-4 h-4 text-rose-500" />}
                  {message.text}
                </div>
              )}
            </div>
          </section>

          {/* TTS Settings Section */}
          <section>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider ${theme.wordSubText}`}>
              <Volume2 className="w-4 h-4" />
              음성 설정 (TTS)
            </h3>
            
            <div className={`rounded-2xl p-5 border space-y-6 transition-colors duration-300 ${theme.wordPanelBg} ${theme.tableBorder}`}>
              {/* Voice Gender Setting */}
              <div>
                <h4 className={`text-base font-bold mb-2 ${theme.breakdownKanjiMeaning}`}>음성 성별</h4>
                <p className={`text-sm mb-3 leading-relaxed ${theme.wordSubText}`}>
                  단어 및 문장 학습 시 재생되는 일본어 발음의 성별을 선택합니다.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateTtsGender('female')}
                    disabled={isSaving}
                    className={`py-3 px-4 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-xs ${
                      ttsGender === 'female'
                        ? theme.btnPrimary
                        : theme.btnSecondary
                    }`}
                  >
                    여성 목소리 (기본)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateTtsGender('male')}
                    disabled={isSaving}
                    className={`py-3 px-4 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-xs ${
                      ttsGender === 'male'
                        ? theme.btnPrimary
                        : theme.btnSecondary
                    }`}
                  >
                    남성 목소리
                  </button>
                </div>
              </div>

              {/* Voice Speed Setting */}
              <div className={`pt-4 border-t ${theme.tableBorder}`}>
                <h4 className={`text-base font-bold mb-2 ${theme.breakdownKanjiMeaning}`}>음성 속도</h4>
                <p className={`text-sm mb-3 leading-relaxed ${theme.wordSubText}`}>
                  일본어 발음이 재생되는 스피드를 조절합니다.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['slow', 'normal', 'fast'] as const).map((speed) => {
                    const label = speed === 'slow' ? '느림 (0.8x)' : speed === 'fast' ? '빠름 (1.25x)' : '보통 (1.0x)';
                    return (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => handleUpdateTtsSpeed(speed)}
                        disabled={isSaving}
                        className={`py-2.5 px-3 font-bold transition-all flex items-center justify-center cursor-pointer text-xs shadow-3xs ${
                          ttsSpeed === speed
                            ? theme.btnPrimary
                            : theme.btnSecondary
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Change Password Section */}
          <section>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider ${theme.wordSubText}`}>
              <User className="w-4 h-4" />
              비밀번호 변경
            </h3>
            
            <form onSubmit={handleChangePassword} className={`rounded-2xl p-5 border space-y-4 transition-colors duration-300 ${theme.wordPanelBg} ${theme.tableBorder}`}>
              <div>
                <label className={`block text-sm font-bold mb-1 ${theme.breakdownKanjiMeaning}`}>현재 비밀번호</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className={`w-full px-4 py-3 outline-none transition-all duration-200 font-sans ${theme.choiceBtnBase}`}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${theme.breakdownKanjiMeaning}`}>새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className={`w-full px-4 py-3 outline-none transition-all duration-200 font-sans ${theme.choiceBtnBase}`}
                  placeholder="영문, 숫자, 특수문자 조합 8자 이상"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${theme.breakdownKanjiMeaning}`}>새 비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className={`w-full px-4 py-3 outline-none transition-all duration-200 font-sans ${theme.choiceBtnBase}`}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                className={`w-full mt-2 py-3 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm ${theme.btnPrimary}`}
              >
                {isChangingPassword && <Loader2 className="w-5 h-5 animate-spin" />}
                비밀번호 변경
              </button>
            </form>
          </section>

          {/* Account Management: Delete Account */}
          <section className={`pt-4 border-t ${theme.tableBorder}`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider ${theme.wordSubText}`}>
              <User className="w-4 h-4" />
              계정 관리
            </h3>
            <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300 ${theme.wordPanelBg} ${theme.tableBorder}`}>
              <div>
                <h4 className="text-base font-bold text-red-500 mb-1">계정 삭제</h4>
                <p className={`text-sm leading-relaxed max-w-[280px] text-red-400/80`}>
                  회원 탈퇴 시 지금까지 쌓아온 모든 학습 기록과 커스텀 설정이 영구 삭제되며, 복구할 수 없습니다.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "삭제 중..." : "계정 영구 삭제"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
