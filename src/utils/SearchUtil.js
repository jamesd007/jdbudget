import React, { useEffect, useState, useRef } from "react";
import Modals from "./Modals";
import "../styles/Modals.css";
import "../styles/UtilStyles.css";
import dayjs from "dayjs";

const SearchUtil = ({ transactions, transactionRefs, onSelect, ...props }) => {
  const [searchStr, setSearchStr] = useState("");
  const displayList = useRef();
  const [displayListNew, setDisplayListNew] = useState([]);
  const searchInputRef = useRef(null);

  const formatDate = (date, format) => {
    return dayjs(date).format(format);
  };

  useEffect(() => {
    let resultsList = [];

    if (!searchStr) {
      // If no search string, show all transactions
      transactions?.forEach((item) => {
        resultsList.push({
          ...item,
          // onClick: () => goToTransaction(item),
        });
      });
    } else {
      // Filter transactions based on search string
      transactions?.filter((item) => {
        if (item.description?.toLowerCase().includes(searchStr.toLowerCase())) {
          resultsList.push({
            ...item,
            // onClick: () => goToTransaction(item),
          });
        }
      });
    }

    setDisplayListNew(resultsList);
  }, [searchStr, transactions]);

  //   useEffect(() => {
  //     let resultsList = [];
  //     if (
  //       searchStr === undefined ||
  //       searchStr === "" ||
  //       searchStr?.length === 0
  //     ) {
  //       transactions &&
  //         transactions?.length > 0 &&
  //         transactions.map((item) => {
  //           resultsList.push({
  //             date: item.date,
  //             description: item.description,
  //             category_description: item.category_description,
  //             amount: item.amount,
  //             onClick: () => goToTransaction(item),
  //           });
  //         });
  //       setDisplayListNew(resultsList);
  //     } else {
  //       transactions &&
  //         transactions?.length > 0 &&
  //         transactions.filter((item) => {
  //           if (
  //             item.description?.toLowerCase().includes(searchStr?.toLowerCase())
  //           ) {
  //             resultsList.push({
  //               date: item.date,
  //               description: item.description,
  //               category_description: item.category_description,
  //               amount: item.amount,
  //               onClick: () => goToTransaction(item),
  //             });
  //           }
  //         });
  //       setDisplayListNew(resultsList);
  //     }
  //     return () => {};
  //   }, [searchStr, transactions]);

  const handleClickOutside = () => {
    props.onClose();
    setSearchStr("");
    displayList.current = undefined;
  };

  const handleClose = () => {
    props.onClose();
    setSearchStr("");
    displayList.current = undefined;
  };

  const handleSearchStr = (e) => {
    setSearchStr(e.target.value);
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <div>
      <Modals
        title="Search"
        onClose={handleClose}
        onClickOutside={handleClickOutside}
      >
        <div>
          <input
            ref={searchInputRef}
            type="text"
            name="searchString"
            value={searchStr}
            placeholder="enter search string"
            onChange={handleSearchStr}
          />
          {displayListNew?.map((item, index) => (
            <div
              className="search_results_list"
              key={item.id || index} // Use `item.id` if available, fallback to `index`
              // onClick={item.onClick}
              onClick={() => onSelect(item)} // Pass selected transaction
            >
              <div className="search_results_date">
                {formatDate(item.date, "DD/MM/YYYY")}
              </div>
              <div className="search_results_description">
                {item.description}
              </div>
              <div className="search_results_category_description">
                {item.category_description}
              </div>
              <div className="search_results_amount">{item.amount}</div>
            </div>
          ))}
        </div>
      </Modals>
    </div>
  );
};

export default SearchUtil;
