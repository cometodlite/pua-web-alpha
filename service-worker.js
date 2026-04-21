const CACHE_NAME = "pua-web-alpha-04-v1";
const BASE_URL = new URL("./", self.location.href);
const BASE_PAGE = new URL("./", BASE_URL).toString();
const PRECACHE_ASSETS = [
  "./",
  "index.html",
  "style.css",
  "main.js",
  "data/characters.js",
  "data/achievements.js",
  "data/bosses.js",
  "data/enemies.js",
  "data/gacha.js",
  "data/story.js",
  "data/stages.js",
  "systems/achievement.js",
  "systems/audio.js",
  "systems/battle.js",
  "systems/formation.js",
  "systems/mission.js",
  "systems/save.js",
  "systems/ui.js",
  "systems/upgrade.js",
  "manifest.webmanifest",
  "assets/ui/icon-192.png",
  "assets/ui/icon-512.png",
  "assets/ui/icon-maskable-512.png",
].map((path) => new URL(path, BASE_URL).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(BASE_PAGE, copy));
          return response;
        })
        .catch(() => caches.match(BASE_PAGE))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
