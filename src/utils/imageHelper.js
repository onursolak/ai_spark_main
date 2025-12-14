// Resim listelerini import et
import bathImages from '../data/image_lists/bath.json';
import bedImages from '../data/image_lists/bed.json';
import kitchenImages from '../data/image_lists/kitchen.json';
import livingImages from '../data/image_lists/living.json';
import diningImages from '../data/image_lists/dining.json';
import streetImages from '../data/image_lists/street.json';

/**
 * Her ilan için benzersiz bir seed oluştur (deterministik)
 * Aynı ilan için her zaman aynı seed'i döndürür
 */
function getPropertySeed(property) {
    // Tüm önemli özellikleri kullan
    const str = `${property.District}-${property.Neighborhood}-${property.Price}-${property["m² (Gross)"]}-${property["Number of rooms"]}-${property["Floor location"]}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Geliştirilmiş seeded random generator (Mulberry32 algoritması)
 */
function seededRandom(seed) {
    // eslint-disable-next-line no-mixed-operators
    let t = seed += 0x6D2B79F5;
    // eslint-disable-next-line no-mixed-operators
    t = Math.imul(t ^ (t >>> 15), t | 1);
    // eslint-disable-next-line no-mixed-operators
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    // eslint-disable-next-line no-mixed-operators
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
}

/**
 * Seed'e dayalı belirli aralıkta rastgele tam sayı üret
 */
function seededRandomInt(min, max, seed) {
    return Math.floor(seededRandom(seed) * (max - min)) + min;
}

/**
 * Diziden seed'li rastgele eleman seç
 */
function seededChoice(array, seed) {
    if (!array || array.length === 0) return null;
    const index = seededRandomInt(0, array.length, seed);
    return array[index];
}

/**
 * Diziden seed'li rastgele N adet farklı eleman seç
 */
function seededSample(array, n, seed) {
    if (!array || array.length === 0) return [];
    const result = [];
    const tempArray = [...array];
    const count = Math.min(n, tempArray.length);
    
    for (let i = 0; i < count; i++) {
        const randomIndex = seededRandomInt(0, tempArray.length, seed + i * 7919); // Asal sayı kullan
        result.push(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
    }
    
    return result;
}

// Resim kategorileri
const houseImages = {
    bath: bathImages,
    bed: bedImages,
    kitchen: kitchenImages,
    living: livingImages,
    dining: diningImages
};

/**
 * Bir ilan için rastgele 4 resim yolu döndürür (3 iç mekan + 1 sokak)
 * Her ilan için farklı resimler, her ilan için aynı resimler (deterministik)
 */
export function getPropertyImages(property) {
    const seed = getPropertySeed(property);
    const images = [];
    
    // Debug için (geliştirme sırasında)
    const isDebug = false; // true yaparak debug aktif edilir
    if (isDebug) {
        console.log(`🏠 İlan: ${property.District}, ${property.Neighborhood} - Seed: ${seed}`);
    }
    
    // Kategoriler listesi
    const categories = ['bath', 'bed', 'kitchen', 'living', 'dining'];
    
    // 3 farklı kategori seç (her ilan için farklı kombinasyon)
    const selectedCategories = seededSample(categories, 3, seed * 31); // 31 asal sayı
    
    if (isDebug) {
        console.log(`  Seçilen kategoriler: ${selectedCategories.join(', ')}`);
    }
    
    // Her kategoriden bir resim seç (her kategori için farklı seed)
    selectedCategories.forEach((category, index) => {
        const categoryImages = houseImages[category];
        if (categoryImages && categoryImages.length > 0) {
            // Her resim için farklı seed kullan
            const imageSeed = seed * 97 + index * 1009 + category.charCodeAt(0) * 503; // Asal sayılar
            const imageFile = seededChoice(categoryImages, imageSeed);
            if (imageFile) {
                images.push(`/kaggle_room_street_data/house_data/${imageFile}`);
                if (isDebug) {
                    console.log(`  ${index + 1}. Resim (${category}): ${imageFile}`);
                }
            }
        }
    });
    
    // 1 sokak resmi ekle (sokak için özel seed)
    if (streetImages && streetImages.length > 0) {
        const streetSeed = seed * 193 + 12347; // Farklı asal çarpanlar
        const streetImage = seededChoice(streetImages, streetSeed);
        if (streetImage) {
            images.push(`/kaggle_room_street_data/street_data/${streetImage}`);
            if (isDebug) {
                console.log(`  4. Resim (sokak): ${streetImage}`);
            }
        }
    }
    
    // En az 1 resim olmalı
    return images;
}

export function getPropertyMainImage(property) {
    const images = getPropertyImages(property);
    const mainImage = images.length > 0 ? images[0] : null;
    
    // Her zaman console'a yazdır
    //console.log(`📸 İlan: ${property.District}, ${property.Neighborhood} -> Resim: ${mainImage}`);
    
    return mainImage;
}

/**
 * Bir ilanın tüm iç mekan resimlerini döndürür
 */
export function getPropertyInteriorImages(property) {
    const images = getPropertyImages(property);
    return images.slice(0, 3); // İlk 3 resim iç mekan
}

/**
 * Bir ilanın sokak resmini döndürür
 */
export function getPropertyStreetImage(property) {
    const images = getPropertyImages(property);
    return images.length > 3 ? images[3] : null; // 4. resim sokak
}

