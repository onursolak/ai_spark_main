// API Configuration
export const API_BASE_URL = 'https://7d5a45fbe3b6.ngrok-free.app';

export const API_ENDPOINTS = {
    // Raw data'yı getir
    DATA: `${API_BASE_URL}/data`,
    
    // Metadata (ilçe, mahalle dropdownlar için)
    META: `${API_BASE_URL}/meta`,
    
    // Fiyat tahmini
    PREDICT: `${API_BASE_URL}/predict`,
    
    // Ortalama fiyat modeli
    AVERAGE: `${API_BASE_URL}/average`,
    
    // İlçe karşılaştırma
    AVERAGE_COMPARE: `${API_BASE_URL}/average/compare`,
    
    // İlçe detayları
    AVERAGE_DISTRICT: (districtName) => `${API_BASE_URL}/average/district/${districtName}`,
    
    // Ortalama fiyat metadata
    AVERAGE_META: `${API_BASE_URL}/average/meta`,
    
    // Gemma AI chatbot
    ASK: `${API_BASE_URL}/ask`,
    
    // Batch test
    RUN_TEST: `${API_BASE_URL}/run-test`,
};

// API call helper fonksiyonu
export const apiCall = async (endpoint, options = {}) => {
    try {
        console.log('🌐 API İsteği:', endpoint, options.method || 'GET');
        
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        console.log('📡 API Yanıt Durumu:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Hata Yanıtı:', errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ API Başarılı:', data);
        return data;
    } catch (error) {
        console.error('❌ API Call Error:', error);
        throw error;
    }
};
