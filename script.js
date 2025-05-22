const form = document.getElementById("entryForm");
const titleInput = document.getElementById("title");
const typeSelect = document.getElementById("type");
const contextInput = document.getElementById("context");
const entriesList = document.getElementById("entriesList");

let editingId = null;

function getEntries() {
    return JSON.parse(localStorage.getItem("english_diary_entries") || "[]");
} //Le os dados do navegador. Se não houver nada, retorna uma lista vazia

function saveEntries(entries) {
    localStorage.setItem("english_diary_entries", JSON.stringify(entries));
} //Pega a lista de aprendizados e salva no navegador 

function addEntry(entry) {
    const entries = getEntries();
    entries.unshift(entry);
    saveEntries(entries);
} //Cria uma nova entrada e salva com as anteriores

function editEntry(id) {
    const entry = getEntries().find(e => e.id === id);
    if (entry) {
        titleInput.value = entry.title;
        typeSelect.value = entry.type;
        contextInput.value = entry.context;
        editingId = id;
    }
} //Preenche o formulário com os dados do item escolhido para editar

function updateEntry(updateEntry) {
    const entries = getEntries().map(entry =>
        entry.id === updateEntry.id ? updateEntry : entry
    );
    saveEntries(entries);
} //Substitui o item antigo pelo novo(baseado no id)

function deleteEntry(id) {
    const entries = getEntries().filter(entry => entry.id !== id);
    saveEntries(entries);
    loadEntries(); //Atualiza a tela
} //Remove o item da lista

function loadEntries() {
    const entries = getEntries();
    entriesList.innerHTML = "";

    entries.forEach(entry => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("card-wrapper");

        const div = document.createElement("div")
        div.classList.add("entry");
        
        div.innerHTML = `
            <strong>${entry.title}</strong> [${entry.type}]<br>
            <em>${entry.context}</em><br>
            <small>${new Date(entry.date).toLocaleString()}</small></br>
            <button class="btn-dois" onclick="editEntry('${entry.id}')">Editar</button>
            <button class="btn-tres" onclick="deleteEntry('${entry.id}')">Excluir</button>`;

        wrapper.appendChild(div);
        entriesList.appendChild(wrapper); //Adiciona o wrapper (que contém o card)
    });
} //Cria blocos HTML com os dados salvos e mostra na tela

form.addEventListener("submit", (e) => {
    e.preventDefault(); //Evita o recarregamento da página

    const entry = {
        id: editingId || Date.now().toString(),
        title: titleInput.value.trim(),
        type: typeSelect.value,
        context: contextInput.value.trim(),
        date: new Date().toISOString()
    };

    if (!entry.title) return; //Se o título estiver vazio, cancela

    if (editingId) {
        updateEntry(entry); //Atualiza
        editingId = null;
    } else {
        addEntry(entry); //Adiciona novo
    }

    form.reset(); //Limpa o formulário
    loadEntries(); //Atualiza a lista
}); //Cria ou atualiza um item ao clicar em salvar

loadEntries(); //Ao abrir a página, ele mosrta os intems salvos