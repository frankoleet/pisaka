const paths = {
  paper: <><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4M10 12h5M10 16h5M4 7v14"/></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  repeat: <><path d="m16 3 4 4-4 4M20 7H8a4 4 0 0 0-4 4m4 10-4-4 4-4M4 17h12a4 4 0 0 0 4-4"/></>,
  arrowUpRight: <path d="M6 18 18 6M6 6h12v12"/>,
  bolt: <path d="m13 2-9 12h7l-1 8 10-13h-8z"/>,
  book: <path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/></>,
  check: <><circle cx="12" cy="12" r="9" pathLength="1"/><path d="m8 12 3 3 5-6" pathLength="1"/></>,
  qr: <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM20 14v4h-3v3M21 21h-1"/>,
};
export default function Icon({ name }: { name: keyof typeof paths }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
