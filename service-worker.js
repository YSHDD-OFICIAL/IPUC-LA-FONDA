// ============================================
// DETECCIÓN DE INSTALACIÓN PWA
// ============================================
let deferredPrompt;
const installBanner = document.createElement('div');
installBanner.id = 'pwa-install-banner';
installBanner.className = 'pwa-install-banner hidden';
installBanner.innerHTML = `
    <div class="install-banner-content">
        <div class="install-banner-icon">
            <img src="ipuclafonda.png" alt="IPUC LA FONDA" width="48" height="48">
        </div>
        <div class="install-banner-text">
            <strong>IPUC LA FONDA</strong>
            <p>Instala esta aplicación en tu dispositivo</p>
        </div>
        <button class="btn-primary btn-sm" id="btn-install-app">
            <i class="bx bx-download"></i> Instalar
        </button>
        <button class="btn-icon" id="btn-dismiss-install" aria-label="Cerrar">
            <i class="bx bx-x"></i>
        </button>
    </div>
`;
document.body.appendChild(installBanner);

// Capturar el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.remove('hidden');
    console.log('📱 beforeinstallprompt capturado - Banner de instalación mostrado');
});

// Botón de instalar
document.getElementById('btn-install-app')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📱 Usuario ${outcome === 'accepted' ? 'instaló' : 'rechazó'} la app`);
    deferredPrompt = null;
    installBanner.classList.add('hidden');
});

// Botón de cerrar banner
document.getElementById('btn-dismiss-install')?.addEventListener('click', () => {
    installBanner.classList.add('hidden');
});

// Detectar si ya está instalada
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');
    installBanner.classList.add('hidden');
    deferredPrompt = null;
});
