// Модуль для валидации форм
export const handleFormValidation = () => {
    const modal = document.getElementById('requestModal');
    const form = modal?.querySelector('.modal__form');
    
    if (!form) return;
    
    // Добавляем индикатор прогресса формы
    addFormProgressIndicator(form);
    
    // Валидация полей в реальном времени
    const inputs = form.querySelectorAll('.modal__input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
            updateFormProgress(form);
        });
        input.addEventListener('input', () => {
            if (input.classList.contains('modal__input--error')) {
                validateField(input);
                updateFormProgress(form);
            }
        });
    });
    
    // Валидация чекбокса
    const checkbox = form.querySelector('.modal__checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            validateCheckbox(checkbox);
            updateFormProgress(form);
        });
    }
    
    // Обработка отправки формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // Валидация всех полей
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        // Валидация чекбокса
        if (checkbox && !validateCheckbox(checkbox)) {
            isValid = false;
        }
        
        if (isValid) {
            handleFormSubmit(form);
        } else {
            // Фокус на первом поле с ошибкой
            const firstErrorField = form.querySelector('.modal__input--error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            
            // Показываем общее сообщение об ошибке
            showFormError(form, 'Please correct the errors below and try again.');
        }
    });
    
    // Инициализируем CTA форму
    initCTAFormValidation();
};

// Валидация отдельного поля
export const validateField = (input) => {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    let isValid = true;
    let errorMessage = '';
    
    // Проверка на пустое поле
    if (!input.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    } else {
        // Специфичная валидация для разных типов полей
        switch (input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            case 'text':
                if (input.name === 'name' && input.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                }
                // Проверка на недопустимые символы в имени
                if (input.name === 'name' && !/^[a-zA-Zа-яА-Я\s\-']+$/.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Name contains invalid characters';
                }
                break;
        }
    }
    
    // Отображение ошибки
    if (errorElement) {
        if (!isValid) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('modal__error--visible');
            input.classList.add('modal__input--error');
            input.setAttribute('aria-invalid', 'true');
        } else {
            errorElement.textContent = '';
            errorElement.classList.remove('modal__error--visible');
            input.classList.remove('modal__input--error');
            input.setAttribute('aria-invalid', 'false');
        }
    }
    
    return isValid;
};

// Валидация чекбокса
export const validateCheckbox = (checkbox) => {
    const isValid = checkbox.checked;
    
    // Визуальная индикация ошибки для чекбокса
    const label = checkbox.closest('.modal__checkbox-label');
    if (label) {
        if (!isValid) {
            label.style.color = 'var(--error-color, #DC2626)';
            checkbox.setAttribute('aria-invalid', 'true');
        } else {
            label.style.color = '';
            checkbox.setAttribute('aria-invalid', 'false');
        }
    }
    
    return isValid;
};

// Обработка отправки формы
export const handleFormSubmit = (form) => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Показываем индикатор загрузки
    const submitBtn = form.querySelector('.modal__submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    
    // Создаем live region для объявления статуса
    const liveRegion = document.querySelector('[aria-live="polite"]') || 
                      createLiveRegion();
    
    // Имитация отправки данных (здесь можно добавить реальный запрос к API)
    setTimeout(() => {
        console.log('Form submitted:', data);
        
        // Объявляем успех через screen reader
        liveRegion.textContent = 'Форма успешно отправлена. Мы свяжемся с вами в ближайшее время.';
        
        // Показываем сообщение об успехе
        showSuccessMessage();
        
        // Закрываем модальное окно
        const modal = document.getElementById('requestModal');
        if (modal) {
            setTimeout(() => {
                modal.classList.remove('modal--active');
                modal.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
            }, 2000);
        }
        
        // Восстанавливаем кнопку
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.setAttribute('aria-busy', 'false');
        
        // Сбрасываем форму
        form.reset();
        
        // Очищаем live region
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 3000);
        
    }, 1500);
};

// Создание live region для screen readers
const createLiveRegion = () => {
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
    return liveRegion;
};

// Показ сообщения об успехе
const showSuccessMessage = () => {
    const modal = document.getElementById('requestModal');
    const modalContent = modal?.querySelector('.modal__content');
    
    if (!modalContent) return;
    
    // Создаем элемент успешного сообщения
    const successMessage = document.createElement('div');
    successMessage.className = 'modal__success';
    successMessage.innerHTML = `
        <div class="modal__success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#10B981"/>
                <path d="M20 32L28 40L44 24" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <h3 class="modal__success-title">Thank you!</h3>
        <p class="modal__success-text">Your request has been submitted successfully. We will contact you soon.</p>
    `;
    
    // Добавляем стили для сообщения об успехе
    const style = document.createElement('style');
    style.textContent = `
        .modal__success {
            text-align: center;
            padding: 40px 20px;
        }
        .modal__success-icon {
            margin-bottom: 20px;
        }
        .modal__success-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0 0 10px 0;
        }
        .modal__success-text {
            font-size: 16px;
            color: var(--text-secondary);
            margin: 0;
        }
    `;
    
    if (!document.querySelector('style[data-success-styles]')) {
        style.setAttribute('data-success-styles', 'true');
        document.head.appendChild(style);
    }
    
    // Заменяем содержимое модального окна
    modalContent.innerHTML = '';
    modalContent.appendChild(successMessage);
    
    // Фокус на сообщении для screen readers
    successMessage.setAttribute('tabindex', '-1');
    successMessage.focus();
};

// Добавление индикатора прогресса формы
const addFormProgressIndicator = (form) => {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'modal__progress';
    progressContainer.innerHTML = `
        <div class="modal__progress-bar">
            <div class="modal__progress-fill" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <span class="modal__progress-text">0% completed</span>
    `;
    
    // Добавляем стили для прогресса
    const style = document.createElement('style');
    style.textContent = `
        .modal__progress {
            margin-bottom: 20px;
            text-align: center;
        }
        .modal__progress-bar {
            width: 100%;
            height: 4px;
            background-color: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        .modal__progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #10b981);
            border-radius: 2px;
            transition: width 0.3s ease;
            width: 0%;
        }
        .modal__progress-text {
            font-size: 12px;
            color: var(--text-secondary);
        }
    `;
    
    if (!document.querySelector('style[data-progress-styles]')) {
        style.setAttribute('data-progress-styles', 'true');
        document.head.appendChild(style);
    }
    
    // Вставляем индикатор после заголовка
    const header = form.previousElementSibling;
    if (header) {
        header.insertAdjacentElement('afterend', progressContainer);
    }
};

// Обновление прогресса формы
const updateFormProgress = (form) => {
    const progressFill = document.querySelector('.modal__progress-fill');
    const progressText = document.querySelector('.modal__progress-text');
    
    if (!progressFill || !progressText) return;
    
    const inputs = form.querySelectorAll('.modal__input');
    const checkbox = form.querySelector('.modal__checkbox');
    const totalFields = inputs.length + (checkbox ? 1 : 0);
    
    let completedFields = 0;
    
    // Проверяем заполненность полей
    inputs.forEach(input => {
        if (input.value.trim() && !input.classList.contains('modal__input--error')) {
            completedFields++;
        }
    });
    
    // Проверяем чекбокс
    if (checkbox && checkbox.checked) {
        completedFields++;
    }
    
    const progress = Math.round((completedFields / totalFields) * 100);
    
    progressFill.style.width = `${progress}%`;
    progressFill.setAttribute('aria-valuenow', progress);
    progressText.textContent = `${progress}% completed`;
};

// Показ общей ошибки формы
const showFormError = (form, message) => {
    let errorContainer = form.querySelector('.modal__form-error');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'modal__form-error';
        errorContainer.setAttribute('role', 'alert');
        errorContainer.setAttribute('aria-live', 'polite');
        
        // Добавляем стили для общей ошибки
        const style = document.createElement('style');
        style.textContent = `
            .modal__form-error {
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 20px;
                color: #dc2626;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .modal__form-error::before {
                content: "⚠️";
                font-size: 16px;
            }
        `;
        
        if (!document.querySelector('style[data-form-error-styles]')) {
            style.setAttribute('data-form-error-styles', 'true');
            document.head.appendChild(style);
        }
        
        form.insertBefore(errorContainer, form.firstChild);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'flex';
    
    // Скрываем через 5 секунд
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
};

// Инициализация валидации CTA формы
const initCTAFormValidation = () => {
    const ctaForm = document.querySelector('.cta__form');
    if (!ctaForm) return;
    
    const emailInput = ctaForm.querySelector('.cta__input');
    const submitBtn = ctaForm.querySelector('.cta__btn');
    
    if (!emailInput || !submitBtn) return;
    
    // Валидация email в реальном времени
    emailInput.addEventListener('input', () => {
        const isValid = validateCTAEmail(emailInput);
        submitBtn.disabled = !isValid;
    });
    
    // Обработка отправки
    ctaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateCTAEmail(emailInput)) {
            handleCTASubmit(ctaForm, emailInput, submitBtn);
        }
    });
};

// Валидация email в CTA форме
const validateCTAEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = input.value.trim() && emailRegex.test(input.value);
    
    input.classList.toggle('cta__input--error', !isValid && input.value.trim());
    
    return isValid;
};

// Обработка отправки CTA формы
const handleCTASubmit = (form, emailInput, submitBtn) => {
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;
    
    // Имитация отправки
    setTimeout(() => {
        // Показываем успешное сообщение
        showCTASuccess(form);
        
        // Сбрасываем форму
        emailInput.value = '';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    }, 1500);
};

// Показ успешного сообщения для CTA формы
const showCTASuccess = (form) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'cta__success';
    successMessage.innerHTML = `
        <div class="cta__success-icon">✓</div>
        <span class="cta__success-text">Thank you for subscribing!</span>
    `;
    
    // Добавляем стили для успешного сообщения
    const style = document.createElement('style');
    style.textContent = `
        .cta__success {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 6px;
            color: #166534;
            font-weight: 500;
            margin-top: 12px;
        }
        .cta__success-icon {
            width: 20px;
            height: 20px;
            background-color: #22c55e;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        .cta__input--error {
            border-color: #dc2626 !important;
            box-shadow: 0 0 0 1px #dc2626 !important;
        }
    `;
    
    if (!document.querySelector('style[data-cta-success-styles]')) {
        style.setAttribute('data-cta-success-styles', 'true');
        document.head.appendChild(style);
    }
    
    form.appendChild(successMessage);
    
    // Удаляем сообщение через 3 секунды
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
};
