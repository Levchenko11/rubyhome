// Основной JavaScript файл проекта - Рефакторированная версия

// Импорт модулей
import { handleBurgerMenu } from './modules/burger-menu.js';
import { handleReviewsSlider } from './modules/slider.js';
import { handleModal } from './modules/modal.js';
import { handleFormValidation } from './modules/form-validation.js';
import { initImageOptimizations } from './modules/lazy-loading.js';

// Утилиты для обработки ошибок
const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    
    // Можно добавить отправку ошибок в систему мониторинга
    // sendErrorToMonitoring(error, context);
};

// Инициализация модулей с обработкой ошибок
const initializeModule = (moduleFunction, moduleName) => {
    try {
        moduleFunction();
        console.log(`✓ ${moduleName} initialized successfully`);
    } catch (error) {
        handleError(error, moduleName);
    }
};

// Регистрация Service Worker
const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('✓ Service Worker registered successfully:', registration.scope);
                    
                    // Проверяем обновления
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('🔄 New Service Worker available');
                                // Можно показать уведомление пользователю об обновлении
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    } else {
        console.warn('Service Worker not supported in this browser');
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing RybuHome application...');
    
    // Регистрируем Service Worker
    registerServiceWorker();
    
    // Инициализируем модули
    initializeModule(handleBurgerMenu, 'Burger Menu');
    initializeModule(handleReviewsSlider, 'Reviews Slider');
    initializeModule(handleModal, 'Modal');
    initializeModule(handleFormValidation, 'Form Validation');
    initializeModule(initImageOptimizations, 'Image Optimizations');
    
    console.log('✅ All modules initialized');
});

// Обработка ошибок на уровне приложения
window.addEventListener('error', (event) => {
    handleError(event.error, 'Global Error Handler');
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Unhandled Promise Rejection');
    event.preventDefault();
});