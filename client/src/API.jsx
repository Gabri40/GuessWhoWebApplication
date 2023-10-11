const URL = "http://localhost:3001/api";

// ------------------------------------- USERS API CALLS -------------------------------------

/**
 * Logs in a user using the provided credentials.
 */
async function logIn(credentials) {
  let response = await fetch(URL + "/sessions", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

/**
 * Logs out the current user.
 */
async function logOut() {
  await fetch(URL + "/sessions/current", {
    method: "DELETE",
    credentials: "include",
  });
}

async function getUserInfo() {
  const response = await fetch(URL + "/sessions/current", {
    method: "GET",
    credentials: "include",
  });

  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;
  }
}

//
// Starts a new game with the specified difficulty.
//
async function startGame(difficulty) {
  const response = await fetch(URL + "/start-game", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ difficulty }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

//
// Check property API
//
async function checkProperty(checkpdata) {
  const response = await fetch(URL + "/check-property", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(checkpdata),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

//
// Make guess API
//
async function makeGuess(makeguessdata) {
  const response = await fetch(URL + "/final-guess", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(makeguessdata),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

//
// Get plays for a currently logged in user API
//
async function getPlays() {
  const response = await fetch(URL + "/plays", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

async function deletePlayByID(playid) {
  const response = await fetch(URL + "/play/" + playid, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

const API = {
  /* apis*/
  logIn,
  logOut,
  getUserInfo,
  startGame,
  checkProperty,
  makeGuess,
  getPlays,
  deletePlayByID,
};
export default API;
