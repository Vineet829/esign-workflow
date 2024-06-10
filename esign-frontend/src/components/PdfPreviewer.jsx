import React from 'react';

const PdfPreviewer = ({ filePath }) => {
  if (!filePath) {
    return null;
  }

  return (
    <div>
      <iframe src={`http://localhost:3000${filePath}`} width="100%" height="500px" title="PDF Preview" />
    </div>
  );
};

export default PdfPreviewer;
