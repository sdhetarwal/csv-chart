"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import DraggableDiv from "./DraggableDiv";

const PointAndFigureChart = ({ tick }) => {
  const svgRef = useRef();
  const dataRef = useRef([]);

 // console.log('Data to render:', dataRef.current);

  const [value, setValue] = useState(1);
  const [boxSizeY, setBoxSizeY] = useState(4);
  const [boxSizeX, setBoxSizeX] = useState(1.2);
  const [lotSize, setLotSize] = useState(100);
  const [totalBuyVolume, setTotalBuyVolume] = useState(0);
  const [totalSellVolume, setTotalSellVolume] = useState(0);
  const [totalNullVolume, setTotalNullVolume] = useState(0);
  const [buyTicks, setBuyTicks] = useState(0);
  const [sellTicks, setSellTicks] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 160; // Number of items per page

  const [previousOpenInterest, setPreviousOpenInterest] = useState(null);
  const [openInterestDiff, setOpenInterestDiff] = useState(0);
  const [totalOpenInterestChange, setTotalOpenInterestChange] = useState(0); // Total open interest change state
  const [totalVolume, setTotalVolume] = useState(0); // Total volume state
  const [totalTicks, setTotalTicks] = useState(0); // Total ticks state
  const [buyVol, setBuyVol] = useState(0); // Buy volume state
  const [sellVol, setSellVol] = useState(0);
  const maxDataLength = 800; // Maximum data length to keep track of
  const totalPages = Math.ceil(dataRef.current.length / itemsPerPage); // Total number of pages
  const [totalBuyStrides, setTotalBuyStrides] = useState(0);
  const [totalSellStrides, setTotalSellStrides] = useState(0);

    const [isHidden, setIsHidden] = useState(false);

    const toggleVisibility = () => {setIsHidden(!isHidden)};
    useEffect(() => {
      const svg = d3
        .select(svgRef.current)
        .attr("width", "100%")
        .attr("height", "75%");


      const drawBox = (g, x, y, direction, last_traded_quantity, color) => {
        g.append("text")
          .attr("x", x)
          .attr("y", y)
          .style("font-size", "14px")
          .style("fill", color)
          .text(last_traded_quantity);
      };

      const render = () => {
        svg.selectAll("*").remove();
        const svgHeight = svgRef.current.clientHeight;
        const g = svg.append("g").attr("transform", "translate(50,50)");
        const startingPrice = dataRef.current[0]?.lp;
       // Map prices to vertical positions in the chart area

        // Create the Y-axis
       // const g = svg.append("g").attr("transform", "translate(50, 0)"); // Ensure proper alignment

        let x = 0;
        let y = svgRef.current.clientHeight / 2;


        let direction = 1;
        let currentColumn = [];
        let difference = 0;

        const start = (page - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, dataRef.current.length);
        const dataToRender = dataRef.current.slice(start, end);

        dataToRender.forEach(({ lp, last_traded_quantity }) => {


           let color = "black"; // Default color for null volume
          if (
            lp > currentColumn[currentColumn.length - 1]
          ) {
            color = "green"; // Buy volume
          } else if (
            lp < currentColumn[currentColumn.length - 1]
          ) {
            color = "red"; // Sell volume
          }
          if (currentColumn.length === 0) {
            currentColumn.push(lp);
          } else {
            const lastPrice = currentColumn[currentColumn.length - 1];
            difference = lp - lastPrice;

            if (direction === 1 && lp >= lastPrice) {
              currentColumn = [lp];
              y -= direction * boxSizeY * 10 * difference;

              drawBox(g, x, y, direction, last_traded_quantity, color);
              difference = 0;
            } else if (direction === 1 && lp <= lastPrice) {
              direction = -1;
              x += 15 * boxSizeX;
              currentColumn = [lp];
              y += direction * boxSizeY * 10 * difference;

              drawBox(g, x, y, direction, last_traded_quantity, color);
              difference = 0;
            } else if (direction === -1 && lp <= lastPrice) {
              currentColumn = [lp];
              y += direction * boxSizeY * 10 * difference;

              drawBox(g, x, y, direction, last_traded_quantity, color);
              difference = 0;
            } else if (direction === -1 && lp >= lastPrice) {
              direction *= -1;
              x += 15 * boxSizeX;
              currentColumn = [lp];
              y -= direction * boxSizeY * 10 * difference;

              drawBox(g, x, y, direction, last_traded_quantity, color);
              difference = 0;
            }
          }
        });
      };

      const updateChart = () => {
        if (tick?.last_traded_quantity) {

          if (
            dataRef.current.length > 0 &&
            (tick.lp - dataRef.current[dataRef.current.length - 1].lp === 0 ||
              (tick.lp - dataRef.current[dataRef.current.length - 1].lp > 0 &&
                tick.lp - dataRef.current[dataRef.current.length - 1].lp <= value))
          ) {
            // Add volume to the last tick volume when the price is equal to the previous price
            dataRef.current[dataRef.current.length - 1].last_traded_quantity +=
              Math.round(tick.last_traded_quantity / lotSize);
          } else {
            // Add a new tick when the price is different from the previous price
            dataRef.current = [
              ...dataRef.current,
              {
                lp: tick.lp,
                last_traded_quantity: Math.round(
                  tick.last_traded_quantity / lotSize
                ),
              },
            ];
          }

            setTotalVolume((prev) => prev + tick.last_traded_quantity); // Update totalVolume
            setTotalTicks((prev) => prev + 1); // Update totalTicks


          if (
            tick.lp > dataRef.current[dataRef.current.length - 2]?.lp
          ) {
            const stride =
              tick.lp - dataRef.current[dataRef.current.length - 2].lp;
            setTotalBuyVolume((prev) => prev + tick.last_traded_quantity);
            setTotalBuyStrides(
              (prev) => prev + (stride * tick.last_traded_quantity) / lotSize
            );
            setBuyTicks((prev) => prev + 1);
          } else if (

            tick.lp === dataRef.current[dataRef.current.length - 2]?.lp
          ) {
            setTotalNullVolume((prev) => prev + tick.last_traded_quantity);
          } else if (

            tick.lp < dataRef.current[dataRef.current.length - 2]?.lp
          ) {
            const stride =
              dataRef.current[dataRef.current.length - 2].lp - tick.lp;
            setTotalSellVolume((prev) => prev + tick.last_traded_quantity);
            setTotalSellStrides(
              (prev) => prev + (stride * tick.last_traded_quantity) / lotSize
            );
            setSellTicks((prev) => prev + 1);
          }
        }

        if (dataRef.current.length > maxDataLength) {
          dataRef.current = dataRef.current.slice(
            dataRef.current.length + 3 * itemsPerPage - maxDataLength
          );
        }

        if (previousOpenInterest === null) {
          setPreviousOpenInterest(tick.oi);
        } else if (tick.oi !== previousOpenInterest) {
          const diff = tick.oi - previousOpenInterest;
          setOpenInterestDiff(diff);
          setTotalOpenInterestChange((prev) => prev + diff); // Update total open interest change
          setPreviousOpenInterest(tick.oi);
        }

        render();
      };

      if (tick) {
        updateChart();
      }
    }, [tick, value, boxSizeY, boxSizeX, lotSize, page]);


  const averageBuyVolume = totalBuyVolume / buyTicks || 0;
  const averageSellVolume = totalSellVolume / sellTicks || 0;
  const getColor = (value) => {
    return value > 0 ? "green" : value < 0 ? "red" : "green";
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div >
       <DraggableDiv><button onClick={toggleVisibility} >
          {isHidden ? 'Show' : 'Hide'}
        </button></DraggableDiv>
        {!isHidden&& <DraggableDiv>
        <div className="flex space-y-0 font-bold text-xs flex-col">
          <p>Buy Price : {tick.lp}</p>
          <p>Buy volume : {totalBuyVolume}</p>
          <p>Sell volume : {totalSellVolume}</p>
          <p style={{ color: getColor(totalBuyVolume - totalSellVolume) }}>
            Total difference volume : {totalBuyVolume - totalSellVolume}
          </p>
          <p>Null volume : {totalNullVolume}</p>
          <p
            style={{
              color: getColor(
                averageBuyVolume.toFixed(2) - averageSellVolume.toFixed(2)
              ),
            }}
          >
            {buyVol} Buy volume/tick: {averageBuyVolume.toFixed(2)}
          </p>
          <p
            style={{
              color: getColor(
                averageSellVolume.toFixed(2) - averageBuyVolume.toFixed(2)
              ),
            }}
          >
            {sellVol} Sell volume/tick: {averageSellVolume.toFixed(2)}
          </p>
          <p>OI Change: {openInterestDiff}</p>
          <p>VWA SellStride: {totalSellStrides.toFixed(1)}</p>{" "}
          <p>VWA BUY Stride: {totalBuyStrides.toFixed(1)}</p>{" "}
          {/* Display totalOpenInterestChange */}
          <p
            style={{
              color: getColor(
                tick.last_traded_quantity - totalVolume / totalTicks
              ),
            }}
          >
            Total Volume/Tick: {(totalVolume / totalTicks).toFixed(2)}
          </p>{" "}
          {/* Display totalVolume */}
          <div className="flex flex-row">
            <input
              className="rounded-sm max-w-10 border border-black p-1 text-base"
              type="number"
              value={value}
              placeholder="value greater than"
              onChange={(e) => setValue(Number(e.target.value))}
            />
            <input
              className="border border-black p-1 max-w-10 text-sm"
              value={boxSizeY}
              placeholder="yaxis"
              type="number"
              onChange={(e) => setBoxSizeY(Number(e.target.value))}
            />
            <input
              className="border border-black p-1 max-w-10 text-sm"
              value={boxSizeX}

              placeholder="xaxis"
              onChange={(e) => setBoxSizeX(Number(e.target.value))}
            />
            <input
              className="border border-black p-1 max-w-10 text-sm"
              value={lotSize}
              placeholder="lotsize"
              onChange={(e) => setLotSize(Number(e.target.value))}
            />
          </div>
          {/* Pagination buttons */}
          <div className="flex justify-between mt-1">
            <button
              className="border border-black p-1"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="border border-black p-1"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </DraggableDiv>}
      <div
        className="flex overflow--x-scroll font-bold"
        style={{ width: "2400px", height: "4600px" }}
      >
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default PointAndFigureChart;
