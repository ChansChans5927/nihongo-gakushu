import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock global Audio interface since jsdom doesn't provide media APIs
class AudioMock {
  src = "";
  volume = 1.0;
  currentTime = 0;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
}

global.Audio = AudioMock as any;
