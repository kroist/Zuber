import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Lobby } from './lobby.js';
import cors from 'cors'

const app: Application = express();

const clients: Set<WebSocket> = new Set();

const port = 3001;

app.use(express.json({ limit: '10mb' }));
app.use(
  cors({
    origin: '*',
    credentials: true // Allow any origin and specifically allow http://localhost:3000
  })
);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
})

let lobby = new Lobby();

app.post('/create_lobby', (req: Request, res: Response) => {
  console.log(req.body);

  console.log(lobby.id);

  res.send({ lobby_id: lobby.id });

})

app.post('/join_lobby', (req: Request, res: Response) => {
  console.log(req.body);
  if (req.body.lobby_id != lobby.id) {
    console.log('Invalid lobby');
    res.status(400).send('Invalid lobby');
    return;
  }
  const nickname = req.body.nickname;
  lobby.users.push(nickname);
  res.send('Lobby joined');

  const message = JSON.stringify({ type: 'lobby_joined', users: lobby.users });
  clients.forEach((client) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    } catch (err) {
      console.log(`error sending to soket ${err}`);
    }
  });
});

app.get('/lobby_users', (req: Request, res: Response) => {
  res.send({users: lobby.users});
});


const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  clients.add(ws);

  // parse message to JSON and check its type
  ws.on('message', (msg) => {

    try {
      console.log(msg.toString());
      const message = JSON.parse(msg.toString());
      console.log(message);
      if (message.type === 'lobby_sub') {
        console.log('Lobby created');
      }

      ws.send(`Hello from server ${msg}`);
    } catch (err) {
      console.log(`Error during message response ${err}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.send('Hello from server');
});
