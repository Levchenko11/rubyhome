// Модуль для управления бургер-меню
export const handleBurgerMenu = () => {
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    const body = document.body;
    
    if (!burger || !nav) return;
    
    const toggleMenu = () => {
        const isActive = burger.classList.contains('header__burger--active');
        
        if (isActive) {
            // Закрываем меню
            burger.classList.remove('header__burger--active');
            nav.classList.remove('header__nav--active');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Открыть меню навигации');
            body.style.overflow = '';
        } else {
            // Открываем меню
            burger.classList.add('header__burger--active');
            nav.classList.add('header__nav--active');
            burger.setAttribute('aria-expanded', 'true');
            burger.setAttribute('aria-label', 'Закрыть меню навигации');
            body.style.overflow = 'hidden';
        }
    };
    
    // Обработчик клика по бургеру
    burger.addEventListener('click', toggleMenu);
    
    // Обработчик нажатия клавиш для бургера
    burger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
    
    // Закрытие меню при клике на ссылку
    const menuLinks = nav.querySelectorAll('.header__menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (burger.classList.contains('header__burger--active')) {
                toggleMenu();
            }
        });
    });
    
    // Закрытие меню при изменении размера экрана
    const handleResize = () => {
        if (window.innerWidth > 768 && burger.classList.contains('header__burger--active')) {
            toggleMenu();
        }
    };
    
    // Дебаунсинг для resize событий
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
    });
    
    // Закрытие меню при клике вне его области
    document.addEventListener('click', (e) => {
        if (burger.classList.contains('header__burger--active') && 
            !nav.contains(e.target) && 
            !burger.contains(e.target)) {
            toggleMenu();
        }
    });
    
    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && burger.classList.contains('header__burger--active')) {
            toggleMenu();
        }
    });
};
