// Este arquivo cuida apenas da interface de botões
function renderizarControlesPaginacao(totalItens) {
    const container = document.getElementById('controlesPaginacao');
    if (!container) return;

    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    
    if (totalPaginas <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = `<button onclick="mudarPagina(1)" ${paginaAtual === 1 ? 'disabled' : ''}>Primeira</button>`;

    // Mostrar até 5 páginas centrais
    let inicio = Math.max(1, paginaAtual - 2);
    let fim = Math.min(totalPaginas, inicio + 4);

    if (fim - inicio < 4) {
        inicio = Math.max(1, fim - 4);
    }
    inicio = Math.max(1, inicio);

    for (let i = inicio; i <= fim; i++) {
        html += `<button class="${i === paginaAtual ? 'active' : ''}" onclick="mudarPagina(${i})">${i}</button>`;
    }

    html += `<button onclick="mudarPagina(${totalPaginas})" ${paginaAtual === totalPaginas ? 'disabled' : ''}>Última</button>`;
    
    container.innerHTML = html;
}

function mudarPagina(novaPagina) {
    paginaAtual = novaPagina;
    if (typeof aplicarFiltros === 'function') {
        aplicarFiltros();
    }
    window.scrollTo(0, 0); 
}