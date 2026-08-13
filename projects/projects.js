document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector("[data-showreel-player]");
  const poster = stage?.querySelector(".showreel-poster");

  if (!stage || !poster) return;

  poster.addEventListener("click", () => {
    const player = document.createElement("iframe");
    player.src = "https://player.bilibili.com/player.html?isOutside=true&aid=114504666978106&bvid=BV1P9EYzcEcU&cid=29944250612&p=1&autoplay=1";
    player.title = "周灏 2025 影像作品集";
    player.scrolling = "no";
    player.allow = "autoplay; fullscreen; picture-in-picture";
    player.allowFullscreen = true;
    player.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-presentation");
    stage.replaceChildren(player);
  }, { once: true });
});
