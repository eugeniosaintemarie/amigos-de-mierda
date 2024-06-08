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
    const contadorPreguntasP = document.getElementById("contador-preguntas");
    const terminarBtn = document.getElementById("terminar-btn");
    const inicioDiv = document.getElementById("inicio");

    let personas = [];
    let preguntas = [];
    let preguntasUsadas = [];
    let personasPreguntas = {};
    let totalPreguntas = 0;

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

        const preguntasUsadasGuardadas = localStorage.getItem('preguntasUsadas');
        if (preguntasUsadasGuardadas) {
            preguntasUsadas = JSON.parse(preguntasUsadasGuardadas);
        }

        const preguntasRestantesGuardadas = localStorage.getItem('preguntasRestantes');
        if (preguntasRestantesGuardadas) {
            preguntas = JSON.parse(preguntasRestantesGuardadas);
        }

        const totalPreguntasGuardadas = localStorage.getItem('totalPreguntas');
        if (totalPreguntasGuardadas) {
            totalPreguntas = JSON.parse(totalPreguntasGuardadas);
        }

        const preguntaActualGuardada = localStorage.getItem('preguntaActual');
        if (preguntaActualGuardada) {
            preguntaP.textContent = preguntaActualGuardada;
        }

        const contadorPreguntasGuardado = localStorage.getItem('contadorPreguntas');
        if (contadorPreguntasGuardado) {
            contadorPreguntasP.textContent = contadorPreguntasGuardado;
        }

        const juegoActivoGuardado = localStorage.getItem('juegoActivo');
        if (juegoActivoGuardado === "true") {
            juegoDiv.classList.remove("hidden");
            if (personas.length > 0) {
                seleccionarPersonaDiv.classList.remove("hidden");
                terminarBtn.classList.remove("hidden");
            } else {
                siguientePreguntaBtn.classList.remove("hidden");
            }
            inicioDiv.classList.add("hidden");
            cargarPersonasDiv.classList.add("hidden");
        }
    }

    function guardarDatos() {
        localStorage.setItem('amigos', JSON.stringify(personas));
        localStorage.setItem('asignaciones', JSON.stringify(personasPreguntas));
        localStorage.setItem('preguntasUsadas', JSON.stringify(preguntasUsadas));
        localStorage.setItem('preguntasRestantes', JSON.stringify(preguntas));
        localStorage.setItem('totalPreguntas', JSON.stringify(totalPreguntas));
        localStorage.setItem('preguntaActual', preguntaP.textContent);
        localStorage.setItem('contadorPreguntas', contadorPreguntasP.textContent);
        localStorage.setItem('juegoActivo', juegoDiv.classList.contains('hidden') ? "false" : "true");
    }

    cargarDatosGuardados();

    cargarPersonasBtn.addEventListener("click", () => {
        inicioDiv.classList.add("hidden");
        cargarPersonasDiv.classList.remove("hidden");
        reiniciarBtnJuego.forEach(btn => {
            btn.classList.add("hidden");
        });
    });

    sinCargarPersonasBtn.addEventListener("click", () => {
        inicioDiv.classList.add("hidden");
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
                if (preguntas.length === 0) {
                    preguntas = text.split("\n").map(pregunta => pregunta.trim()).filter(pregunta => pregunta);
                    totalPreguntas = preguntas.length;
                }
                mostrarSiguientePregunta(conPersonas);
            });
    }

    function actualizarContador() {
        const preguntasRestantes = totalPreguntas - preguntas.length;
        contadorPreguntasP.textContent = `${preguntasRestantes}/${totalPreguntas}`;
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
        actualizarContador();
        guardarDatos();

        if (conPersonas) {
            personasSelect.value = "";
            asignarPreguntaBtn.disabled = true;
            seleccionarPersonaDiv.classList.remove("hidden");
            siguientePreguntaBtn.classList.add("hidden");
            terminarBtn.classList.remove("hidden");
        } else {
            seleccionarPersonaDiv.classList.add("hidden");
            siguientePreguntaBtn.classList.remove("hidden");
            terminarBtn.classList.add("hidden");
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

    terminarBtn.addEventListener("click", () => {
        terminarJuego(personas.length > 0);
    });

    function terminarJuego(conPersonas) {
        juegoDiv.classList.add("hidden");
        if (conPersonas) {
            const personasOrdenadas = Object.keys(personasPreguntas).sort((a, b) => personasPreguntas[b] - personasPreguntas[a]);
            const personasConPuntos = personasOrdenadas.map(persona => `${persona} [${personasPreguntas[persona]}]`);
            resultadoTextoP.innerHTML = `Resultado:<br>${personasConPuntos.join("<br>")}`;
        } else {
            resultadoTextoP.textContent = "No hay más preguntas";
        }
        resultadoDiv.classList.remove("hidden");
        localStorage.clear();
    }

    function actualYear() {
        document.getElementById("actualYear").innerHTML = new Date().getFullYear();
    }

    actualYear();

    function asyncLoadScript(url, callback) {
        var d = document,
            t = 'script',
            o = d.createElement(t),
            s = d.getElementsByTagName(t)[0];
        o.src = url;
        if (callback) {
            o.addEventListener('load', function (e) {
                callback(null, e);
            }, false);
        }
        s.parentNode.insertBefore(o, s);
    }

    // asyncLoadScript('url_del_script.js', (err, event) => {
    //     if (!err) {
    //         console.log('Script cargado correctamente');
    //     }
    // });
});
