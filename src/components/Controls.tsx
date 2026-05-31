"use client";

interface ControlsProps {
  /** Whether there is a question on screen to act on. */
  hasQuestion: boolean;
  speechEnabled: boolean;
  speechSupported: boolean;
  onRepeat: () => void;
  onNext: () => void;
  onToggleSpeech: () => void;
}

/**
 * Bottom control bar: Repeat, Next, and a Speech on/off toggle.
 * Repeat/Next are disabled until a question has been drawn.
 */
export default function Controls({
  hasQuestion,
  speechEnabled,
  speechSupported,
  onRepeat,
  onNext,
  onToggleSpeech,
}: ControlsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRepeat}
          disabled={!hasQuestion}
          className="ht-btn ht-btn--ghost"
        >
          <span aria-hidden>🔁</span> Repeat
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasQuestion}
          className="ht-btn ht-btn--primary"
        >
          Next <span aria-hidden>→</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleSpeech}
        disabled={!speechSupported}
        aria-pressed={speechEnabled}
        className="ht-btn ht-btn--ghost justify-center"
      >
        {speechSupported ? (
          <>
            <span aria-hidden>{speechEnabled ? "🔊" : "🔇"}</span>
            Speech {speechEnabled ? "On" : "Off"}
          </>
        ) : (
          <>
            <span aria-hidden>🔇</span> Speech unavailable
          </>
        )}
      </button>
    </div>
  );
}
