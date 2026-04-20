import React from 'react';

const TrafficLight = ({ color }) => {
  const styles = {
    container: {
      backgroundColor: '#222',
      padding: '10px',
      borderRadius: '10px',
      width: '60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center'
    },
    light: (isActive, activeColor) => ({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: isActive ? activeColor : '#444',
      boxShadow: isActive ? `0 0 15px ${activeColor}` : 'none',
      transition: 'all 0.3s ease'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.light(color === 'red', '#ff4444')}></div>
      <div style={styles.light(color === 'yellow', '#ffbb33')}></div>
      <div style={styles.light(color === 'green', '#00C851')}></div>
    </div>
  );
};

export default TrafficLight;