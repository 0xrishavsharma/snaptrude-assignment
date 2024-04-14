import React, { useState } from "react";

const Search = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = async (event) => {
        event.preventDefault();

        const mapboxToken = import.meta.env
            .VITE_APP_MAPBOX_ACCESS_TOKEN_WITH_STATIC_IMAGE;
        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/suggest?limit=5&language=en&q=${searchTerm}&access_token=${mapboxToken}`
        );
        const data = await res.json();
        console.log(data);

        console.log(searchTerm);
    };

    return (
        <div className='flex items-center justify-center mt-5'>
            <input
                type='text'
                placeholder='Search...'
                className='p-2 mr-3 border border-gray-400 rounded'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
                onClick={handleSearch}
                className='p-2 text-white bg-blue-500 rounded'
            >
                Search
            </button>
        </div>
    );
};

export default Search;
