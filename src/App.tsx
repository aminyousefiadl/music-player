import { useCallback, useLayoutEffect, useRef, useState } from "react";
import chillHop, { classNames } from "./utility";

const musics = chillHop();

function App() {
  const [playing, setPlaying] = useState<typeof musics[0] | null>(null);
  const playerRef = useRef<null | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<null | number>(null);
  const [currentTime, setCurrentTime] = useState<null | number>(null);

  useLayoutEffect(() => {
    if (playerRef?.current) {
      if (isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [isPlaying, playing]);

  const showTime = useCallback((numberInSec: number) => {
    const minute = numberInSec / 60;
    const sec = numberInSec - Math.floor(minute) * 60;
    return `${Math.floor(minute)}:${
      sec < 10 ? `0${Math.floor(sec)}` : Math.floor(sec)
    }`;
  }, []);

  const changeSong = useCallback(
    (prev: typeof playing, direction: "next" | "prev") => {
      const playingSongIndex = musics.findIndex((music) => {
        return prev?.id === music.id;
      });
      if (direction === "prev") {
        if (playingSongIndex - 1 < 0) {
          return musics[musics.length - 1];
        }
        return musics[playingSongIndex - 1];
      } else if (
        playingSongIndex < 0 ||
        playingSongIndex >= musics.length - 1
      ) {
        return musics[0];
      }
      return musics[playingSongIndex + 1];
    },
    []
  );

  const onUpdateSong = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const element = e.target as HTMLAudioElement;
      if (
        element?.duration &&
        element?.currentTime &&
        element.currentTime >= element.duration
      ) {
        setPlaying((prev) => {
          return changeSong(prev, "next");
        });
      }
      setDuration((e.target as HTMLAudioElement)?.duration ?? null);
      setCurrentTime((e.target as HTMLAudioElement)?.currentTime ?? null);
    },
    [changeSong]
  );

  const onUpdateProgressBar = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, duration: number) => {
      let element = e.target as HTMLDivElement;
      if (
        (e.target as HTMLDivElement).classList.contains(
          "progress_elapsed-progress"
        )
      ) {
        element = (e.target as HTMLDivElement)!.parentElement as HTMLDivElement;
      }
      if (playerRef?.current) {
        playerRef.current.currentTime =
          ((e.pageX - element?.getClientRects()[0].x!) * (duration ?? 0)) /
          element.clientWidth;
      }
    },
    []
  );

  return (
    <div className="App">
      <div className="container">
        <aside>
          <h1 className="title">Library</h1>
          <div
            onClick={(e) => {
              if ((e.target as HTMLElement).nodeName === "IMG") {
                const selected = musics.findIndex((item) => {
                  return (
                    item.id === (e.target as HTMLImageElement).id.split("_")[1]
                  );
                });
                if (selected > -1) {
                  setPlaying(musics[selected]);
                }
              }
            }}
          >
            {musics.map((music) => {
              return (
                <div
                  key={music.id}
                  className={classNames(
                    "music-item",
                    playing?.id === music.id ? "active" : undefined
                  )}
                >
                  <img
                    id={`img_${music.id}`}
                    src={music.cover}
                    alt={music.name}
                  />
                  <div className="music-item_title">
                    <h4>{music.name}</h4>
                    <p>{music.artist}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        <main>
          {playing ? (
            <div className="main-wrapper">
              <img src={playing.cover} alt={playing.name} />
              <audio
                onTimeUpdate={(e) => {
                  onUpdateSong(e);
                }}
                ref={playerRef}
                src={playing.audio}
              ></audio>
              <p className="name">{playing.artist}</p>
              <h3>Player</h3>
              <div className="progress">
                <span id="current" className="">
                  {(currentTime && showTime(currentTime)) || ""}
                </span>
                <div
                  onClick={(e) => {
                    onUpdateProgressBar(e, duration ?? 0);
                  }}
                  className="progress_wrapper"
                >
                  <div
                    style={
                      duration && currentTime
                        ? { width: (currentTime / duration) * 100 + "%" }
                        : { width: 0 }
                    }
                    className="progress_elapsed-progress"
                  ></div>
                </div>
                <span id="duration">
                  {(duration && showTime(duration)) || ""}
                </span>
              </div>
              <div className="controller">
                <img
                  onClick={() => {
                    setPlaying((prev) => {
                      return changeSong(prev, "prev");
                    });
                  }}
                  src="/left-chevron.png"
                  alt="previous-song"
                />
                <img
                  onClick={() => {
                    if (isPlaying) {
                      setIsPlaying(false);
                    } else {
                      setIsPlaying(true);
                    }
                  }}
                  src={isPlaying ? "/pause.png" : "/play.png"}
                  alt="play"
                />
                <img
                  onClick={() => {
                    setPlaying((prev) => {
                      return changeSong(prev, "next");
                    });
                  }}
                  src="/right-chevron.png"
                  alt="right-song"
                />
              </div>
            </div>
          ) : (
            <div className="no-song">
              <h1>click on the song cover to play</h1>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
