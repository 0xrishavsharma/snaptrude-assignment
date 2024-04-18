import React, { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";

// React Icons
import { IoMdSearch } from "react-icons/io";
import { baseUrl, mapboxPublicToken } from "../../utils/config";
import { cn } from "../../utils/cn";

interface SearchResult {
    name: string;
    place_formatted: string;
    full_address: string;
}

interface GeoData {
    features: {
        geometry: {
            coordinates: number[];
        };
    }[];
}

type SearchProps = {
    setLng: (lng: number) => void;
    setLat: (lat: number) => void;
    setZoom: (zoom: number) => void;
    setDisplayLng: (lng: number) => void;
    setDisplayLat: (lat: number) => void;
    setDisplayZoom: (zoom: number) => void;
};

const Search = ({
    setLng,
    setLat,
    setZoom,
    setDisplayLat,
    setDisplayLng,
    setDisplayZoom,
}: SearchProps) => {
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isResultsWindowOpen, setIsResultsWindowOpen] =
        useState<boolean>(true);

    const debouncedSearch = debounce(async (searchTerm: string) => {
        if (searchTerm.length < 4) return;
        try {
            const res = await fetch(
                `${baseUrl}/api/search-suggest?query=${searchTerm}`
            );
            const data = await res.json();
            setSearchResults(data?.suggestions);
        } catch (error) {
            console.log("Error fetching search data", error);
        }
    }, 200);

    const onEnterPressAfterSearch = async (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const res = await fetch(
                `https://api.mapbox.com/search/geocode/v6/forward?limit=1&q=${searchResults[0]?.name}&access_token=${mapboxPublicToken}`
            );
            const data: GeoData = await res.json();

            setLng(data.features[0].geometry.coordinates[0]);
            setLat(data.features[0].geometry.coordinates[1]);
            setZoom(10);
        }
    };

    const onSearchResultClick = async (result: SearchResult) => {
        console.log("result", result);

        try {
            const res = await fetch(
                `https://api.mapbox.com/search/geocode/v6/forward?limit=1&q=${
                    result.name + " " + result.place_formatted
                }&access_token=${mapboxPublicToken}`
            );
            const data = await res.json();

            setLng(data?.features[0].geometry.coordinates[0]);
            setLat(data?.features[0].geometry.coordinates[1]);
            setZoom(10);
            setDisplayLng(data?.features[0].geometry.coordinates[0]);
            setDisplayLat(data?.features[0].geometry.coordinates[1]);
            setDisplayZoom(10);
        } catch (error) {
            console.log("Error fetching search data", error);
        }
    };

    useEffect(() => {
        if (searchTerm) {
            debouncedSearch(searchTerm);
        }
    }, [searchTerm]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsResultsWindowOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    return (
        <div className='relative flex flex-col items-center justify-center'>
            <div className='flex items-center p-2 bg-white border-gray-400 rounded'>
                <input
                    type='text'
                    placeholder='Search...'
                    className=' text-black bg-transparent outline-none'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={onEnterPressAfterSearch}
                    onClick={() => setIsResultsWindowOpen(true)}
                />
                <IoMdSearch className='text-xl text-gray-400' />
            </div>
            {isResultsWindowOpen && searchTerm && searchResults?.length > 0 && (
                <div
                    ref={searchContainerRef}
                    className='bg-white/90 top-12 absolute left-0 right-0 flex flex-col max-w-full rounded'
                >
                    {searchResults.map((result, i) => (
                        <button
                            key={i}
                            className={cn(
                                i === 0 && "bg-gray-200/80",
                                "hover:bg-gray-200/80 hover:cursor-pointer text-start flex flex-col justify-start px-3 py-1 text-black border-b border-gray-300"
                            )}
                            onClick={onSearchResultClick.bind(null, result)}
                        >
                            <span className='text-bold'>{result.name}</span>
                            <span className='-mt-1 text-sm text-gray-500'>
                                {result.place_formatted}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
