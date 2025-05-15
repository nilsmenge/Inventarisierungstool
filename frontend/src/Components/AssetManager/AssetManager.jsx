import React, { useState } from 'react';
import './AssetManager.css'

const AssetManager = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = ['Assets', 'Dashboard'];

  return (
    <div className='asset-manager-container'>
        {/*Sidebar*/}
        <div className='sidebar'>
            <nav className='nav-menu'>
                {menuItems.map((item, idx) => (
                  <a
                    href="#"
                    key={item}
                    className={`nav-item${activeIndex === idx ? ' active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                  >
                    {item}
                  </a>
                ))}
            </nav>
        </div>

        {/*Main Content*/}
        <div className='main-content'>
            <div className='content-wrapper'>
                <div className='content-header'>
                    <h1 className='page-title'>Assets</h1>
                    <div className='header-actions'>
                        <div className='search-container'>
                            <input 
                                type="text" 
                                placeholder='Suche...'
                                className='search-input' 
                            />
                        </div>
                        <div className='dropdown'>
                            <select className='select-option'>
                                <option value="Neueste zuerst">Neueste zuerst</option>
                                <option value="Alphabetisch A-Z">Alphabetisch A-Z</option>
                                <option value="Alphabetisch Z-A">Alphabetisch Z-A</option>
                            </select>
                        </div>
                        <button className='btn-default'>Scan</button>
                        <button className='btn-default'>Filter</button>
                        <button className='btn-newasset'>Neues Asset</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default AssetManager