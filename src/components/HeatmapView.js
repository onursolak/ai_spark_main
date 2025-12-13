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

<<<<<<< HEAD
            // Yeni heat layer oluştur - maxZoom'u kaldırarak her zoom seviyesinde görünmesini sağla
            heatLayerRef.current = L.heatLayer(points, {
                radius: 35,
                blur: 45,
                minOpacity: 0.6,
=======
            // Yeni heat layer oluştur
            heatLayerRef.current = L.heatLayer(points, {
                radius: 30,
                blur: 40,
                minOpacity: 0.5,
                maxZoom: 17,
>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)
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

<<<<<<< HEAD
// İlçe etiketlerini gösteren bileşen
function DistrictLabels({ districts }) {
    const map = useMap();
    const markersRef = useRef([]);
    const [currentZoom, setCurrentZoom] = useState(11);

    useEffect(() => {
        const handleZoom = () => {
            setCurrentZoom(map.getZoom());
        };

        map.on('zoomend', handleZoom);
        return () => {
            map.off('zoomend', handleZoom);
        };
    }, [map]);

    useEffect(() => {
        // Eski markerları temizle
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];

        // Zoom seviyesi çok yüksekse (çok yakınsa) etiketleri gösterme
        if (currentZoom > 13 || currentZoom < 10) {
            return;
        }

        if (districts && districts.length > 0) {
            // Zoom seviyesine göre boyut ayarla
            const scale = currentZoom / 11; // 11 varsayılan zoom
            const fontSize = Math.max(11, 13 * scale);
            const priceSize = Math.max(12, 14 * scale);

            districts.forEach(district => {
                // Özel bir DivIcon oluştur
                const icon = L.divIcon({
                    className: 'district-label',
                    html: `
                        <div style="
                            background: rgba(255, 255, 255, 0.95);
                            padding: ${6 * scale}px ${10 * scale}px;
                            border-radius: 6px;
                            font-weight: bold;
                            font-size: ${fontSize}px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            border: 2px solid #f27f0e;
                            white-space: nowrap;
                            text-align: center;
                            color: #333;
                        ">
                            <div style="font-size: ${fontSize - 2}px; color: #666; margin-bottom: 2px;">${district.name}</div>
                            <div style="color: #f27f0e; font-size: ${priceSize}px;">${district.avgPrice}</div>
                            <div style="font-size: ${fontSize - 4}px; color: #999;">${district.count} ilan</div>
                        </div>
                    `,
                    iconSize: [120 * scale, 60 * scale],
                    iconAnchor: [60 * scale, 30 * scale]
                });

                const marker = L.marker([district.lat, district.lng], { 
                    icon: icon,
                    // Etiketlerin tıklanabilir olmamasını sağla
                    interactive: false
                }).addTo(map);

                markersRef.current.push(marker);
            });
        }

        return () => {
            markersRef.current.forEach(marker => map.removeLayer(marker));
            markersRef.current = [];
        };
    }, [districts, map, currentZoom]);

    return null;
}

export default function HeatmapView({ data }) {
    const [heatmapData, setHeatmapData] = useState([]);
    const [districtLabels, setDistrictLabels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLabels, setShowLabels] = useState(false); // Başlangıçta kapalı
=======
export default function HeatmapView({ data }) {
    const [heatmapData, setHeatmapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)

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

<<<<<<< HEAD
            // İlçe etiketleri için veri hazırla
            const labels = [];

=======
>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)
            Object.keys(districtMap).forEach(district => {
                const coords = koordinatMap[district];
                if (coords) {
                    // Fiyatı 0-1 arasında normalize et (intensity için)
                    const normalizedPrice = (districtMap[district].avgPrice - minPrice) / (maxPrice - minPrice);
                    const intensity = normalizedPrice * 0.9 + 0.3; // 0.3 - 1.2 arası (daha belirgin)
                    
                    console.log(`${district}: fiyat=${districtMap[district].avgPrice.toFixed(0)}, intensity=${intensity.toFixed(2)}, ilan=${districtMap[district].count}`);
                    
<<<<<<< HEAD
                    // Fiyat formatını düzelt
                    const avgPriceValue = districtMap[district].avgPrice;
                    let priceText;
                    if (avgPriceValue >= 1000000) {
                        // 1 milyon ve üzeri için
                        priceText = (avgPriceValue / 1000000).toFixed(1) + 'M TL';
                    } else if (avgPriceValue >= 1000) {
                        // 1000 TL ve üzeri için
                        priceText = (avgPriceValue / 1000).toFixed(0) + 'K TL';
                    } else {
                        priceText = avgPriceValue.toFixed(0) + ' TL';
                    }
                    
                    // Etiket bilgisi ekle
                    labels.push({
                        name: district,
                        lat: coords.lat,
                        lng: coords.lng,
                        avgPrice: priceText,
                        count: districtMap[district].count
                    });
                    
=======
>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)
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
<<<<<<< HEAD
            setDistrictLabels(labels);
=======
>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)
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
<<<<<<< HEAD
                minZoom={10}
                maxZoom={14}
                maxBounds={[
                    [40.80, 28.00],  // Güneybatı köşesi
                    [41.45, 29.70]   // Kuzeydoğu köşesi
                ]}
                maxBoundsViscosity={1.0}
=======
>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <HeatmapLayer points={heatmapData} />
<<<<<<< HEAD
                {showLabels && <DistrictLabels districts={districtLabels} />}
            </MapContainer>

            {/* Fiyat Göster/Gizle Butonu */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1000,
            }}>
                <button
                    onClick={() => setShowLabels(!showLabels)}
                    style={{
                        background: showLabels ? '#f27f0e' : 'white',
                        color: showLabels ? 'white' : '#f27f0e',
                        border: '2px solid #f27f0e',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        if (!showLabels) {
                            e.target.style.background = '#fff5ed';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!showLabels) {
                            e.target.style.background = 'white';
                        }
                    }}
                >
                    <span style={{ fontSize: '16px' }}>
                        {showLabels ? '🏷️' : '💰'}
                    </span>
                    {showLabels ? 'Fiyatları Gizle' : 'Fiyatları Göster'}
                </button>
            </div>

=======
            </MapContainer>

>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)
            {/* Legend (açıklama) */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
<<<<<<< HEAD
                left: '20px',
=======
                right: '20px',
>>>>>>> 79a703e (Add heatmap functionality using Leaflet and react-leaflet)
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
