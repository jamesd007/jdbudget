import React, { useState } from "react";

const SearchableDropdown = ({ allCategories }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const sortedCategories = [...allCategories].sort((a, b) =>
    a.description.localeCompare(b.description)
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = sortedCategories.filter((catRec) =>
    catRec.description.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: "15rem", marginBottom: "0.5rem" }}>
      <label>
        Category:
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select
          onChange={(e) => {
            const selectedValue = e.target.value;
            if (selectedValue === "new") {
              handleCreateNewCategory();
            } else {
              handleInputChange(currentDate, "category", selectedValue);
            }
          }}
          value={budgetData.category}
        >
          {filteredCategories.map((catRec) => (
            <option key={catRec.id} value={catRec.id}>
              {catRec.description}
            </option>
          ))}
          <option value="new">New Category</option>
          <option disabled value="">
            {" "}
            -- select an option --{" "}
          </option>
        </select>
      </label>
    </div>
  );
};
