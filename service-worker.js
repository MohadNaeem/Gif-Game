self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached version or fetch from the network if not available in the cache
      return response || fetch(event.request);
    })
  );
});
