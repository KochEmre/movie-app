import { useParams } from 'react-router-dom';
import MovieDetail from '../components/MovieDetail';

const MoviePage = () => {
  const { id } = useParams();
  
  return <MovieDetail />;
};

export default MoviePage;
