let dadosOriginais = [];
let filtroSaldoAtual = 'todos';

function carregarDadosLocalmente() {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlBruto, "text/xml");
        const rows = xmlDoc.getElementsByTagName("row");
        
        dadosOriginais = [];
        
        for (let i = 0; i < rows.length; i++) {
            const fields = rows[i].getElementsByTagName("field");
            let item = {};

            for (let j = 0; j < fields.length; j++) {
                const f = fields[j];
                const nome = f.getAttribute("name");
                if (nome === "CODIGO") item.codigo = f.textContent;
                else if (nome === "DESCRICAO") item.descricao = f.textContent;
                else if (nome === "SALDO_DISPONIVEL") item.saldo = parseFloat(f.textContent) || 0;
                else if (nome === "GRUPO_ESTOQUE") item.grupo = f.textContent;
                else if (nome === "FAMILIA_MATERIAL") item.familia = f.textContent.trim();
                else if (nome === "DEPOSITO") item.deposito = f.textContent.trim();
            }
            dadosOriginais.push(item);
        }
        
        popularSelects();
        aplicarFiltros();
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

function popularSelects() {
    const familias = [...new Set(dadosOriginais.map(item => item.familia))].sort();
    const depositos = [...new Set(dadosOriginais.map(item => item.deposito))].sort();

    const selectFamilia = document.getElementById('filtroFamilia');
    const selectDeposito = document.getElementById('filtroDeposito');

    familias.forEach(f => {
        if(f) selectFamilia.innerHTML += `<option value="${f}">${f}</option>`;
    });

    depositos.forEach(d => {
        if(d) selectDeposito.innerHTML += `<option value="${d}">${d}</option>`;
    });
}

function definirFiltroSaldo(tipo) {
    filtroSaldoAtual = tipo;
    aplicarFiltros();
}

function aplicarFiltros() {
    const familiaSelecionada = document.getElementById('filtroFamilia').value;
    const depositoSelecionado = document.getElementById('filtroDeposito').value;
    const termoBusca = document.getElementById('buscaTexto').value.toLowerCase();

    let filtrados = dadosOriginais.filter(item => {
        let passaSaldo = true;
        if (filtroSaldoAtual === 'positivo') passaSaldo = item.saldo > 0;
        else if (filtroSaldoAtual === 'negativo') passaSaldo = item.saldo < 0;
        else if (filtroSaldoAtual === 'zero') passaSaldo = item.saldo === 0;

        let passaFamilia = (familiaSelecionada === "" || item.familia === familiaSelecionada);
        let passaDeposito = (depositoSelecionado === "" || item.deposito === depositoSelecionado);

        const codigo = (item.codigo || "").toLowerCase();
        const descricao = (item.descricao || "").toLowerCase();
        let passaTexto = codigo.includes(termoBusca) || descricao.includes(termoBusca);

        return passaSaldo && passaFamilia && passaDeposito && passaTexto;
    });
    
    renderizarTabela(filtrados);
}

function limparFiltros() {
    document.getElementById('buscaTexto').value = "";
    document.getElementById('filtroFamilia').value = "";
    document.getElementById('filtroDeposito').value = "";
    filtroSaldoAtual = 'todos';
    aplicarFiltros();
}

function renderizarTabela(dados) {
    const corpo = document.getElementById('corpoTabela');
    const contador = document.getElementById('contadorResultados');
    let htmlFinal = "";
    
    // Atualiza o contador de resultados
    contador.innerText = `Retornou ${dados.length} resultado${dados.length !== 1 ? 's' : ''}`;

    for (let i = 0; i < dados.length; i++) {
        const item = dados[i];
        let classeCor = "linha-zero";
        if (item.saldo > 0) classeCor = "linha-positiva";
        else if (item.saldo < 0) classeCor = "linha-negativa";

        htmlFinal += `<tr class="${classeCor}">
            <td>${item.codigo || ''}</td>
            <td>${item.descricao || ''}</td>
            <td style="text-align: right;"><b>${(item.saldo || 0).toFixed(2)}</b></td>
            <td>${item.grupo || ''}</td>
            <td>${item.familia || ''}</td>
            <td>${item.deposito || ''}</td>
        </tr>`;
    }
    corpo.innerHTML = htmlFinal;
}

document.addEventListener("DOMContentLoaded", carregarDadosLocalmente);