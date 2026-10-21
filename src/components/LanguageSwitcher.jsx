import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const OPTIONS = [
  { code: 'en', flag: '/flags/gb.svg' },
  { code: 'ka', flag: '/flags/ge.svg' },
];

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const currentCode = lang === 'ka' ? 'ka' : 'en';
  const activeOption = useMemo(
    () => OPTIONS.find((option) => option.code === currentCode) ?? OPTIONS[0],
    [currentCode],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const changeLanguage = (code) => {
    if (code !== currentCode) setLang(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-[40px] min-w-[85px] items-center gap-2 rounded-full border-[0.5px] border-[#E2E2E2] bg-[#FEFEFE] px-2"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t.languageSwitcher.changeLanguage}
      >
        <img
          src={activeOption.flag}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 rounded-full border border-[#E2E2E2]"
        />
        <span className="text-sm font-normal leading-none text-[#6B6B6B]">
          {t.languageSwitcher.short[activeOption.code]}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B6B6B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[140px] overflow-hidden rounded-xl border-[0.5px] border-[#E2E2E2] bg-[#FEFEFE] py-3 shadow-[0_2px_15px_0px_rgba(15,23,42,0.10)]"
          role="menu"
        >
          {OPTIONS.map((option) => {
            const isActive = option.code === currentCode;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => changeLanguage(option.code)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left transition ${
                  isActive
                    ? 'bg-[#EFF4FD]'
                    : 'border-b-[0.5px] border-[#E2E2E2] bg-transparent hover:bg-[#EFF4FD]'
                }`}
                role="menuitem"
              >
                <img
                  src={option.flag}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 rounded-full border border-[#E2E2E2]"
                />
                <span className="text-xs font-normal leading-none text-[#6B6B6B]">
                  {t.languageSwitcher.label[option.code]}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
