// Check that service workers are supported
if ('serviceWorker' in navigator) {
	// Use the window load event to keep the page load performant
	window.addEventListener('load', () => {
		navigator.serviceWorker.register(
			'http://localhost/wp-pwa/wp-content/themes/newsmag/WordPress-PWA-Workbox/sw/sw.php'
		);
	});
}
