// App.tsx
import './App.css';
import UserProfile from './usage';

function App() {
  const userId = "6"; // Example user ID

  return (
    <>
      <UserProfile userId={userId} />
    </>
  );
}

export default App;
