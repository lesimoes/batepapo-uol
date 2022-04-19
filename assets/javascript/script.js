const API = 'https://mock-api.driven.com.br/api/v6/uol';
const TIME_3S = 3 * 1000;
const TIME_5S = 5 * 1000;
const TIME_10S = 10 * 1000;


function hello () {
    if (!false) {
        console.log('oiii, eu sou true');
    }
    if (true) {
        console.log('oiii, eu sou true');
    }
    console.log('hello')
}

let nome;
let participantes = [];
let destinatario = 'Todos';

function iniciarChat () {

    lerMensagens();
    listarParticipantes();

    //setInterval(lerMensagens, TIME_3S);
    setInterval(manterAtivo, TIME_5S);
    //setInterval(listarParticipantes, TIME_10S);
}

function listarParticipantes () {
    axios.get(`${API}/participants`)
        .then(renderizarParticipantes);
}

function manterAtivo () {
    axios.post(`${API}/status`, { name: nome })
}

function resetarPagina () {
    window.location.reload();
}

function entrarNaSala () {
    nome = prompt('Qual é a sua graça?');
    //nome = 'narutin';

    const promise = axios.post(`${API}/participants`, { name: nome });
    promise.then(iniciarChat)
    promise.catch(resetarPagina)
}

function lerMensagens () {
    const promise = axios.get(`${API}/messages`);
    promise.then(renderizarMensagens)
}

function ehMensagemVisivel (message) {
    if (message.type === 'private_message' && (message.from === nome || message.to === nome) ){
        return true;
    }
    if (message.type === 'private_message' && message.to === 'Todos') {
        return true;
    }
    return false;
}


function renderizarParticipantes (resposta) {

    const listarParticipantes = resposta.data;
    const containerParticipantes = document.querySelector('aside > ul');
    containerParticipantes.innerHTML = `
        <li class="visibilidade-publico selecionado">
            <ion-icon name="people"></ion-icon>Todos<ion-icon>
            </ion-icon>
        </li>
    `;
    listarParticipantes.map(participante => {
        containerParticipantes.innerHTML += `
        <li class="visibilidade-publico selecionado" onclick="selecionarDestinatario(this)">
            <ion-icon name="person-circle"></ion-icon><span>${participante.name}</span>
            
        </li>
    `;
    })
}

function selecionarDestinatario (elemento) {
    destinatario = elemento.querySelector('span').innerHTML;
    console.log(destinatario)

    const clicadoAnterior = document.querySelector(".contatos .check")
   
    if (clicadoAnterior !== null) {
        console.log(clicadoAnterior)
        clicadoAnterior.classList.remove("check");
        clicadoAnterior.remove();
    }

    elemento.innerHTML += `
        <ion-icon class="check" name="checkmark-outline"></ion-icon>
    `

}

function enviarMensagem () {
    const texto = document.querySelector('.input-mensagem').value;
    const message = {
        from: nome,
        to: "Todos",
        text: texto,
        type: "message"
    }
    if (texto) {
        document.querySelector('.input-mensagem').value = '';
        const promise = axios.post(`${API}/messages`, message);
        promise.then(lerMensagens);
        promise.catch(resetarPagina);
    } else {
        alert("Manda mensagem")
    }

}

function renderizarMensagens (resposta) {

    const containerMensagens = document.querySelector('.mensagens-container');

    containerMensagens.innerHTML = '';
    for (let i = 0 ; i < resposta.data.length ; i ++) {

        const message = resposta.data[i];
        if (message.type === 'status') {
            containerMensagens.innerHTML += `
            <li class="entrada-saida">
                <span class="horario">(${message.time})</span>
                <strong>${message.from}</strong>
                <span>${message.text}</span>
            </li>
            `;
        }
        if (ehMensagemVisivel(message)) {
            containerMensagens.innerHTML += `
            <li class="conversa-privada">
                <span class="horario">(${message.time})</span>
                <strong>${message.from}</strong>
                <span> reservadamente para </span>
                <strong>${message.to}: </strong>
                <span>${message.text}</span>
            </li>
            `
        }
        if (message.type === 'message') {
            containerMensagens.innerHTML += `
            <li class="conversa-publica">
                <span class="horario">(${message.time})</span>
                <strong>${message.from}</strong>
                <span> para </span>
                <strong>${message.to}: </strong>
                <span>${message.text}</span>
            </li>
            `
        }
    }

    rolarProFim();
}

function rolarProFim () {
    const ultimaMensagem = document.querySelector('.mensagens-container li:last-child');
    ultimaMensagem.scrollIntoView();
}


function abrirMenu () {
    document.querySelector('.menu-fundo').classList.remove('fundo-escondido');
    document.querySelector('aside').classList.remove('escondido');
}

function anexarEventos () {
    document.querySelector('.menu-fundo').addEventListener('click', function () {

        document.querySelector('.menu-fundo').classList.add('fundo-escondido');
        document.querySelector('aside').classList.add('escondido');
    })
    
    document.addEventListener('keydown', function (event) {
     
        if (event.key === 'Enter') {
            enviarMensagem();
        }
    })
}


anexarEventos();
entrarNaSala();