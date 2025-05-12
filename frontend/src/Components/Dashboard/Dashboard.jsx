import React from "react";
import { useState } from "react";
import './Dashboard.css'
import { Icon, Search, Plus, Trash, Edit, Check, X } from 'lucide-react';

const Dashboard = () => {;
  
  
    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <div className="dashboard-header">
                        <h1 className="dashboard-title"> Admin Dashboard</h1>
                        <button className="btn" id="btn-newuser">Neuer Benutzer</button>
                    </div>

                    <div className="search-container">
                        <input 
                            type="text"
                            placeholder="Suche nach Benutzern..."
                            className="search-input"
                             />
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>E-Mail</th>
                                    <th>Rolle</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
  }
  /*<Icon iconNode={Plus} size={16} className="icon" />*/
  export default Dashboard
