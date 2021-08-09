const urlChat = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol";

let nome;
let idIntervalCarregarMensagens;
let participantes = []
let destinatario = "Todos";
let messageType = "message";

function iniciarChat () {

    document.addEventListener("keydown", function(event) {
        if (event.code === "Enter") {
            enviarMensagem();
        }
    });
    entrarSala();
    atualizarMensagensStatus();
    carregarListaParticipantes();
    setInterval(carregarListaParticipantes, 10000);
}

function entrarSala () {
    nome = prompt("Qual o seu lindo nome?");
    axios.post(`${urlChat}/participants`, {
        name: nome,
    }).then(function() {
        console.log("Sucesso")
        confirmarStatus();
    }).catch(function () {
        alert("Nome já em uso, escolha outro");
        iniciarChat();
    })
}


function confirmarStatus () {
    console.log("Confirm status")
    axios.post(`${urlChat}/status`, {
        name: nome,
    });
}

function renderizarMensagens (resposta) {

    let mensagens = [];
    const ul = document.querySelector(".mensagens-container");
    ul.innerHTML = "";

    for (let i = 0 ; i < resposta.data.length ; i ++) {
        if (resposta.data[i].type !== "private_message") {
            mensagens.push(resposta.data[i]);
        }
        if (resposta.data[i].type === "private_message" && (resposta.data[i].to === nome || resposta.data[i].from === nome)) {            
            mensagens.push(resposta.data[i]);
        }
    }

    for (let i = 0 ; i < mensagens.length ; i ++) {
        if (mensagens[i].type === "status") {
            ul.innerHTML += `<li class="entrada-saida">
            <span class="horario">(${mensagens[i].time})</span>
            <strong>${mensagens[i].from}</strong>
            <span> para </span>
            <strong>${mensagens[i].to}: </strong>
            <span>${mensagens[i].text}</span>
        </li>`
        }
        if (mensagens[i].type === "private_message") {
            ul.innerHTML += `<li class="conversa-privada">
            <span class="horario">(${mensagens[i].time})</span>
            <strong>${mensagens[i].from}</strong>
            <span> reservadamente para </span>
            <strong>${mensagens[i].to}: </strong>
            <span>${mensagens[i].text}</span>
        </li>`
        }
        if (mensagens[i].type === "message") {
            ul.innerHTML += `<li class="conversa-publica">
            <span class="horario">(${mensagens[i].time})</span>
            <strong>${mensagens[i].from}</strong>
            <span> para </span>
            <strong>${mensagens[i].to}: </strong>
            <span>${mensagens[i].text}</span>
        </li>`
        }
    }

    rolarChatParaFinal();
}


function carregarMensagens () {
    console.log("load messages", idIntervalCarregarMensagens)
    const promise = axios.get(`${urlChat}/messages`);
    promise.then(renderizarMensagens);
}

function atualizarMensagensStatus () {

    idIntervalCarregarMensagens = setInterval(carregarMensagens, 3000);
    idIntervalStatus = setInterval(confirmarStatus, 5000);
}

function rolarChatParaFinal() {
    const ultimaMensagem = document.querySelector(".mensagens-container li:last-child");
    ultimaMensagem.scrollIntoView();
  }



function enviarMensagem () {

    const inputMessage = document.querySelector(".input-mensagem");
    
    const mensagemBody = {
        from: nome,
        to: destinatario || "Todos",
        text: inputMessage.value,
        type: messageType,
    }
    
    inputMessage.value = "";
    const promise = axios.post(`${urlChat}/messages`, mensagemBody);
    promise.then(carregarMensagens);
    promise.catch(atualizarPagina);
}


function abrirMenu () {
    const menu = document.querySelector(".menu");
    const fundoChat = document.querySelector(".menu-fundo");

    menu.classList.toggle("escondido");
    fundoChat.classList.toggle("fundo-escondido");

}

function carregarListaParticipantes () {
   const promise = axios.get(`${urlChat}/participants`);
   promise.then(renderizarParticipantes);
}

function renderizarParticipantes (resposta) {
    const ul = document.querySelector(".contatos");
    ul.innerHTML = "";

    let classeParticipants = "";

    resposta.data.push({
        name: "Todos",
    })

    for (let i = 0 ; i < resposta.data.length ; i ++) {
        if(destinatario === resposta.data[i].name) {
            classeParticipants = "selecionado";
        } else {
            classeParticipants = "";
        }

        ul.innerHTML += ` <li class="${classeParticipants}" onclick="selecionarDestinatario(this)">
        <ion-icon name='person-circle'></ion-icon>
        <span class='nome'>${resposta.data[i].name}</span>
        <ion-icon class='check' name='checkmark-outline'></ion-icon>
      </li>`;    
    }    

}

function selecionarDestinatario (elemento) {
    destinatario = elemento.querySelector(".nome").innerHTML;
    carregarListaParticipantes();
    document.querySelector(".enviando").innerHTML = `Enviando para ${destinatario}...`;
}

function atualizarPagina () {
    window.location.reload();
}

function mudarVisibilidade (elemento, mode){
    document.querySelector(".visibilidades .selecionado").classList.remove("selecionado");
    elemento.classList.add("selecionado");
    messageType = mode;
}

carregarMensagens();
iniciarChat();