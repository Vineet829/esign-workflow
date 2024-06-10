import React, { useState } from 'react';
import PdfUploader from './components/PdfUploader';
import PdfPreviewer from './components/PdfPreviewer';

const App = () => {
  const [filePath, setFilePath] = useState('');
  const [documentId, setDocumentId] = useState('');

  return (
    <div>
      <h1 style={{display:'flex', justifyContent:'center'}}>eSign Workflow Application</h1>
      <PdfUploader onUpload={setFilePath} />
      <PdfPreviewer filePath={filePath} />
    
    </div>
  );
};

export default App;
