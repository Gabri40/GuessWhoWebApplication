"use strict";

const sqlite = require("sqlite3");

// open the database
const db = new sqlite.Database("db.sqlite", (err) => {
  if (err) throw err;
});

// get all pokemon
exports.getAllPokemon = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM pokemon";
    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        const pokemons = rows.map((row) => ({
          name: row.name,
          type1: row.type1,
          type2: row.type2 ? row.type2 : "",
          generation: row.generation,
          evolution_stage: row.evolution_stage,
        }));
        resolve(pokemons);
      }
    });
  });
};

// get plays by id
exports.getPlaysByID = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM plays WHERE userID = ?";
    db.all(sql, [id], (err, rows) => {
      if (err) reject(err);
      else {
        const plays = rows.map((row) => ({
          playID: row.playID,
          userID: row.userID,
          date: row.date,
          difficulty: row.difficulty,
          secretPokemon: row.secretPokemon,
          score: row.score,
        }));
        resolve(plays);
      }
    });
  });
};

// save a play
exports.addPlay = (play) => {
  return new Promise((resolve, reject) => {
    const params = [
      play.userID,
      play.date,
      play.difficulty,
      play.secretPokemon,
      play.score,
      play.type1,
      play.type2,
      play.generation,
      play.evolution_stage,
    ];

    const sql =
      "INSERT INTO plays (userID, date, difficulty, secretPokemon, score, type1, type2, generation, evolution_stage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        const playID = this.lastID;
        resolve(playID);
      }
    });
  });
};

exports.checkPlayProperty = (playID, propertytype, propertyvalue) => {
  return new Promise((resolve, reject) => {
    const sql = `select ${propertytype}, score from plays where playID = ${playID}`;
    db.get(sql, (err, row) => {
      if (err) {
        reject(err);
      } else {
        const correct = row[propertytype] === propertyvalue;

        const sql1 = `update plays set score = score - 1 where playID = ${playID}`;
        db.run(sql1, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(correct);
          }
        });
      }
    });
  });
};

exports.checkPlayGuess = (playID, guess) => {
  return new Promise((resolve, reject) => {
    const sql = `select secretPokemon,score from plays where playID = ${playID}`;
    db.get(sql, (err, row) => {
      if (err) reject(err);
      else {
        //update score
        const win = row.secretPokemon === guess;

        if (win) {
          resolve({ finalscore: row.score });
        } else {
          const sql1 = `update plays set score = 0 where playID = ${playID}`;

          db.run(sql1, (err) => {
            if (err) reject(err);
            else resolve({ finalscore: 0 });
          });
        }
      }
    });
  });
};

exports.getPlaysByID = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM plays WHERE userID = ?";
    db.all(sql, [id], (err, rows) => {
      if (err) reject(err);
      else {
        const plays = rows.map((row) => ({
          playID: row.playID,
          userID: row.userID,
          date: row.date,
          difficulty: row.difficulty,
          secretPokemon: row.secretPokemon,
          score: row.score,
        }));
        resolve(plays);
      }
    });
  });
};

exports.removePlayByID = (playID, userID) => {
  return new Promise((resolve, reject) => {
    const sql =
      "DELETE FROM plays WHERE playID = ? AND (userID = ? OR userID IS NULL)";
    db.run(sql, [playID, userID], (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
};
