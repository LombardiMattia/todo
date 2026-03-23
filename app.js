document.addEventListener("DOMContentLoaded", () => {
    const sezionePassiva = document.getElementById("sezione-todos");

    loadTodos();
    showTodos(sezionePassiva);

    // Inserimento nuovo todo
    document.getElementById("inserisci").addEventListener("click", () => {
        const titolo = document.getElementById("titolo-todo").value;
        const descrizione = document.getElementById("descrizione-todo").value;

        addTodo(titolo, descrizione, sezionePassiva);

        document.getElementById("titolo-todo").value = "";
        document.getElementById("descrizione-todo").value = "";
        document.getElementById("TODO").style.display = "none";
        flagTodo = !flagTodo;
    });

    // Gestione grafica aggiunta todo
    const sezioneAttiva = document.getElementById("sezione-modifica");
    let flagTodo = false;
    sezioneAttiva.addEventListener("click", graficaAggiuntaTodo);
    const bottoneAggiungi = document.getElementById("aggiungi");
    if (bottoneAggiungi)
        bottoneAggiungi.addEventListener("click", graficaAggiuntaTodo);

    function graficaAggiuntaTodo() {
        if (!flagTodo) {
            document.getElementById("TODO").style.display = "flex";
            flagTodo = true;
        }
    }

});

// GENERAZIONE DATA
const oggi = new Date();
function oraConverter(param) {
    const dataIt = param.toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    return dataIt.charAt(0).toUpperCase() + dataIt.slice(1);
}
document.getElementById("lato-2").textContent = oraConverter(oggi);

// BACKEND
let todosData = { todos: [], nextId: 1 };

// 1.0 RECUPERO DATI LOCALSTORAGE
function loadTodos() {
    try {
        const jsonTodos = localStorage.getItem("log-todos");
        if (jsonTodos) todosData = JSON.parse(jsonTodos);
    } catch (error) {
        todosData = { todos: [], nextId: 1 };
    }
}

// 2.0 SALVA DATI LOCALSTORAGE
function saveTodos() {
    try {
        localStorage.setItem("log-todos", JSON.stringify(todosData));
    } catch (error) {
        console.log("Errore salvataggio: ", error);
    }
}

// 3.0 CREAZIONE NUOVO TODO
function addTodo(titolo, descrizione, sezione) {
    titolo = String(titolo || "").trim();
    descrizione = String(descrizione || "").trim();
    if (!titolo) return false;

    const newTodo = {
        id: todosData.nextId++,
        titolo,
        descrizione,
        completed: false,
        createdAt: new Date(),
    };

    todosData.todos.push(newTodo);
    saveTodos();
    showTodos(sezione);
    return true;
}

// 4.0 ELIMINA TODO
function deleteTodo(idTodoDaEliminare, sezione) {
    todosData.todos = todosData.todos.filter((t) => t.id !== idTodoDaEliminare);
    saveTodos();
    showTodos(sezione);
}

// 5.0 AGGIORNA TODO
function updateTodo(id, nuovoTitolo, nuovaDescrizione, sezione) {
    const todo = todosData.todos.find((t) => t.id === id);
    if (!todo) return false;
    todo.titolo = String(nuovoTitolo || "").trim() || todo.titolo;
    todo.descrizione = String(nuovaDescrizione || "").trim() || todo.descrizione;
    saveTodos();
    showTodos(sezione);
    return true;
}

// TOGGLE COMPLETATO
function toggleTodos(id) {
    const todo = todosData.todos.find((elemento) => elemento.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
    }
}


// MOSTRA TODOS
function showTodos(sezione, filtro = "tutti") {
    console.log(filtro)
    document.getElementById("filtro-selezionato").textContent = filtro.toLocaleUpperCase();
    
    // Aggiorna i counter
    document.getElementById("resoconto").innerHTML = "Totali inseriti: " + count(filtro);
    document.getElementById("n-TUTTI").innerHTML = count("tutti");
    document.getElementById("n-ATTIVI").innerHTML = count("attivi");
    document.getElementById("n-COMPLETATI").innerHTML = count("completati");

    if (!sezione) return;
    sezione.innerHTML = "";

    let todosDaMostrare = todosData.todos;

    if (filtro === "attivi") {
        todosDaMostrare = todosData.todos.filter(todo => !todo.completed);
    } else if (filtro === "completati") {
        todosDaMostrare = todosData.todos.filter(todo => todo.completed);
    }

    todosDaMostrare.forEach((todo) => {
        const div = document.createElement("div");
        div.classList.add("todo-box");
        div.id = `todo-${todo.id}`;
        div.style.display = "flex";

        // --- il resto della creazione dell'elemento todo rimane uguale ---
        const spanSx = document.createElement("span");
        spanSx.classList.add("modf-sx");
        const circle = document.createElement("span");
        circle.classList.add("circle-complete");
        spanSx.appendChild(circle);

        const spanDx = document.createElement("span");
        spanDx.classList.add("modf-dx");

        const titoloP = document.createElement("input");
        titoloP.disabled = true;
        titoloP.classList.add("titolo-vero");
        titoloP.placeholder = todo.titolo.toUpperCase();
        titoloP.autocomplete = "off";

        const descP = document.createElement("input");
        descP.disabled = true;
        descP.classList.add("descrizione-vera");
        descP.placeholder = todo.descrizione;
        descP.autocomplete = "off";

        const dataCreazione = document.createElement("p");
        dataCreazione.classList.add("data");
        dataCreazione.textContent = oraConverter(new Date(todo.createdAt));

        spanDx.appendChild(titoloP);
        spanDx.appendChild(descP);
        spanDx.appendChild(dataCreazione);
        div.appendChild(spanSx);
        div.appendChild(spanDx);

        const chip = document.createElement("div");
        chip.classList.add("chip", "chip-active");

        const elimina = document.createElement("span");
        elimina.classList.add("elimina");
        elimina.innerHTML = '<i class="fa-solid fa-xmark"></i>';

        const modifica = document.createElement("span");
        modifica.classList.add("modifica");
        modifica.innerHTML = '<i class="fa-solid fa-pen"></i>';

        let modFlag = false;
        modifica.addEventListener("click", () => {
            if (!modFlag) {
                modifica.innerHTML = '<i class="fa-solid fa-check"></i>';
                elimina.style.display = "none";
                titoloP.disabled = false;
                descP.disabled = false;
                titoloP.focus();
                modFlag = true;
                return;
            }
            modFlag = false;
            titoloP.disabled = true;
            descP.disabled = true;
            modifica.innerHTML = '<i class="fa-solid fa-pen"></i>';
            elimina.style.display = "block";
            updateTodo(todo.id, titoloP.value, descP.value, sezione);
        });

        elimina.addEventListener("click", () => deleteTodo(todo.id, sezione));

        if (todo.completed) {
            circle.classList.add("circle-active");
            circle.innerHTML = '<i class="fa-solid fa-check"></i>';
        }

        circle.addEventListener("click", () => {
            toggleTodos(todo.id);
            showTodos(sezione, filtro); // importante: mantenere il filtro
        });

        chip.appendChild(modifica);
        chip.appendChild(elimina);
        div.appendChild(chip);

        sezione.appendChild(div);
    });

}

function count(type) {
    if (type === 0 || type === "tutti") {
        return todosData.todos.length;
    } else if (type === 1 || type === "attivi") {
        return todosData.todos.filter(todo => !todo.completed).length;
    } else if (type === 2 || type === "completati") {
        return todosData.todos.filter(todo => todo.completed).length;
    } else {
        return 0;
    }
}

// SEZIONE FILTRI
const boxFiltri = document.querySelectorAll(".box");
let defaultBox = document.getElementById("tutti");

boxFiltri.forEach(box => {
    box.addEventListener("click", (evento) => {
        const idTarget = evento.currentTarget.id;

        defaultBox.classList.remove("filter-active");
        defaultBox = document.getElementById(idTarget);
        defaultBox.classList.add("filter-active");

        // mostra i todos in base al filtro selezionato
        if (idTarget === "attivi") {
            showTodos(document.getElementById("sezione-todos"), "attivi");
        } else if (idTarget === "checked") {
            showTodos(document.getElementById("sezione-todos"), "completati");
        } else {
            showTodos(document.getElementById("sezione-todos"), "tutti");
        }
    });
});
