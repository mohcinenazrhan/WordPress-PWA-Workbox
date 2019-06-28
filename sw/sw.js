importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
	console.log(`Yay! Workbox is loaded 🎉`);

	// Register a route to let’s add a cache fallback to our JavaScript & CSS files of same origin
	workbox.routing.registerRoute(
		new RegExp('\\.(js|css)'),
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: 'static-resources'
		})
	);

	// Cache image & svg files.
	workbox.routing.registerRoute(
		/\.(?:png|jpg|jpeg|svg|gif)$/,
		// Use the cache if it's available.
		new workbox.strategies.CacheFirst({
			// Use a custom cache name.
			cacheName: 'image-cache',
			plugins: [
				new workbox.expiration.Plugin({
					// Keep at most 1000 entries.
					maxEntries: 1000,
					// Don't keep any entries for more than 30 days.
					maxAgeSeconds: 30 * 24 * 60 * 60,
					// Automatically cleanup if quota is exceeded.
					purgeOnQuotaError: true
				})
			]
		})
	);

	// Cache the underlying font files with a cache-first strategy for 1 year.
	workbox.routing.registerRoute(
		new RegExp('.+\\.(woff2|woff|ttc|ttf|eot)'),
		new workbox.strategies.CacheFirst({
			cacheName: 'webfonts',
			plugins: [
				new workbox.cacheableResponse.Plugin({
					statuses: [ 0, 200 ]
				}),
				new workbox.expiration.Plugin({
					maxAgeSeconds: 60 * 60 * 24 * 365,
					maxEntries: 30
				})
			]
		})
	);

	// Cache avatar images
	workbox.routing.registerRoute(
		/.*(?:.gravatar)\.com/,
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: 'gravatar'
		})
	);
} else {
	console.log(`Boo! Workbox didn't load 😬`);
}
