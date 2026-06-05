import PlayIcon from "../../../assets/PlayIcon.svg";
import PauseIcon from "../../../assets/PauseIcon.svg";

type AudioControlProps = {
  currentReciter: string;
  audioPlaying: boolean;
  changeReciter: (reciterId: string) => void;
  onPlay: () => void;
  onPause: () => void;
};

function AudioControl({
  currentReciter,
  changeReciter,
  audioPlaying,
  onPlay,
  onPause,
}: AudioControlProps) {
  const reciters = [
    { id: "01", name: "Abdullah Al-Juhany" },
    { id: "02", name: "Abdul Muhsin Al-Qasim" },
    { id: "03", name: "Abdurrahman as-Sudais" },
    { id: "04", name: "Ibrahim Al-Dossari" },
    { id: "05", name: "Misyari Rasyid Al-Afasi" },
  ];

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Dropdown Reciter */}
      <select
        value={currentReciter}
        onChange={(e) => changeReciter(e.target.value)}
        className="
          w-full p-3 flex-1 rounded-xl
          bg-white text-gray-800 shadow-sm
          border border-gray-200
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
          transition-all duration-300
          dark:bg-gray-800 dark:text-blue-100 dark:border-gray-700
          dark:focus:ring-blue-500
        "
      >
        {reciters.map((reciter) => (
          <option
            key={reciter.id}
            value={reciter.id}
            className="bg-white dark:bg-gray-800"
          >
            {reciter.name}
          </option>
        ))}
      </select>

      {/* Play / Pause Button */}
      <button
        onClick={audioPlaying ? onPause : onPlay}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-300 ease-in-out
          shadow-md hover:shadow-lg
          ${audioPlaying
            ? "bg-blue-500 hover:bg-blue-600 dark:bg-cyan-400 dark:hover:bg-cyan-500"
            : "bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-cyan-400"}
        `}
      >
        <img
          src={audioPlaying ? PauseIcon : PlayIcon}
          alt={audioPlaying ? "Pause Icon" : "Play Icon"}
          className="w-5 h-5 invert-[0%] dark:invert-[100%]"
        />
      </button>
    </div>
  );
}

export default AudioControl;
