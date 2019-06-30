importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
	console.log(`Yay! Workbox is loaded 🎉`);

	// Configure workbox precache

	// Force production builds
	workbox.setConfig({ debug: false });

	workbox.core.setCacheNameDetails({
		prefix: 'wp-pwa',
		suffix: 'v1',
		precache: 'precache'
	});

	const precacheCacheName = workbox.core.cacheNames.precache;
	const OFFLINE_PAGE = 'http://localhost/wp-pwa/offline-page/';

	// List of links to precache.
	workbox.precaching.precacheAndRoute([ OFFLINE_PAGE ]);

	// Skip Waiting and Clients Claim the default service worker lifecycle.
	workbox.core.skipWaiting();
	workbox.core.clientsClaim();

	// Cache pages
	const networkFirst = new workbox.strategies.NetworkFirst({
		cacheName: 'pages-cache'
	});

	const pagesHandler = async (args) => {
		try {
			const response = await networkFirst.handle(args);
			return response || getTheOfflinePage();
		} catch (error) {
			return getTheOfflinePage();
		}
	};

	async function getTheOfflinePage() {
		try {
			const cache = await caches.open(precacheCacheName);
			const cachedResponse = await cache.match(OFFLINE_PAGE);
			if (cachedResponse) return cachedResponse;
			else throw Error('The fallback offline page that was expected is missing.');
		} catch (error) {
			console.log('Get fallback offline page error ', error);
		}
	}

	const navigationRoute = new workbox.routing.NavigationRoute(pagesHandler, {
		// Configure with RegExps as appropriate.
		whitelist: [ /.*\.html/, /(\/([a-zA-Z\-0-9]+\/?))$/ ],
		blacklist: [ /\/wp-admin/, /\/wp-login/, /preview=true/ ]
	});

	workbox.routing.registerRoute(navigationRoute);

	// Register a route to let’s add a cache fallback to our JavaScript & CSS files of same & cross origin
	workbox.routing.registerRoute(
		new RegExp('.+\\.(js|css)'),
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

	/* Cache fonts files. */
	// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
	workbox.routing.registerRoute(
		/^https:\/\/fonts\.googleapis\.com/,
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: 'google-fonts-stylesheets'
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
