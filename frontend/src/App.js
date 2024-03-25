import React from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Logout from "./components/Auth/Logout";
import EntryForm from "./components/EntryForm";
import Review from "./components/Review";
import Journal from "./components/Journal";

const NavBar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Login</Link>
        </li>
        <li>
          <Link to="/entry">Entry Form</Link>
        </li>
        <li>
          <Link to="/review">Review</Link>
        </li>
        <li>
          <Link to="/journal">Journal</Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/register" component={Register} />
          <PrivateRoute path="/entry" component={EntryForm} />
          <PrivateRoute path="/review" component={Review} />
          <Route path="/journal" component={Journal} />
          <Route path="/logout" component={Logout} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
