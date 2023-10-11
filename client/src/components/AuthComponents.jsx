import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";

// login form from lectures
function LoginForm(props) {
  const [username, setUsername] = useState("user1@test.com");
  const [password, setPassword] = useState("pwd");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then((user) => {
        setErrorMessage("");
        props.loginSuccessful(user);
        console.log("logged in" + user.name);
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage("Wrong username or password");
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");
    const credentials = { username, password };

    let valid = true;
    if (username === "" || password === "") valid = false;

    if (valid) {
      doLogIn(credentials);
    }
  };

  return (
    <>
      <Row className="mt-3 mx-3">
        <Col className="col-3"></Col>
        <Col className=" ">
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? (
              <Alert
                variant="danger"
                dismissible
                onClick={() => setErrorMessage("")}
              >
                {errorMessage}
              </Alert>
            ) : null}

            <Form.Group controlId="username">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="password" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </Form.Group>

            <Button className="btn  me-3 mt-3" type="submit">
              Login
            </Button>

            <Button className="btn  me-3 mt-3" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </Form>
        </Col>
        <Col className="col-3"></Col>
      </Row>
    </>
  );
}

export default LoginForm;
