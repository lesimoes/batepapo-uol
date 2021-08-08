const urlChat = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol";

let nome;
let idIntervalCarregarMensagens;


function iniciarChat () {

    document.addEventListener("keydown", function(event) {
        if (event.code === "Enter") {
            enviarMensagem();
        }
    });
    entrarSala();
    atualizarMensagensStatus();
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
        if (resposta.data[i].type === "private_message" && resposta.data[i].to === nome) {            
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



function enviarMensagem (event) {

    const inputMessage = document.querySelector(".input-mensagem");
    
    const mensagemBody = {
        from: nome,
        to: "Todos",
        text: inputMessage.value,
        type: "message",
    }
    
    inputMessage.value = "";
    axios.post(`${urlChat}/messages`, mensagemBody);
}

carregarMensagens();
iniciarChat();