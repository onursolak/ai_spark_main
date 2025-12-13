import React, { useEffect, useState } from 'react';
import '../style/Desktop.css';
import HouseImg from '../style/imgs/house.jpeg';
import jsonDatas from '../data/data.json';
import { Client } from "@gradio/client";
import HeatmapView from '../components/HeatmapView';

export default function Desktop({ viewMode, onToggleFavorite, isFavorite, onViewDetail }) {
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

    const [aiMode, setAiMode] = useState(true);

    const [gradioClient, setGradioClient] = useState(null); // Bağlantıyı tutacak state
    const [isConnecting, setIsConnecting] = useState(false);
    const [aiTyping, setAiTyping] = useState(false);

    const [messages, setMessages] = useState([
        { 
            sender: 'ai', 
            text: 'Merhaba! Size nasıl bir ev bakıyoruz?' 
        },
    ]);

    useEffect(() => {
        const connectToGradio = async () => {
            try {
                console.log("🔌 Gradio sunucusuna bağlanılıyor...");
                const client = await Client.connect("https://887d2b115212a7e122.gradio.live/");
                setGradioClient(client);
                setIsConnecting(true);
                console.log("✅ Bağlantı başarılı!");
            } catch (error) {
                console.error("❌ Bağlantı hatası:", error);
                setIsConnecting(false);
            }
        };
        connectToGradio();
    }, []);


    // 2. Sayfa ilk açıldığında çalışır (Sadece İstanbul İlçeleri)
    useEffect(() => {
        fetch('https://turkiyeapi.dev/api/v1/provinces/34')
            .then(res => res.json())
            .then(response => {
                // API'den gelen veri yapısı: response.data.districts
                if (response.data && response.data.districts) {
                    setIlceler(response.data.districts);
                }
            })
            .catch(err => {
                console.error("İlçeler çekilemedi:", err);
            });
    }, []);

    // 3. Kullanıcı bir İLÇE seçtiğinde çalışır
    const handleIlceChange = (e) => {
        const ilceId = e.target.value;

        setSecilenIlceId(ilceId); // Seçilen ID'yi state'e at
        setMahalleler([]);        // Eski mahalleleri temizle (Önemli!)

        // Eğer "Seçiniz" değil de gerçek bir ilçe seçildiyse:
        if (ilceId) {
            setYukleniyor(true); // Yükleniyor yazısını göster

            fetch(`https://turkiyeapi.dev/api/v1/districts/${ilceId}`)
                .then(res => res.json())
                .then(response => {
                    setYukleniyor(false); // Yükleme bitti
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
    
  return (
    <div className={`desktop-container ${aiMode ? 'grid-big' : 'grid-small'}`}>
        
        {/* SOL TARAF: FİLTRELEME ALANI */}
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
                                {isConnecting && messages.map((msg, index) => (
                                    <div key={index} className={`message-bubble ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}>
                                        {msg.text}
                                    </div>
                                ))}

                                {!isConnecting &&
                                    <div className={`message-bubble ${'ai-msg'}`}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px' }}>Bağlanılıyor</span>
                                            <div style={{ display: 'flex', gap: '3px' }}>
                                                <span className="loading-dot">.</span>
                                                <span className="loading-dot" style={{ animationDelay: '0.2s' }}>.</span>
                                                <span className="loading-dot" style={{ animationDelay: '0.4s' }}>.</span>
                                            </div>
                                        </div>
                                    </div>
                                }

                                {isConnecting && aiTyping &&
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
                                    disabled={!isConnecting || !gradioClient} 
                                    style={{ opacity: !isConnecting ? 0.5 : 1, cursor: !isConnecting ? 'wait' : 'pointer' }}
                                    
                                    onClick={async () => {
                                        if (!gradioClient) return;
                                        try {
                                            if (input.trim() !== '') {
                                                setAiTyping(true);
                                                setMessages(prev => [
                                                    ...prev, 
                                                    { sender: 'user', text: input }
                                                ]);
                                                setInput("");

                                                const result = await gradioClient.predict("/generate_response", [ 
                                                    input 
                                                ]);
                                                setAiTyping(false);
                                                setMessages(prev => [
                                                    ...prev, 
                                                    { sender: 'ai', text: result.data[0] }
                                                ]);
                                            }
                                            
                                        } catch (e) {
                                            setAiTyping(false);
                                            console.error("Tahmin hatası:", e);
                                        }
                                    }}  
                                >
                                    {isConnecting ? "➤" : "..."}
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

                                console.log(ilceler?.find(i=> i.id == secilenIlceId)?.name)
                                console.log(secilenMahalle)
                                console.log(secilenOda)
                                console.log(minMetrekare)
                                console.log(secilenKat)


                                const secilenIlceIsmi = ilceler?.find(i => i.id == secilenIlceId)?.name;

                                const sonuc = jsonDatas.filter(i => {
                                    // 1. İlçe Kontrolü (Seçilmediyse VEYA Eşleşiyorsa)
                                    const ilceUyuyor = !secilenIlceId || i["District"] == secilenIlceIsmi;

                                    // 2. Mahalle Kontrolü
                                    const mahalleUyuyor = !secilenMahalle || i["Neighborhood"] == secilenMahalle;

                                    // 3. Oda Kontrolü
                                    const odaUyuyor = !secilenOda || i["Number of rooms"] == secilenOda;

                                    // 4. Metrekare Kontrolü 
                                    // (Min dediğin için "==" yerine ">=" (büyük eşit) kullanmak daha doğrudur)
                                    const m2Uyuyor = !minMetrekare || i["m² (Gross)"] >= parseInt(minMetrekare);

                                    // 5. Kat Kontrolü
                                    const katUyuyor = !secilenKat || i["Floor location"] == secilenKat;

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




        {/* SAĞ TARAF: İLAN LİSTESİ veya HARİTA */}
        <main className='results-area'>
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

                        <div className="stat-card">
                            <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <span className="stat-card-label">Aktif Görüntüleme</span>
                                <span className="stat-card-value">2.4K</span>
                                <span className="stat-card-change positive">+18% bu hafta</span>
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
                        data.map((ilan, index) => (
                        /* JSON'da unique bir ID olmadığı için key olarak index kullandık */
                        <div className="card" key={index}>
                            
                            <div className="card-image-wrapper">
                                {/* Resim şimdilik sabit, verinde resim URL'i yok */}
                                <img src={HouseImg} alt={`${ilan.District} Satılık Daire`} />
                                
                                {/* Yeni Badge */}
                                {index < 3 && <div className="card-badge">✨ Yeni</div>}
                                
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
                    ))
                    )}
                    </div>
                </>
            ) : (
                <div className="map-container">
                    <HeatmapView data={data} />
                </div>
            )}
        </main>

    </div>
  )
}