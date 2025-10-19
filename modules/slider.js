// Модуль для управления слайдером отзывов
export const handleReviewsSlider = () => {
    const slider = document.querySelector('.reviews__slider');
    const track = document.querySelector('.reviews__track');
    const cards = document.querySelectorAll('.review-card');
    const prevBtn = document.querySelector('.reviews__nav-btn--prev');
    const nextBtn = document.querySelector('.reviews__nav-btn--next');
    const dots = document.querySelectorAll('.reviews__dot');
    
    if (!slider || !track || !cards.length || !prevBtn || !nextBtn || !dots.length) return;
    
    let currentIndex = 0;
    let cardsPerView = 2; // По умолчанию показываем 2 карточки
    
    // Определяем количество карточек для показа в зависимости от ширины экрана
    const updateCardsPerView = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 768) {
            cardsPerView = 1;
        } else if (screenWidth <= 1024) {
            cardsPerView = 2;
        } else {
            cardsPerView = 2;
        }
    };
    
    // Обновляем позицию слайдера с улучшенной производительностью
    const updateSliderPosition = () => {
        const cardWidth = cards[0].offsetWidth;
        const gap = 30;
        const offset = currentIndex * (cardWidth + gap);
        
        // Используем transform для лучшей производительности
        track.style.transform = `translateX(-${offset}px)`;
        
        // Обновляем состояние кнопок
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - cardsPerView;
        
        // Обновляем точки навигации с ARIA
        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle('reviews__dot--active', isActive);
            dot.setAttribute('aria-pressed', isActive.toString());
        });
    };
    
    // Переход к следующему слайду
    const nextSlide = () => {
        if (currentIndex < cards.length - cardsPerView) {
            currentIndex++;
            updateSliderPosition();
        }
    };
    
    // Переход к предыдущему слайду
    const prevSlide = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    };
    
    // Переход к конкретному слайду
    const goToSlide = (index) => {
        if (index >= 0 && index <= cards.length - cardsPerView) {
            currentIndex = index;
            updateSliderPosition();
        }
    };
    
    // Обработчики событий
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Обработчики для точек навигации
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
        
        // Поддержка клавиатуры для точек
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
            }
        });
    });
    
    // Поддержка клавиатуры для кнопок навигации
    prevBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            prevSlide();
        }
    });
    
    nextBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        }
    });
    
    // Поддержка стрелок клавиатуры для навигации по слайдеру
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        }
    });
    
    // Поддержка свайпов на мобильных устройствах
    let startX = 0;
    let endX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    }, { passive: false });
    
    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) { // Минимальное расстояние для свайпа
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        isDragging = false;
    }, { passive: true });
    
    // Обработчик изменения размера окна с дебаунсингом
    let resizeTimeout;
    const handleResize = () => {
        updateCardsPerView();
        // Корректируем текущий индекс если необходимо
        if (currentIndex > cards.length - cardsPerView) {
            currentIndex = Math.max(0, cards.length - cardsPerView);
        }
        updateSliderPosition();
    };
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
    });
    
    // Инициализация
    updateCardsPerView();
    updateSliderPosition();
    
    // Добавляем ARIA атрибуты для улучшения доступности
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-label', 'Слайдер отзывов клиентов');
    track.setAttribute('role', 'group');
    
    // Устанавливаем tabindex для навигации с клавиатуры
    slider.setAttribute('tabindex', '0');
};
