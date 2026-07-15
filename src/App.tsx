import { Routes, Route } from 'react-router-dom';
import { CompareProvider } from './context/CompareContext';
import { ConsultantLinkProvider } from './context/ConsultantLinkContext';
import { PropertySeekerLayout } from './pages/property-seeker/PropertySeekerLayout';
import { BrowsePage } from './pages/property-seeker/BrowsePage';
import { ComparisonPage } from './pages/property-seeker/ComparisonPage';
import { PropertyDetailsPage } from './pages/property-seeker/PropertyDetailsPage';

function App() {
  return (
    <CompareProvider>
      <ConsultantLinkProvider>
        <Routes>
          <Route element={<PropertySeekerLayout />}>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/property/:id" element={<PropertyDetailsPage />} />
          </Route>
        </Routes>
      </ConsultantLinkProvider>
    </CompareProvider>
  );
}

export default App;
