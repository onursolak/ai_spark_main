import React, { useState } from 'react';
import '../style/PropertyDetail.css';
import HouseImg from '../style/imgs/house.jpeg';
import { API_ENDPOINTS, apiCall } from '../config/api';

export default function PropertyDetail({ property, onClose, onToggleFavorite, isFavorite }) {
    const [predicting, setPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);
    
    if (!property) return null;

    // Fiyat tahmini fonksiyonu
    const handlePredictPrice = async () => {
        setPredicting(true);
        
        try {
            // Veriyi API formatına dönüştür
            const convertToAPIFormat = (data) => {
                let rooms = data["Number of rooms"];
                if (typeof rooms === 'number') {
                    rooms = rooms > 1 ? `${rooms-1}+1` : "1+1";
                }
                
                let balcony = data["Balcony"];
                if (balcony === "Available" || balcony === "Var") {
                    balcony = "Yes";
                } else if (balcony === "Not Available" || balcony === "Yok") {
                    balcony = "No";
                }
                
                let buildingAge = data["Building Age"];
                if (typeof buildingAge === 'number') {
                    if (buildingAge <= 5) buildingAge = "0-5 between";
                    else if (buildingAge <= 10) buildingAge = "5-10 between";
                    else if (buildingAge <= 15) buildingAge = "10-15 between";
                    else if (buildingAge <= 20) buildingAge = "15-20 between";
                    else buildingAge = "20+ older";
                }
                
                let heating = data["Heating"];
                if (heating && heating.includes("Natural Gas")) {
                    heating = "Natural Gas";
                } else if (heating && heating.includes("Central")) {
                    heating = "Central";
                } else {
                    heating = "Central";
                }
                
                let fromWho = data["From who"];
                if (fromWho === "From the real estate office" || fromWho === "Emlakçı") {
                    fromWho = "Agent";
                } else {
                    fromWho = "Owner";
                }
                
                let usingStatus = data["Using status"];
                if (usingStatus === "Property owner" || usingStatus === "Boş") {
                    usingStatus = "Empty";
                } else if (usingStatus === "Tenant" || usingStatus === "Kiracılı") {
                    usingStatus = "Tenant";
                } else {
                    usingStatus = "Empty";
                }
                
                return {
                    "District": data.District,
                    "Neighborhood": data.Neighborhood,
                    "m² (Gross)": parseInt(data["m² (Gross)"]),
                    "m² (Net)": parseInt(data["m² (Net)"]),
                    "Number of rooms": rooms,
                    "Building Age": buildingAge,
                    "Floor location": data["Floor location"].toString(),
                    "Number of floors": parseInt(data["Number of floors"]),
                    "Heating": heating,
                    "Number of bathrooms": parseInt(data["Number of bathrooms"]) || 1,
                    "Balcony": balcony,
                    "Furnished": data["Furnished"] === "Yes" || data["Furnished"] === "Evet" ? "Yes" : "No",
                    "Using status": usingStatus,
                    "Available for Loan": data["Available for Loan"] === "Yes" || data["Available for Loan"] === "Evet" ? "Yes" : "No",
                    "From who": fromWho,
                    "Swap": data["Swap"] === "Yes" || data["Swap"] === "Evet" ? "Yes" : "No"
                };
            };

            const requestData = convertToAPIFormat(property);
            console.log('🔮 Detay sayfası - Fiyat tahmini:', requestData);

            const result = await apiCall(API_ENDPOINTS.PREDICT, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            let predictedPrice = null;
            if (typeof result === 'number') {
                predictedPrice = result;
            } else if (result.predicted_price) {
                predictedPrice = result.predicted_price;
            } else if (result.prediction) {
                predictedPrice = result.prediction;
            } else if (result.price) {
                predictedPrice = result.price;
            } else if (result.data) {
                predictedPrice = result.data;
            }

            if (!predictedPrice || isNaN(predictedPrice)) {
                throw new Error('Tahmin edilen fiyat geçersiz');
            }

            const actualPrice = property.Price;
            const difference = ((actualPrice - predictedPrice) / predictedPrice) * 100;
            let status = 'normal';
            
            if (difference > 15) {
                status = 'expensive';
            } else if (difference < -15) {
                status = 'cheap';
            }
            
            setPrediction({
                predicted: predictedPrice,
                actual: actualPrice,
                difference: difference.toFixed(1),
                status: status
            });
            
        } catch (error) {
            console.error('❌ Detay sayfası - Fiyat tahmini hatası:', error);
            setPrediction({
                error: 'Tahmin alınamadı'
            });
        } finally {
            setPredicting(false);
        }
    };

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

                    {/* AI Fiyat Tahmini Butonu */}
                    <div className="detail-prediction-section">
                        <button 
                            className="detail-predict-btn"
                            onClick={handlePredictPrice}
                            disabled={predicting}
                        >
                            {predicting ? (
                                <>
                                    <span className="spinner-small"></span>
                                    <span>Tahmin ediliyor...</span>
                                </>
                            ) : prediction ? (
                                <>
                                    <span>🔄</span>
                                    <span>Yeniden Tahmin Et</span>
                                </>
                            ) : (
                                <>
                                    <span>🔮</span>
                                    <span>AI ile Fiyat Tahmini</span>
                                </>
                            )}
                        </button>

                        {/* Tahmin Sonucu */}
                        {prediction && !prediction.error && (
                            <div className={`detail-prediction-result ${prediction.status}`}>
                                <div className="prediction-result-header">
                                    {prediction.status === 'expensive' && (
                                        <>
                                            <span className="result-icon">📈</span>
                                            <span className="result-title">Fiyat Ortalamanın Üzerinde</span>
                                        </>
                                    )}
                                    {prediction.status === 'cheap' && (
                                        <>
                                            <span className="result-icon">📉</span>
                                            <span className="result-title">Fiyat Ortalamanın Altında</span>
                                        </>
                                    )}
                                    {prediction.status === 'normal' && (
                                        <>
                                            <span className="result-icon">✅</span>
                                            <span className="result-title">Fiyat Normal Seviyede</span>
                                        </>
                                    )}
                                </div>
                                <div className="prediction-result-body">
                                    <div className="prediction-stat">
                                        <span className="stat-label">AI Tahmini</span>
                                        <span className="stat-value">{prediction.predicted.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <div className="prediction-stat">
                                        <span className="stat-label">İlan Fiyatı</span>
                                        <span className="stat-value">{prediction.actual.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <div className="prediction-stat">
                                        <span className="stat-label">Fark</span>
                                        <span className={`stat-value ${prediction.status}`}>
                                            {prediction.difference > 0 ? '+' : ''}{prediction.difference}%
                                        </span>
                                    </div>
                                </div>
                                <p className="prediction-note">
                                    {prediction.status === 'expensive' && 
                                        `Bu ilan, benzer özelliklerdeki evlere göre %${Math.abs(prediction.difference)} daha pahalı.`
                                    }
                                    {prediction.status === 'cheap' && 
                                        `Bu ilan, benzer özelliklerdeki evlere göre %${Math.abs(prediction.difference)} daha ucuz. İyi bir fırsat olabilir!`
                                    }
                                    {prediction.status === 'normal' && 
                                        'Bu ilanın fiyatı piyasa ortalamasına uygun.'
                                    }
                                </p>
                            </div>
                        )}

                        {prediction && prediction.error && (
                            <div className="detail-prediction-error">
                                <span>⚠️</span>
                                <span>{prediction.error}</span>
                            </div>
                        )}
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
                                <span className="feature-value">
                                    {property["Building Age"] || property["Age of building"] || 'Belirtilmemiş'}
                                    {(property["Building Age"] || property["Age of building"]) && ' Yıl'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="detail-section">
                        <h3 className="section-title">📝 İlan Açıklaması</h3>
                        <p className="detail-description">
                            {property.District} bölgesinde, {property.Neighborhood} mahallesinde satılık {property["Number of rooms"]} daire.
                            {property["m² (Gross)"]} m² brüt alana sahip bu daire, {property["Floor location"]}. katta bulunmaktadır.
                            {(property["Building Age"] || property["Age of building"]) && 
                                ` Bina yaşı ${property["Building Age"] || property["Age of building"]} yıldır.`
                            }
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
