import React from 'react';
import api from '../../providers/api';
import './style.scss';

const ExportExcel = ({ exportUrl }) => {
  // const getFile = () => {
  //   api
  //     .get(exportUrl, { responseType: 'blob' })
  //     .then((blob) => {
  //       let contentDisposition =
  //         blob.headers['content-disposition'].split('filename=');
  //       let filename = contentDisposition[1];
  //       // Create blob link to download
  //       const url = window.URL.createObjectURL(blob.data);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.setAttribute('download', filename);
  //       // Append to html link element page
  //       document.body.appendChild(link);
  //       // Start download
  //       link.click();
  //       // Clean up and remove the link
  //       link.parentNode.removeChild(link);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       console.log('ai ai ai ai');
  //     });
  // };
};

export default ExportExcel;
