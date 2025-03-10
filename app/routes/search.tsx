import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input, Button, Card, CardBody } from "@nextui-org/react";
import { motion } from "framer-motion";
import AdminLayout from "~/Layout/AdminLayout";
import backgroundImage from "~/images/Library-Postcard-004_2.webp";

const SearchEngine = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const suggestionBoxRef = useRef(null);

    useEffect(() => {
        if (query.length > 1) {
            fetchSuggestions(query);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchSuggestions = async (searchTerm) => {
        try {
            const formattedQuery = searchTerm.replace(/\s+/g, "+");
            const response = await axios.get(`https://dummyjson.com/users/search?q=${formattedQuery}`);
            setSuggestions(response.data.users || []);
        } catch (error) {
            console.error("Suggestion error:", error);
            setSuggestions([]);
        }
    };

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const formattedQuery = query.replace(/\s+/g, "+");
            const response = await axios.get(`https://dummyjson.com/users/search?q=${formattedQuery}`);
            setResults(response.data.users || []);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
        setLoading(false);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setSuggestions([]);
    };

    return (
        <AdminLayout>
            <div
                className="relative mt-4 rounded-xl flex flex-col items-center justify-center h-[86vh] p-4 bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                {/* Black Overlay */}
                <div className="absolute inset-0 bg-black opacity-50"></div>

                <motion.div
                    className="relative w-full max-w-2xl p-6 bg-white bg-opacity-90 rounded-2xl shadow-md"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative w-full" ref={suggestionBoxRef}>
                        <Input
                            type="text"
                            placeholder="Search for anything..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-md z-10">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            setQuery(suggestion.firstName + " " + suggestion.lastName);
                                            setSuggestions([]);
                                        }}
                                    >
                                        {suggestion.firstName} {suggestion.lastName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button onClick={handleSearch} className="p-3 flex items-center gap-2">
                            Search
                        </Button>
                        <Button onClick={handleClear} className="p-3 flex items-center gap-2 bg-red-500 text-white">
                            Clear
                        </Button>
                    </div>
                </motion.div>

                <div className="relative mt-6 w-full max-w-2xl overflow-hidden">
                    {loading && <p className="text-center text-gray-500">Searching...</p>}
                    {results.length > 0 && (
                        <motion.div
                            className="space-y-4 overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {results.map((result, index) => (
                                <Card key={index} className="p-4 bg-white rounded-xl shadow">
                                    <CardBody>
                                        <h3 className="text-lg font-semibold">{result.firstName} {result.lastName}</h3>
                                        <p className="text-gray-600">Email: {result.email}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default SearchEngine;
