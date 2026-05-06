import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NexusDashboard from './pages/NexusDashboard';
import NexusChat from './pages/NexusChat';
import NexusVideo from './pages/NexusVideo';
import { remBirth } from './api/remAPI';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
  remBirth().then(result => {
    if (result.born) console.log('✦ Rem ha nacido con su propia API');
  });
}, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NexusDashboard />} />
        <Route path="/chat" element={<NexusChat />} />
        <Route path="/video" element={<NexusVideo />} />
      </Routes>
    </Router>
  );
}