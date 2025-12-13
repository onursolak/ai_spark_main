import React from 'react';
import '../style/PropertyDetail.css';
import HouseImg from '../style/imgs/house.jpeg';

export default function PropertyDetail({ property, onClose, onToggleFavorite, isFavorite }) {
    if (!property) return null;

    return (
        <div className="detail-modal-overlay" onClick={onClose}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="detail-close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Header Image */}
                <div className="detail-header-image">
                    <img src={HouseImg} alt={`${property.District} ${property.Neighborhood}`} />
                    <button 
                        className={`detail-favorite-btn ${isFavorite ? 'favorited' : ''}`}
                        onClick={() => onToggleFavorite(property)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="detail-content">
                    {/* Title and Price */}
                    <div className="detail-header">
                        <div>
                            <h2 className="detail-title">
                                📍 {property.District}, {property.Neighborhood}
                            </h2>
                            <p className="detail-subtitle">Satılık Daire</p>
                        </div>
                        <div className="detail-price-container">
                            <span className="detail-price-label">Fiyat</span>
                            <span className="detail-price">
                                {property.Price.toLocaleString('tr-TR')} ₺
                            </span>
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="detail-features-grid">
                        <div className="detail-feature-card">
                            <div className="feature-icon">🏠</div>
                            <div className="feature-info">
                                <span className="feature-label">Oda Sayısı</span>
                                <span className="feature-value">{property["Number of rooms"]}</span>
                            </div>
                        </div>
                        <div className="detail-feature-card">
                            <div className="feature-icon">📏</div>
                            <div className="feature-info">
                                <span className="feature-label">Brüt m²</span>
                                <span className="feature-value">{property["m² (Gross)"]} m²</span>
                            </div>
                        </div>
                        <div className="detail-feature-card">
                            <div className="feature-icon">📏</div>
                            <div className="feature-info">
                                <span className="feature-label">Net m²</span>
                                <span className="feature-value">{property["m² (Net)"]} m²</span>
                            </div>
                        </div>
                        <div className="detail-feature-card">
                            <div className="feature-icon">🏢</div>
                            <div className="feature-info">
                                <span className="feature-label">Bulunduğu Kat</span>
                                <span className="feature-value">{property["Floor location"]}. Kat</span>
                            </div>
                        </div>
                        <div className="detail-feature-card">
                            <div className="feature-icon">🏗️</div>
                            <div className="feature-info">
                                <span className="feature-label">Bina Yaşı</span>
                                <span className="feature-value">{property["Age of building"]} Yıl</span>
                            </div>
                        </div>
                        <div className="detail-feature-card">
                            <div className="feature-icon">📅</div>
                            <div className="feature-info">
                                <span className="feature-label">İlan Tarihi</span>
                                <span className="feature-value">{new Date(property["Date"]).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="detail-section">
                        <h3 className="section-title">📝 İlan Açıklaması</h3>
                        <p className="detail-description">
                            {property.District} bölgesinde, {property.Neighborhood} mahallesinde satılık {property["Number of rooms"]} daire.
                            {property["m² (Gross)"]} m² brüt alana sahip bu daire, {property["Floor location"]}. katta bulunmaktadır.
                            Bina yaşı {property["Age of building"]} yıldır.
                        </p>
                    </div>

                    {/* Location */}
                    <div className="detail-section">
                        <h3 className="section-title">📍 Konum Bilgisi</h3>
                        <div className="location-info">
                            <div className="location-item">
                                <span className="location-label">İl:</span>
                                <span className="location-value">İstanbul</span>
                            </div>
                            <div className="location-item">
                                <span className="location-label">İlçe:</span>
                                <span className="location-value">{property.District}</span>
                            </div>
                            <div className="location-item">
                                <span className="location-label">Mahalle:</span>
                                <span className="location-value">{property.Neighborhood}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="detail-actions">
                        <a 
                            href={`https://www.google.com/maps/search/${property.District} ${property.Neighborhood}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="detail-action-btn primary"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            Haritada Göster
                        </a>
                        <button className="detail-action-btn secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            İletişime Geç
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
