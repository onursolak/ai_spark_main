import React, { useEffect, useState } from 'react';
import '../style/Desktop.css';
import HouseImg from '../style/imgs/house.jpeg';
import jsonDatas from '../data/data.json';
import HeatmapView from '../components/HeatmapView';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { getPropertyMainImage } from '../utils/imageHelper';

export default function Desktop({ viewMode, onToggleFavorite, isFavorite, onViewDetail, metadata }) {
    // --- STATE TANIMLARI ---
    // İlçe zaten vardı, diğerlerini ekliyoruz:
    const [secilenMahalle, setSecilenMahalle] = useState(""); // Seçilen mahalle ismi
    const [secilenOda, setSecilenOda] = useState("");         // Örn: "2+1"
    const [minMetrekare, setMinMetrekare] = useState("");     // Örn: 100
    const [secilenKat, setSecilenKat] = useState("");         // Örn: 3


    const [data, setDatas] = useState(jsonDatas);

    const [input, setInput] = useState("");

    const [ilceler, setIlceler] = useState([]);       // İlçe listesi
    const [mahalleler, setMahalleler] = useState([]); // Mahalle listesi

    const [secilenIlceId, setSecilenIlceId] = useState(""); // Seçili ilçe ID'si
    const [yukleniyor, setYukleniyor] = useState(false);    // Mahalleler yükleniyor mu?

    // AI mode - başlangıçta filtreler görünsün (false)
    const [aiMode, setAiMode] = useState(false);

    const [aiTyping, setAiTyping] = useState(false);
    
    // Fiyat tahmini için state'ler
    const [predictions, setPredictions] = useState({}); // { index: { predicted: number, status: 'normal'|'expensive'|'cheap' } }
    const [autoPredicting, setAutoPredicting] = useState(false); // Otomatik tahmin yapılıyor mu?

    // Pagination state'leri
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Sidebar toggle state - başlangıçta kapalı
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [messages, setMessages] = useState([
        { 
            sender: 'ai', 
            text: 'Merhaba! Size nasıl bir ev bakıyoruz?' 
        },
    ]);


    // 2. Sayfa ilk açıldığında çalışır - Backend'den metadata'yı al
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Eğer üst component'ten metadata gelmediyse, burada çek
                if (!metadata) {
                    const data = await apiCall(API_ENDPOINTS.META);
                    console.log('Metadata alındı:', data);
                    
                    // Metadata'dan ilçeleri al
                    if (data.districts) {
                        const districtsWithIds = data.districts.map((name, index) => ({
                            id: `district-${index}`,
                            name: name
                        }));
                        setIlceler(districtsWithIds);
                    }
                } else {
                    // Metadata prop'tan geldi
                    if (metadata.districts) {
                        const districtsWithIds = metadata.districts.map((name, index) => ({
                            id: `district-${index}`,
                            name: name
                        }));
                        setIlceler(districtsWithIds);
                    }
                }
            } catch (error) {
                console.error("Metadata çekilemedi:", error);
                // Hata durumunda eski API'yi kullan (fallback)
                fetch('https://turkiyeapi.dev/api/v1/provinces/34')
                    .then(res => res.json())
                    .then(response => {
                        if (response.data && response.data.districts) {
                            setIlceler(response.data.districts);
                        }
                    })
                    .catch(err => {
                        console.error("İlçeler çekilemedi:", err);
                    });
            }
        };
        
        fetchMetadata();
    }, [metadata]);

    // 3. Kullanıcı bir İLÇE seçtiğinde çalışır
    const handleIlceChange = async (e) => {
        const ilceId = e.target.value;
        setSecilenIlceId(ilceId); // Seçilen ID'yi state'e at
        setMahalleler([]);        // Eski mahalleleri temizle (Önemli!)

        // Eğer "Seçiniz" değil de gerçek bir ilçe seçildiyse:
        if (ilceId) {
            setYukleniyor(true); // Yükleniyor yazısını göster

            try {
                // Seçilen ilçenin adını bul
                const selectedDistrictName = ilceler.find(i => i.id === ilceId)?.name;
                
                // Metadata'dan o ilçeye ait mahalleleri bul
                if (metadata && metadata.neighborhoods && selectedDistrictName) {
                    const districtNeighborhoods = metadata.neighborhoods[selectedDistrictName];
                    
                    if (districtNeighborhoods && Array.isArray(districtNeighborhoods)) {
                        // Mahalle isimlerini uygun formata çevir
                        const formattedNeighborhoods = districtNeighborhoods.map((name, index) => ({
                            id: `${ilceId}-${index}`,
                            name: name
                        }));
                        setMahalleler(formattedNeighborhoods);
                    }
                } else {
                    // Metadata yoksa backend'den al
                    const metadataResponse = await apiCall(API_ENDPOINTS.META);
                    
                    if (metadataResponse.neighborhoods && selectedDistrictName) {
                        const districtNeighborhoods = metadataResponse.neighborhoods[selectedDistrictName];
                        
                        if (districtNeighborhoods && Array.isArray(districtNeighborhoods)) {
                            const formattedNeighborhoods = districtNeighborhoods.map((name, index) => ({
                                id: `${ilceId}-${index}`,
                                name: name
                            }));
                            setMahalleler(formattedNeighborhoods);
                        }
                    }
                }
                setYukleniyor(false);
            } catch (error) {
                console.error("Mahalleler backend'den alınamadı, fallback API kullanılıyor:", error);
                // Fallback: Eski API'yi kullan
                fetch(`https://turkiyeapi.dev/api/v1/districts/${ilceId}`)
                    .then(res => res.json())
                    .then(response => {
                        setYukleniyor(false);
                        if (response.data && response.data.neighborhoods) {
                            setMahalleler(response.data.neighborhoods);
                        }
                    })
                    .catch(err => {
                        setYukleniyor(false);
                        console.error("Mahalleler çekilemedi:", err);
                    });
            }
        }
    }
    
    // Otomatik fiyat tahmini - tüm görünen ilanlar için
    useEffect(() => {
        const autoPredictPrices = async () => {
            if (data.length === 0 || autoPredicting) return;
            
            setAutoPredicting(true);
            console.log('🤖 Otomatik tahmin başlatılıyor...', data.length, 'ilan');
            
            // Sayfalamadan sonraki ilanları al
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageData = data.slice(startIndex, endIndex);
            
            // Her ilan için tahmin yap (paralel olarak, ama rate limiting için sıralı)
            for (let i = 0; i < currentPageData.length; i++) {
                const actualIndex = startIndex + i;
                const ilan = currentPageData[i];
                
                // Zaten tahmin yapılmışsa atla
                if (predictions[actualIndex]) {
                    continue;
                }
                
                try {
                    await handlePredictPrice(ilan, actualIndex, true); // true = silent mode
                    // Rate limiting için kısa bekleme
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`İlan ${actualIndex} için tahmin hatası:`, error);
                }
            }
            
            setAutoPredicting(false);
            console.log('✅ Otomatik tahmin tamamlandı');
        };
        
        // Sayfa veya data değiştiğinde otomatik tahmin yap
        autoPredictPrices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, data]); // predictions'ı dependency'den çıkardık (infinite loop önleme)
    
    // Fiyat tahmini fonksiyonu
    const handlePredictPrice = async (ilan, index, silent = false) => {
        
        try {
            // Veriyi API formatına dönüştür
            const convertToAPIFormat = (data) => {
                // Number of rooms dönüştürme
                let rooms = data["Number of rooms"];
                if (typeof rooms === 'number') {
                    // 4 -> "3+1", 3 -> "2+1", 2 -> "1+1", vb.
                    rooms = rooms > 1 ? `${rooms-1}+1` : "1+1";
                }
                
                // Balcony dönüştürme
                let balcony = data["Balcony"];
                if (balcony === "Available" || balcony === "Var") {
                    balcony = "Yes";
                } else if (balcony === "Not Available" || balcony === "Yok") {
                    balcony = "No";
                }
                
                // Building Age dönüştürme
                let buildingAge = data["Building Age"];
                if (typeof buildingAge === 'number') {
                    if (buildingAge <= 5) buildingAge = "0-5 between";
                    else if (buildingAge <= 10) buildingAge = "5-10 between";
                    else if (buildingAge <= 15) buildingAge = "10-15 between";
                    else if (buildingAge <= 20) buildingAge = "15-20 between";
                    else buildingAge = "20+ older";
                }
                
                // Heating dönüştürme
                let heating = data["Heating"];
                if (heating && heating.includes("Natural Gas")) {
                    heating = "Natural Gas";
                } else if (heating && heating.includes("Central")) {
                    heating = "Central";
                } else if (!heating) {
                    heating = "Central";
                }
                
                // From who dönüştürme
                let fromWho = data["From who"];
                if (fromWho === "From the real estate office" || fromWho === "Emlakçı") {
                    fromWho = "Agent";
                } else if (fromWho === "Property owner" || fromWho === "Mal Sahibi") {
                    fromWho = "Owner";
                } else {
                    fromWho = "Owner";
                }
                
                // Using status dönüştürme
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

            const requestData = convertToAPIFormat(ilan);

            if (!silent) {
                console.log('🔮 Fiyat tahmini isteği gönderiliyor:', requestData);
            }

            const result = await apiCall(API_ENDPOINTS.PREDICT, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (!silent) {
                console.log('✅ Tahmin sonucu geldi:', result);
            }

            // Response'tan fiyatı al - farklı formatları dene
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

            if (!silent) {
                console.log('💰 Tahmin edilen fiyat:', predictedPrice);
                console.log('💵 Gerçek fiyat:', ilan.Price);
            }

            if (!predictedPrice || isNaN(predictedPrice)) {
                throw new Error('Tahmin edilen fiyat geçersiz: ' + JSON.stringify(result));
            }

            const actualPrice = ilan.Price;
            
            // Fiyat karşılaştırması yap
            const difference = ((actualPrice - predictedPrice) / predictedPrice) * 100;
            let status = 'normal';
            
            if (difference > 15) {
                status = 'expensive'; // Pahalı
            } else if (difference < -15) {
                status = 'cheap'; // Ucuz
            }
            
            if (!silent) {
                console.log(`📊 Fark: %${difference.toFixed(1)} - Durum: ${status}`);
            }
            
            setPredictions(prev => ({
                ...prev,
                [index]: {
                    predicted: predictedPrice,
                    actual: actualPrice,
                    difference: difference.toFixed(1),
                    status: status
                }
            }));
            
        } catch (error) {
            if (!silent) {
                console.error('❌ Fiyat tahmini hatası:', error);
                console.error('Hata detayı:', error.message);
            }
            setPredictions(prev => ({
                ...prev,
                [index]: {
                    error: 'Tahmin alınamadı'
                }
            }));
        }
    }
    
    // Pagination hesaplamaları
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
  return (
    <div className="desktop-wrapper">
        {/* Sidebar Toggle Button */}
        <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Filtreleri Gizle" : "Filtreleri Göster"}
        >
            <span className="toggle-icon">{sidebarOpen ? '✕' : '☰'}</span>
            <span className="toggle-text">{sidebarOpen ? 'Gizle' : 'Filtreler'}</span>
        </button>

        <div className={`desktop-container ${aiMode ? 'grid-big' : 'grid-small'} ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        
        {/* SOL TARAF: FİLTRELEME ALANI */}
        {sidebarOpen && (
        <aside className='filter-sidebar'>

            <div className='filter-sidebar-header' style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>{aiMode ? "🤖 Chatbot" : "🔍 Filtrele"}</h3>
                <h4 style={{cursor: 'pointer'}}
                    onClick={()=>{
                        setAiMode(!aiMode)
                    }}
                >
                    {aiMode ? "⚙️ " : "💬 "}Modu değiştir
                </h4>
            </div>

            {
                aiMode ?
                (
                    <>
                        <div className="ai-chat-container">
                        {/* Mesaj Listesi Alanı */}
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-bubble ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}>
                                    {msg.text}
                                </div>
                            ))}

                            {aiTyping &&
                                <div className={`message-bubble ${'ai-msg'}`}>
                                    <div style={{ display: 'flex', gap: '4px', padding: '5px 0' }}>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            }
                        </div>

                            {/* Mesaj Yazma Alanı */}
                            <div className="chat-input-area">
                                <textarea 
                                    placeholder="Örn: Kadıköy'de 3+1 deniz manzaralı..." 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    rows="2"
                                />
                            <button 
                                className="send-btn"
                                onClick={async () => {
                                        try {
                                            if (input.trim() !== '') {
                                                setAiTyping(true);
                                                setMessages(prev => [
                                                    ...prev, 
                                                    { sender: 'user', text: input }
                                                ]);
                                                const userInput = input;
                                                setInput("");

                                                // Yeni backend API'yi kullan
                                                const result = await apiCall(API_ENDPOINTS.ASK, {
                                                    method: 'POST',
                                                    body: JSON.stringify({
                                                        prompt: userInput
                                                    })
                                                });

                                                setAiTyping(false);
                                                
                                                // Backend response'unu kontrol et
                                                const aiResponse = result.response || result.answer || result.data || 'Yanıt alınamadı.';
                                                
                                                setMessages(prev => [
                                                    ...prev, 
                                                    { sender: 'ai', text: aiResponse }
                                                ]);
                                            }
                                            
                                        } catch (e) {
                                            setAiTyping(false);
                                            console.error("AI yanıt hatası:", e);
                                            setMessages(prev => [
                                                ...prev, 
                                                { sender: 'ai', text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' }
                                            ]);
                                        }
                                }}  
                            >
                                ➤
                            </button>
                            </div>
                        </div>
                    </>
                )
                :
                (
                    <>
            
                        {/* --- İLÇE (Zaten Vardı) --- */}
                        <div className="filter-group">
                            <label>İlçe</label>
                            <select onChange={handleIlceChange} value={secilenIlceId}>
                                <option value="">Tümü</option>
                                {ilceler.map(ilce => (
                                    <option key={ilce.id} value={ilce.id}>
                                        {ilce.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* --- MAHALLE --- */}
                        <div className="filter-group">
                            <label>Mahalle</label>
                            <select 
                                value={secilenMahalle} 
                                onChange={(e) => setSecilenMahalle(e.target.value)}
                            >
                                <option value="">
                                    {!secilenIlceId ? "Önce İlçe Seçin" : (yukleniyor ? "Yükleniyor..." : "Tümü")}
                                </option>
                                
                                {mahalleler.map((mahalle, index) => (
                                    <option key={index} value={mahalle.name}>
                                        {mahalle.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* --- ODA SAYISI --- */}
                        <div className="filter-group">
                            <label>Oda Sayısı</label>
                            <select 
                                value={secilenOda} 
                                onChange={(e) => setSecilenOda(e.target.value)}
                            >
                                <option value="">Seçiniz</option> {/* Boş seçenek eklemek iyidir */}
                                <option value="1+1">1+1</option>
                                <option value="2+1">2+1</option>
                                <option value="3+1">3+1</option>
                            </select>
                        </div>

                        {/* --- METREKARE --- */}
                        <div className="filter-group">
                            <label>Metrekare (Min)</label>
                            <input 
                                type="number" 
                                placeholder="Örn: 100" 
                                value={minMetrekare}
                                onChange={(e) => setMinMetrekare(e.target.value)}
                            />
                        </div>

                        {/* --- BULUNDUĞU KAT --- */}
                        <div className="filter-group">
                            <label>Bulunduğu Kat</label>
                            <input 
                                type="number" 
                                placeholder="Örn: 3" 
                                value={secilenKat}
                                onChange={(e) => setSecilenKat(e.target.value)}
                            />
                        </div>

                        <button className='search-btn'
                            onClick={()=> {

                                console.log(ilceler?.find(i=> i.id === secilenIlceId)?.name)
                                console.log(secilenMahalle)
                                console.log(secilenOda)
                                console.log(minMetrekare)
                                console.log(secilenKat)


                                const secilenIlceIsmi = ilceler?.find(i => i.id === secilenIlceId)?.name;

                                const sonuc = jsonDatas.filter(i => {
                                    // 1. İlçe Kontrolü (Seçilmediyse VEYA Eşleşiyorsa)
                                    const ilceUyuyor = !secilenIlceId || i["District"] === secilenIlceIsmi;

                                    // 2. Mahalle Kontrolü
                                    const mahalleUyuyor = !secilenMahalle || i["Neighborhood"] === secilenMahalle;

                                    // 3. Oda Kontrolü
                                    const odaUyuyor = !secilenOda || i["Number of rooms"] === secilenOda;

                                    // 4. Metrekare Kontrolü 
                                    // (Min dediğin için "==" yerine ">=" (büyük eşit) kullanmak daha doğrudur)
                                    const m2Uyuyor = !minMetrekare || i["m² (Gross)"] >= parseInt(minMetrekare);

                                    // 5. Kat Kontrolü
                                    const katUyuyor = !secilenKat || i["Floor location"] === parseInt(secilenKat);

                                    // HEPSİ True ise o ilanı göster
                                    return ilceUyuyor && mahalleUyuyor && odaUyuyor && m2Uyuyor && katUyuyor;
                                });

                                setDatas(sonuc);
                            }}
                        >Ara</button>
                    </>
                )
            }
        </aside>
        )}




        {/* SAĞ TARAF: İLAN LİSTESİ veya HARİTA */}
        <main className={`results-area ${!sidebarOpen ? 'full-width' : ''}`}>
            {viewMode === 'list' ? (
                <>
                    {/* İstatistik Kartları */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <span className="stat-card-label">Toplam İlan</span>
                                <span className="stat-card-value">{data.length.toLocaleString('tr-TR')}</span>
                                <span className="stat-card-change positive">+12% bu ay</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <span className="stat-card-label">Ort. Fiyat</span>
                                <span className="stat-card-value">
                                    {data.length > 0 
                                        ? (data.reduce((sum, item) => sum + item.Price, 0) / data.length).toLocaleString('tr-TR', {maximumFractionDigits: 0})
                                        : '0'} ₺
                                </span>
                                <span className="stat-card-change positive">+8% geçen aya göre</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <span className="stat-card-label">Bölge Sayısı</span>
                                <span className="stat-card-value">
                                    {new Set(data.map(item => item.District)).size}
                                </span>
                                <span className="stat-card-change neutral">İstanbul</span>
                            </div>
                        </div>

                    </div>

                    <div className="cards-grid">
                    {data.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '80px 40px',
                            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(226, 232, 240, 0.6)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div style={{ 
                                fontSize: '80px', 
                                marginBottom: '24px',
                                animation: 'float 3s ease-in-out infinite'
                            }}>🏠</div>
                            <h3 style={{
                                color: '#1e293b',
                                marginBottom: '12px',
                                fontSize: '1.8rem',
                                fontWeight: '800'
                            }}>
                                Henüz İlan Bulunamadı
                            </h3>
                            <p style={{
                                color: '#64748b',
                                fontSize: '1.05rem',
                                maxWidth: '400px',
                                margin: '0 auto 24px',
                                lineHeight: '1.6'
                            }}>
                                Lütfen filtreleri ayarlayın veya AI asistanından yardım alın
                            </p>
                            <button style={{
                                padding: '12px 28px',
                                background: 'linear-gradient(135deg, #f27f0e 0%, #d96d0b 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(242, 127, 14, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(242, 127, 14, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(242, 127, 14, 0.3)';
                            }}
                            >
                                🔍 Arama Başlat
                            </button>
                        </div>
                    ) : (
                        currentItems.map((ilan, relativeIndex) => {
                            // Gerçek index'i hesapla (pagination için)
                            const actualIndex = indexOfFirstItem + relativeIndex;
                            return (
                        /* JSON'da unique bir ID olmadığı için key olarak index kullandık */
                        <div className="card" key={actualIndex}>
                            
                            <div className="card-image-wrapper">
                                {/* Resim dinamik olarak yükleniyor */}
                                <img 
                                    src={getPropertyMainImage(ilan)} 
                                    alt={`${ilan.District} Satılık Daire`}
                                    onError={(e) => {
                                        // Resim yüklenemezse yedek resmi göster
                                        e.target.src = HouseImg;
                                    }}
                                />
                                
                                {/* Yeni Badge */}
                                {relativeIndex < 3 && actualIndex < 3 && <div className="card-badge">✨ Yeni</div>}
                                
                                {/* Favorite Button */}
                                <button 
                                    className={`card-favorite ${isFavorite(ilan) ? 'favorited' : ''}`}
                                    onClick={() => onToggleFavorite(ilan)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite(ilan) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
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
                                        {ilan.Price.toLocaleString('tr-TR')} TL
                                    </p>
                                    
                                    {/* Fiyat Tahmin Sonucu */}
                                    {predictions[actualIndex] && !predictions[actualIndex].error && (
                                        <div className={`price-prediction ${predictions[actualIndex].status}`}>
                                            <div className="prediction-content">
                                                {predictions[actualIndex].status === 'expensive' && (
                                                    <>
                                                        <span className="prediction-icon">📈</span>
                                                        <span className="prediction-text">Piyasa ortalamasına göre %{Math.abs(predictions[actualIndex].difference)} pahalı</span>
                                                    </>
                                                )}
                                                {predictions[actualIndex].status === 'cheap' && (
                                                    <>
                                                        <span className="prediction-icon">📉</span>
                                                        <span className="prediction-text">Piyasa ortalamasına göre %{Math.abs(predictions[actualIndex].difference)} ucuz</span>
                                                    </>
                                                )}
                                                {predictions[actualIndex].status === 'normal' && (
                                                    <>
                                                        <span className="prediction-icon">✅</span>
                                                        <span className="prediction-text">Fiyat normal seviyede</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="prediction-detail">
                                                Tahmin: {predictions[actualIndex].predicted.toLocaleString('tr-TR')} TL
                                            </div>
                                        </div>
                                    )}
                                    
                                    {predictions[actualIndex] && predictions[actualIndex].error && (
                                        <div className="price-prediction error">
                                            <span className="prediction-icon">⚠️</span>
                                            <span className="prediction-text">{predictions[actualIndex].error}</span>
                                        </div>
                                    )}
                                    
                                    {!predictions[actualIndex] && (
                                        <div className="price-prediction loading">
                                            <span className="spinner-small"></span>
                                            <span className="prediction-text">Tahmin yapılıyor...</span>
                                        </div>
                                    )}
                                    
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
                    );
                    })
                    )}
                    </div>
                    
                    {/* Pagination */}
                    {currentItems.length > 0 && totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                className="pagination-btn"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ← Önceki
                            </button>
                            
                            <div className="pagination-numbers">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    // Sadece mevcut sayfanın etrafındaki sayfaları göster
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => paginate(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 3 ||
                                        pageNum === currentPage + 3
                                    ) {
                                        return <span key={pageNum} className="pagination-dots">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            
                            <button 
                                className="pagination-btn"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sonraki →
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="map-container">
                    <HeatmapView data={data} />
                </div>
            )}
        </main>

    </div>
    </div>
  )
}