import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebaseConfig';
import TrafficLight from '../components/TrafficLight';

const Dashboard = () => {
  const [lane1Color, setLane1Color] = useState('red');

  useEffect(() => {

    const trafficRef = ref(database, 'junction1/lane1/color');

    const unsubscribe = onValue(trafficRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLane1Color(data);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Smart City Traffic Control</h1>
      
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>Main Junction (J1)</h2>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Lane 1</h3>
          {/* The light is now entirely controlled by Firebase */}
          <TrafficLight color={lane1Color} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;