import { useMemo, useState } from 'react';
import Emoji from './Emoji';
import { EMOJI_GROUPS, DEFAULT_CATEGORY_EMOJI } from '../../utils/categoryEmoji';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function EmojiPicker({ value, onChange }) {
  const [customInput, setCustomInput] = useState('');
  const [recent, setRecent] = useLocalStorage('qlct:recentEmojis', []);

  const current = value || DEFAULT_CATEGORY_EMOJI;

  const groups = useMemo(() => EMOJI_GROUPS, []);

  function pick(emoji) {
    onChange(emoji);
    setRecent((prev) => [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 12));
  }

  // Auto-detects and applies an emoji as soon as it's typed or pasted from
  // the keyboard - no extra confirm step needed. Plain text is left alone.
  function handleCustomInputChange(e) {
    const val = e.target.value;
    const match = val.match(/\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic})*/u);
    if (match) {
      pick(match[0]);
      setCustomInput('');
    } else {
      setCustomInput(val);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-zinc-900">
          <Emoji size={26}>{current}</Emoji>
        </span>
        <input
          type="text"
          value={customInput}
          onChange={handleCustomInputChange}
          placeholder="Gõ hoặc dán emoji bất kỳ từ bàn phím..."
          className="w-full min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <p className="-mt-1.5 text-[11px] text-zinc-400">
        Mẹo: trên điện thoại, chạm giữ bàn phím rồi chọn biểu tượng cảm xúc (😀) để chèn bất kỳ emoji nào - biểu tượng sẽ được chọn ngay lập tức.
      </p>

      {recent.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-zinc-400">Gần đây</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((e) => (
              <EmojiButton key={`recent-${e}`} emoji={e} active={e === current} onClick={() => pick(e)} />
            ))}
          </div>
        </div>
      )}

      <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-1.5 text-xs font-semibold text-zinc-400">{g.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.emojis.map((e) => (
                <EmojiButton key={`${g.label}-${e}`} emoji={e} active={e === current} onClick={() => pick(e)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmojiButton({ emoji, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
        active
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
      }`}
      title={emoji}
    >
      <Emoji size={20}>{emoji}</Emoji>
    </button>
  );
}
