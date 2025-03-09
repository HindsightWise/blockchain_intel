import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import EntityExplorer from './pages/EntityExplorer';
import TransactionVisualizer from './pages/TransactionVisualizer';
import AddressSearch from './pages/AddressSearch';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="entities" element={<EntityExplorer />} />
          <Route path="visualizer" element={<TransactionVisualizer />} />
          <Route path="search" element={<AddressSearch />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;