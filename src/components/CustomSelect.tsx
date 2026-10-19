import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Dropdown kustom (tanpa <select>) supaya daftar pilihan ikut tema gelap.
 *
 * Props
 * - id          : id untuk tombol pemicu (agar <label htmlFor> dan fokus bisa menjangkaunya)
 * - value       : nilai terpilih ("" = belum memilih)
 * - onChange    : (value) => void
 * - options     : array string, atau array { value, label }
 * - placeholder : teks saat belum ada pilihan
 * - error       : pesan galat (opsional), tampil di bawah input
 */
export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<string | SelectOption>;
  placeholder?: string;
  error?: string;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  error,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;

  const items = useMemo<SelectOption[]>(
    () => options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)),
    [options]
  );
  const selectedIndex = items.findIndex((o) => o.value === value);
  const selected: SelectOption | undefined = items[selectedIndex];

  // Click outside: tutup dropdown jika pointer ditekan di luar komponen (mouse maupun sentuh)
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // Saat dibuka, pastikan item terpilih terlihat di dalam daftar
  useEffect(() => {
    if (isOpen) listRef.current?.children[Math.max(selectedIndex, 0)]?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const open = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);
  const select = (i: number) => {
    onChange(items[i].value);
    close();
  };
  const moveActive = (i: number) => {
    setActiveIndex(i);
    listRef.current?.children[i]?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = items.length - 1;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) open();
        else moveActive(e.key === "ArrowDown" ? Math.min(activeIndex + 1, last) : Math.max(activeIndex - 1, 0));
        break;
      case "Home":
      case "End":
        if (!isOpen) break;
        e.preventDefault();
        moveActive(e.key === "Home" ? 0 : last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) open();
        else if (activeIndex >= 0) select(activeIndex);
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          close();
        }
        break;
      case "Tab":
        close(); // biarkan fokus berpindah seperti biasa
        break;
      default:
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${uid}-opt-${activeIndex}` : undefined}
        aria-invalid={error ? true : undefined}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={onKeyDown}
        // Firefox memicu click saat tombol Spasi dilepas; cegah agar tidak membuka/menutup dua kali
        onKeyUp={(e) => e.key === " " && e.preventDefault()}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-[#151a2a] px-4 py-3.5 text-left text-base outline-none transition focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500 sm:text-sm ${
          isOpen ? "border-red-500 ring-1 ring-red-500" : error ? "border-red-500" : "border-slate-700"
        } ${selected ? "text-white" : "text-slate-400"}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-700 bg-[#1a2035] py-1 shadow-xl shadow-black/40"
        >
          {items.map((o, i) => {
            const isSelected = i === selectedIndex;
            const tone = i === activeIndex ? "bg-[#252d47] text-white" : isSelected ? "text-white" : "text-gray-300";
            return (
              <li
                key={o.value}
                id={`${uid}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()} // jaga fokus tetap di tombol pemicu
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => select(i)}
                className={`flex h-11 cursor-pointer items-center justify-between px-4 text-base transition-colors hover:bg-[#252d47] hover:text-white sm:text-sm ${tone}`}
              >
                <span className={isSelected ? "font-semibold" : ""}>{o.label}</span>
                {isSelected && <Check className="h-4 w-4 text-red-500" />}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
