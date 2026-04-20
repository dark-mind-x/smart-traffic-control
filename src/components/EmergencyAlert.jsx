import React from 'react';

const EmergencyAlert = ({ road }) => {
  if (!road) return null;

  return (
    <>
      <style>{`
        @keyframes flashRed {
          0% { background-color: #ef4444; box-shadow: 0 0 20px #ef4444; }
          50% { background-color: #991b1b; box-shadow: 0 0 5px #991b1b; }
          100% { background-color: #ef4444; box-shadow: 0 0 20px #ef4444; }
        }
        .emergency-banner {
          width: 100%;
          padding: 15px 0;
          text-align: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          animation: flashRed 1s infinite;
          border-radius: 8px;
          margin-bottom: 30px;
        }
      `}</style>
      <div className="emergency-banner">
        ⚠️ EMERGENCY OVERRIDE ACTIVE: CLEARING {road} ⚠️
      </div>
    </>
  );
};

export default EmergencyAlert;