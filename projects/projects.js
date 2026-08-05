const showreelPlayer = document.querySelector("[data-showreel-player]");

if (showreelPlayer) {
  const playButton = showreelPlayer.querySelector(".showreel-play");
  const playerFrame = showreelPlayer.querySelector("iframe[data-src]");

  playButton?.addEventListener(
    "click",
    () => {
      playerFrame.src = playerFrame.dataset.src;
      showreelPlayer.classList.add("is-playing");
      playerFrame.focus();
    },
    { once: true },
  );
}
