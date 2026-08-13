document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("video").forEach((video) => {
    video.volume = 0.5;
    video.dataset.initialVolume = "0.5";
  });

  const player = document.querySelector("[data-founder-player]");
  const video = player?.querySelector("[data-founder-video]");
  const title = player?.querySelector("[data-founder-title]");
  const index = player?.querySelector("[data-founder-index]");
  const covers = [...document.querySelectorAll(".founder-cover[data-video-src]")];

  if (!video || !covers.length) return;

  covers.forEach((cover, coverIndex) => {
    cover.addEventListener("click", () => {
      const wasPlaying = !video.paused;
      const nextSource = cover.dataset.videoSrc;

      covers.forEach((item) => {
        const isCurrent = item === cover;
        item.classList.toggle("is-active", isCurrent);
        item.setAttribute("aria-pressed", String(isCurrent));
      });

      if (video.querySelector("source").getAttribute("src") !== nextSource) {
        video.pause();
        video.querySelector("source").setAttribute("src", nextSource);
        video.poster = cover.dataset.videoPoster;
        video.load();
        video.volume = 0.5;
        video.dataset.initialVolume = "0.5";
      }

      title.textContent = cover.dataset.videoTitle;
      index.textContent = `${String(coverIndex + 1).padStart(2, "0")} / ${String(covers.length).padStart(2, "0")}`;

      if (wasPlaying) video.play().catch(() => {});
    });
  });
});
