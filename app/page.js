"use client";
import { useState, useEffect } from "react";
import PointAndFigureChart from "./components/PointAndFigureChart";
import FileUpload from "./components/FileUpload";

const Home = () => {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [auto, setAuto] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [speed, setSpeed] = useState(1000); // default speed 1s
  const [transaction, setTransaction] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);

  useEffect(() => {
    if (auto) {
      const id = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < data.length - 1) {
            return prevIndex + 1;
          }
          return prevIndex;
        });
      }, speed);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [auto, speed]);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleTransaction = (type) => {
    const price = data[currentIndex].lp;
    if (transaction) {
      const profitOrLoss =
        type === "Buy" ? transaction - price : price - transaction;
      setProfitLoss(profitOrLoss);
      setTransaction(null); // Reset transaction after profit/loss calculation
    } else {
      console.log("Transaction: ", price);
      setTransaction(price);
    }
  };

  return (
    <div>
      <div className="flex justify-end space-x-1 lg:space-x-4">
        <FileUpload setData={setData} />
        <button
          className="lg:px-4 p-1 bg-blue-500 text-white text-xs lg:text-lg rounded-lg shadow hover:bg-blue-600 transition duration-200"
          onClick={() => handleTransaction("Buy")}
        >
          Buy
        </button>
        <button
          className="lg:px-4 p-1 bg-red-500 text-white text-xs lg:text-lg rounded-lg shadow hover:bg-red-600 transition duration-200"
          onClick={() => handleTransaction("Sell")}
        >
          Sell
        </button>

        {profitLoss !== null && (
          <div className={`${profitLoss>0?"bg-green-300":"bg-red-300"}`}>Profit/Loss: {profitLoss.toFixed(2)}</div>
        )}
        <div className="flex flex-col lg:px-4 p-1 max-w-16 absolute right-0 top-1/2">
          <button
            className="bg-blue-500 text-white text-xs lg:text-lg rounded-lg shadow hover:bg-blue-600 transition duration-200"
            onClick={handleNext}
          >
            Next
          </button>

          <button
            className="lg:px-4 p-1 bg-green-500 text-white text-xs lg:text-lg rounded-lg shadow hover:bg-green-600 transition duration-200"
            onClick={() => setAuto(!auto)}
          >
            {auto ? "Stop" : "Start"}
          </button>

          <input
            type="number"
            className="lg:px-4 p-1 bg-gray-200 text-black text-xs lg:text-lg rounded-lg shadow"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            placeholder="Speed (ms)"
          />
        </div>
      </div>

      <div className="flex justify-center space-x-1">

      </div>

      {data.length > 0 && (
        <div className="h-screen overflow-y-scroll border border-gray-300">
          <PointAndFigureChart tick={data[currentIndex]} />
        </div>
      )}
    </div>
  );
};

export default Home;
