const ws = new WebSocket("ws://localhost:8000");

//HTML ELEMENTS
const btnCreate = document.querySelector("#btn-create");
const btnJoin = document.querySelector("#btn-join");
const inputGameId = document.querySelector(".game-id");

// FUNCTION
const changeTeam = (tag, balls) => {
  if (!gameId) {
    return alert("you are not join any game room");
  }
  if (gameStatus !== null) {
    return alert(gameStatus);
  }
  ws.send(
    JSON.stringify({
      method: "play",
      clientId: clientId,
      clientTeam: team,
      gameId: inputGameId.value,
      balls: balls,
    })
  );
  tag.style.cssText = `background-color: ${team}; width: 200px; height: 100px; margin-left: 10px;`;
};

// CREATE GAME ROOM
btnCreate.addEventListener("click", (e) => {
  const payload = {
    method: "create",
    clientId: clientId,
  };
  ws.send(JSON.stringify(payload));
});

// JOIN GAME ROOM
btnJoin.addEventListener("click", () => {
  const payload = {
    method: "join",
    clientId: clientId,
    gameId: inputGameId.value,
  };

  ws.send(JSON.stringify(payload));
});

// VALUE
let clientId = null;
let gameId = null;
let team = "grey";
let gameStatus = null;

// GET MESSAGE
ws.onmessage = (msg) => {
  const response = JSON.parse(msg.data);

  // CREATE RESPONSE
  if (response.method === "create") {
    gameId = response.game.gameId;
    alert(`here is your gameId: ${gameId}`)
  }

  // CONNECT RESPONSE
  if (response.method === "connect") {
    clientId = response.clientId;
  }

  // JOIN RESPONSE
  if (response.method === "join") {
    const user = response.game.clients.find((id) => id.clientId === clientId);
    team = user.team;
    gameStatus = null;
    alert("play now!")
    gameId = response.game.id
  }

  // UPDATE RESPONSE
  if (response.method === "update") {
    const state = response.game.state;
    state.forEach(e => {
      document.querySelector(`.${e.key}`).style.cssText = `background-color: ${e.value}; width: 200px; height: 100px; margin-left: 10px;`
    });
  }

  // GAME ERROR RESPONSE
  if (response.message === "false") {
    alert("wrong id");
    gameStatus = "wrong id";
  }
  if (response.message === "full") {
    gameStatus = "game is full";
  }
};
