// src/components/common/UI/Table.jsx
import React from 'react';

const Table = ({ 
  columns = [], 
  data = [], 
  className = '',
  striped = false,
  hoverable = true,
  compact = false,
  loading = false,
  onRowClick,
  ...props 
}) => {
  const rowClasses = `
    ${striped ? 'even:bg-gray-50 dark:even:bg-gray-800/50' : ''}
    ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors' : ''}
    ${onRowClick ? 'cursor-pointer' : ''}
  `;

  const cellClasses = compact ? 'px-4 py-2' : 'px-6 py-4';

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {/* Header */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`
                  ${cellClasses}
                  text-left text-xs font-medium text-gray-500 dark:text-gray-400
                  uppercase tracking-wider
                  ${column.className || ''}
                `}
                style={column.width ? { width: column.width } : {}}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowClasses}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      ${cellClasses}
                      text-sm text-gray-900 dark:text-gray-100
                      whitespace-nowrap
                    `}
                  >
                    {column.cell 
                      ? column.cell(row[column.accessor], row, rowIndex)
                      : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length} 
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;