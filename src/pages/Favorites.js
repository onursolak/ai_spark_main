import React from 'react';
import '../style/Favorites.css';
import HouseImg from '../style/imgs/house.jpeg';
import { getPropertyMainImage } from '../utils/imageHelper';

export default function Favorites({ favorites, onToggleFavorite, onViewDetail }) {
    return (
        <div className="favorites-container">
            {/* Header */}
            <div className="favorites-header">
                <div>
                    <h1 className="favorites-title">
                        ❤️ Beğendiklerim
                    </h1>
                    <p className="favorites-subtitle">
                        {favorites.length} ilan kaydettin
                    </p>
                </div>
            </div>

            {/* Content */}
            {favorites.length === 0 ? (
                <div className="favorites-empty">
                    <div className="empty-icon">💔</div>
                    <h3 className="empty-title">Henüz Beğenilen İlan Yok</h3>
                    <p className="empty-description">
                        İlanları beğenmeye başlayın ve buradan kolayca erişin
                    </p>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favorites.map((ilan, index) => (
                        <div className="favorite-card" key={index}>
                            <div className="card-image-wrapper">
                                <img 
                                    src={getPropertyMainImage(ilan)} 
                                    alt={`${ilan.District} Satılık Daire`}
                                    onError={(e) => {
                                        e.target.src = HouseImg;
                                    }}
                                />
                                
                                <button 
                                    className="card-favorite favorited"
                                    onClick={() => onToggleFavorite(ilan)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="card-body">
                                <div>
                                    <h4>{ilan.District}, {ilan.Neighborhood}</h4>
                                </div>
                                
                                <div>
                                    <p className="price">
                                        {ilan.Price.toLocaleString('tr-TR')}
                                    </p>
                                    
                                    <div className="features">
                                        <span>🏠 {ilan["Number of rooms"]}</span>
                                        <span>📏 {ilan["m² (Gross)"]} m²</span>
                                        <span>🏢 {ilan["Floor location"]}. Kat</span>
                                    </div>
                                    
                                    <div className="btn-group">
                                        <button 
                                            className="detail-btn btn-primary"
                                            onClick={() => onViewDetail(ilan)}
                                        >
                                            📋 Detayları Gör
                                        </button>
                                        <button className="detail-btn btn-secondary">
                                            <a 
                                                target='_blank' 
                                                rel="noopener noreferrer"
                                                href={`https://www.google.com/maps/search/${ilan["District"]} ${ilan["Neighborhood"]}`}
                                                style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}
                                            >
                                                📍
                                            </a>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
