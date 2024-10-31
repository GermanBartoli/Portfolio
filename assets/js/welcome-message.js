function aceptarBtnBienvenida(event) {
    enableScroll();
    // Agrega la clase 'oculto' al div para animar su ocultaci�n
    document.getElementById("mensaje").classList.add("oculto");

    restoreFocus(); // Restaurar foco despu�s de hacer clic


    document.getElementById("aHome").classList.remove("disabled-link");
    document.getElementById("aAbout").classList.remove("disabled-link");
    document.getElementById("aResume").classList.remove("disabled-link");
    document.getElementById("aSkills").classList.remove("disabled-link");
    document.getElementById("aPortfolio").classList.remove("disabled-link");
    document.getElementById("aContact").classList.remove("disabled-link");

    var mensaje = document.getElementById('mensaje');
    var elementosHijosDivMensaje = mensaje.querySelectorAll('*'); // Seleccionar todos los elementos hijos

    elementosHijosDivMensaje.forEach(function (elemento) {
        elemento.style.pointerEvents = 'none'; // Deshabilitar elementos hijos
    });

}

const allFocusableElements = document.querySelectorAll('button, [href], input, select, textarea');
const originalTabIndices = [];

// Funci�n para deshabilitar el foco
function disableFocus() {
    disableAudioFocus();
    allFocusableElements.forEach(element => {
        if (element.id !== "aceptarBtnBienvenida") { // Ignorar el bot�n espec�fico
            originalTabIndices.push(element.tabIndex); // Guardar el tabindex original
            element.tabIndex = -1; // Deshabilitar el foco
        }
    });

    //const aceptarBtn = document.getElementById("aceptarBtnBienvenida"); // Obtener el bot�n espec�fico
    //if (aceptarBtn) {
    //    aceptarBtn.tabIndex = 0; // Asegurarse de que el bot�n pueda recibir foco
    //    aceptarBtn.focus(); // Enfocar el bot�n espec�fico
    //}
}

// Funci�n para restaurar el foco
function restoreFocus() {
    allFocusableElements.forEach((element, index) => {
        element.tabIndex = originalTabIndices[index]; // Restaurar el tabindex original
    });

    const aceptarBtn = document.getElementById("aceptarBtnBienvenida"); // Obtener el bot�n espec�fico
    if (aceptarBtn) {
        aceptarBtn.tabIndex = -1; // Deshabilitar el foco en el bot�n
    }

    // Puedes enfocar el primer elemento, si lo deseas
    // allFocusableElements[0].focus(); // Volver a enfocar el primer elemento

    // Activar el foco en los elementos de audio
    const audioPlayer = document.getElementById('audio-player');
    const audioElements = audioPlayer.querySelectorAll('audio, span');

    audioElements.forEach(element => {
        element.tabIndex = 0; // Habilitar el foco en los elementos
    });
    // Puedes enfocar un elemento espec�fico o el primer elemento del audio player
    // audioElements[0].focus(); // Si deseas enfocar el primer elemento
}


// Llama a la funci�n para deshabilitar el foco en el audio
function disableAudioFocus() {
    const audioPlayer = document.getElementById('audio-player');
    const audioElements = audioPlayer.querySelectorAll('audio, span');

    audioElements.forEach(element => {
        element.tabIndex = -1; // Deshabilitar el foco
    });
}

//document.getElementById("aceptarBtnBienvenida").addEventListener("click", function () {
//    restoreFocus(); // Restaurar foco despu�s de hacer clic
//});

// evitar focus iframe
const iframeGoogleMaps = document.querySelector('iframeGoogleMaps');
iframeGoogleMaps.addEventListener('focus', (event) => {
    event.preventDefault();
    //document.querySelector('#otro-elemento').focus(); // Cambia '#otro-elemento' al selector del elemento que deseas enfocar
});

