const http = require("http");
const uuid = require("uuid");
const server = http.createServer();
const WebSocketServer = require("websocket").server;

server.listen(8000, () => console.log("server is running"));

const wsServer = new WebSocketServer({
  httpServer: server,
});

const clients = {};
const games = {};
let gameState = {};
const state = []

wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  const clientId = uuid.v1();
  const payload = {
    method: "connect",
    clientId: clientId,
  };

  // CLIENTS
  clients[clientId] = {
    connection: connection,
  };

  // MESSAGES
  connection.on("message", (msg) => {
    const data = JSON.parse(msg.utf8Data);
    const gameId = uuid.v1();
    const clientConnection = clients[data.clientId].connection;

    games[gameId] = {
      gameId: gameId,
      balls: 30,
      clients: [],
    };

    // CREATE
    if (data.method === "create") {
      const payload = {
        method: "create",
        game: games[gameId],
      };
      clientConnection.send(JSON.stringify(payload));
    }

    // JOIN
    if (data.method === "join") {
      const clientId = data.clientId;
      const gameId = data.gameId;
      const clientsLength = games[gameId]?.clients.length;
      const team =
        clientsLength === 0
          ? "red"
          : clientsLength === 1
          ? "green"
          : clientsLength === 2
          ? "blue"
          : "full";

      if (clientsLength === undefined) {
        clients[clientId].connection.send(
          JSON.stringify({
            message: "false",
          })
        );
        return;
      }

      if (team === "full") {
        clients[clientId].connection.send(
          JSON.stringify({
            message: "full",
          })
        );
        return;
      }

      const gameExist = games[gameId];
      if (!gameExist) {
        clients[clientId].connection.send(
          JSON.stringify({
            message: "false",
          })
        );
        return;
      }

      games[gameId].clients.push({ clientId, team });

      const payload = {
        method: "join",
        game: {
          id: gameId,
          balls: 30,
          clients: games[gameId].clients,
        },
      };

      games[gameId].clients.forEach((element) => {
        clients[element.clientId].connection.send(JSON.stringify(payload));
      });
    }

    // UPDATE
    if (data.method === "play") {
      const gameId = data.gameId;
      const team = data.clientTeam;
      const balls = data.balls;
      gameState = {
        id: gameId,
        state: state,
      };
      const ballExist = state.find((kotak) => kotak.key === balls);
      if (ballExist) {
        ballExist.value = team;
      } else {
        const stateData = { key: balls, value: team };
        state.push(stateData);
      }
      const payload = {
        method: "update",
        game: gameState,
      };
      games[gameId].clients.forEach((element) => {
        clients[element.clientId].connection.send(JSON.stringify(payload));
      });
    }
  });

  connection.on("close", () => {
    console.log("close");
  });

  connection.send(JSON.stringify(payload));
});
