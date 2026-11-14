import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// If something ever breaks mid-game, show a friendly restart screen instead of a blank page
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Blast Off! crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 text-center p-6">
        <div className="text-7xl">🛰️</div>
        <h1 className="font-display text-3xl font-bold text-white">Oops! Houston, we have a problem.</h1>
        <p className="text-slate-300 font-semibold">Something went wrong. Let's restart the mission!</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-display font-bold text-xl shadow-lg"
        >
          🚀 Restart
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
