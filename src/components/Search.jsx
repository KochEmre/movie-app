import React from "react";
import Spinner from "./Spinner";

const Search = ({ searchTerm, setSearchTerm, isLoading }) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />

        <input
          type="text"
          placeholder="Search though thousands of movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading && (
          <div className="search-spinner">
            <Spinner size="small" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
