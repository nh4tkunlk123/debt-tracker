import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DebtProvider } from './store/DebtContext';
import { LanguageProvider } from './store/LanguageContext';
import { HomeScreen } from './screens/HomeScreen';
import { DetailScreen } from './screens/DetailScreen';

function App() {
  return (
    <LanguageProvider>
      <DebtProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/person/:id" element={<DetailScreen />} />
          </Routes>
        </BrowserRouter>
      </DebtProvider>
    </LanguageProvider>
  );
}

export default App;
