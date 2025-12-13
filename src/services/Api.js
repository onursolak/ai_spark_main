// src/Api.js

const BASE_URL = "https://turkiyeapi.dev/api/v1";

const Api = {

    /**
     * Tüm istekleri GET olarak atan ana fonksiyon
     */
    request(endpoint, params = null, onSuccess = null, onError = null) {

        if (!endpoint) {
            console.error("Endpoint girilmedi!");
            return;
        }

        // 1. URL'i Hazırla
        let url = `${BASE_URL}${endpoint}`;

        // 2. Eğer parametre (data) varsa, URL'in sonuna ?key=value şeklinde ekle
        if (params && Object.keys(params).length > 0) {
            // URLSearchParams: Nesneyi "ad=Ali&yas=25" formatına çevirir
            const queryString = new URLSearchParams(params).toString();
            
            // Eğer endpoint'te zaten '?' varsa '&' ile, yoksa '?' ile ekle
            url += (url.includes('?') ? '&' : '?') + queryString;
        }

        // 3. İsteği At (Varsayılan Method GET'tir, Body olmaz)
        fetch(url, {
            method: 'GET', // Özellikle belirttik: Her şey GET olacak
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.message || `Hata: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(responseData => {
            // Başarılı callback
            if (onSuccess) onSuccess(responseData);
        })
        .catch(error => {
            // Hata callback
            console.error("API Hatası:", error);
            if (onError) onError(error);
        });
    },

    // --- KISA YOLLAR (Hepsi request'e yönlendirir) ---

    // Kullanım: Api.get('/users', { page: 1 }, (res) => ...)
    get(endpoint, params, onSuccess, onError) {
        this.request(endpoint, params, onSuccess, onError);
    },

    // Kullanım: Api.post('/users/add', { ad: 'Ali' }, (res) => ...)
    // NOT: İsim post olsa da teknik olarak GET atar.
    post(endpoint, params, onSuccess, onError) {
        this.request(endpoint, params, onSuccess, onError);
    },

    put(endpoint, params, onSuccess, onError) {
        this.request(endpoint, params, onSuccess, onError);
    },

    delete(endpoint, params, onSuccess, onError) {
        this.request(endpoint, params, onSuccess, onError);
    }
};

export default Api;