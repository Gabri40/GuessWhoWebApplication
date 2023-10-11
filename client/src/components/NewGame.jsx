import { React, useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../API";

function NewGame(props) {
  const navigate = useNavigate();
  const { loggedIn, newgamedata } = props;

  const [playID, setPlayID] = useState(undefined);
  const [difficulty, setDifficulty] = useState(0);

  const [pokemonList, setPokemonList] = useState([]);

  const [selectedProperty, setSelectedProperty] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [propertyCheckResult, setPropertyCheckResult] = useState(undefined);
  const [propertyCheckCount, setPropertyCheckCount] = useState(0);

  const [gameEnded, setGameEnded] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const exitGame = async () => {
    try {
      if (!gameEnded || !loggedIn) {
        const resp = await API.deletePlayByID(playID);
      }
      navigate("/");
    } catch (error) {
      console.error("Error exiting play:", error.message);
    }
  };

  useEffect(() => {
    // new game data props from difficulty selection page
    setPokemonList([...newgamedata.pokemons]);
    setPlayID(newgamedata.playID);
    setDifficulty(newgamedata.difficulty);
  }, []);

  // Check a selected property
  const handleCheckProperty = async (propertyname, propertyvalue) => {
    try {
      const checkPData = {
        playID: playID,
        propertyname: propertyname,
        propertyvalue: propertyvalue,
      };

      const response = await API.checkProperty(checkPData);

      // Update property check count
      setPropertyCheckCount(propertyCheckCount + 1);

      // Update property check result
      setPropertyCheckResult(response.hasProperty);
      const bool = response.hasProperty;

      // Update Pokemon list based on property check result
      if (bool) {
        setPokemonList([
          ...pokemonList.filter(
            (pokemon) => pokemon[propertyname] === propertyvalue
          ),
        ]);
      } else {
        setPokemonList([
          ...pokemonList.filter(
            (pokemon) => pokemon[propertyname] !== propertyvalue
          ),
        ]);
      }

      console.log("property check result", response);

      setPropertyValue("");
      setSelectedProperty("");
    } catch (error) {
      console.error("Error checking property:", error.message);
    }
  };

  // Make a guess on the selected Pokemon
  const handleMakeGuess = async (pokemonName) => {
    try {
      const makeguessdata = {
        playID: playID,
        guess: pokemonName,
      };

      const response = await API.makeGuess(makeguessdata);

      console.log("guess result", response);

      // Update game status and score
      // isGuessCorrect is 0 (falsy) for lose, finalscore (thruty) for win
      setGameEnded(true);
      setFinalScore(response.isGuessCorrect);
    } catch (error) {
      console.error("Error making a guess:", error.message);
    }
  };

  // Get distinct property values for dropdown options from the current list of pokemon
  const getDistinctPropertyOptions = (propertyname) => {
    const distinctOptions = new Set();
    pokemonList.forEach((pokemon) => {
      distinctOptions.add(pokemon[propertyname]);
    });
    return Array.from(distinctOptions);
  };

  return (
    <Container>
      {/* ----------------------------------------TITLE EXIT BUTTON------------------------------------------- */}
      <br />
      <Row>
        <Col className="pt-2">
          <big>
            New Game -{" "}
            {!difficulty ? "Easy" : difficulty == 1 ? "Medium" : "Hard"}{" "}
            Difficulty
          </big>
        </Col>
        <Col>
          <Button
            className="btn-secondary float-end"
            onClick={(e) => {
              e.preventDefault();
              exitGame();
            }}
          >
            Exit
          </Button>
        </Col>
      </Row>

      {/* ----------------------------------------PROPERTY CHECK FORM---------------------------------------- */}
      <br />
      {gameEnded ? null : (
        <Row>
          <Col>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (!gameEnded) {
                  handleCheckProperty(selectedProperty, propertyValue);
                }
              }}
            >
              {/* ---------------------------------------- PROPERTY NAME FORM */}
              <Form.Group controlId="propertySelect">
                <Form.Label>Select a property:</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedProperty}
                  onChange={(e) => {
                    setSelectedProperty(e.target.value);
                    setPropertyValue("");
                  }}
                >
                  <option value="">Select a property</option>
                  {/* the option to investigate a property is disabled if the value of that property has been guessed
                      i.e all the remaining pokemon have the same property value for that property 

                      to check this we just count the distict values for that property in the remaining pokemon list

                      for example : if all the remaining pokmeons have the first type to be water we can deduce 
                      the secret pokemon has water as its first type too, so the option to investigate type1 is disabled
                   */}
                  <option
                    value="type1"
                    disabled={getDistinctPropertyOptions("type1").length === 1}
                  >
                    Type 1
                  </option>
                  <option
                    value="type2"
                    disabled={getDistinctPropertyOptions("type2").length === 1}
                  >
                    Type 2
                  </option>
                  <option
                    value="generation"
                    disabled={
                      getDistinctPropertyOptions("generation").length === 1
                    }
                  >
                    Generation
                  </option>
                  <option
                    value="evolution_stage"
                    disabled={
                      getDistinctPropertyOptions("evolution_stage").length === 1
                    }
                  >
                    Evolution Stage
                  </option>
                </Form.Control>
              </Form.Group>

              {/* ---------------------------------------- PROPERTY VALUE FORM */}
              <Form.Group controlId="propertyValueSelect">
                <Form.Label className="mt-3">Select a value:</Form.Label>
                <Form.Control
                  as="select"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                >
                  <option value="">Select a value</option>
                  {getDistinctPropertyOptions(selectedProperty)
                    .filter((p) => p !== "")
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
              <Button
                className="mt-3"
                variant="primary"
                type="submit"
                disabled={
                  gameEnded ||
                  propertyValue === "" ||
                  getDistinctPropertyOptions(selectedProperty).length === 1
                }
              >
                Check Property
              </Button>
              {propertyCheckResult === undefined || gameEnded ? null : (
                <p
                  className={
                    propertyCheckResult
                      ? "text-success mt-2"
                      : "text-danger mt-2 mb-0"
                  }
                >
                  {propertyCheckResult ? "Correct!" : "Incorrect!"} (Properties
                  Checked: {propertyCheckCount})
                </p>
              )}
            </Form>
          </Col>
        </Row>
      )}

      {/* ---------------------------------------- END GAME INFO OR POKEMON CARDS BUTTON------------------------------------------- */}
      <br />
      <br />
      {gameEnded ? (
        <div className="text-center">
          <p>
            {finalScore ? "You won!" : "You lost!"} Your score is: {finalScore}
          </p>
        </div>
      ) : (
        <Row xs={2} sm={3} md={4} lg={6} className="g-4">
          {pokemonList.map((pokemon, index) => (
            <Col key={index}>
              <Card
                onClick={() => handleMakeGuess(pokemon.name)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <Card.Img
                    className="mt-0"
                    src={`http://localhost:3001/images/${pokemon.name}.png`}
                    alt={pokemon.name}
                  />
                  <Card.Title className="text-capitalize fw-bold text-center mt-3">
                    {pokemon.name}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default NewGame;
