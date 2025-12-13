import React, { useEffect, useState } from 'react';
import '../style/Desktop.css';
import HouseImg from '../style/imgs/house.jpeg';
import jsonDatas from '../data/data.json';
import { Client } from "@gradio/client";

export default function Desktop() {
    const odaSecenekleri = ["1", "2", "3", "4", "5", "6+"];
    const katSecenekleri = ["Zemin", "1", "2", "3", "4", "5", "6-10", "11+"];
    const m2Secenekleri = ["0-75 m²", "76-100 m²", "101-125 m²", "126-150 m²", "151+ m²"];

    const [secilenOdalar, setSecilenOdalar] = useState([]);
    const [secilenKatlar, setSecilenKatlar] = useState([]);
    const [secilenM2, setSecilenM2] = useState([]);


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
                const client = await Client.connect("https://7cb1286ae8eaff6da7.gradio.live/");
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

            <div className='filter-sidebar-header' style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3 style={{color: "#9c7349"}}>{aiMode ? "Chatbot" : "Filtrele"}</h3>
                <h4 style={{cursor: 'pointer'}}
                    onClick={()=>{
                        setAiMode(!aiMode)
                    }}
                >
                    Modu değiştir
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
                                        Bağlanılıyor...
                                    </div>
                                }

                                {isConnecting && aiTyping &&
                                    <div className={`message-bubble ${'ai-msg'}`}>
                                        ...
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

                        <div className="filter-group">
                            <label>Mahalle</label>
                            <select>
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

                        <div className="filter-group">
                            <label>Oda Sayısı</label>
                            <select><option>1+1</option><option>2+1</option><option>3+1</option></select>
                        </div>

                        <div className="filter-group">
                            <label>Metrekare (Min)</label>
                            <input type="number" placeholder="Örn: 100" />
                        </div>

                        <div className="filter-group">
                            <label>Bulunduğu Kat</label>
                            <input type="number" placeholder="Örn: 3" />
                        </div>

                        <button className='search-btn'
                            onClick={()=> {
                                const selectedIlce = ilceler.find(i=> i.id == secilenIlceId).name;
                                setDatas(jsonDatas);
                            }}
                        >Ara</button>
                    </>
                )
            }
        </aside>




        {/* SAĞ TARAF: İLAN LİSTESİ */}
        <main className='results-area'>
            <div className="cards-grid">
                {data.map((ilan, index) => (
                    /* JSON'da unique bir ID olmadığı için key olarak index kullandık */
                    <div className="card" key={index}>
                        
                        {/* Resim şimdilik sabit, verinde resim URL'i yok */}
                        <img src={HouseImg} alt={`${ilan.District} Satılık Daire`} />
                        
                        <div className="card-body">
                            <div>
                                <h4>{ilan.District}, {ilan.Neighborhood}</h4>
                            </div>
                            
                            <div>
                                <p className="price">
                                    {ilan.Price.toLocaleString('tr-TR')} TL
                                </p>
                                
                                <div className="features">
                                    {/* Oda Sayısı */}
                                    <span>{ilan["Number of rooms"]} Oda </span> 
                                    • 
                                    {/* Metrekare (Köşeli parantez zorunlu çünkü key içinde boşluk var) */}
                                    <span> {ilan["m² (Gross)"]} m² </span>
                                    •
                                    {/* Bulunduğu Kat */}
                                    <span> {ilan["Floor location"]}. Kat</span>
                                </div>
                                
                                <div style={{display: "flex", gap: "5px"}}>
                                    <button className="detail-btn" style={{flex: 2}}>Detay Gör</button>
                                    <button className="detail-btn" style={{flex: 1}}>
                                        <a 
                                            target='_blank' 
                                            rel="noopener noreferrer"
                                            /* Hem District hem Neighborhood bilgisini araya boşluk koyarak ekledik */
                                            href={`https://www.google.com/maps/search/${ilan["District"]} ${ilan["Neighborhood"]}`}
                                            style={{textDecoration: 'none', color: 'inherit'}}
                                        >
                                            Konum
                                        </a>
                                    </button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                ))}
            </div>
        </main>

    </div>
  )
}