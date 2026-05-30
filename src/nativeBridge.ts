// 이 파일은 웹 앱(React)에서 네이티브 모바일 앱(React Native)으로 메시지를 보내기 위한 브릿지 역할을 합니다.

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    receiveExpoToken?: (token: string) => void;
    expoPushToken?: string;
  }
}

export const NativeBridge = {
  /**
   * 모바일 환경에서 실행 중인지 확인합니다.
   */
  isMobileApp: () => {
    return !!window.ReactNativeWebView;
  },

  /**
   * 지정된 시간(초) 후에 푸시 알림을 예약합니다.
   * @param title 알림 제목 (예: "오늘의 한자 복습!")
   * @param body 알림 내용 (예: "어제 배운 단어를 까먹기 전에 복습해 보세요.")
   * @param seconds 남은 시간(초)
   */
  scheduleNotification: (title: string, body: string, seconds: number) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "SCHEDULE_NOTIFICATION",
          payload: { title, body, seconds },
        })
      );
      console.log(`[NativeBridge] Notification scheduled for ${seconds}s later.`);
    } else {
      console.log("[NativeBridge] Not in mobile app. Notification ignored.");
    }
  },

  /**
   * 모바일(네이티브) 측에 Expo Push Token을 요청하여 받아옵니다.
   */
  requestExpoToken: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.ReactNativeWebView) {
        return reject(new Error("Not in mobile app environment"));
      }
      
      // 앱 시작 시 이미 주입된 토큰이 있다면 바로 반환
      if (window.expoPushToken) {
        return resolve(window.expoPushToken);
      }

      // 1초 뒤 타임아웃
      const timeoutId = setTimeout(() => {
        reject(new Error("Expo token request timed out"));
      }, 2000);

      window.receiveExpoToken = (token: string) => {
        clearTimeout(timeoutId);
        window.expoPushToken = token;
        resolve(token);
      };

      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "GET_EXPO_TOKEN" })
      );
    });
  },
};
