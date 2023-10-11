import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";

function Nav(props) {
  const navigate = useNavigate();
  return (
    <>
      <Navbar className="bg-primary mb-3" data-bs-theme="dark">
        <Container>
          <Navbar.Brand
            className="fw-bold fs-2"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            Who's That Pokemon?
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              {!props.user ? (
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Login
                </a>
              ) : (
                <>
                  <span>logged in as {props.user.name}: </span>
                  <a
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      props.doLogOut();
                      navigate("/");
                    }}
                  >
                    Logout
                  </a>
                </>
              )}
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Nav;
