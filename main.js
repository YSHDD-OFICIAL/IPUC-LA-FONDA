// Main JavaScript para IPUC LA FONDA

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== PRELOADER ==========
    const preloader = document.getElementById('preloader');
    
    // Ocultar preloader después de que todo cargue
    window.addEventListener('load', function() {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1500);
    });
    
    // ========== HEADER Y NAVEGACIÓN ==========
    const header = document.querySelector('.header');
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    
    // Toggle del menú móvil
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 991) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Dropdown en móvil
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.dropdown-menu');
        
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 991) {
                e.preventDefault();
                dropdown.classList.toggle('show');
            }
        });
    });
    
    // Header scroll effect
    function updateHeader() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateHeader);
    updateHeader();
    
    // ========== SCROLL TO TOP ==========
    const scrollTopBtn = document.getElementById('scrollTop');
    
    function updateScrollTop() {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', updateScrollTop);
    updateScrollTop();
    
    // ========== TYPEWRITER EFFECT ==========
    const typewriterElement = document.getElementById('typewriter');
    const typewriterTexts = [
        'cree en Jesús',
        'enseña la Biblia',
        'ama a las personas',
        'busca a Dios',
        'sirve a la comunidad',
        'transforma vidas'
    ];
    let typewriterIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isEnd = false;
    
    function typeWriter() {
        const currentText = typewriterTexts[typewriterIndex];
        
        if (!isDeleting) {
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentText.length) {
                isEnd = true;
                isDeleting = true;
                setTimeout(typeWriter, 2000);
                return;
            }
        } else {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                isEnd = false;
                typewriterIndex = (typewriterIndex + 1) % typewriterTexts.length;
            }
        }
        
        const speed = isDeleting ? 50 : 100;
        setTimeout(typeWriter, isEnd ? 2000 : speed);
    }
    
    // Iniciar typewriter cuando el elemento esté en el viewport
    function startTypewriterWhenVisible() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                typeWriter();
                observer.disconnect();
            }
        });
        
        if (typewriterElement) {
            observer.observe(typewriterElement);
        }
    }
    
    startTypewriterWhenVisible();
    
    // ========== ANIMACIÓN DE PALABRAS CAMBIANTES ==========
    const changingWordElement = document.getElementById('changing-word');
    const changingWords = ["Amor", "Justicia", "Unidad", "Santidad", "Gratitud", "Humildad", "Esperanza", "Fe", "Paz"];
    let currentWordIndex = 0;
    
    function changeWord() {
        changingWordElement.style.animation = 'none';
        setTimeout(() => {
            currentWordIndex = (currentWordIndex + 1) % changingWords.length;
            changingWordElement.textContent = changingWords[currentWordIndex];
            changingWordElement.style.animation = 'fadeInUp 0.5s ease forwards';
        }, 100);
    }
    
    // Cambiar palabra cada 3 segundos
    if (changingWordElement) {
        setInterval(changeWord, 3000);
    }
    
    // ========== VERSÍCULOS DE LA BIBLIA ==========
    const verseText = document.querySelector('.verse-text');
    const verseReference = document.querySelector('.verse-reference');
    const prevVerseBtn = document.getElementById('prevVerse');
    const nextVerseBtn = document.getElementById('nextVerse');
    
    const bibleVerses = [
        {
            text: '"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."',
            reference: 'Juan 3:16'
        },
        {
            text: '"Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán."',
            reference: 'Isaías 40:31'
        },
        {
            text: '"Todo lo puedo en Cristo que me fortalece."',
            reference: 'Filipenses 4:13'
        },
        {
            text: '"Fiel es Dios, por el cual fuisteis llamados a la comunión con su Hijo Jesucristo nuestro Señor."',
            reference: '1 Corintios 1:9'
        },
        {
            text: '"Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados."',
            reference: 'Romanos 8:28'
        }
    ];
    
    let currentVerseIndex = 0;
    
    function updateVerse() {
        verseText.style.opacity = '0';
        verseReference.style.opacity = '0';
        
        setTimeout(() => {
            verseText.textContent = bibleVerses[currentVerseIndex].text;
            verseReference.textContent = bibleVerses[currentVerseIndex].reference;
            
            verseText.style.opacity = '1';
            verseReference.style.opacity = '1';
        }, 300);
    }
    
    prevVerseBtn.addEventListener('click', function() {
        currentVerseIndex = (currentVerseIndex - 1 + bibleVerses.length) % bibleVerses.length;
        updateVerse();
    });
    
    nextVerseBtn.addEventListener('click', function() {
        currentVerseIndex = (currentVerseIndex + 1) % bibleVerses.length;
        updateVerse();
    });
    
    // Cambiar versículo automáticamente cada 30 segundos
    setInterval(() => {
        currentVerseIndex = (currentVerseIndex + 1) % bibleVerses.length;
        updateVerse();
    }, 30000);
    
    // ========== RADIO PLAYER ==========
    const radioPlayer = document.getElementById('radioPlayer');
    const playPauseBtn = document.getElementById('playPause');
    const playIcon = document.getElementById('playIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeToggle = document.getElementById('volumeToggle');
    const volumeIcon = document.getElementById('volumeIcon');
    const favoriteToggle = document.getElementById('favoriteToggle');
    const favoriteIcon = document.getElementById('favoriteIcon');
    const playerStatus = document.getElementById('playerStatus');
    const radioProgress = document.getElementById('radioProgress');
    const shareRadioBtn = document.getElementById('shareRadio');
    const listenerCount = document.getElementById('listenerCount');
    
    let isPlaying = false;
    let isFavorite = false;
    let isMuted = false;
    let savedVolume = 80;
    let listeners = 125;
    
    // Play/Pause
    playPauseBtn.addEventListener('click', function() {
        if (isPlaying) {
            radioPlayer.pause();
        } else {
            radioPlayer.play().catch(e => {
                console.error('Error al reproducir radio:', e);
                showToast('Error', 'No se pudo conectar a la radio. Intenta de nuevo.', 'error');
            });
        }
    });
    
    radioPlayer.addEventListener('play', function() {
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
        playerStatus.textContent = 'Reproduciendo...';
        playPauseBtn.classList.add('playing');
    });
    
    radioPlayer.addEventListener('pause', function() {
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        playerStatus.textContent = 'Pausado';
        playPauseBtn.classList.remove('playing');
    });
    
    // Error handling
    radioPlayer.addEventListener('error', function() {
        showToast('Error de conexión', 'No se pudo conectar a la radio. Intenta de nuevo.', 'error');
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        playerStatus.textContent = 'Error de conexión';
    });
    
    // Volume control
    volumeSlider.addEventListener('input', function() {
        const volume = this.value / 100;
        radioPlayer.volume = volume;
        savedVolume = this.value;
        
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    });
    
    // Toggle mute
    volumeToggle.addEventListener('click', function() {
        isMuted = !isMuted;
        
        if (isMuted) {
            radioPlayer.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.className = 'fas fa-volume-mute';
        } else {
            radioPlayer.volume = savedVolume / 100;
            volumeSlider.value = savedVolume;
            
            if (savedVolume === 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (savedVolume < 50) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        }
    });
    
    // Favorite toggle
    favoriteToggle.addEventListener('click', function() {
        isFavorite = !isFavorite;
        
        if (isFavorite) {
            favoriteIcon.className = 'fas fa-heart';
            favoriteIcon.style.color = '#e31837';
            showToast('Añadido a favoritos', 'Radio IPUC se ha añadido a tus favoritos.', 'success');
        } else {
            favoriteIcon.className = 'far fa-heart';
            favoriteIcon.style.color = '';
            showToast('Eliminado de favoritos', 'Radio IPUC se ha eliminado de tus favoritos.', 'info');
        }
    });
    
    // Share radio
    shareRadioBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: 'Radio IPUC - En Vivo',
                text: 'Escucha Radio IPUC en vivo desde la página de IPUC LA FONDA',
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback para navegadores que no soportan Web Share API
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('Enlace copiado', 'El enlace se ha copiado al portapapeles.', 'success');
            });
        }
    });
    
    // Simular oyentes en vivo
    function updateListeners() {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        listeners = Math.max(100, listeners + change);
        listenerCount.textContent = listeners;
    }
    
    setInterval(updateListeners, 10000);
    
    // ========== TESTIMONIALS SLIDER ==========
    const testimonialSlider = document.getElementById('testimonialSlider');
    const prevTestimonialBtn = document.getElementById('prevTestimonial');
    const nextTestimonialBtn = document.getElementById('nextTestimonial');
    const testimonialDots = document.getElementById('testimonialDots');
    
    const testimonials = [
        {
            content: '"La IPUC LA FONDA ha sido una bendición en mi vida. He encontrado una comunidad amorosa y un lugar donde puedo crecer espiritualmente."',
            author: "Alma Paredes",
            role: "Miembro desde 2018"
        },
        {
            content: '"Gracias a la IPUC LA FONDA, mi familia y yo hemos encontrado un hogar espiritual. Estamos muy agradecidos por todo el apoyo y las enseñanzas."',
            author: "Nodier",
            role: "Miembro desde 2020"
        },
        {
            content: '"Las enseñanzas bíblicas y el apoyo de la comunidad han transformado mi vida. Hoy soy una persona diferente gracias a Dios y a esta iglesia."',
            author: "María Rodríguez",
            role: "Miembro desde 2019"
        },
        {
            content: '"Los cultos juveniles han sido fundamentales para que mis hijos encuentren buenas amistades y crezcan en su fe."',
            author: "Familia González",
            role: "Miembros desde 2021"
        }
    ];
    
    let currentTestimonialIndex = 0;
    
    function createTestimonialSlides() {
        testimonialSlider.innerHTML = '';
        testimonialDots.innerHTML = '';
        
        testimonials.forEach((testimonial, index) => {
            // Crear slide
            const slide = document.createElement('div');
            slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <div class="testimonial-content">
                    ${testimonial.content}
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.author)}&background=${encodeURIComponent('#1a4f8b')}&color=fff&size=100" alt="${testimonial.author}">
                    </div>
                    <div class="author-info">
                        <h4>${testimonial.author}</h4>
                        <p>${testimonial.role}</p>
                    </div>
                </div>
            `;
            testimonialSlider.appendChild(slide);
            
            // Crear dot
            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToTestimonial(index));
            testimonialDots.appendChild(dot);
        });
    }
    
    function goToTestimonial(index) {
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.slider-dot');
        
        slides[currentTestimonialIndex].classList.remove('active');
        dots[currentTestimonialIndex].classList.remove('active');
        
        currentTestimonialIndex = index;
        
        slides[currentTestimonialIndex].classList.add('active');
        dots[currentTestimonialIndex].classList.add('active');
    }
    
    function nextTestimonial() {
        const nextIndex = (currentTestimonialIndex + 1) % testimonials.length;
        goToTestimonial(nextIndex);
    }
    
    function prevTestimonial() {
        const prevIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
        goToTestimonial(prevIndex);
    }
    
    prevTestimonialBtn.addEventListener('click', prevTestimonial);
    nextTestimonialBtn.addEventListener('click', nextTestimonial);
    
    // Auto-rotación de testimonios
    let testimonialInterval = setInterval(nextTestimonial, 8000);
    
    // Pausar auto-rotación al interactuar
    [prevTestimonialBtn, nextTestimonialBtn, testimonialDots].forEach(element => {
        if (element) {
            element.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
            element.addEventListener('mouseleave', () => {
                testimonialInterval = setInterval(nextTestimonial, 8000);
            });
        }
    });
    
    // Crear slides al cargar
    createTestimonialSlides();
    
    // ========== TOAST NOTIFICATIONS ==========
    const toastContainer = document.getElementById('toastContainer');
    
    function showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${getToastIcon(type)}
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Remover al hacer clic en el botón cerrar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        });
    }
    
    function getToastIcon(type) {
        switch(type) {
            case 'success': return '<i class="fas fa-check-circle"></i>';
            case 'warning': return '<i class="fas fa-exclamation-triangle"></i>';
            case 'error': return '<i class="fas fa-times-circle"></i>';
            default: return '<i class="fas fa-info-circle"></i>';
        }
    }
    
    // ========== MODAL DE PETICIÓN DE ORACIÓN ==========
    const prayerModal = document.getElementById('prayerModal');
    const prayerBtn = document.getElementById('prayer-btn');
    const prayerForm = document.getElementById('prayerForm');
    const modalClose = document.querySelector('.modal-close');
    
    prayerBtn.addEventListener('click', function() {
        prayerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    modalClose.addEventListener('click', function() {
        prayerModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Cerrar modal al hacer clic fuera
    prayerModal.addEventListener('click', function(e) {
        if (e.target === prayerModal) {
            prayerModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Enviar formulario de oración
    prayerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simular envío
        showToast('Petición enviada', 'Tu petición de oración ha sido enviada. Estaremos orando por ti.', 'success');
        
        // Cerrar modal
        prayerModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Resetear formulario
        prayerForm.reset();
    });
    
    // ========== BOTÓN "RECORDARME" PARA CULTOS ==========
    const notifyMeBtn = document.getElementById('notifyMe');
    const serviceBtns = document.querySelectorAll('.btn-service');
    
    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            showToast("Notificaciones no soportadas", "Tu navegador no soporta notificaciones.", "warning");
            return false;
        }
        
        if (Notification.permission === "granted") {
            return true;
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    showToast("Notificaciones activadas", "Recibirás recordatorios de los cultos.", "success");
                    return true;
                }
            });
        }
        
        return false;
    }
    
    function scheduleNotification(title, body, delay) {
        if (!("Notification" in window) || Notification.permission !== "granted") {
            return;
        }
        
        setTimeout(() => {
            new Notification(title, {
                body: body,
                icon: 'assets/icons/notification-icon.png'
            });
        }, delay);
    }
    
    notifyMeBtn.addEventListener('click', function() {
        if (requestNotificationPermission()) {
            // Aquí se programaría la notificación para el próximo culto
            showToast("Recordatorio activado", "Te notificaremos antes del próximo culto.", "success");
        }
    });
    
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            if (requestNotificationPermission()) {
                showToast(
                    `Recordatorio para ${days[day]}`,
                    "Recibirás una notificación antes del culto.",
                    "success"
                );
            }
        });
    });
    
    // ========== MAPA INTERACTIVO ==========
    const loadMapBtn = document.getElementById('loadMap');
    const mapContainer = document.getElementById('mapContainer');
    
    loadMapBtn.addEventListener('click', function() {
        // Simular carga de mapa
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        this.disabled = true;
        
        setTimeout(() => {
            mapContainer.innerHTML = `
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.681262113223!2d-76.53690782433133!3d3.451946796508122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30a6a4c8b5c3a5%3A0x5f5c5e5b5a5b5c5d!2sCali%2C%20Valle%20del%20Cauca%2C%20Colombia!5e0!3m2!1ses!2ses!4v1631234567890!5m2!1ses!2ses" 
                    width="100%" 
                    height="500" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy">
                </iframe>
            `;
        }, 1500);
    });
    
    // ========== FORMULARIO DE NEWSLETTER ==========
    const newsletterForm = document.getElementById('newsletterForm');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        // Simular envío
        showToast("Suscripción exitosa", "Gracias por suscribirte a nuestro boletín.", "success");
        
        // Resetear formulario
        this.reset();
    });
    
    // ========== BOTÓN "CÓMO LLEGAR" ==========
    const getDirectionsBtn = document.getElementById('getDirections');
    
    getDirectionsBtn.addEventListener('click', function() {
        const address = "IPUC LA FONDA, Cali, Valle del Cauca, Colombia";
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    });
    
    // ========== ACTUALIZAR AÑO EN FOOTER ==========
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // ========== LAZY LOADING DE IMÁGENES ==========
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // ========== ANIMACIONES AL SCROLL ==========
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    scrollRevealElements.forEach(element => {
        scrollObserver.observe(element);
    });
    
    // ========== PERFORMANCE OPTIMIZATIONS ==========
    
    // Debounce para eventos de scroll y resize
    function debounce(func, wait = 20, immediate = true) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    // Optimizar eventos de scroll
    const optimizedScroll = debounce(updateHeader, 10);
    window.addEventListener('scroll', optimizedScroll);
    
    // Service Worker para PWA (opcional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registrado con éxito: ', registration.scope);
            }).catch(error => {
                console.log('Error al registrar ServiceWorker: ', error);
            });
        });
    }
    
    // ========== INICIALIZACIÓN FINAL ==========
    console.log('IPUC LA FONDA - Web App inicializada correctamente');
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showToast('¡Bienvenido!', 'Gracias por visitar IPUC LA FONDA. Dios te bendiga.', 'info');
    }, 2000);
});
