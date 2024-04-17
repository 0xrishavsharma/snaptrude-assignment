import React, { useState, useEffect } from "react";
import { debounce } from "lodash";

// React Icons
import { IoMdSearch } from "react-icons/io";

interface SearchResult {
    name: string;
    place_formatted: string;
}

const Search = ({ setLng, setLat, setZoom }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    // const [sessionToken, setSessionToken] = useState(""); // Add this line

    const debouncedSearch = debounce(async (searchTerm: string) => {
        const mapboxToken = import.meta.env
            .VITE_APP_MAPBOX_ACCESS_TOKEN_WITH_STATIC_IMAGE;

        const sessionToken = Math.random().toString(36).substr(2, 15); // Add this line
        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/suggest?limit=5&language=en&q=${searchTerm}&access_token=${mapboxToken}&session_token=${sessionToken}`
        );
        const data = await res.json();
        setSearchResults(data.suggestions);
        console.log(data);
    }, 50); // Adjust the delay as needed

    console.log("searchResults", searchResults);

    useEffect(() => {
        if (searchTerm) {
            debouncedSearch(searchTerm);
        }
    }, [searchTerm]);

    return (
        <div className='relative flex flex-col items-center justify-center'>
            <div className='flex items-center p-2 bg-white border-gray-400 rounded'>
                <input
                    type='text'
                    placeholder='Search...'
                    className=' text-black bg-transparent outline-none'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault(); // Prevent form submission

                            // Add logic here to set the map's center and zoom
                            // based on the selected search result
                            console.log(searchResults[0]);
                            // setLng(searchResults[0].bbox[0]);
                            // setLat(searchResults[0].bbox[1]);
                            // setZoom(12);
                        }
                    }}
                />
                <IoMdSearch className=' text-xl text-gray-400' />
            </div>

            {
                <div className='bg-white/90 top-12 absolute left-0 right-0 flex flex-col max-w-full gap-1 p-3 rounded'>
                    {searchResults.map((result, i) => (
                        <div key={i} className='flex flex-col text-black'>
                            <span className='text-semibold'>{result.name}</span>
                            <span className='-mt-1 text-sm text-gray-500'>
                                {result.place_formatted}
                            </span>
                        </div>
                    ))}
                </div>
            }
        </div>
    );
};

export default Search;
