const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Servir arquivos estáticos
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));
app.use('/overlay', express.static(path.join(__dirname, '../overlay')));

// Página raiz (opcional)
app.get('/', (req, res) => {
  res.redirect('/dashboard/index.html');
});

const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

// Armazena o último estado enviado por tipo
let estados = {
  futebol: {},
  basquete: {},
};

wss.on('connection', (ws) => {
  // Envia estado atual para novo cliente
  Object.values(estados).forEach(estado => {
    if (estado.tipo) {
      ws.send(JSON.stringify(estado));
    }
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Atualiza o estado salvo apenas para mensagens com tipo
    if (data.tipo) {
      estados[data.tipo] = data;
    }

    // Repassa mensagem para todos os clientes conectados
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
