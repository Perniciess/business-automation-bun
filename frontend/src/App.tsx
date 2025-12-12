import Home from "@/pages/Home"
import Statement from "@/pages/Statement"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Dashboard from './pages/Dashboard'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statement" element={<Statement />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );    
}

export default App;
