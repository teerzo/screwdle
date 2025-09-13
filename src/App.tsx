
import "./index.css";

export function App() {
  return (
    <div className="w-full bg-card rounded-3xl p-10 shadow-game text-center">
      <div className="mb-10">
        <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wider">
          SCREWDLE
        </h1>
        <p className="text-lg text-tertiary font-normal">Guess the word in 6 tries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-card border-2 border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-game-hover hover:border-primary">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Classic</h3>
          <p className="text-sm text-tertiary mb-5 leading-relaxed">Play with any 5-letter word</p>
          <button className="w-full py-3 px-5 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wider bg-primary text-white hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30">
            Play Now
          </button>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-game-hover hover:border-primary">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Daily</h3>
          <p className="text-sm text-tertiary mb-5 leading-relaxed">One word per day for everyone</p>
          <button 
            className="w-full py-3 px-5 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wider bg-secondary text-white hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary/30"
            onClick={() => (window as any).navigate('/daily')}
          >
            Play Daily
          </button>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-game-hover hover:border-primary">
          <div className="text-4xl mb-3">🎮</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Practice</h3>
          <p className="text-sm text-tertiary mb-5 leading-relaxed">Hone your skills with hints</p>
          <button className="w-full py-3 px-5 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wider bg-tertiary text-white hover:bg-gray-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tertiary/30">
            Practice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 p-5 bg-gray-50 rounded-2xl border border-border">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">0</div>
          <div className="text-sm text-tertiary font-medium uppercase tracking-wider">Games Played</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">0%</div>
          <div className="text-sm text-tertiary font-medium uppercase tracking-wider">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">0</div>
          <div className="text-sm text-tertiary font-medium uppercase tracking-wider">Current Streak</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-center">
        <button className="py-2.5 px-4 border-2 border-border bg-card rounded-xl text-sm cursor-pointer transition-all duration-300 text-gray-900 hover:border-primary hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          ⚙️ Settings
        </button>
        <button className="py-2.5 px-4 border-2 border-border bg-card rounded-xl text-sm cursor-pointer transition-all duration-300 text-gray-900 hover:border-primary hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          ❓ How to Play
        </button>
      </div>
    </div>
  );
}

export default App;
