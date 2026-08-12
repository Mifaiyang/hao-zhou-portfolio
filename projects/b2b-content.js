document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("video").forEach((video) => {
    video.volume = 0.5;
    video.dataset.initialVolume = "0.5";
  });
});
