"use client"
import { parseCSV } from '@/utils/csvUtils';
import { useState } from 'react';


const FileUpload = ({ setData }) => {
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        parseCSV(file, setData);
    };

    return (
        <input className="p-1 max-w-42 lg:max-w-96 text-xs lg:text-lg border border-black" type="file" accept=".csv" onChange={handleFileUpload} />
    );
};

export default FileUpload;
