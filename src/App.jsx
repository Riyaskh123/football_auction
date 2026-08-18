import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import DisplayScreen from './pages/DisplayScreen.jsx'
import ControlScreen from './pages/ControlScreen.jsx'
import RegisterScreen from './pages/RegisterScreen.jsx'
import AdminRegistrations from './pages/AdminRegistrations.jsx'
import ResultsScreen from './pages/ResultsScreen.jsx'
import TeamRegisterScreen from './pages/TeamRegisterScreen.jsx'
import AdminTeamRegistrations from './pages/AdminTeamRegistrations.jsx'
import PlayersListScreen from './pages/PlayersListScreen.jsx'
import AdminFixtures from './pages/AdminFixtures.jsx'
import FixturesScreen from './pages/FixturesScreen.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/display" element={<DisplayScreen />} />
      <Route path="/control" element={<ControlScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/admin/registrations" element={<AdminRegistrations />} />
      <Route path="/results" element={<ResultsScreen />} />
      <Route path="/register/team" element={<TeamRegisterScreen />} />
      <Route path="/admin/team-registrations" element={<AdminTeamRegistrations />} />
      <Route path="/players" element={<PlayersListScreen />} />
      <Route path="/admin/fixtures" element={<AdminFixtures />} />
      <Route path="/fixtures" element={<FixturesScreen />} />
    </Routes>
  )
}
