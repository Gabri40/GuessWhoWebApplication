"use strict";

const express = require("express");
const morgan = require("morgan"); // logging middleware
const {
  body,
  validationResult,
  param,
  ExpressValidator,
  header,
} = require("express-validator"); // validation middleware
const passport = require("passport"); // auth middleware
const LocalStrategy = require("passport-local").Strategy; // username and password for login

const session = require("express-session"); // enable sessions
const cors = require("cors");

const dao = require("./dao");
const userdao = require("./user-dao");

const dayjs = require("dayjs");

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(
  new LocalStrategy(function (username, password, done) {
    userdao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, {
          message: "Incorrect username and/or password.",
        });

      return done(null, user);
    });
  })
);

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userdao
    .getUserById(id)
    .then((user) => {
      done(null, user); // this will be available in req.user
    })
    .catch((err) => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static images
app.use(express.static("public"));

// set up the session
app.use(
  session({
    secret: "uvutobjkydkfgkjdfgsjkjklgfdsjkldabvdsjr",
    resave: false,
    saveUninitialized: false,
  })
);

// init passport
app.use(passport.initialize());
app.use(passport.session());

// ------------------------------------- USERS APIS -------------------------------------
// as week13 final version user apis

// POST /sessions
// login
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(info);
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current
// logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Unauthenticated user!" });
});

// ------------------------------------- GAME APIS -------------------------------------
// GET /api/plays/
// get all plays for current user
app.get("/api/plays/", (req, res) => {
  if (req.isAuthenticated()) {
    dao
      .getPlaysByID(req.user.id)
      .then((plays) => res.json(plays))
      .catch((err) => {
        res.status(500).json({
          errors: [{ msg: err }],
        });
      });
  } else {
    res.status(401).json({ error: "Unauthenticated user!" });
  }
});

// Retrieves the whole pokémon catalog from the database. This is a small
// application so the shuffle and selection could also be done on the database
// using ORDER BY RANDOM() and LIMIT N to only retrieve the desired number of
// pokemons, however if the table where to be larger shuffling on the database
// itself would be more inefficient, considering this i preferred to do the
// shuffle and selection here
async function getAllPokemon() {
  try {
    const pokemons = await dao.getAllPokemon();
    return pokemons;
  } catch (error) {
    throw error;
  }
}

// Shuffle array (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Choose a secret object based on the specified sublist of pokemons
function chooseSecretPokemon(pokemons) {
  const randomIndex = Math.floor(Math.random() * pokemons.length);
  return pokemons[randomIndex];
}

// POST /api/plays/
// add new play data
app.post("/api/start-game/", async (req, res) => {
  try {
    // Validate the difficulty level
    const difficulty = req.body.difficulty;
    if (difficulty !== 0 && difficulty !== 1 && difficulty !== 2) {
      res.status(400).json({ error: "Invalid difficulty level." });
      return;
    }

    // Get all pokemons from the database
    const allPokemons = await getAllPokemon();
    // Shuffle the pokemons
    const randomizedPokemons = shuffleArray(allPokemons);

    // Select a sublist based on difficulty
    let sublist;
    if (difficulty === 0) {
      sublist = randomizedPokemons.slice(0, 12);
    } else if (difficulty === 1) {
      sublist = randomizedPokemons.slice(0, 24);
    } else if (difficulty === 2) {
      sublist = randomizedPokemons;
    }

    // Choose a secret pokemon from the sublist
    const secretPokemon = chooseSecretPokemon(sublist);

    console.log("new game - secret pokemon: ", secretPokemon);

    const newplaydata = {
      userID: req.user ? req.user.id : null,
      date: dayjs().format("YYYY-MM-DD"),
      difficulty: difficulty,
      secretPokemon: secretPokemon.name,
      score: (difficulty + 1) * 12,
      type1: secretPokemon.type1,
      type2: secretPokemon.type2,
      generation: secretPokemon.generation,
      evolution_stage: secretPokemon.evolution_stage,
    };

    // console.log(newplaydata);

    dao.addPlay(newplaydata).then((playid) => {
      res.status(201).json({
        playID: playid,
        pokemons: sublist,
        difficulty: difficulty,
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

app.put("/api/check-property", (req, res) => {
  console.log(req.body);
  try {
    const { playID, propertyname, propertyvalue } = req.body;

    const validProperties = ["type1", "type2", "generation", "evolution_stage"];
    const validTypes = [
      "dragon",
      "bug",
      "dark",
      "electric",
      "fighting",
      "fire",
      "flying",
      "ghost",
      "grass",
      "ground",
      "ice",
      "normal",
      "poison",
      "psychic",
      "rock",
      "steel",
      "water",
    ];
    const validGenerations = ["1", "2"];
    const validEvolutionStages = ["0", "1", "2"];

    if (!validProperties.includes(propertyname)) {
      res.status(400).json({ error: "Invalid property name." });
      return;
    }
    if (
      (propertyname === "type1" || propertyname === "type2") &&
      !validTypes.includes(propertyvalue)
    ) {
      res.status(400).json({ error: "Invalid type." });
      return;
    }
    if (
      propertyname === "generation" &&
      !validGenerations.includes(propertyvalue)
    ) {
      res.status(400).json({ error: "Invalid generation." });
      return;
    }
    if (
      propertyname === "evolution_stage" &&
      !validEvolutionStages.includes(propertyvalue)
    ) {
      res.status(400).json({ error: "Invalid evolution stage." });
      return;
    }

    dao
      .checkPlayProperty(playID, propertyname, propertyvalue)
      .then((result) => {
        res.status(200).json({ hasProperty: result });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
      });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

app.put("/api/final-guess", (req, res) => {
  try {
    const { playID, guess } = req.body;

    // score check in dao
    dao.checkPlayGuess(playID, guess).then((result) => {
      res.status(200).json({ isGuessCorrect: result.finalscore });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.delete("/api/play/:playid", (req, res) => {
  try {
    const playID = req.params.playid;
    const userID = req.isAuthenticated() ? req.user.id : null;

    dao.removePlayByID(playID, userID).then((result) => {
      res.status(200).json({ isDeleted: result });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
