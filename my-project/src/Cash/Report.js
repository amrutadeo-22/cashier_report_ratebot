
import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Report = () => {
  const [openSections, setOpenSections] = useState({
    cash: false,
    upi: false,
    online: false,
    pos: false,
    card: false,
  });

  const [reportEntries, setReportEntries] = useState({
    cash: [],
    upi: [],
    online: [],
    pos: [],
    card: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");

        // console.log("Fetching cash entries...");
        // const cashResponse = await fetch('http://localhost/get_entry');
        // const cashData = await cashResponse.json();
        // console.log("Cash entries:", cashData);
        
        console.log("Fetching UPI entries...");
        const upiResponse = await fetch('http://127.0.0.1:5000/get_entry');
        const upiData = await upiResponse.json();
        console.log("UPI entries:", upiData);
        
        console.log("Fetching online entries...");
        const onlineResponse = await fetch('http://127.0.0.1:5000/get_entry_online');
        const onlineData = await onlineResponse.json();
        console.log("Online entries:", onlineData);
        
        // console.log("Fetching POS entries...");
        // const posResponse = await fetch('http://localhost/get_entry_pos');
        // const posData = await posResponse.json();
        // console.log("POS entries:", posData);
        
        // console.log("Fetching card entries...");
        // const cardResponse = await fetch('http://localhost/get_entry_card');
        // const cardData = await cardResponse.json();
        // console.log("Card entries:", cardData);

        console.log("Setting report entries...");
        setReportEntries({
          // cash: cashData,
          upi: upiData,
          online: onlineData,
          // pos: posData,
          // card: cardData,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    console.log("Calling fetchData()...");
    fetchData();
  }, []);

  const toggleSection = (method) => {
    setOpenSections((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const getEntriesByMethod = (method) => {
    return reportEntries[method];
  };

  return (
    <div className="flex flex-col mt-20">
      {['cash', 'upi', 'online', 'pos', 'card'].map((method) => (
        <div key={method} className="mb-1 bg-gray-10 rounded shadow-md p-2 px-8">
          <div className="flex justify-between items-left cursor-pointer" onClick={() => toggleSection(method)}>
            <h2 className='font-bold'>{method.charAt(0).toUpperCase() + method.slice(1)}</h2>
            <IconButton>
              {openSections[method] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </div>
          {openSections[method] && (
            <table className="w-full mt-2 rounded-lg">
              <thead className="bg-blue-500 text-white">
                <tr className='items-start'>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Provider/Receiver Name</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {getEntriesByMethod(method).map((entry, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{entry[0]}</td>
                    <td className="border px-4 py-2">{entry[1]}</td>
                    <td className="border px-4 py-2">{entry[2]}</td>
                    <td className="border px-4 py-2">{entry[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default Report;
