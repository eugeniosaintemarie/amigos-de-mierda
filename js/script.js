document.addEventListener("DOMContentLoaded", () => {
    const cargarPersonasBtn = document.getElementById("cargar-personas-btn");
    const sinCargarPersonasBtn = document.getElementById("sin-cargar-personas-btn");
    const cargarPersonasDiv = document.getElementById("cargar-personas");
    const personaInput = document.getElementById("persona-input");
    const agregarPersonaBtn = document.getElementById("agregar-persona-btn");
    const listaPersonasUl = document.getElementById("lista-personas");
    const comenzarJuegoBtn = document.getElementById("comenzar-juego-btn");
    const juegoDiv = document.getElementById("juego");
    const preguntaP = document.getElementById("pregunta");
    const seleccionarPersonaDiv = document.getElementById("seleccionar-persona");
    const personasSelect = document.getElementById("personas-select");
    const asignarPreguntaBtn = document.getElementById("asignar-pregunta-btn");
    const siguientePreguntaBtn = document.getElementById("siguiente-pregunta-btn");
    const reiniciarBtnJuego = document.querySelectorAll("#reiniciar-btn-juego");
    const resultadoDiv = document.getElementById("resultado");
    const resultadoTextoP = document.getElementById("resultado-texto");
    const reiniciarBtn = document.getElementById("reiniciar-btn");

    let personas = [];
    let preguntas = [];
    let preguntasUsadas = [];
    let personasPreguntas = {};

    function cargarDatosGuardados() {
        const personasGuardadas = localStorage.getItem('amigos');
        if (personasGuardadas) {
            personas = JSON.parse(personasGuardadas);
            personas.forEach(persona => {
                const li = document.createElement("li");
                li.textContent = persona;
                listaPersonasUl.appendChild(li);
                const option = document.createElement("option");
                option.value = persona;
                option.textContent = persona;
                personasSelect.appendChild(option);
            });
        }

        const asignacionesGuardadas = localStorage.getItem('asignaciones');
        if (asignacionesGuardadas) {
            personasPreguntas = JSON.parse(asignacionesGuardadas);
        }
    }

    function guardarDatos() {
        localStorage.setItem('amigos', JSON.stringify(personas));
        localStorage.setItem('asignaciones', JSON.stringify(personasPreguntas));
    }

    document.addEventListener('DOMContentLoaded', cargarDatosGuardados);

    cargarPersonasBtn.addEventListener("click", () => {
        document.getElementById("inicio").classList.add("hidden");
        cargarPersonasDiv.classList.remove("hidden");
    });

    sinCargarPersonasBtn.addEventListener("click", () => {
        document.getElementById("inicio").classList.add("hidden");
        comenzarJuego(false);
        guardarDatos();
    });

    agregarPersonaBtn.addEventListener("click", () => {
        const persona = personaInput.value.trim();
        if (persona) {
            personas.push(persona);
            personasPreguntas[persona] = 0;
            const li = document.createElement("li");
            li.textContent = persona;
            listaPersonasUl.appendChild(li);
            const option = document.createElement("option");
            option.value = persona;
            option.textContent = persona;
            personasSelect.appendChild(option);
            personaInput.value = "";
            guardarDatos();
        }
    });


    personasSelect.addEventListener("change", () => {
        asignarPreguntaBtn.disabled = !personasSelect.value;
    });

    comenzarJuegoBtn.addEventListener("click", () => {
        if (personas.length >= 2) {
            cargarPersonasDiv.classList.add("hidden");
            comenzarJuego(true);
        } else {
            alert("Carga al menos 2 amigos para comenzar");
        }
    });

    function comenzarJuego(conPersonas) {
        fetch("data/preguntas.txt")
            .then(response => response.text())
            .then(text => {
                preguntas = text.split("\n").map(pregunta => pregunta.trim()).filter(pregunta => pregunta);
                mostrarSiguientePregunta(conPersonas);
            });
    }

    function mostrarSiguientePregunta(conPersonas) {
        if (preguntas.length === 0) {
            terminarJuego(conPersonas);
            return;
        }

        const indicePregunta = Math.floor(Math.random() * preguntas.length);
        const pregunta = preguntas.splice(indicePregunta, 1)[0];
        preguntasUsadas.push(pregunta);

        preguntaP.textContent = pregunta;
        if (conPersonas) {
            personasSelect.value = "";
            asignarPreguntaBtn.disabled = true;
            seleccionarPersonaDiv.classList.remove("hidden");
            siguientePreguntaBtn.classList.add("hidden");
        } else {
            seleccionarPersonaDiv.classList.add("hidden");
            siguientePreguntaBtn.classList.remove("hidden");
        }

        juegoDiv.classList.remove("hidden");
    }

    asignarPreguntaBtn.addEventListener("click", () => {
        const persona = personasSelect.value;
        personasPreguntas[persona]++;
        mostrarSiguientePregunta(true);
    });

    siguientePreguntaBtn.addEventListener("click", () => {
        mostrarSiguientePregunta(false);
    });

    reiniciarBtnJuego.forEach(btn => {
        btn.addEventListener("click", () => {
            location.reload();
        });
    });

    reiniciarBtn.addEventListener("click", () => {
        location.reload();
    });

    function terminarJuego(conPersonas) {
        juegoDiv.classList.add("hidden");
        if (conPersonas) {
            const maxPreguntas = Math.max(...Object.values(personasPreguntas));
            const personaMasPreguntas = Object.keys(personasPreguntas).filter(persona => personasPreguntas[persona] === maxPreguntas);
            resultadoTextoP.textContent = `La(s) persona(s) con más preguntas asignadas fueron: ${personaMasPreguntas.join(", ")}`;
        } else {
            resultadoTextoP.textContent = "No hay más preguntas";
        }
        resultadoDiv.classList.remove("hidden");
    }
});
