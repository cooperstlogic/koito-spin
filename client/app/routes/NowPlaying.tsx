import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  apiFetch,
  getAlbum,
  type Listen,
  type NowPlaying as NowPlayingResponse,
  type PaginatedResponse,
} from "api/api";
import { timeSince } from "~/utils/utils";
import { siteTitle } from "~/branding";

// Standalone now playing view for a phone or a spare screen: no sidebar, updates itself.

const NO_IMAGE = "00000000-0000-0000-0000-000000000000";

const getNowPlaying = () =>
  apiFetch<NowPlayingResponse>("/apis/web/v1/now-playing");
const getLastListen = () =>
  apiFetch<PaginatedResponse<Listen>>("/apis/web/v1/listens", {
    limit: 1,
    period: "all_time",
    page: 0,
  });

// Keep a spare screen from sleeping while this page is visible (where supported).
function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const request = async () => {
      try {
        const wl = (navigator as any).wakeLock;
        if (wl && document.visibilityState === "visible") {
          lock = await wl.request("screen");
        }
      } catch {
        // not allowed or not supported: the page still works
      }
    };
    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      document.removeEventListener("visibilitychange", request);
      lock?.release().catch(() => {});
    };
  }, []);
}

export default function NowPlaying() {
  useWakeLock();

  const { data: np } = useQuery({
    queryKey: ["now-playing"],
    queryFn: getNowPlaying,
    refetchInterval: 5_000,
  });
  const playing = !!np?.currently_playing;
  const npTrack = playing ? np!.track : undefined;

  const { data: album } = useQuery({
    queryKey: ["album", npTrack?.album_id],
    queryFn: () => getAlbum(npTrack!.album_id),
    enabled: !!npTrack?.album_id,
    staleTime: Infinity,
  });

  // refetch the last listen whenever now playing changes, and every minute anyway
  const { data: last } = useQuery({
    queryKey: ["now-last-listen", npTrack?.id ?? 0],
    queryFn: getLastListen,
    refetchInterval: 60_000,
  });
  const lastListen = last?.items?.[0];

  const track = npTrack ?? lastListen?.track;
  const art = track?.image?.xl;
  const hasArt = !!art && !art.includes(NO_IMAGE);

  const pageTitle = npTrack
    ? `${npTrack.title} – ${npTrack.artists.map((a) => a.name).join(", ")}`
    : `Now playing - ${siteTitle}`;

  return (
    <main className="np-page min-h-screen w-full flex items-center justify-center p-6 bg-(--color-bg) text-(--color-fg)">
      <title>{pageTitle}</title>
      <style>{css}</style>

      <div className="np-layout flex flex-col items-center gap-10 w-full max-w-6xl">
        <div className={`np-cover ${playing ? "is-playing" : ""} ${hasArt ? "" : "no-art"}`}>
          <img className="np-record" src="/favicon.svg" alt="" aria-hidden />
          {hasArt && (
            <img className="np-art" src={art} alt={album?.title ?? track?.title ?? ""} />
          )}
        </div>

        <div className="np-text flex flex-col gap-3 min-w-0">
          <p className="flex items-center gap-2 text-sm uppercase tracking-widest text-(--color-fg-secondary)">
            {playing ? (
              <>
                <span className="np-dot" aria-hidden />
                Now playing
              </>
            ) : lastListen ? (
              <>Last played · {timeSince(new Date(lastListen.time))}</>
            ) : (
              <>Nothing playing</>
            )}
          </p>

          {track && (
            <>
              <Link
                to={`/track/${track.id}`}
                className="np-title font-semibold leading-tight hover:underline"
              >
                {track.title}
              </Link>
              <p className="text-xl text-(--color-fg-secondary)">
                {track.artists.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ", "}
                    <Link to={`/artist/${a.id}`} className="hover:underline">
                      {a.name}
                    </Link>
                  </span>
                ))}
              </p>
              {npTrack && album && (
                <Link
                  to={`/album/${album.id}`}
                  className="text-lg text-(--color-fg-tertiary) hover:underline"
                >
                  {album.title}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <Link
        to="/"
        className="fixed bottom-4 right-5 text-sm text-(--color-fg-tertiary) hover:text-(--color-fg)"
      >
        {siteTitle}
      </Link>
    </main>
  );
}

// Record and art sizes follow the screen's shape: stacked on phones, side by side on wide screens.
const css = `
.np-page { --art: min(60vw, 44vh); }
/* room for the record to slide out only while playing, so idle art stays centered */
.np-cover { position: relative; width: var(--art); height: var(--art); flex-shrink: 0; transition: width 700ms ease; }
.np-cover.is-playing:not(.no-art) { width: calc(var(--art) * 1.42); }
.np-art, .np-record { position: absolute; top: 0; left: 0; width: var(--art); height: var(--art); }
.np-art { object-fit: cover; border-radius: 6px; box-shadow: 0 12px 40px rgb(0 0 0 / 0.45); z-index: 1; }
.np-record {
  padding: 3%;
  transition: translate 700ms ease;
  animation: np-spin 1.8s linear infinite;  /* 33 1/3 rpm */
  animation-play-state: paused;
}
.np-cover.is-playing .np-record { animation-play-state: running; }
/* slide with \`translate\`, not \`transform\`: translate applies after the spin's \`rotate\`, so the record spins in place */
.np-cover.is-playing:not(.no-art) .np-record { translate: 42% 0; }
@keyframes np-spin { to { rotate: 360deg; } }
.np-title { font-size: clamp(1.75rem, 4.5vw, 3.25rem); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.np-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); animation: np-pulse 1.6s ease-in-out infinite; }
@keyframes np-pulse { 50% { opacity: 0.3; } }
.np-text { text-align: center; align-items: center; }
@media (orientation: landscape) and (min-width: 700px) {
  .np-page { --art: min(40vw, 70vh); }
  .np-layout { flex-direction: row; justify-content: center; }
  .np-text { text-align: left; align-items: flex-start; max-width: 40vw; }
}
@media (prefers-reduced-motion: reduce) {
  .np-record { animation: none; transition: none; }
}
`;
