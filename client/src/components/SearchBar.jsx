function SearchBar({value, onChange}) {
    return (
        <input
            className="search-bar"
            type="text"
            placeholder="Search products or stores..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    )
}

export default SearchBar