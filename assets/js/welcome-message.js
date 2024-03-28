function aceptarBtnBienvenida(event) {
    enableScroll();
    // Agrega la clase 'oculto' al div para animar su ocultación
    document.getElementById("mensaje").classList.add("oculto");

    document.getElementById("aHome").classList.remove("disabled-link");
    document.getElementById("aAbout").classList.remove("disabled-link");
    document.getElementById("aResume").classList.remove("disabled-link");
    document.getElementById("aSkills").classList.remove("disabled-link");
    document.getElementById("aPortfolio").classList.remove("disabled-link");
    document.getElementById("aContact").classList.remove("disabled-link");
}