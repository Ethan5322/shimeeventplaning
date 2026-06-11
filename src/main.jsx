import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminPanel from './AdminPanel.jsx'
import QRLanding from './QRLanding.jsx'
import './index.css'

function Root() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");

  if (page === "admin") {
    return (
      <AdminPanel
        onLogout={() => {
          window.history.pushState({}, "", "/");
          window.location.reload();
        }}
      />
    );
  }

  if (page === "qr" || page === "marketing" || page === "landing") {
    return <QRLanding />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
