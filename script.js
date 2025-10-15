import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const form = document.getElementById("entryForm");
const titleInput = document.getElementById("title");
const typeSelect = document.getElementById("type");
const contextInput = document.getElementById("context");
const entriesList = document.getElementById("entriesList");
const toggleButton = document.getElementById("darkMode");
const body = document.body;
const supabaseUrl = 'https://apirozkueuepmxbaplwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaXJvemt1ZXVlcG14YmFwbHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzU3MzQsImV4cCI6MjA3NjAxMTczNH0.ZUI4iHJZQa5NE8-YbnuF7w8igDpbzduYI3Jvbrbso2k';
const supabase = createClient(supabaseUrl, supabaseKey);

let editingId = null;

//Dark mode
toggleButton.addEventListener("click", () => {
    body.classList.toggle("modo-escuro");
    body.classList.toggle("modo-claro");
});

//Le os dados do navegador. Retorna uma lista de entradas
const getEntries = async () => {
    const {data, error} = await supabase
    .from("entries")
    .select("*")
    .order("date", {ascending: false}); //Mais recente primeiro

    if (error) {
        console.error("Erro ao buscar entradas:", error);
        return [];
    }
    return data || [];
};

//Pega a lista de aprendizados e salva no navegador 
const saveEntries = entries => localStorage.setItem("english_diary_entries", JSON.stringify(entries));

//Cria uma nova entrada e salva no Supabase
const addEntry = async (entry) => {
    const {error} = await supabase
        .from("entries")
        .insert([entry]);

    if (error) {
        console.error("Erro ao adicionar entrada:", error);
    } else {
        console.log("Entrada adicioanda com sucesso!");
        loadEntries(); //Atualiza a lista na tela
    }
};

//Substitui o item antigo pelo novo(baseado no id)
const updateEntry = async (updateEntry) => {
    const {error} = await supabase
        .from("entries")
        .update({
            title: updateEntry.title,
            type: updateEntry.type,
            context: updateEntry.context,
            date: updateEntry.date
        })
        .eq("id", updateEntry.id);

    if (error) {
        console.error("Error ao atualizar entrada:", error);
    } else {
        console.log("Entrada atualizada com sucesso!");
        loadEntries(); //Atualiza a tela
    }
};

//Remove o item da lista no SUpabase
const deleteEntry = async (id) => {
    const {error} = await supabase
        .from("entries")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir entrada:", error);
    } else {
        console.log("Entrada excluída com sucesso!");
        loadEntries(); //Atualiza a tela
    }    
};

//Preenche o formulário com os dados do item escolhido para editar
const editEntry = id => {
    const entry = getEntries().find(e => e.id === id);
    if (!entry) return;
    titleInput.value = entry.title;
    typeSelect.value = entry.type;
    contextInput.value = entry.context;
    editingId = id;
};

//Cria blocos HTML com os dados salvos e mostra na tela
const loadEntries = async () => {
    entriesList.innerHTML = "";

    const entries = await getEntries(); //Aguarda os dados do Supabase

    getEntries().forEach(entry => {
        const wrapper = document.createElement("div");
        wrapper.className = "card-wrapper";

        const div = document.createElement("div");
        div.className = "entry";
        div.dataset.id = entry.id; //para delegação de eventos

        div.innerHTML = `
            <strong>${entry.title}</strong> [${entry.type}]<br>
            <em>${entry.context}</em><br>
            <small>${new Date(entry.date).toLocaleString()}</small><br>
            <button class="btn-dois edit-btn">Editar</button>
            <button class="btn-tres delete-btn">Excluir</button>
        `;

        wrapper.appendChild(div);
        entriesList.appendChild(wrapper); //Adiciona o wrapper (que contém o card)
    });
};

//Cria ou atualiza um item
const handleSubmit = async () => {
    const entry = {
        id: editingId || Date.now().toString(),
        title: titleInput.value.trim(),
        type: typeSelect.value,
        context: contextInput.value.trim(),
        date: new Date().toISOString()
    };

    if (!entry.title) return; //Se o título estiver vazio, cancela

    if (editingId) {
        await updateEntry(entry); //Atualiza
        editingId = null;
    } else {
        addEntry(entry); //Adiciona novo
    }

    form.reset(); //Limpa o formulário
    loadEntries(); //Atualiza a lista
};

//Cria ou atualiza um item ao clicar em salvar
form.addEventListener("submit", e => {
    e.preventDefault(); //Evita o recarregamento da página
    handleSubmit();
});

//Cria ou atualiza um item ao apertar Enter
form.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
    }
});

//Delegação de eventos para editar/excluir
entriesList.addEventListener("click", e => {
    const card = e.target.closest(".entry");
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.classList.contains("edit-btn")) editEntry(id);
    if (e.target.classList.contains("delete-btn")) deleteEntry(id);
});

//Ao abrir a página, ele mostra os itens salvos
loadEntries();
