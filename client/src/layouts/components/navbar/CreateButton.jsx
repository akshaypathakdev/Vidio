import { useEffect, useRef, useState } from "react";
import { Plus, Video, MessageSquare, ListPlus } from "lucide-react";
import { Link } from "react-router-dom";

function CreateButton() {
  const [open, setOpen] = useState(false);
  const createRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (createRef.current && !createRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkClassName = `
    flex w-full items-center gap-3 rounded-lg px-3 py-2.5
    text-sm text-white transition hover:bg-white/5
  `;

  return (
    <div ref={createRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Create"
        aria-expanded={open}
        className="
          flex h-9 w-9 items-center justify-center rounded-full
          border border-white/10 text-white transition hover:bg-white/5
          sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2
        "
      >
        <Plus
          size={18}
          className={`transition-transform ${open ? "rotate-45" : ""}`}
        />
        <span className="hidden sm:inline">Create</span>
      </button>

      {open && (
        <div
          className="
          absolute right-0 top-12 z-50 w-44 overflow-hidden
          rounded-xl border border-white/10 bg-[#08090b] p-1.5 shadow-xl
        "
        >
          <Link
            to="/video/upload"
            onClick={() => setOpen(false)}
            className={linkClassName}
          >
            <Video size={18} className="text-white/70" />
            <span>Video</span>
          </Link>

          <Link
            to="/playlists"
            onClick={() => setOpen(false)}
            className={linkClassName}
          >
            <ListPlus size={18} className="text-white/70" />
            <span>Playlist</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default CreateButton;
