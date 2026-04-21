import { HashRouter, Routes, Route } from 'react-router-dom';
import { DebtProvider } from './store/DebtContext';
import { LanguageProvider } from './store/LanguageContext';
import { HomeScreen } from './screens/HomeScreen';
import { DetailScreen } from './screens/DetailScreen';

function App() {
  return (
    <LanguageProvider>
      <DebtProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/person/:id" element={<DetailScreen />} />
          </Routes>
        </HashRouter>
      </DebtProvider>
    </LanguageProvider>
  );
}

export default App;
