import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize = 10 }) => {
  if (totalPages === 0) return null;

  const pageNumbers = [];

  // Determine page number range to display (max 7 pages)
  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, currentPage + 3);

  if (currentPage <= 4) {
    startPage = 1;
    endPage = Math.min(7, totalPages);
  } else if (currentPage + 3 >= totalPages) {
    startPage = Math.max(1, totalPages - 6);
    endPage = totalPages;
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handleClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const start = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
      <div className="py-1">
        {totalItems !== undefined && totalItems !== null && (
          <span className="text-blue-500 fw-bold" style={{ fontSize: '0.8rem' }}>
            Showing {start}-{end} results from {totalItems}
          </span>
        )}
      </div>
      <nav>
        <ul className="pagination mb-0 justify-content-end">
          {currentPage > 1 && (
            <li className="page-item">
              <button className="page-link" onClick={() => handleClick(currentPage - 1)}>
                {'<'}
              </button>
            </li>
          )}

          {startPage > 1 && (
            <li className="page-item">
              <button className="page-link" onClick={() => handleClick(1)}>
                1
              </button>
            </li>
          )}

          {startPage > 2 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          {pageNumbers.map((page) => (
            <li
              key={page}
              className={`page-item ${page === currentPage ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => handleClick(page)}>
                {page}
              </button>
            </li>
          ))}

          {endPage < totalPages - 1 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          {endPage < totalPages && (
            <li className="page-item">
              <button className="page-link" onClick={() => handleClick(totalPages)}>
                {totalPages}
              </button>
            </li>
          )}

          {currentPage < totalPages && (
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => handleClick(currentPage + 1)}
              >
                {'>'}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;