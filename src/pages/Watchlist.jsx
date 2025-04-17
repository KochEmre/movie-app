import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_added');

  // Arama ve sıralama işlemleri
  const filteredMovies = watchlist
    .filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'rating_desc':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'rating_asc':
          return (a.vote_average || 0) - (b.vote_average || 0);
        case 'year_desc':
          return (b.release_date?.split('-')[0] || 0) - (a.release_date?.split('-')[0] || 0);
        case 'year_asc':
          return (a.release_date?.split('-')[0] || 0) - (b.release_date?.split('-')[0] || 0);
        case 'date_added':
        default:
          return 0; // Varsayılan olarak ekleme sırasını korur
      }
    });

  // Tüm izleme listesini temizle
  const handleClearAll = () => {
    if (window.confirm('İzleme listenizi tamamen temizlemek istediğinizden emin misiniz?')) {
      watchlist.forEach(movie => removeFromWatchlist(movie.id));
    }
  };

  return (
    <div className="wrapper py-6">
      <h1 className="text-3xl font-bold text-white mb-8">İzleme Listem</h1>
      
      {watchlist.length > 0 ? (
        <>
          {/* Arama ve sıralama kontrolleri */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="relative w-full md:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="İzleme listenizde arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-light-100/10 dark:bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-light-100/10 dark:bg-gray-800 text-white rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date_added">Ekleme Sırası</option>
                <option value="title_asc">İsim (A-Z)</option>
                <option value="title_desc">İsim (Z-A)</option>
                <option value="rating_desc">Puan (Yüksek-Düşük)</option>
                <option value="rating_asc">Puan (Düşük-Yüksek)</option>
                <option value="year_desc">Yıl (Yeni-Eski)</option>
                <option value="year_asc">Yıl (Eski-Yeni)</option>
              </select>
              
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <FaTrash />
                <span>Tümünü Temizle</span>
              </button>
            </div>
          </div>
          
          {/* Film listesi */}
          {filteredMovies.length > 0 ? (
            <AnimatePresence>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">
                "{searchTerm}" ile eşleşen film bulunamadı.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg mb-4">
            Henüz izleme listenize film eklemediniz.
          </p>
          <p className="text-gray-400">
            Film detaylarında yer işareti simgesine tıklayarak izleme listenize ekleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
