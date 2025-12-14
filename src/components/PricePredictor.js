import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import '../style/PricePredictor.css';

export default function PricePredictor({ metadata }) {
    const [formData, setFormData] = useState({
        district: '',
        neighborhood: '',
        rooms: '3+1',
        grossArea: ''
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [neighborhoods, setNeighborhoods] = useState([]);

    // Debug: Metadata'yı console'a yazdır
    useEffect(() => {
        if (metadata) {
            console.log('📊 PricePredictor - Metadata yapısı:', {
                hasDistricts: !!metadata.districts,
                hasNeighborhoods: !!metadata.neighborhoods,
                hasAverage: !!metadata.average,
                hasAverageDistricts: !!metadata.average?.districts,
                hasAverageNeighborhoods: !!metadata.average?.neighborhoods,
                metadata: metadata
            });
        }
    }, [metadata]);

    // İlçe değiştiğinde mahalleleri güncelle
    useEffect(() => {
        const fetchNeighborhoods = async () => {
            if (!formData.district) {
                setNeighborhoods([]);
                return;
            }

            // Önce metadata'dan dene
            if (metadata) {
                let districtNeighborhoods = [];
                
                if (metadata.average?.neighborhoods?.[formData.district]) {
                    districtNeighborhoods = metadata.average.neighborhoods[formData.district];
                } else if (metadata.neighborhoods?.[formData.district]) {
                    districtNeighborhoods = metadata.neighborhoods[formData.district];
                }
                
                console.log('Seçilen ilçe:', formData.district);
                console.log('Bulunan mahalleler (metadata):', districtNeighborhoods);
                console.log('Mahalleler tipi:', typeof districtNeighborhoods, Array.isArray(districtNeighborhoods));
                
                // Eğer object ise ve array değilse, values'u al
                if (districtNeighborhoods && typeof districtNeighborhoods === 'object') {
                    if (Array.isArray(districtNeighborhoods)) {
                        // Array ise, her elemanın tipini kontrol et
                        const processedNeighborhoods = districtNeighborhoods.map(item => {
                            // Eğer item bir object ise, name property'sini al
                            if (typeof item === 'object' && item !== null) {
                                return item.name || item.neighborhood || item.Neighborhood || JSON.stringify(item);
                            }
                            // String ise direkt kullan
                            return item;
                        }).filter(Boolean);
                        
                        if (processedNeighborhoods.length > 0) {
                            console.log('Mahalleler array olarak kullanılıyor:', processedNeighborhoods);
                            setNeighborhoods(processedNeighborhoods);
                            setFormData(prev => ({ ...prev, neighborhood: '' }));
                            return;
                        }
                    } else {
                        // Object ise keys'i al (mahalle isimleri key olarak saklanıyor)
                        const keys = Object.keys(districtNeighborhoods);
                        if (keys.length > 0) {
                            console.log('Mahalleler object keys olarak kullanılıyor:', keys);
                            setNeighborhoods(keys);
                            setFormData(prev => ({ ...prev, neighborhood: '' }));
                            return;
                        }
                    }
                }
            }

            // Metadata'da yoksa API'den çek
            try {
                console.log('API\'den ilçe detayları çekiliyor:', formData.district);
                const districtData = await apiCall(API_ENDPOINTS.AVERAGE_DISTRICT(formData.district));
                console.log('İlçe detayları RAW:', districtData);
                console.log('İlçe detayları TIPI:', typeof districtData, Array.isArray(districtData));
                
                let neighborhoodList = [];
                
                // API'den gelen mahalle listesini çıkar
                if (districtData && districtData.neighborhoods) {
                    // Eğer neighborhoods bir object ise, key'leri al
                    if (typeof districtData.neighborhoods === 'object' && !Array.isArray(districtData.neighborhoods)) {
                        neighborhoodList = Object.keys(districtData.neighborhoods);
                        console.log('Mahalleler (object keys):', neighborhoodList);
                    } else if (Array.isArray(districtData.neighborhoods)) {
                        // Array ise, her elemanın tipini kontrol et
                        neighborhoodList = districtData.neighborhoods.map(item => {
                            if (typeof item === 'object' && item !== null) {
                                return item.name || item.neighborhood || item.Neighborhood || item.mahalle;
                            }
                            return item;
                        }).filter(Boolean);
                        console.log('Mahalleler (array processed):', neighborhoodList);
                    }
                } else if (districtData && Array.isArray(districtData)) {
                    // Eğer array olarak gelirse, mahalle isimlerini çıkar
                    neighborhoodList = [...new Set(districtData.map(item => {
                        // Farklı property isimlerini dene
                        if (typeof item === 'object' && item !== null) {
                            return item.name || item.neighborhood || item.Neighborhood || item.mahalle;
                        }
                        return item;
                    }).filter(Boolean))];
                    console.log('Mahalleler (array mapping):', neighborhoodList);
                } else if (districtData && typeof districtData === 'object') {
                    // Eğer başka bir yapıda ise, tüm key'leri listele
                    console.log('District Data Keys:', Object.keys(districtData));
                    // districts, rooms gibi key'leri kontrol et
                    if (districtData.data && Array.isArray(districtData.data)) {
                        neighborhoodList = [...new Set(districtData.data.map(item => {
                            if (typeof item === 'object' && item !== null) {
                                return item.name || item.neighborhood || item.Neighborhood || item.mahalle;
                            }
                            return item;
                        }).filter(Boolean))];
                        console.log('Mahalleler (data array):', neighborhoodList);
                    }
                }
                
                console.log('Final mahalle listesi:', neighborhoodList);
                setNeighborhoods(neighborhoodList);
                setFormData(prev => ({ ...prev, neighborhood: '' }));
            } catch (error) {
                console.error('Mahalleler yüklenemedi:', error);
                setNeighborhoods([]);
            }
        };

        fetchNeighborhoods();
    }, [formData.district, metadata]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            // Ortalama fiyat modeli için gerekli parametreler
            const requestData = {
                district: formData.district,
                neighborhood: formData.neighborhood || undefined, // Opsiyonel
                rooms: formData.rooms,
                area: parseInt(formData.grossArea) || undefined // Opsiyonel ama tahmin için önemli
            };

            console.log('Ortalama fiyat tahmini isteği gönderiliyor:', requestData);

            const result = await apiCall(API_ENDPOINTS.AVERAGE, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            console.log('Tahmin sonucu:', result);
            
            // Backend'den gelen response'u kaydet (tüm bilgileri)
            setPrediction(result);
            
        } catch (err) {
            console.error('Tahmin hatası:', err);
            setError('Fiyat tahmini alınırken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="price-predictor-container">
            <div className="predictor-header">
                <h2>🏠 Ev Fiyat Tahmini</h2>
                <p>Evin özelliklerini girin, yapay zeka fiyat tahmini versin!</p>
            </div>

            <form onSubmit={handleSubmit} className="predictor-form">
                <div className="form-grid">
                    {/* İlçe */}
                    <div className="form-group">
                        <label>İlçe *</label>
                        <select 
                            name="district" 
                            value={formData.district} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seçiniz</option>
                            {(metadata?.average?.districts || metadata?.districts || []).map((district, idx) => (
                                <option key={idx} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mahalle */}
                    <div className="form-group">
                        <label>Mahalle (Opsiyonel)</label>
                        <select 
                            name="neighborhood" 
                            value={formData.neighborhood} 
                            onChange={handleChange}
                            disabled={!formData.district}
                        >
                            <option value="">
                                {!formData.district ? 'Önce İlçe Seçin' : 'Tüm Mahalleler'}
                            </option>
                            {neighborhoods.map((neighborhood, idx) => {
                                // Güvenlik: neighborhood'un string olduğundan emin ol
                                const neighborhoodName = typeof neighborhood === 'string' 
                                    ? neighborhood 
                                    : (neighborhood?.name || neighborhood?.neighborhood || String(neighborhood));
                                return (
                                    <option key={idx} value={neighborhoodName}>
                                        {neighborhoodName}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Oda Sayısı */}
                    <div className="form-group">
                        <label>Oda Sayısı *</label>
                        <select 
                            name="rooms" 
                            value={formData.rooms}
                            onChange={handleChange}
                            required
                        >
                            <option value="1+1">1+1</option>
                            <option value="2+1">2+1</option>
                            <option value="3+1">3+1</option>
                            <option value="4+1">4+1</option>
                            <option value="5+1">5+1</option>
                        </select>
                    </div>

                    {/* Brüt Metrekare */}
                    <div className="form-group">
                        <label>Brüt Metrekare (Opsiyonel)</label>
                        <input 
                            type="number" 
                            name="grossArea" 
                            value={formData.grossArea}
                            onChange={handleChange}
                            placeholder="Örn: 120"
                        />
                        <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            Metrekare girdiğinizde daha hassas tahmin alırsınız
                        </small>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="predict-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Tahmin Ediliyor...
                        </>
                    ) : (
                        <>
                            🔮 Fiyat Tahmini Al
                        </>
                    )}
                </button>
            </form>

            {/* Sonuç */}
            {prediction && (
                <div className="prediction-result success">
                    <div className="result-icon">💰</div>
                    <div className="result-content">
                        <h3>Tahmini Fiyat</h3>
                        <p className="price">
                            {prediction.estimated_price 
                                ? prediction.estimated_price.toLocaleString('tr-TR') + ' ₺'
                                : prediction.average_price_formatted || prediction.average_price?.toLocaleString('tr-TR') + ' ₺'
                            }
                        </p>
                        
                        {/* Detaylı bilgiler */}
                        <div className="prediction-details">
                            {prediction.average_price && (
                                <div className="detail-item">
                                    <span className="detail-label">Ortalama Fiyat:</span>
                                    <span className="detail-value">{prediction.average_price.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            )}
                            {prediction.median_price && (
                                <div className="detail-item">
                                    <span className="detail-label">Medyan Fiyat:</span>
                                    <span className="detail-value">{prediction.median_price.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            )}
                            {prediction.price_per_m2 && (
                                <div className="detail-item">
                                    <span className="detail-label">m² Fiyat:</span>
                                    <span className="detail-value">{prediction.price_per_m2.toLocaleString('tr-TR')} ₺/m²</span>
                                </div>
                            )}
                            {prediction.sample_count !== undefined && (
                                <div className="detail-item">
                                    <span className="detail-label">Örnek Sayısı:</span>
                                    <span className="detail-value">{prediction.sample_count}</span>
                                </div>
                            )}
                            {prediction.confidence && (
                                <div className="detail-item">
                                    <span className="detail-label">Güven Seviyesi:</span>
                                    <span className={`confidence-badge ${prediction.confidence}`}>
                                        {prediction.confidence === 'high' ? 'Yüksek' : 
                                         prediction.confidence === 'medium' ? 'Orta' : 'Düşük'}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <p className="result-note">
                            Bu tahmin {prediction.sample_count} benzer satış verisine dayanmaktadır.
                        </p>
                    </div>
                </div>
            )}

            {/* Hata */}
            {error && (
                <div className="prediction-result error">
                    <div className="result-icon">⚠️</div>
                    <div className="result-content">
                        <h3>Hata</h3>
                        <p>{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
