import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { Daily } from './Daily';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/daily" element={<Daily />} />
      </Routes>
    </BrowserRouter>
  );
}