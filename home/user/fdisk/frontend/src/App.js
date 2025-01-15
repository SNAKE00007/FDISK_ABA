import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Equipment from './pages/Equipment';
import Reports from './pages/Reports';
import Members from './pages/Members';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Switch>
          <Route exact path="/" component={Login} />
          <PrivateRoute path="/dashboard" component={Dashboard} />
          <PrivateRoute path="/users" component={Users} />
          <PrivateRoute path="/equipment" component={Equipment} />
          <PrivateRoute path="/reports" component={Reports} />
          <PrivateRoute path="/members" component={Members} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;