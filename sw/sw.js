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
} else {
	console.log(`Boo! Workbox didn't load 😬`);
}
