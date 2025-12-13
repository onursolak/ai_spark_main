import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import '../style/PricePredictor.css';

export default function PricePredictor({ metadata }) {
    const [formData, setFormData] = useState({
        district: '',
        neighborhood: '',
        grossArea: '',
        netArea: '',
        rooms: '3+1',
        buildingAge: '5-10 between',
        floorLocation: '',
        numFloors: '',
        heating: 'Central',
        bathrooms: 2,
        balcony: 'Yes',
        furnished: 'No',
        usingStatus: 'Empty',
        loanAvailable: 'Yes',
        fromWho: 'Owner',
        swap: 'No'
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [neighborhoods, setNeighborhoods] = useState([]);

    // İlçe değiştiğinde mahalleleri güncelle
    useEffect(() => {
        if (formData.district && metadata?.neighborhoods) {
            const districtNeighborhoods = metadata.neighborhoods[formData.district] || [];
            setNeighborhoods(districtNeighborhoods);
            // İlçe değişince mahalle seçimini sıfırla
            setFormData(prev => ({ ...prev, neighborhood: '' }));
        } else {
            setNeighborhoods([]);
        }
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
            // API'nin beklediği formatta veri hazırla
            const requestData = {
                "District": formData.district,
                "Neighborhood": formData.neighborhood,
                "m² (Gross)": parseInt(formData.grossArea),
                "m² (Net)": parseInt(formData.netArea),
                "Number of rooms": formData.rooms,
                "Building Age": formData.buildingAge,
                "Floor location": formData.floorLocation,
                "Number of floors": parseInt(formData.numFloors),
                "Heating": formData.heating,
                "Number of bathrooms": parseInt(formData.bathrooms),
                "Balcony": formData.balcony,
                "Furnished": formData.furnished,
                "Using status": formData.usingStatus,
                "Available for Loan": formData.loanAvailable,
                "From who": formData.fromWho,
                "Swap": formData.swap
            };

            console.log('Tahmin isteği gönderiliyor:', requestData);

            const result = await apiCall(API_ENDPOINTS.PREDICT, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            console.log('Tahmin sonucu:', result);
            
            // Backend'den gelen response'u kontrol et
            setPrediction(result.predicted_price || result.prediction || result);
            
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
                            {metadata?.districts?.map((district, idx) => (
                                <option key={idx} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mahalle */}
                    <div className="form-group">
                        <label>Mahalle *</label>
                        <select 
                            name="neighborhood" 
                            value={formData.neighborhood} 
                            onChange={handleChange}
                            required
                            disabled={!formData.district}
                        >
                            <option value="">
                                {!formData.district ? 'Önce İlçe Seçin' : 'Seçiniz'}
                            </option>
                            {neighborhoods.map((neighborhood, idx) => (
                                <option key={idx} value={neighborhood}>{neighborhood}</option>
                            ))}
                        </select>
                    </div>

                    {/* Brüt Metrekare */}
                    <div className="form-group">
                        <label>Brüt Metrekare *</label>
                        <input 
                            type="number" 
                            name="grossArea" 
                            value={formData.grossArea}
                            onChange={handleChange}
                            placeholder="Örn: 120"
                            required
                        />
                    </div>

                    {/* Net Metrekare */}
                    <div className="form-group">
                        <label>Net Metrekare *</label>
                        <input 
                            type="number" 
                            name="netArea" 
                            value={formData.netArea}
                            onChange={handleChange}
                            placeholder="Örn: 100"
                            required
                        />
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

                    {/* Bina Yaşı */}
                    <div className="form-group">
                        <label>Bina Yaşı *</label>
                        <select 
                            name="buildingAge" 
                            value={formData.buildingAge}
                            onChange={handleChange}
                            required
                        >
                            <option value="0-5 between">0-5 arası</option>
                            <option value="5-10 between">5-10 arası</option>
                            <option value="10-15 between">10-15 arası</option>
                            <option value="15-20 between">15-20 arası</option>
                            <option value="20+ older">20+ yaş</option>
                        </select>
                    </div>

                    {/* Bulunduğu Kat */}
                    <div className="form-group">
                        <label>Bulunduğu Kat *</label>
                        <input 
                            type="text" 
                            name="floorLocation" 
                            value={formData.floorLocation}
                            onChange={handleChange}
                            placeholder="Örn: 3"
                            required
                        />
                    </div>

                    {/* Kat Sayısı */}
                    <div className="form-group">
                        <label>Toplam Kat Sayısı *</label>
                        <input 
                            type="number" 
                            name="numFloors" 
                            value={formData.numFloors}
                            onChange={handleChange}
                            placeholder="Örn: 5"
                            required
                        />
                    </div>

                    {/* Isıtma */}
                    <div className="form-group">
                        <label>Isıtma</label>
                        <select 
                            name="heating" 
                            value={formData.heating}
                            onChange={handleChange}
                        >
                            <option value="Central">Merkezi</option>
                            <option value="Individual">Bireysel</option>
                            <option value="Natural Gas">Doğalgaz</option>
                        </select>
                    </div>

                    {/* Banyo Sayısı */}
                    <div className="form-group">
                        <label>Banyo Sayısı</label>
                        <input 
                            type="number" 
                            name="bathrooms" 
                            value={formData.bathrooms}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>

                    {/* Balkon */}
                    <div className="form-group">
                        <label>Balkon</label>
                        <select 
                            name="balcony" 
                            value={formData.balcony}
                            onChange={handleChange}
                        >
                            <option value="Yes">Var</option>
                            <option value="No">Yok</option>
                        </select>
                    </div>

                    {/* Eşyalı */}
                    <div className="form-group">
                        <label>Eşyalı</label>
                        <select 
                            name="furnished" 
                            value={formData.furnished}
                            onChange={handleChange}
                        >
                            <option value="Yes">Evet</option>
                            <option value="No">Hayır</option>
                        </select>
                    </div>

                    {/* Kullanım Durumu */}
                    <div className="form-group">
                        <label>Kullanım Durumu</label>
                        <select 
                            name="usingStatus" 
                            value={formData.usingStatus}
                            onChange={handleChange}
                        >
                            <option value="Empty">Boş</option>
                            <option value="Tenant">Kiracılı</option>
                            <option value="Owner">Mالکte</option>
                        </select>
                    </div>

                    {/* Krediye Uygun */}
                    <div className="form-group">
                        <label>Krediye Uygun</label>
                        <select 
                            name="loanAvailable" 
                            value={formData.loanAvailable}
                            onChange={handleChange}
                        >
                            <option value="Yes">Evet</option>
                            <option value="No">Hayır</option>
                        </select>
                    </div>

                    {/* Kimden */}
                    <div className="form-group">
                        <label>İlan Sahibi</label>
                        <select 
                            name="fromWho" 
                            value={formData.fromWho}
                            onChange={handleChange}
                        >
                            <option value="Owner">Mal Sahibi</option>
                            <option value="Agent">Emlakçı</option>
                        </select>
                    </div>

                    {/* Takas */}
                    <div className="form-group">
                        <label>Takas</label>
                        <select 
                            name="swap" 
                            value={formData.swap}
                            onChange={handleChange}
                        >
                            <option value="Yes">Evet</option>
                            <option value="No">Hayır</option>
                        </select>
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
                            {typeof prediction === 'number' 
                                ? prediction.toLocaleString('tr-TR') + ' ₺'
                                : prediction
                            }
                        </p>
                        <p className="result-note">
                            Bu tahmin yapay zeka modeli tarafından oluşturulmuştur.
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
