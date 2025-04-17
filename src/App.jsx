import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import WatchlistPage from './pages/WatchlistPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';

const App = () => {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <WatchlistProvider>
          <Router basename="/my-movie-app">
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
              <Navbar />

              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/watchlist" element={<WatchlistPage />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/search" element={<SearchPage />} />
                </Routes>
              </main>

              <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Movie World</span>
                    </div>
                    <div className="text-sm">
                      <p>Data provided by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">The Movie Database (TMDb)</a></p>
                      <p className="mt-1">© {new Date().getFullYear()} Movie World. All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </WatchlistProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
};

export default App;
