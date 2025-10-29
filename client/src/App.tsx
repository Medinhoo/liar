import { SocketProvider, useSocket } from './context/SocketContext';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';

function AppContent() {
  const { roomId } = useSocket();

  return roomId ? <GameRoom /> : <Home />;
}

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;
