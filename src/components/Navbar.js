import React, { useEffect, useState } from 'react';
import '../style/Navbar.css';

export default function Navbar() {

    return (
        <div className='navbar'>
            <div style={{fontSize: '26px', color: '#f27f0e'}}>Ai-Spark</div>
            <div>Ai chatbot</div>
        </div>
    )
}