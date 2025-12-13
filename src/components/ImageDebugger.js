import React from 'react';
import { getPropertyImages } from '../utils/imageHelper';
import jsonDatas from '../data/data.json';

export default function ImageDebugger() {
    // İlk 5 ilanı al
    const testProperties = jsonDatas.slice(0, 5);
    
    return (
        <div style={{
            padding: '20px',
            background: '#f5f5f5',
            margin: '20px',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <h2>🔍 Resim Debug Paneli</h2>
            <p style={{color: '#666'}}>İlk 5 ilanın resimleri</p>
            
            {testProperties.map((property, index) => {
                const images = getPropertyImages(property);
                return (
                    <div key={index} style={{
                        background: 'white',
                        padding: '15px',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                    }}>
                        <h3 style={{margin: '0 0 10px 0', color: '#333'}}>
                            {index + 1}. {property.District}, {property.Neighborhood}
                        </h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
                            {images.map((img, imgIndex) => (
                                <div key={imgIndex} style={{textAlign: 'center'}}>
                                    <img 
                                        src={img} 
                                        alt={`${index}-${imgIndex}`}
                                        style={{
                                            width: '100%',
                                            height: '100px',
                                            objectFit: 'cover',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc'
                                        }}
                                    />
                                    <div style={{
                                        fontSize: '10px',
                                        marginTop: '5px',
                                        color: '#666',
                                        wordBreak: 'break-all'
                                    }}>
                                        {img.split('/').pop()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            
            <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#fff3cd',
                borderRadius: '8px'
            }}>
                <strong>⚠️ Dikkat:</strong> Eğer yukarıdaki tüm ilanlar için aynı resimler görünüyorsa, 
                tarayıcı cache'i sorunu vardır. Lütfen:
                <ol style={{marginTop: '10px'}}>
                    <li>F12 ile Developer Tools'u açın</li>
                    <li>Network tab'ında "Disable cache" işaretleyin</li>
                    <li>Cmd+Shift+R (Mac) veya Ctrl+Shift+R (Windows) ile yenileyin</li>
                </ol>
            </div>
        </div>
    );
}

