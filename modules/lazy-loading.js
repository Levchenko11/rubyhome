// Модуль для улучшенного lazy loading изображений
export const handleLazyLoading = () => {
    // Проверяем поддержку Intersection Observer
    if (!('IntersectionObserver' in window)) {
        // Fallback для старых браузеров - загружаем все изображения
        loadAllImages();
        return;
    }
    
    // Настройки для Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '50px', // Начинаем загрузку за 50px до появления в viewport
        threshold: 0.01
    };
    
    // Создаем observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                observer.unobserve(img);
            }
        });
    }, observerOptions);
    
    // Находим все изображения с lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    // Добавляем placeholder и наблюдаем за изображениями
    lazyImages.forEach(img => {
        addPlaceholder(img);
        imageObserver.observe(img);
    });
    
    // Предзагрузка критических изображений
    preloadCriticalImages();
};

// Загрузка отдельного изображения
const loadImage = (img) => {
    // Создаем новый объект изображения для предзагрузки
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
        // Когда изображение загружено, обновляем src
        img.src = imageLoader.src;
        img.classList.add('loaded');
        
        // Удаляем placeholder
        removePlaceholder(img);
        
        // Добавляем анимацию появления
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // Запускаем анимацию
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    };
    
    imageLoader.onerror = () => {
        // Обработка ошибки загрузки
        img.classList.add('error');
        removePlaceholder(img);
        
        // Можно добавить fallback изображение
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA3NEg5M1Y4MEg4N1Y3NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+PC9wYXRoPgo8L3N2Zz4K';
    };
    
    // Начинаем загрузку
    const picture = img.closest('picture');
    if (picture) {
        // Если изображение в picture элементе, загружаем WebP версию
        const source = picture.querySelector('source[type="image/webp"]');
        if (source && source.srcset) {
            imageLoader.src = source.srcset;
        } else {
            imageLoader.src = img.dataset.src || img.src;
        }
    } else {
        imageLoader.src = img.dataset.src || img.src;
    }
};

// Добавление placeholder'а
const addPlaceholder = (img) => {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: inherit;
    `;
    
    // Добавляем CSS анимацию если её нет
    if (!document.querySelector('#lazy-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'lazy-loading-styles';
        style.textContent = `
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .image-placeholder {
                pointer-events: none;
            }
            img.loaded {
                transition: opacity 0.3s ease;
            }
            img.error {
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Делаем контейнер изображения относительным
    const container = img.parentElement;
    if (container && getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    
    container.appendChild(placeholder);
};

// Удаление placeholder'а
const removePlaceholder = (img) => {
    const container = img.parentElement;
    const placeholder = container?.querySelector('.image-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
};

// Предзагрузка критических изображений
const preloadCriticalImages = () => {
    // Предзагружаем hero изображение и логотип
    const criticalImages = [
        'assets/img/hero.webp',
        'assets/img/logo.svg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
};

// Fallback для старых браузеров
const loadAllImages = () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    });
};

// Добавление размеров изображений для предотвращения layout shift
export const addImageDimensions = () => {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    
    images.forEach(img => {
        // Определяем размеры на основе контекста
        if (img.classList.contains('hero__img')) {
            img.width = 600;
            img.height = 500;
        } else if (img.classList.contains('partners__logo')) {
            img.width = 200;
            img.height = 80;
        } else if (img.classList.contains('property-card__img')) {
            img.width = 362;
            img.height = 321;
        } else if (img.classList.contains('property-featured__bg-img')) {
            img.width = 362;
            img.height = 548;
        } else if (img.classList.contains('review-card__avatar-img')) {
            img.width = 74;
            img.height = 74;
        } else if (img.classList.contains('review-card__quote-icon')) {
            img.width = 64;
            img.height = 64;
        }
    });
};

// Оптимизация изображений для разных плотностей экрана
export const handleResponsiveImages = () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Добавляем srcset для адаптивных изображений
        if (img.src.includes('.webp') || img.src.includes('.png')) {
            const basePath = img.src.replace(/\.(webp|png)$/, '');
            const extension = img.src.match(/\.(webp|png)$/)?.[1];
            
            if (extension) {
                // Создаем srcset для разных плотностей
                img.srcset = `
                    ${basePath}.${extension} 1x,
                    ${basePath}@2x.${extension} 2x
                `.trim();
            }
        }
    });
};

// Инициализация всех оптимизаций изображений
export const initImageOptimizations = () => {
    addImageDimensions();
    handleLazyLoading();
    handleResponsiveImages();
    
    console.log('✓ Image optimizations initialized');
};
