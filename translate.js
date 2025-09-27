// Sistema de traducción para Futuros Ancestrales
// Widget de Google Translate que se puede mostrar/ocultar

let googleTranslateVisible = false;

// Función principal - alternar visibilidad de Google Translate
function translatePage() {
    const translateBtn = document.getElementById('translate-btn');
    const googleElement = document.getElementById('google_translate_element');

    if (!translateBtn || !googleElement) return;

    googleTranslateVisible = !googleTranslateVisible;

    if (googleTranslateVisible) {
        showGoogleTranslate();
        translateBtn.textContent = 'Ocultar Traductor';
    } else {
        hideGoogleTranslate();
        translateBtn.textContent = 'Translate';
    }

    // Sincronizar estado
    localStorage.setItem('futuros-ancestrales-translate-visible', googleTranslateVisible.toString());
    broadcastTranslationToggle(googleTranslateVisible);
}

// Función para mostrar Google Translate
function showGoogleTranslate() {
    const googleElement = document.getElementById('google_translate_element');
    if (googleElement) {
        googleElement.style.display = 'block';
        googleElement.style.visibility = 'visible';
    }
}

// Función para ocultar Google Translate
function hideGoogleTranslate() {
    const googleElement = document.getElementById('google_translate_element');
    if (googleElement) {
        googleElement.style.display = 'none';
        googleElement.style.visibility = 'hidden';
    }
}

// Función para actualizar texto del botón
function updateButtonText() {
    const translateBtn = document.getElementById('translate-btn');
    if (translateBtn) {
        translateBtn.textContent = googleTranslateVisible ? 'Ocultar Traductor' : 'Translate';
    }
}

// Función para comunicar cambios entre pestañas
function broadcastTranslationToggle(visible) {
    if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('translation-sync');
        channel.postMessage({ type: 'toggle-translator', visible });
        channel.close();
    }
}

// Función para escuchar cambios desde otras pestañas
function listenForTranslationChanges() {
    if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('translation-sync');
        channel.addEventListener('message', (event) => {
            if (event.data.type === 'toggle-translator' && event.data.visible !== googleTranslateVisible) {
                googleTranslateVisible = event.data.visible;
                if (googleTranslateVisible) {
                    showGoogleTranslate();
                } else {
                    hideGoogleTranslate();
                }
                updateButtonText();
            }
        });
    }

    // localStorage fallback para navegadores sin BroadcastChannel
    window.addEventListener('storage', (e) => {
        if (e.key === 'futuros-ancestrales-translate-visible') {
            const visible = e.newValue === 'true';
            if (visible !== googleTranslateVisible) {
                googleTranslateVisible = visible;
                if (googleTranslateVisible) {
                    showGoogleTranslate();
                } else {
                    hideGoogleTranslate();
                }
                updateButtonText();
            }
        }
    });
}

// Función para inicializar Google Translate
function initializeGoogleTranslate() {
    window.googleTranslateElementInit = function () {
        if (window.google && window.google.translate) {
            new window.google.translate.TranslateElement({
                pageLanguage: 'es',
                includedLanguages: 'en,es,pt,fr,de,it,ru,ja,zh,ar',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
                multilanguagePage: true
            }, 'google_translate_element');

            // Verificar si debe estar visible según el estado guardado
            const visible = localStorage.getItem('futuros-ancestrales-translate-visible') === 'true';
            if (visible) {
                googleTranslateVisible = true;
                showGoogleTranslate();
                updateButtonText();
            }
        }
    };

    // Cargar script de Google Translate si no existe
    if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.head.appendChild(script);
    }
}

// Crear elemento para Google Translate
function createGoogleTranslateElement() {
    if (!document.getElementById('google_translate_element')) {
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.cssText = `
            display: none;
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 1000;
            background-color: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(div);
    }
}

// Función para agregar estilos de Google Translate
function addGoogleTranslateStyles() {
    if (!document.getElementById('google-translate-styles')) {
        const style = document.createElement('style');
        style.id = 'google-translate-styles';
        style.textContent = `
            .goog-te-gadget-simple {
                background-color: white !important;
                border: 1px solid #ccc !important;
                border-radius: 3px !important;
                padding: 5px !important;
                font-size: 13px !important;
            }
            
            body, body.translated-ltr, body.translated-rtl {
                top: 0px !important;
                position: static !important;
            }
            
            #translate-btn {
                cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function () {
    createGoogleTranslateElement();
    addGoogleTranslateStyles();
    initializeGoogleTranslate();
    listenForTranslationChanges();

    // Verificar estado inicial
    const visible = localStorage.getItem('futuros-ancestrales-translate-visible') === 'true';
    googleTranslateVisible = visible;
    updateButtonText();
});