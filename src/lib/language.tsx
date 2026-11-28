import { createContext, useContext, useState, type ReactNode } from "react";

type LangState = {
  showEn: boolean;
  setShowEn: (v: boolean) => void;
  toggle: () => void;
};

const LangCtx = createContext<LangState>({
  showEn: true,
  setShowEn: () => {},
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [showEn, setShowEn] = useState(true);
  return (
    <LangCtx.Provider value={{ showEn, setShowEn, toggle: () => setShowEn((v) => !v) }}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);

/** Renders an English term beneath/next to the Sinhala label when bilingual mode is on. */
export function Bi({
  si,
  en,
  className = "",
  enClass = "en mt-0.5 block",
  as = "span",
}: {
  si: ReactNode;
  en?: ReactNode;
  className?: string;
  enClass?: string;
  as?: "span" | "div";
}) {
  const { showEn } = useLang();
  const Tag = as;
  return (
    <Tag className={className}>
      {si}
      {showEn && en ? <span className={enClass}>{en}</span> : null}
    </Tag>
  );
}
