import React from 'react';
import FloatingSidebar from '../components/ui/FloatingSidebar';

const SidebarDemoPage: React.FC = () => {
  return (
    <div className="sidebar-demo-page">
      <div className="demo-container">
        <FloatingSidebar />
        
        <main className="main-content">
          <div className="content-placeholder">
            <h1>Dashboard</h1>
            <p>Main content area placeholder</p>
          </div>
        </main>
      </div>

      <style>{`
        .sidebar-demo-page {
          min-height: 100vh;
          background: #B91C1C;
          padding: 28px;
        }

        .demo-container {
          display: flex;
          gap: 24px;
          height: calc(100vh - 56px);
        }

        .main-content {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(10px);
        }

        .content-placeholder {
          color: white;
        }

        .content-placeholder h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 16px 0;
        }

        .content-placeholder p {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }

        @media (max-width: 768px) {
          .sidebar-demo-page {
            padding: 16px;
          }

          .demo-container {
            height: calc(100vh - 32px);
            gap: 16px;
          }

          .main-content {
            padding: 20px;
          }

          .content-placeholder h1 {
            font-size: 24px;
          }

          .content-placeholder p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default SidebarDemoPage;
