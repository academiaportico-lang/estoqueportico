let dadosOriginais = [];
let filtroSaldoAtual = 'todos';
let paginaAtual = 1;
const itensPorPagina = 50;

function carregarDadosLocalmente() {
    try {
        if (typeof xmlBruto === 'undefined') {
            console.error("Variável xmlBruto não encontrada no dados.js");
            return;
        }
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlBruto, "text/xml");
        const rows = xmlDoc.getElementsByTagName("row");
        
        dadosOriginais = [];
        for (let i = 0; i < rows.length; i++) {
            const fields = rows[i].getElementsByTagName("field");
            let item = { id: i, contagem: 0 };

            for (let j = 0; j < fields.length; j++) {
                const f = fields[j];
                const nome = f.getAttribute("name");
                const valor = f.textContent;
                if (nome === "CODIGO") item.codigo = valor;
                else if (nome === "DESCRICAO") item.descricao = valor;
                else if (nome === "SALDO_DISPONIVEL") item.saldo = parseFloat(valor) || 0;
                else if (nome === "GRUPO_ESTOQUE") item.grupo = valor;
                else if (nome === "FAMILIA_MATERIAL") item.familia = valor ? valor.trim() : "";
                else if (nome === "DEPOSITO") item.deposito = valor ? valor.trim() : "";
                else if (nome === "CONTAGEM") item.contagem = valor || 0;
            }
            dadosOriginais.push(item);
        }
        popularSelects();
        aplicarFiltros();
    } catch (erro) { console.error("Erro no carregamento:", erro); }
}

function popularSelects() {
    const familias = [...new Set(dadosOriginais.map(item => item.familia))].filter(f => f).sort();
    const depositos = [...new Set(dadosOriginais.map(item => item.deposito))].filter(d => d).sort();
    
    document.getElementById('filtroFamilia').innerHTML = '<option value="">TODAS AS FAMÍLIAS</option>' + 
        familias.map(f => `<option value="${f}">${f}</option>`).join('');
    
    document.getElementById('filtroDeposito').innerHTML = '<option value="">TODOS OS DEPÓSITOS</option>' + 
        depositos.map(d => `<option value="${d}">${d}</option>`).join('');
}

function aplicarFiltros() {
    const fam = document.getElementById('filtroFamilia').value;
    const dep = document.getElementById('filtroDeposito').value;
    const busca = document.getElementById('buscaTexto').value.toLowerCase();

    let filtrados = dadosOriginais.filter(item => {
        let pSaldo = true;
        if (filtroSaldoAtual === 'positivo') pSaldo = item.saldo > 0;
        else if (filtroSaldoAtual === 'negativo') pSaldo = item.saldo < 0;
        else if (filtroSaldoAtual === 'zero') pSaldo = item.saldo === 0;

        return pSaldo && 
               (fam === "" || item.familia === fam) && 
               (dep === "" || item.deposito === dep) && 
               ((item.codigo||"").toLowerCase().includes(busca) || (item.descricao||"").toLowerCase().includes(busca));
    });

    const totalItens = filtrados.length;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const dadosPaginados = filtrados.slice(inicio, inicio + itensPorPagina);
    
    renderizarTabela(dadosPaginados, totalItens);
    
    if (typeof renderizarControlesPaginacao === 'function') {
        renderizarControlesPaginacao(totalItens);
    }
}

function renderizarTabela(dados, totalTotal) {
    const corpo = document.getElementById('corpoTabela');
    const contador = document.getElementById('contadorResultados');
    
    contador.innerText = `Total: ${totalTotal} itens | Página ${paginaAtual}`;

    let html = "";
    for (let i = 0; i < dados.length; i++) {
        const item = dados[i];
        let cl = item.saldo > 0 ? "linha-positiva" : (item.saldo < 0 ? "linha-negativa" : "linha-zero");
        
        html += `<tr class="${cl}">
            <td>${item.codigo || ''}</td>
            <td>${item.descricao || ''}</td>
            <td style="text-align: center;color:blue;"><b>${(item.saldo || 0).toFixed(2)}</b></td>
            <td>${item.grupo || ''}</td>
            <td>${item.familia || ''}</td>
            <td>${item.deposito || ''}</td>
            <td><input type="number" id="input-${item.id}" value="${item.contagem}" class="input-contagem" onchange="atualizarMemoria(${item.id}, this.value)"></td>
            <td><button class="btn-acao-salvar" onclick="salvarLinha(${item.id})">OK</button></td>
        </tr>`;
    }
    corpo.innerHTML = html;
}

function atualizarMemoria(id, valor) {
    const index = dadosOriginais.findIndex(item => item.id === id);
    if (index !== -1) dadosOriginais[index].contagem = valor;
}

function salvarLinha(id) {
    const input = document.getElementById(`input-${id}`);
    atualizarMemoria(id, input.value);
    input.style.backgroundColor = "#d4edda";
    setTimeout(() => { input.style.backgroundColor = "white"; }, 400);
}

async function exportarDados() {
    let novoXml = `const xmlBruto = \`<?xml version="1.0" encoding="utf-8"?>\n<table_data name="TabelaDesconhecida">`;
    for (let item of dadosOriginais) {
        novoXml += `\n\t<row>
\t\t<field name="CODIGO">${item.codigo}</field>
\t\t<field name="DESCRICAO">${item.descricao}</field>
\t\t<field name="SALDO_DISPONIVEL">${item.saldo.toFixed(2)}</field>
\t\t<field name="GRUPO_ESTOQUE">${item.grupo}</field>
\t\t<field name="FAMILIA_MATERIAL">${item.familia}</field>
\t\t<field name="DEPOSITO">${item.deposito}</field>
\t\t<field name="CONTAGEM">${item.contagem}</field>
\t</row>`;
    }
    novoXml += `\n</table_data>\`;`;

    try {
        const res = await fetch('http://localhost:3001/salvar-estoque', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conteudo: novoXml })
        });
        if (res.ok) alert("✅ DADOS SALVOS COM SUCESSO!");
    } catch (e) { alert("❌ Erro ao conectar ao servidor."); }
}

function definirFiltroSaldo(t) { 
    paginaAtual = 1; 
    filtroSaldoAtual = t; 
    aplicarFiltros(); 
}

function limparFiltros() { 
    document.getElementById('buscaTexto').value = ""; 
    document.getElementById('filtroFamilia').value = ""; 
    document.getElementById('filtroDeposito').value = ""; 
    filtroSaldoAtual = 'todos'; 
    paginaAtual = 1;
    aplicarFiltros(); 
}

document.addEventListener("DOMContentLoaded", carregarDadosLocalmente);