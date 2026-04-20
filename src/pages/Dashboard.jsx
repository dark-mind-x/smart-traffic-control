import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, database } from '../services/firebaseConfig';
import TrafficLight from '../components/TrafficLight';

// A reusable mini-component for the Intensity Badge
const IntensityBadge = ({ intensity }) => {
  const isHigh = intensity && intensity.toLowerCase() === 'high';
  return (
    <div style={{
      marginTop: '12px',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      backgroundColor: isHigh ? '#450a0a' : '#052e16',
      color: isHigh ? '#fca5a5' : '#86efac',
      border: `1px solid ${isHigh ? '#dc2626' : '#22c55e'}`,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      display: 'inline-block'
    }}>
      Traffic: {intensity || 'Low'}
    </div>
  );
};

const Dashboard = () => {
  // 1. Upgraded State: Now holds both color and intensity for each road
  const [junctionData, setJunctionData] = useState({
    road1: { color: 'red', intensity: 'low' },
    road2: { color: 'red', intensity: 'low' },
    road3: { color: 'red', intensity: 'low' },
    road4: { color: 'red', intensity: 'low' }
  });

  // 2. Upgraded Listener: Parses the nested objects from Firebase
  useEffect(() => {
    const trafficRef = ref(database, 'junction1');
    const unsubscribe = onValue(trafficRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setJunctionData({
          road1: {
            color: data.road1?.color || 'red',
            intensity: data.road1?.intensity || 'low'
          },
          road2: {
            color: data.road2?.color || 'red',
            intensity: data.road2?.intensity || 'low'
          },
          road3: {
            color: data.road3?.color || 'red',
            intensity: data.road3?.intensity || 'low'
          },
          road4: {
            color: data.road4?.color || 'red',
            intensity: data.road4?.intensity || 'low'
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <>
      <style>{`
        .dashboard-bg {
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #0f172a;
          min-height: 100vh;
          color: #e2e8f0;
          margin: 0;
          padding: 0;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 5%;
          background-color: #1e293b;
          border-bottom: 1px solid #334155;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        .navbar-title {
          margin: 0;
          font-size: 1.5rem;
          color: #38bdf8;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .btn-logout {
          padding: 8px 20px;
          background-color: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s;
        }
        .btn-logout:hover {
          background-color: #dc2626;
        }
        .main-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
        }
        .junction-title {
          color: #f8fafc;
          font-size: 1.8rem;
          margin-bottom: 40px;
          border-bottom: 2px solid #38bdf8;
          padding-bottom: 10px;
          text-align: center;
        }
        .junction-card {
          background-color: #1e293b;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          display: inline-block;
        }
        .intersection-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          grid-template-rows: auto auto auto;
          gap: 20px 40px;
          align-items: center;
          justify-items: center;
        }
        .road-label {
          margin: 0 0 12px 0;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 1rem;
        }
        .center-square {
          width: 140px;
          height: 140px;
          background-color: #0f172a;
          border-radius: 12px;
          border: 2px dashed #475569;
          display: flex;
          justify-content: center;
          align-items: center;
          grid-column: 2;
          grid-row: 2;
        }
        
        @media (max-width: 600px) {
          .navbar-title { font-size: 1.2rem; }
          .junction-card {
            padding: 20px 10px;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
          }
          .intersection-grid {
            transform: scale(0.70);
            transform-origin: top center;
            gap: 10px 20px;
          }
          .main-container { padding: 20px 10px; }
        }
      `}</style>

      <div className="dashboard-bg">
        <div className="navbar">
          <h1 className="navbar-title">Smart City Traffic Control</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>

        <div className="main-container">
          <h2 className="junction-title">Main Intersection (J1)</h2>
          
          <div className="junction-card">
            <div className="intersection-grid">
              
              {/* North (Top) */}
              <div style={{ gridColumn: '2', gridRow: '1', textAlign: 'center' }}>
                <h4 className="road-label">Road 1 (N)</h4>
                <TrafficLight color={junctionData.road1.color} />
                <IntensityBadge intensity={junctionData.road1.intensity} />
              </div>

              {/* West (Left) */}
              <div style={{ gridColumn: '1', gridRow: '2', textAlign: 'center' }}>
                <h4 className="road-label">Road 4 (W)</h4>
                <TrafficLight color={junctionData.road4.color} />
                <IntensityBadge intensity={junctionData.road4.intensity} />
              </div>

              {/* Center Intersection Marker */}
              <div className="center-square">
                <span style={{ color: '#334155', fontSize: '24px', fontWeight: 'bold' }}>+</span>
              </div>

              {/* East (Right) */}
              <div style={{ gridColumn: '3', gridRow: '2', textAlign: 'center' }}>
                <h4 className="road-label">Road 2 (E)</h4>
                <TrafficLight color={junctionData.road2.color} />
                <IntensityBadge intensity={junctionData.road2.intensity} />
              </div>

              {/* South (Bottom) */}
              <div style={{ gridColumn: '2', gridRow: '3', textAlign: 'center', marginTop: '10px' }}>
                <TrafficLight color={junctionData.road3.color} />
                <h4 className="road-label" style={{ marginTop: '12px', marginBottom: 0 }}>Road 3 (S)</h4>
                <IntensityBadge intensity={junctionData.road3.intensity} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;