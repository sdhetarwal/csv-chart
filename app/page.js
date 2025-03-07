"use client";
import { useState } from "react";

import PointAndFigureChart from "./components/PointAndFigureChart";
import FileUpload from "./components/FileUpload";

const Home = () => {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  console.log(data[currentIndex]);
  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };


  return (
    <div>

      <div className="flex justify-end space-x-1 lg:space-x-4 ">
      <FileUpload   setData={setData} />

        <button
          className="lg:px-4 p-1 bg-blue-500 text-white text-xs lg:text-lg rounded-lg shadow hover:bg-blue-600 transition duration-200"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
      {data.length > 0 && (
        <div className="h-screen overflow-y-scroll border border-gray-300 p-4">
          <PointAndFigureChart tick={data[currentIndex]} />
        </div>
      )}
    </div>
  );
};

export default Home;
