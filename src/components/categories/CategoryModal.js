import { useState, useRef, useEffect } from "react";
import Modals from "../../utils/Modals";
import "../../styles/Modals.css";

const CategoryModal = ({ title, setOpenCatModal, db, setCatDescription }) => {
  const catNameRef = useRef(null);
  const [newCatDescription, setNewCatDescription] = useState("");
  const [newCatCode, setNewCatCode] = useState("");
  useEffect(() => {
    if (catNameRef.current) {
      catNameRef.current.focus();
    }
  }, []);

  const handleCategoryDescription = (e) => {
    setNewCatDescription(e.target.value);
  };

  const handleCategoryCode = (e) => {
    setNewCatCode(e.target.value);
  };

  const handleCloseModal = () => {
    setOpenCatModal(false);
  };

  const saveCategory = async () => {
    try {
      const nameExist = await db.category_descriptions
        .where({ category_description: newCatDescription })
        .first();

      if (nameExist) {
        alert(
          "Category description, " + newCatDescription + ", already exists"
        );
      } else {
        await db.category_descriptions.add({
          // description: newCatDescription,
          category_description: newCatDescription,
          category_code: newCatCode,
        });
        setCatDescription(newCatDescription);
        setOpenCatModal(false);
      }
    } catch (error) {
      console.error("Error adding new category:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    saveCategory();
  };

  return (
    <Modals
      title={title}
      noBckgrnd={true}
      onClose={handleCloseModal}
      footer={
        <div>
          <button className="main_buttons" type="button" onClick={saveCategory}>
            Submit
          </button>
        </div>
      }
    >
      <div>
        <form onSubmit={handleSubmit}>
          {/* <label>Category name: </label>
          <input
            ref={catNameRef}
            type="text"
            onChange={(e) => setNewCatDescription(e.target.value)}
          /> */}
          <label>Category description: </label>
          <input type="text" onChange={handleCategoryDescription} />
          <label>Category code (optional - to match bank code): </label>
          <input type="text" onChange={handleCategoryCode} />
        </form>
      </div>
    </Modals>
  );
};

export default CategoryModal;
