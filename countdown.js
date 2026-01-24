// Countdown mejorado para IPUC LA FONDA

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== CONFIGURACIÓN DE CULTOS ==========
    const cultos = [
        { 
            day: 0, // Domingo (0 = Domingo, 1 = Lunes, etc.)
            start: "10:00", 
            end: "12:30", 
            name: "Culto Dominical",
            type: "domingo"
        },
        { 
            day: 2, // Martes
            start: "18:00", 
            end: "20:00", 
            name: "Culto de Oración",
            type: "martes"
        },
        { 
            day: 5, // Viernes
            start: "18:00", 
            end: "20:00", 
            name: "Culto Juvenil",
            type: "viernes"
        }
    ];
    
    // ========== ELEMENTOS DOM ==========
    const messageNow = document.getElementById('messageNow');
    const messageSoon = document.getElementById('messageSoon');
    const messageEnded = document.getElementById('messageEnded');
    
    const countDays = document.getElementById('countDays');
    const countHours = document.getElementById('countHours');
    const countMinutes = document.getElementById('countMinutes');
    const countSeconds = document.getElementById('countSeconds');
    const countProgress = document.getElementById('countProgress');
    
    const serviceType = document.getElementById('serviceType');
    const nextServiceTime = document.getElementById('nextServiceTime');
    
    const countdownMiniDays = document.querySelector('#countdownMini .countdown-item:nth-child(1) .number');
    const countdownMiniHours = document.querySelector('#countdownMini .countdown-item:nth-child(2) .number');
    const countdownMiniMinutes = document.querySelector('#countdownMini .countdown-item:nth-child(3) .number');
    const countdownMiniSeconds = document.querySelector('#countdownMini .countdown-item:nth-child(4) .number');
    
    // ========== FUNCIONES AUXILIARES ==========
    function padNumber(num) {
        return num.toString().padStart(2, '0');
    }
    
    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return { hours, minutes };
    }
    
    function getDayName(dayIndex) {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[dayIndex];
    }
    
    // ========== LÓGICA PRINCIPAL ==========
    function getNextCulto() {
        const now = new Date();
        const today = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Buscar el próximo culto
        for (let i = 0; i < 8; i++) { // Buscar en los próximos 7 días
            const targetDay = (today + i) % 7;
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + i);
            
            for (const culto of cultos) {
                if (culto.day === targetDay) {
                    const startTime = parseTime(culto.start);
                    const endTime = parseTime(culto.end);
                    
                    const startMinutes = startTime.hours * 60 + startTime.minutes;
                    const endMinutes = endTime.hours * 60 + endTime.minutes;
                    
                    // Si es hoy
                    if (i === 0) {
                        // Si el culto ya empezó pero no ha terminado
                        if (currentTime >= startMinutes && currentTime < endMinutes) {
                            return {
                                ...culto,
                                date: targetDate,
                                startMinutes,
                                endMinutes,
                                inProgress: true,
                                timeRemaining: endMinutes - currentTime
                            };
                        }
                        // Si el culto es más tarde hoy
                        else if (currentTime < startMinutes) {
                            targetDate.setHours(startTime.hours, startTime.minutes, 0, 0);
                            return {
                                ...culto,
                                date: targetDate,
                                startMinutes,
                                endMinutes,
                                timeUntil: startMinutes - currentTime
                            };
                        }
                    }
                    // Si es un día futuro
                    else if (currentTime < startMinutes || i > 0) {
                        targetDate.setHours(startTime.hours, startTime.minutes, 0, 0);
                        return {
                            ...culto,
                            date: targetDate,
                            startMinutes,
                            endMinutes,
                            timeUntil: (i * 24 * 60) + (startMinutes - (i === 0 ? currentTime : 0))
                        };
                    }
                }
            }
        }
        
        // Si no se encuentra ningún culto (no debería pasar)
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + (7 - today));
        nextSunday.setHours(10, 0, 0, 0);
        
        return {
            ...cultos[0],
            date: nextSunday,
            startMinutes: 600,
            endMinutes: 750
        };
    }
    
    // ========== ACTUALIZAR INTERFAZ ==========
    function updateCountdown() {
        const now = new Date();
        const nextCulto = getNextCulto();
        
        // Ocultar todos los mensajes
        messageNow.classList.remove('show');
        messageSoon.classList.remove('show');
        messageEnded.classList.remove('show');
        
        // Actualizar tipo de servicio
        if (serviceType) {
            serviceType.textContent = nextCulto.name;
        }
        
        // Actualizar próxima hora
        if (nextServiceTime) {
            const dayName = getDayName(nextCulto.day);
            const timeStr = nextCulto.start;
            nextServiceTime.textContent = `${dayName} ${timeStr}`;
        }
        
        // Si el culto está en progreso
        if (nextCulto.inProgress) {
            messageNow.classList.add('show');
            
            // Mostrar tiempo restante del culto
            const remaining = nextCulto.timeRemaining;
            const hours = Math.floor(remaining / 60);
            const minutes = remaining % 60;
            
            if (countDays) countDays.textContent = '00';
            if (countHours) countHours.textContent = padNumber(hours);
            if (countMinutes) countMinutes.textContent = padNumber(minutes);
            if (countSeconds) countSeconds.textContent = '00';
            
            // Actualizar contador mini
            if (countdownMiniDays) countdownMiniDays.textContent = '00';
            if (countdownMiniHours) countdownMiniHours.textContent = padNumber(hours);
            if (countdownMiniMinutes) countdownMiniMinutes.textContent = padNumber(minutes);
            if (countdownMiniSeconds) countdownMiniSeconds.textContent = '00';
            
            // Actualizar barra de progreso
            if (countProgress) {
                const totalDuration = nextCulto.endMinutes - nextCulto.startMinutes;
                const elapsed = totalDuration - remaining;
                const progress = (elapsed / totalDuration) * 100;
                countProgress.style.width = `${progress}%`;
            }
        }
        // Si el culto está por empezar
        else {
            const timeDiff = nextCulto.date.getTime() - now.getTime();
            
            if (timeDiff <= 0) {
                // Culto recién terminado
                messageEnded.classList.add('show');
                return;
            }
            
            // Calcular días, horas, minutos, segundos
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            // Actualizar contador principal
            if (countDays) countDays.textContent = padNumber(days);
            if (countHours) countHours.textContent = padNumber(hours);
            if (countMinutes) countMinutes.textContent = padNumber(minutes);
            if (countSeconds) countSeconds.textContent = padNumber(seconds);
            
            // Actualizar contador mini
            if (countdownMiniDays) countdownMiniDays.textContent = padNumber(days);
            if (countdownMiniHours) countdownMiniHours.textContent = padNumber(hours);
            if (countdownMiniMinutes) countdownMiniMinutes.textContent = padNumber(minutes);
            if (countdownMiniSeconds) countdownMiniSeconds.textContent = padNumber(seconds);
            
            // Mostrar mensaje "pronto" si faltan menos de 10 minutos
            if (days === 0 && hours === 0 && minutes < 10) {
                messageSoon.classList.add('show');
            }
            
            // Actualizar barra de progreso (para cultos del mismo día)
            if (countProgress && days === 0) {
                const totalMinutesUntil = nextCulto.timeUntil || (hours * 60 + minutes);
                const progress = Math.max(0, 100 - (totalMinutesUntil / 180) * 100); // Asumiendo 3 horas máximo
                countProgress.style.width = `${progress}%`;
            }
        }
    }
    
    // ========== INICIALIZACIÓN ==========
    
    // Actualizar inmediatamente
    updateCountdown();
    
    // Actualizar cada segundo
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Cerrar mensajes
    const messageCloses = document.querySelectorAll('.message-close');
    messageCloses.forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.classList.remove('show');
        });
    });
    
    // ========== FUNCIONES ADICIONALES ==========
    
    // Calcular siguiente culto basado en fecha específica
    function getNextCultoFromDate(date) {
        const now = date || new Date();
        const today = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Buscar el próximo culto
        for (let i = 0; i < 8; i++) {
            const targetDay = (today + i) % 7;
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + i);
            
            for (const culto of cultos) {
                if (culto.day === targetDay) {
                    const startTime = parseTime(culto.start);
                    const startMinutes = startTime.hours * 60 + startTime.minutes;
                    
                    // Si es hoy y ya pasó, o es un día futuro
                    if ((i === 0 && currentTime < startMinutes) || i > 0) {
                        targetDate.setHours(startTime.hours, startTime.minutes, 0, 0);
                        return {
                            ...culto,
                            date: targetDate,
                            startMinutes
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    // Obtener horario de la semana
    function getWeeklySchedule() {
        const now = new Date();
        const schedule = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            const day = date.getDay();
            
            const dayServices = cultos.filter(culto => culto.day === day);
            
            if (dayServices.length > 0) {
                schedule.push({
                    date: date,
                    dayName: getDayName(day),
                    services: dayServices
                });
            }
        }
        
        return schedule;
    }
    
    // Verificar si ahora mismo hay culto
    function isServiceNow() {
        const now = new Date();
        const today = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        for (const culto of cultos) {
            if (culto.day === today) {
                const startTime = parseTime(culto.start);
                const endTime = parseTime(culto.end);
                
                const startMinutes = startTime.hours * 60 + startTime.minutes;
                const endMinutes = endTime.hours * 60 + endTime.minutes;
                
                if (currentTime >= startMinutes && currentTime < endMinutes) {
                    return {
                        culto,
                        minutesElapsed: currentTime - startMinutes,
                        minutesRemaining: endMinutes - currentTime
                    };
                }
            }
        }
        
        return null;
    }
    
    // ========== EXPORTAR FUNCIONES (si es necesario) ==========
    window.IPUC = window.IPUC || {};
    window.IPUC.Countdown = {
        updateCountdown,
        getNextCulto,
        getWeeklySchedule,
        isServiceNow,
        getNextCultoFromDate
    };
    
    console.log('Countdown de IPUC LA FONDA inicializado correctamente');
});
