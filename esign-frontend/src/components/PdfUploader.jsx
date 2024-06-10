import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css'; 

const PdfUploader = ({ onUpload }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [pdfPreview, setPdfPreview] = useState(null);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('pdf', data.pdf[0]);
  
    try {
      const response = await axios.post('http://localhost:3000/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
        onUpload(response.data.filePath);
      
        toast.success('Upload complete!');
        
        handlePdfChange(data.pdf[0]);
      
    } catch (error) {
      
      console.error('Error uploading PDF:', error);
    }
  };
  
  

  const handlePdfChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPdfPreview(null);
    }
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)} className="pdf-uploader-form">
        <div className="form-group">
          <label htmlFor="pdf">Upload PDF:</label>
          <input
            type="file"
            id="pdf"
            {...register('pdf', {
              required: 'Please select a PDF file.',
              validate: {
                fileType: (value) => {
                  return value[0]?.type === 'application/pdf' || 'Only PDF files are allowed.';
                }
              }
            })}
            onChange={(e) => handlePdfChange(e.target.files[0])}
          />
          {errors.pdf && <p className="error">{errors.pdf.message}</p>}
        </div>

        <button type="submit" className="upload-btn">Upload PDF</button>

      <div className="static-content">
        <div className="form-group radio-buttons">
          <label>Radio Button 1:</label>
          <div>
            <label>
              <input type="radio" name="radio1" disabled /> Option 1
            </label>
            <label>
              <input type="radio" name="radio1" disabled /> Option 2
            </label>
          </div>
        </div>

        <div className="form-group radio-buttons">
          <label>Radio Button 2:</label>
          <div>
            <label>
              <input type="radio" name="radio2" disabled /> Option 1
            </label>
            <label>
              <input type="radio" name="radio2" disabled /> Option 2
            </label>
          </div>
        </div>

        <div className="form-group esign-box">
          <label>Sample E-sign PDF:</label>
          <div className="static-box">E-Sign</div>
        </div>

      
        {pdfPreview && (
          <div className="pdf-preview">
            <embed src={pdfPreview} type="application/pdf" width="100%" height="400px" />
          </div>
        )}
      </div>
    </form>
    </>
  );
};

export default PdfUploader;
