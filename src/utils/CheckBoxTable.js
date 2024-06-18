import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import "../styles/CheckBox.css";
import { useDataContext } from "../providers/DataProvider";

const CheckboxTable = (props) => {
  // const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  // const [editableHeaders, setEditableHeaders] = useState(headers);
  const {
    lines,
    selectedCheckboxes,
    setSelectedCheckboxes,
    editableHeaders,
    setEditableHeaders,
    scrollPosition,
    setScrollPosition,
  } = useDataContext();
  const tableRef = useRef(null);
  console.log("tedtestE props =", props);
  const handleCheckboxChange = useCallback(
    (event, id) => {
      const isChecked = event.target.checked;
      setScrollPosition(tableRef.current.scrollTop);
      if (isChecked) {
        setSelectedCheckboxes((prevState) => [...prevState, id]);
      } else {
        setSelectedCheckboxes((prevState) =>
          prevState.filter((item) => item !== id)
        );
      }
    },
    [setSelectedCheckboxes, setScrollPosition]
  );

  useLayoutEffect(() => {
    // Restore the scroll position after the state has been updated and the component has re-rendered
    if (tableRef.current) {
      tableRef.current.scrollTop = scrollPosition;
    }
  });

  const handleSelectAll = () => {
    if (selectedCheckboxes?.length === props?.lines?.length) {
      setSelectedCheckboxes([]);
    } else {
      setSelectedCheckboxes(props?.lines?.map((item) => item.id));
    }
  };

  const isColumnIgnored = (header) => {
    if (!header) return false;
    return header.toLowerCase() === "ignore";
  };

  const generateGridTemplateColumns = () => {
    if (props?.colWidth) {
      return `2rem repeat(${props?.headers.length + 1}, ${props?.colWidth})`;
    } else if (props?.colWidthArr && props?.colWidthArr.length > 0) {
      return `2rem ${props?.colWidthArr.join(" ")}`;
    } else {
      return `repeat(${props?.headers.length + 2}, 3rem)`; // +2 for the extra column with 2rem width
    }
  };

  return (
    <div>
      <div style={{ marginLeft: "2rem" }}>
        <label
          // className="checkbox-row no-scrollbar"
          style={{ width: "90vw", maxWidth: "fit-content" }}
        >
          <input
            style={{
              marginLeft: "0",
            }}
            type="checkbox"
            checked={selectedCheckboxes?.length === props?.lines?.length}
            onChange={handleSelectAll}
          />
          Select All
        </label>
      </div>
      <div className="file-content" ref={tableRef}>
        <table>
          {props?.headers && (
            <thead>
              <tr>
                <th
                  className="checkbox-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: generateGridTemplateColumns(),
                    fontSize: "0.9rem",
                    borderBottom: "1px solid black",
                  }}
                >
                  <span></span>
                  {props?.headers.map((item, index) => (
                    <span key={index}>{item}</span>
                  ))}
                </th>
                {/* <th
                  className="checkbox-row"
                  style={{
                    gridTemplateColumns: props?.colWidth
                      ? `2rem repeat(${editableHeaders?.length + 1},${
                          props?.colWidth
                        })`
                      : props?.colWidthArr
                      ? props.colWidthArr
                      : `repeat(${editableHeaders?.length + 1},3rem)`,
                    fontSize: "1rem",
                  }}
                >
                  <span></span>
                  {props.headers.map((item) => (
                    <span>{item}</span>
                  ))}
                </th> */}
              </tr>
            </thead>
          )}
          <tbody>
            {props.lines?.map((item, index) => {
              console.log("tedtestZ item=", item, " index=", index);
              return (
                <tr key={index}>
                  <td
                    className="checkbox-row"
                    style={{
                      gridTemplateColumns: generateGridTemplateColumns(),
                      verticalAlign: "middle",
                      // gridTemplateColumns: props?.colWidth
                      //   ? `2rem repeat(${editableHeaders?.length + 1},${
                      //       props?.colWidth
                      //     })`
                      //   : `repeat(${editableHeaders?.length + 1},3rem)`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCheckboxes.includes(item.id)}
                      onChange={(e) => handleCheckboxChange(e, item.id)}
                    />
                    {props.array &&
                      item?.data?.split(",").map(
                        (itemField, indexItem) =>
                          // console.log("tedtest item.data=", item.data);
                          !isColumnIgnored(editableHeaders[indexItem]) && (
                            <span key={indexItem} className="ellipsis">
                              {itemField}
                            </span>
                          )
                      )}
                    {props.objects &&
                      editableHeaders?.map((fieldName, indexField) => (
                        <span key={indexField} className="ellipsis">
                          {item[fieldName.toLowerCase()]}
                        </span>
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckboxTable;
