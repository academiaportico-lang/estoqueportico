const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
// Aumentado o limite para suportar arquivos XML muito grandes sem erro
app.use(express.json({ limit: '100mb' })); 
app.use(express.static(__dirname));

app.post('/salvar-estoque', (req, res) => {
    const conteudoParaGravar = req.body.conteudo;
    const caminhoArquivo = path.join(__dirname, 'dados.js');

    // fs.writeFile é assíncrono, não trava o processador
    fs.writeFile(caminhoArquivo, conteudoParaGravar, 'utf8', (err) => {
        if (err) {
            console.error("❌ Erro ao gravar:", err);
            return res.status(500).send("Erro");
        }
        console.log("✅ Arquivo dados.js atualizado com sucesso!");
        res.send("OK");
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Veloz rodando em http://localhost:${PORT}`);
});