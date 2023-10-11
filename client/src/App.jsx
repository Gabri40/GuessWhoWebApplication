import { React, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import Nav from "./components/Nav";
import LoginForm from "./components/AuthComponents";
import API from "./API";
import FrontPage from "./components/FrontPage";
import NewGame from "./components/NewGame";

function App() {
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [newgamedata, setNewgamedata] = useState({});

  // user login
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {}
    };
    checkAuth();
  }, []);

  const doLogOut = () => {
    API.logOut().then(() => {
      setLoggedIn(false);
      setUser(undefined);
      console.log("logged out");
    });
  };

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Nav user={user} doLogOut={doLogOut} />
              <FrontPage loggedIn={loggedIn} setNewgamedata={setNewgamedata} />
            </>
          }
        />
        <Route
          path="/play"
          element={
            <>
              <Nav user={user} doLogOut={doLogOut} />
              <NewGame loggedIn={loggedIn} newgamedata={newgamedata} />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Nav user={user} doLogOut={doLogOut} />
              <LoginForm loginSuccessful={loginSuccessful} />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
