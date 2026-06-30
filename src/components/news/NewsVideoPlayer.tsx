import { ExternalLink } from "lucide-react";

// 동영상 플레이어 Props 인터페이스
interface NewsVideoPlayerProps {
  videoUrl: string;       // 유튜브 비디오 전체 주소 URL
  playerState: number;    // 유튜브 플레이어 상태 상수
}

// 유튜브 동영상 재생 프레임 및 상태 모니터링 컨트롤러 컴포넌트
export function NewsVideoPlayer({
  videoUrl,
  playerState
}: NewsVideoPlayerProps) {
  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* 유튜브 Iframe 렌더링 컨테이너 */}
      <div className="relative aspect-video bg-black">
        <div id="news-youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
      </div>
      
      {/* 하단 오디오 상태 요약 정보 바 */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          {/* 유튜브 플레이어 상태 상태등 시각 효과 */}
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${playerState === 1 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
          <span>
            {playerState === 1 
              ? "뉴스 시청 중" 
              : playerState === 2 
                ? "일시정지됨" 
                : "준비 완료"
            }
          </span>
        </div>
        
        {/* 유튜브 새 탭으로 보기 아웃링크 */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-rose-500 font-medium transition-colors cursor-pointer"
        >
          <span>YouTube에서 보기</span> 
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
