// Service Worker для RybuHome
const CACHE_NAME = 'rybuhome-v1';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/normalize.css',
    '/script.js',
    '/privacy/',
    '/privacy/index.html',
    // Изображения
    '/assets/img/logo.svg',
    '/assets/img/hero.webp',
    '/assets/img/property-featured-building.webp',
    '/assets/img/client-1.webp',
    '/assets/img/client-2.webp',
    // Иконки
    '/assets/icons/security-icon.svg',
    '/assets/icons/movers-icon.svg',
    '/assets/icons/air-conditioner-icon.svg',
    '/assets/icons/furniture-icon.svg',
    '/assets/icons/flower-garden-icon.svg',
    '/assets/icons/swimming-pool-icon.svg',
    '/assets/icons/quote.png',
    // Модули
    '/modules/burger-menu.js',
    '/modules/modal.js',
    '/modules/slider.js',
    '/modules/form-validation.js',
    '/modules/lazy-loading.js',
    // Шрифты Google Fonts
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    // Игнорируем запросы к внешним ресурсам (кроме Google Fonts)
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('fonts.googleapis.com') &&
        !event.request.url.includes('fonts.gstatic.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Если ресурс есть в кэше, возвращаем его
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Если ресурса нет в кэше, загружаем из сети
                return fetch(event.request)
                    .then((response) => {
                        // Проверяем валидность ответа
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Клонируем ответ для кэширования
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Если сеть недоступна, показываем офлайн страницу для HTML запросов
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Для изображений показываем placeholder
                        if (event.request.destination === 'image') {
                            return new Response(
                                '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Изображение недоступно</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// Обработка сообщений от главного потока
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Уведомление об обновлении кэша
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_CACHE') {
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                event.ports[0].postMessage({ success: true });
            })
            .catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
    }
});
