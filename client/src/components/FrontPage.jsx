import { React, useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../API";

function FrontPage(props) {
  const { loggedIn, setNewgamedata } = props;
  const navigate = useNavigate();

  const [plays, setPlays] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  // Load plays and calculate total score on component load
  useEffect(() => {
    if (loggedIn) {
      API.getPlays()
        .then((response) => {
          setPlays(response);
          const sumScore = response.reduce(
            (total, play) => total + play.score,
            0
          );
          setTotalScore(sumScore);
        })
        .catch((error) => {
          console.error("Error loading plays:", error.message);
        });
    }
  }, []);

  const createNewGame = async (difficulty) => {
    try {
      const response = await API.startGame(difficulty);
      setNewgamedata(response);
      console.log("new game", response);
      navigate("/play");
    } catch (error) {
      console.error("Error starting the game:", error.message);
    }
  };

  return (
    <Container>
      <br />
      <Row>
        <Col className="pt-2">
          <big>New Game:</big>
        </Col>
        <Col>
          <Button
            className="w-100"
            onClick={(e) => {
              e.preventDefault();
              createNewGame(0);
            }}
          >
            Easy
          </Button>
        </Col>
        <Col>
          <Button
            className="w-100"
            onClick={(e) => {
              e.preventDefault();
              createNewGame(1);
            }}
          >
            Medium
          </Button>
        </Col>
        <Col>
          <Button
            className="w-100"
            onClick={(e) => {
              e.preventDefault();
              createNewGame(2);
            }}
          >
            Hard
          </Button>
        </Col>
      </Row>

      <br />
      <br />

      {loggedIn ? (
        <>
          <Row>
            <Col>
              <big>Previous Games:</big>
            </Col>
            <Col>
              <big>Total Score: {totalScore}</big>
            </Col>
            <Col>
              <big>Number of Plays: {plays.length}</big>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Difficulty</th>
                    <th>Secret Pokemon</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {plays.map((play) => (
                    <tr key={play.playID}>
                      <td>{play.date}</td>
                      <td>
                        {play.difficulty === 0
                          ? "Easy"
                          : play.difficulty === 1
                          ? "Medium"
                          : "Hard"}
                      </td>
                      <td className="text-capitalize">{play.secretPokemon}</td>
                      <td>{play.score}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      ) : null}
    </Container>
  );
}

export default FrontPage;
