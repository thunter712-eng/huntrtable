"use client";

interface VoiceSelectProps {
  voices: SpeechSynthesisVoice[];
  /** Currently selected voiceURI, or "" for automatic. */
  value: string;
  onChange: (uri: string) => void;
  /** Speak a short sample so the user can hear the chosen voice. */
  onPreview: (text: string) => void;
  /** Re-query the device for voices (called when the picker is opened). */
  onOpen: () => void;
}

const SAMPLE = "Hi! Great conversations start here. What is your favorite memory?";

/** Voices whose names signal higher-quality / more natural synthesis. */
function isHighQuality(v: SpeechSynthesisVoice): boolean {
  return /siri|natural|neural|premium|enhanced/i.test(`${v.name} ${v.voiceURI}`);
}

/** Trim the verbose part of some voice names for a tidier list. */
function label(v: SpeechSynthesisVoice): string {
  const name = v.name.replace(/\s*\(.*?\)\s*/g, "").trim() || v.name;
  return `${isHighQuality(v) ? "✨ " : ""}${name}`;
}

/**
 * A native <select> for choosing the speech voice. Native is intentional: on
 * iOS it opens the familiar wheel picker and needs no custom styling to feel
 * right. Changing the voice plays a short preview.
 */
export default function VoiceSelect({
  voices,
  value,
  onChange,
  onPreview,
  onOpen,
}: VoiceSelectProps) {
  if (voices.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
    onPreview(SAMPLE); // Within a user gesture, so iOS will allow it.
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <label className="ht-select">
        <span aria-hidden className="text-base">
          🎙️
        </span>
        <span className="sr-only">Choose a voice</span>
        <select
          value={value}
          onChange={handleChange}
          onFocus={onOpen}
          onPointerDown={onOpen}
          aria-label="Choose a voice"
          className="ht-select__field"
        >
          <option value="">Automatic (recommended)</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {label(v)}
            </option>
          ))}
        </select>
        <span aria-hidden className="text-stone-400">
          ▾
        </span>
      </label>
      <p className="px-2 text-center text-[0.7rem] leading-snug text-stone-400 dark:text-stone-500">
        Voices with ✨ sound most natural. On iPhone, add more via Settings →
        Accessibility → Read &amp; Speak → Voices, then reopen this picker.
      </p>
    </div>
  );
}
