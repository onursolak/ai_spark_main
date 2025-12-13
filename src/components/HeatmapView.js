import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet.heat'i doğru import et
require('leaflet.heat');

// Leaflet.heat global yükleniyor mu kontrol et
if (!L.heatLayer) {
    console.error('Leaflet.heat yüklenmedi!');
} else {
    console.log('Leaflet.heat başarıyla yüklendi!');
}

// İstanbul İlçeleri Koordinatları (Yedek)
const istanbulIlcelerKoordinat = {
    "Adalar": { lat: 40.8785, lng: 29.1250 },
    "Arnavutköy": { lat: 41.1885, lng: 28.7465 },
    "Ataşehir": { lat: 40.9827, lng: 29.1232 },
    "Avcılar": { lat: 40.9785, lng: 28.7211 },
    "Bağcılar": { lat: 41.0395, lng: 28.8570 },
    "Bahçelievler": { lat: 41.0025, lng: 28.8536 },
    "Bakırköy": { lat: 40.9785, lng: 28.8736 },
    "Başakşehir": { lat: 41.0809, lng: 28.8094 },
    "Bayrampaşa": { lat: 41.0449, lng: 28.8991 },
    "Beşiktaş": { lat: 41.0422, lng: 29.0059 },
    "Beykoz": { lat: 41.1337, lng: 29.1007 },
    "Beylikdüzü": { lat: 40.9900, lng: 28.6414 },
    "Beyoğlu": { lat: 41.0392, lng: 28.9784 },
    "Büyükçekmece": { lat: 41.0219, lng: 28.5851 },
    "Çatalca": { lat: 41.1433, lng: 28.4644 },
    "Çekmeköy": { lat: 41.0324, lng: 29.1775 },
    "Esenler": { lat: 41.0425, lng: 28.8764 },
    "Esenyurt": { lat: 41.0329, lng: 28.6744 },
    "Eyüpsultan": { lat: 41.0481, lng: 28.9242 },
    "Eyüp": { lat: 41.0481, lng: 28.9242 },
    "Fatih": { lat: 41.0192, lng: 28.9497 },
    "Gaziosmanpaşa": { lat: 41.0664, lng: 28.9106 },
    "Güngören": { lat: 41.0166, lng: 28.8749 },
    "Kadıköy": { lat: 40.9901, lng: 29.0320 },
    "Kağıthane": { lat: 41.0783, lng: 28.9737 },
    "Kartal": { lat: 40.8984, lng: 29.1923 },
    "Küçükçekmece": { lat: 41.0126, lng: 28.7853 },
    "Maltepe": { lat: 40.9357, lng: 29.1411 },
    "Pendik": { lat: 40.8781, lng: 29.2364 },
    "Sancaktepe": { lat: 41.0105, lng: 29.2267 },
    "Sarıyer": { lat: 41.1687, lng: 29.0529 },
    "Silivri": { lat: 41.0740, lng: 28.2464 },
    "Sultanbeyli": { lat: 40.9663, lng: 29.2632 },
    "Sultangazi": { lat: 41.1018, lng: 28.8695 },
    "Şile": { lat: 41.1750, lng: 29.6165 },
    "Şişli": { lat: 41.0602, lng: 28.9870 },
    "Tuzla": { lat: 40.8231, lng: 29.2989 },
    "Ümraniye": { lat: 41.0170, lng: 29.1092 },
    "Üsküdar": { lat: 41.0226, lng: 29.0200 },
    "Zeytinburnu": { lat: 40.9912, lng: 28.9007 }
};

// Heatmap layer'ı oluşturan bileşen
function HeatmapLayer({ points }) {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
        if (points && points.length > 0) {
            console.log('Heatmap points:', points.length, 'örnek:', points[0]);
            
            // Eski heat layer varsa kaldır
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }

            // Yeni heat layer oluştur
            heatLayerRef.current = L.heatLayer(points, {
                radius: 30,
                blur: 40,
                minOpacity: 0.5,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                    0.0: '#0000ff',
                    0.4: '#00ff00',
                    0.6: '#ffff00',
                    0.8: '#ff8800',
                    1.0: '#ff0000'
                }
            }).addTo(map);
            
            console.log('Heatmap layer eklendi');
        } else {
            console.warn('Heatmap points boş veya yok');
        }

        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [points, map]);

    return null;
}

export default function HeatmapView({ data }) {
    const [heatmapData, setHeatmapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // İstanbul'un merkezi
    const istanbulCenter = [41.0082, 28.9784];

    useEffect(() => {
        const prepareHeatmapData = async () => {
            setIsLoading(true);

            // İlçe bazında fiyat ortalaması ve ilan sayısını hesapla
            const districtMap = {};

            data.forEach(item => {
                const district = item.District;
                if (!districtMap[district]) {
                    districtMap[district] = {
                        totalPrice: 0,
                        count: 0,
                        avgPrice: 0
                    };
                }
                districtMap[district].totalPrice += item.Price;
                districtMap[district].count += 1;
            });

            // Ortalama fiyatları hesapla
            Object.keys(districtMap).forEach(district => {
                districtMap[district].avgPrice = 
                    districtMap[district].totalPrice / districtMap[district].count;
            });

            // İlçe koordinatlarını map'le
            const koordinatMap = {};
            
            // İlçe koordinatlarını çekmek için API'den yararlan
            try {
                const ilcelerResponse = await fetch('https://turkiyeapi.dev/api/v1/provinces/34');
                const ilcelerData = await ilcelerResponse.json();
                
                // İlçe koordinatlarını map'le
                if (ilcelerData.data && ilcelerData.data.districts) {
                    ilcelerData.data.districts.forEach(ilce => {
                        // Koordinatların var olup olmadığını kontrol et
                        if (ilce.coordinates && ilce.coordinates.latitude && ilce.coordinates.longitude) {
                            koordinatMap[ilce.name] = {
                                lat: ilce.coordinates.latitude,
                                lng: ilce.coordinates.longitude
                            };
                        }
                    });
                }
            } catch (error) {
                console.warn('API hatası, yedek koordinatlar kullanılıyor:', error);
            }
            
            // API'den alınamayan koordinatlar için yedek kullan
            Object.keys(districtMap).forEach(district => {
                if (!koordinatMap[district] && istanbulIlcelerKoordinat[district]) {
                    koordinatMap[district] = istanbulIlcelerKoordinat[district];
                }
            });
            
            console.log('Koordinat Map:', koordinatMap);
            console.log('İlçeler:', Object.keys(districtMap));

            // Heatmap için veri hazırla
            const heatPoints = [];
            const maxPrice = Math.max(...Object.values(districtMap).map(d => d.avgPrice));
            const minPrice = Math.min(...Object.values(districtMap).map(d => d.avgPrice));

            console.log('Fiyat aralığı:', minPrice, '-', maxPrice);

            Object.keys(districtMap).forEach(district => {
                const coords = koordinatMap[district];
                if (coords) {
                    // Fiyatı 0-1 arasında normalize et (intensity için)
                    const normalizedPrice = (districtMap[district].avgPrice - minPrice) / (maxPrice - minPrice);
                    const intensity = normalizedPrice * 0.9 + 0.3; // 0.3 - 1.2 arası (daha belirgin)
                    
                    console.log(`${district}: fiyat=${districtMap[district].avgPrice.toFixed(0)}, intensity=${intensity.toFixed(2)}, ilan=${districtMap[district].count}`);
                    
                    // İlan sayısına göre ek noktalar ekle (daha yoğun görünsün)
                    const pointCount = Math.max(Math.min(districtMap[district].count / 5, 50), 10); // En az 10, en fazla 50 nokta
                    for (let i = 0; i < pointCount; i++) {
                        // Koordinatları hafifçe dağıt
                        const latOffset = (Math.random() - 0.5) * 0.03;
                        const lngOffset = (Math.random() - 0.5) * 0.03;
                        heatPoints.push([
                            coords.lat + latOffset,
                            coords.lng + lngOffset,
                            intensity
                        ]);
                    }
                } else {
                    console.warn(`${district} için koordinat bulunamadı`);
                }
            });

            console.log('Toplam heatmap noktası:', heatPoints.length);
            setHeatmapData(heatPoints);
            setIsLoading(false);
        };

        if (data && data.length > 0) {
            prepareHeatmapData();
        }
    }, [data]);

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    Harita yükleniyor...
                </div>
            )}
            
            <MapContainer
                center={istanbulCenter}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <HeatmapLayer points={heatmapData} />
            </MapContainer>

            {/* Legend (açıklama) */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                fontSize: '12px'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    Fiyat Yoğunluğu
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ 
                        width: '80px', 
                        height: '15px', 
                        background: 'linear-gradient(to right, #0000ff, #00ff00, #ffff00, #ff8800, #ff0000)',
                        borderRadius: '3px'
                    }}></div>
                    <span style={{ fontSize: '11px' }}>Düşük → Yüksek</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                    Toplam {data.length} ilan
                </div>
            </div>
        </div>
    );
}
