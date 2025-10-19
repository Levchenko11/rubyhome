// Модуль для управления модальным окном
export const handleModal = () => {
    const modal = document.getElementById('requestModal');
    const modalOverlay = modal?.querySelector('.modal__overlay');
    const modalClose = modal?.querySelector('.modal__close');
    const modalForm = modal?.querySelector('.modal__form');
    const body = document.body;
    
    // Кнопки для открытия модального окна
    const openModalBtns = document.querySelectorAll('.header__contact-btn, .hero__btn, .property-card__btn');
    
    if (!modal) return;
    
    // Элементы для управления фокусом
    let focusableElements = [];
    let firstFocusableElement = null;
    let lastFocusableElement = null;
    
    // Получаем все фокусируемые элементы в модальном окне
    const updateFocusableElements = () => {
        focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
    };
    
    // Функция открытия модального окна
    const openModal = () => {
        modal.classList.add('modal--active');
        modal.setAttribute('aria-hidden', 'false');
        body.classList.add('modal-open');
        
        updateFocusableElements();
        
        // Фокус на первом элементе формы с задержкой для анимации
        setTimeout(() => {
            const firstInput = modal.querySelector('.modal__input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    };
    
    // Функция закрытия модального окна
    const closeModal = () => {
        modal.classList.remove('modal--active');
        modal.setAttribute('aria-hidden', 'true');
        body.classList.remove('modal-open');
        
        // Сброс формы при закрытии
        if (modalForm) {
            modalForm.reset();
            clearFormErrors();
            resetRadioButtons();
        }
    };
    
    // Сброс ошибок формы
    const clearFormErrors = () => {
        const errors = modal.querySelectorAll('.modal__error');
        errors.forEach(error => {
            error.classList.remove('modal__error--visible');
            error.textContent = '';
        });
        
        const inputs = modal.querySelectorAll('.modal__input');
        inputs.forEach(input => {
            input.classList.remove('modal__input--error');
        });
    };
    
    // Сброс радио-кнопок
    const resetRadioButtons = () => {
        const radioButtons = modal.querySelectorAll('.modal__radio-button');
        radioButtons.forEach(button => {
            button.classList.remove('modal__radio-button--active');
        });
        
        // Активируем первую кнопку (Buy)
        const firstRadio = modal.querySelector('.modal__radio[value="buy"]');
        const firstButton = modal.querySelector('.modal__radio-button');
        if (firstRadio && firstButton) {
            firstRadio.checked = true;
            firstButton.classList.add('modal__radio-button--active');
        }
    };
    
    // Управление фокусом в модальном окне
    const trapFocus = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    };
    
    // Обработчики для открытия модального окна
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
        
        // Поддержка клавиатуры
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
    });
    
    // Обработчик для закрытия модального окна
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
        
        modalClose.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeModal();
            }
        });
    }
    
    // Закрытие по клику на overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    // Закрытие по Escape и управление фокусом
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('modal--active')) {
            if (e.key === 'Escape') {
                closeModal();
            } else {
                trapFocus(e);
            }
        }
    });
    
    // Обработка радио-кнопок
    const radioInputs = modal.querySelectorAll('.modal__radio');
    const radioButtons = modal.querySelectorAll('.modal__radio-button');
    
    radioInputs.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            // Убираем активный класс со всех кнопок
            radioButtons.forEach(btn => btn.classList.remove('modal__radio-button--active'));
            
            // Добавляем активный класс к выбранной кнопке
            if (radio.checked) {
                radioButtons[index].classList.add('modal__radio-button--active');
            }
        });
    });
    
    // Обработка кликов по кастомным радио-кнопкам
    radioButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const radio = radioInputs[index];
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        });
    });
    
    // Улучшенная поддержка ARIA
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Добавляем aria-live для объявления изменений
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    
    // Объявляем открытие модального окна
    const announceModalOpen = () => {
        liveRegion.textContent = 'Модальное окно открыто. Заполните форму заявки.';
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    };
    
    // Добавляем объявление при открытии
    const originalOpenModal = openModal;
    const enhancedOpenModal = () => {
        originalOpenModal();
        announceModalOpen();
    };
    
    // Заменяем обработчики на улучшенную версию
    openModalBtns.forEach(btn => {
        btn.removeEventListener('click', openModal);
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            enhancedOpenModal();
        });
    });
};
