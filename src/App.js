import React, { useState, useEffect } from 'react';
import Navbar from "./components/Navbar";
import './App.css';
import Desktop from "./pages/Desktop";
import Favorites from "./pages/Favorites";
import PropertyDetail from "./pages/PropertyDetail";
import PricePredictor from "./components/PricePredictor";
import ImageDebugger from "./components/ImageDebugger";
import { API_ENDPOINTS, apiCall } from './config/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentView, setCurrentView] = useState('list');
  const [favorites, setFavorites] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // Backend'den metadata'yı yükle
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await apiCall(API_ENDPOINTS.META);
        console.log('Metadata yüklendi:', data);
        setMetadata(data);
      } catch (error) {
        console.error('Metadata yüklenemedi:', error);
      }
    };
    
    fetchMetadata();
  }, []);

  // LocalStorage'dan favorileri yükle
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Favorileri LocalStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Favori toggle fonksiyonu
  const toggleFavorite = (property) => {
    const isFavorited = favorites.some(fav => 
      fav.District === property.District && 
      fav.Neighborhood === property.Neighborhood &&
      fav.Price === property.Price
    );

    if (isFavorited) {
      setFavorites(favorites.filter(fav => 
        !(fav.District === property.District && 
          fav.Neighborhood === property.Neighborhood &&
          fav.Price === property.Price)
      ));
    } else {
      setFavorites([...favorites, property]);
    }
  };

  // Favori kontrolü
  const isFavorite = (property) => {
    return favorites.some(fav => 
      fav.District === property.District && 
      fav.Neighborhood === property.Neighborhood &&
      fav.Price === property.Price
    );
  };

  // Detay görüntüleme
  const viewDetail = (property) => {
    setSelectedProperty(property);
  };

  const closeDetail = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="App">
      <Navbar 
        currentView={currentView}
        onViewChange={setCurrentView}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        favoritesCount={favorites.length}
      />
      
      {currentPage === 'home' ? (
        <Desktop 
          viewMode={currentView}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          onViewDetail={viewDetail}
          metadata={metadata}
        />
      ) : currentPage === 'favorites' ? (
        <Favorites 
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onViewDetail={viewDetail}
        />
      ) : currentPage === 'predict' ? (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <PricePredictor metadata={metadata} />
        </div>
      ) : null}

      {selectedProperty && (
        <PropertyDetail 
          property={selectedProperty}
          onClose={closeDetail}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite(selectedProperty)}
        />
      )}
    </div>
  );
}

export default App;
