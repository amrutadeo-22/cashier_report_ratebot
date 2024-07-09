
import React, { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadIcon from '@mui/icons-material/Download';
import { IconButton } from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Report2 = () => {
  const [data, setData] = useState([]);
  const [paymentMode, setPaymentMode] = useState('all');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (startDate && endDate) {
      fetchPayments();
    }
  }, [startDate, endDate]);

  const fetchPayments = () => {
    fetch('http://localhost:5000/get_payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error('Fetched data is not an array:', data);
          setData([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setData([]);
      });
  };
  const handleDownloadOption = (value) => {
        if (value === 'Pdf') {
          downloadAllTables();
        } else if (value === 'Excel') {
          downloadAllTablesExcel();
        }
      };
  const filterDataByMode = (mode) => {
    if (mode === 'all') {
      return data;
    }
    return data.filter((item) => item.payment_mode.toLowerCase() === mode);
  };

  const getTotalReceived = (filteredData) => {
    return filteredData.reduce((acc, current) => acc + current.received, 0);
  };

  const downloadAllTables = () => {
    const doc = new jsPDF('landscape', 'px', [1920, 1080]);
    const tables = [
      { name: 'By Cash INR', data: filterDataByMode('cash') },
      { name: 'By Card INR', data: filterDataByMode('card') },
      { name: 'By Online INR', data: filterDataByMode('online') },
      { name: 'By POS INR', data: filterDataByMode('pos') },
      { name: 'By UPI INR', data: filterDataByMode('upi') },
    ];

    let totalAmount = 0; // Total received amount for all tables

    tables.forEach((table, index) => {
      if (index > 0) doc.addPage(); // Add a new page for each table except the first one
      doc.setFont("bold");
      doc.setFontSize(30);
      const tableTitleX = 40;
      const tableTitleY = 40; // Adjust Y position for each table
      doc.text(table.name, tableTitleX, tableTitleY);
      const totalReceived = getTotalReceived(table.data);
      totalAmount += totalReceived;

      autoTable(doc, {
        startY: tableTitleY + 60, // Start Y position for table content
        head: [['Date', 'Description', 'Reference No.', 'Receipt No.', 'Company', 'OTA Reference No.', 'Invoice No.', 'Conversion Rate', 'Received', 'Payments', 'Balance Amount', 'User ID']],
        body: table.data.map(row => [
          row.date,
          row.description,
          row.reference_no,
          row.receipt_no,
          row.company,
          row.ota_reference_no,
          row.invoice_no,
          row.conversion_rate,
          row.received,
          row.payments,
          row.balance_amount,
          row.user_id
        ]),
        columnStyles: {
          1: { cellWidth: 200 },
          2: { cellWidth: 100 },
          3: { cellWidth: 100 },
          4: { cellWidth: 100 },
          5: { cellWidth: 150 },
        },
        styles: {
          overflow: 'linebreak',
          cellPadding: 5,
          fontSize: 18
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 23
        }
      });

      // Display total received amount at the end of each table
      doc.setFontSize(20);
      const endYPosition = doc.autoTable.previous.finalY + 20;
      doc.text(`Total Received: ${totalReceived}`, 40, endYPosition);
    });

    // Display total amount for all tables
    doc.setFontSize(25);
    const startYPosition = doc.autoTable.previous.finalY + 20;
    doc.text(`Total Amount for All Tables: ${totalAmount}`, 40, startYPosition + 40);

    doc.save('All_Tables.pdf');
};


  const downloadPDF = (tableData, tableName) => {
    const doc = new jsPDF('landscape', 'px', [1920, 1080]);
    doc.setFont("bold");
    doc.setFontSize(30);
    
    doc.text(`${tableName}`, 40, 20);
    doc.text(`Total Received: ${getTotalReceived(tableData)}`, 40, 40);
    
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Description', 'Reference No.', 'Receipt No.', 'Company', 'OTA Reference No.', 'Invoice No.', 'Conversion Rate', 'Received', 'Payments', 'Balance Amount', 'User ID']],
      body: tableData.map(row => [
        row.date,
        row.description,
        row.reference_no,
        row.receipt_no,
        row.company,
        row.ota_reference_no,
        row.invoice_no,
        row.conversion_rate,
        row.received,
        row.payments,
        row.balance_amount,
        row.user_id
      ]),
      columnStyles: {
        1: { cellWidth: 200 },
        2: { cellWidth: 100 },
        3: { cellWidth: 100 },
        4: { cellWidth: 100 },
        5: { cellWidth: 150 },
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 5,
        fontSize: 18
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 23
      },
      didDrawPage: (data) => {
        doc.text(`Total Received: ${getTotalReceived(tableData)}`, 40, data.cursor.y + 10);
      }
    });
    
    doc.save(`${tableName}.pdf`);
  };
  

// const downloadAllTablesExcel = () => {
//   const wb = XLSX.utils.book_new();
//   const paymentModes = ['cash', 'card', 'online', 'pos', 'upi'];
  
//   paymentModes.forEach(mode => {
//       const filteredData = filterDataByMode(mode);
//       const tableName = mode.charAt(0).toUpperCase() + mode.slice(1);
//       const modifiedHeaders = {};
      
//       // Remove underscores and capitalize the first letter of each word
//       Object.keys(filteredData[0] || {}).forEach(key => {
//           const modifiedHeader = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
//           modifiedHeaders[modifiedHeader] = key;
//       });
      
//       const modifiedData = filteredData.map(item => {
//           const newItem = {};
//           Object.keys(modifiedHeaders).forEach(modifiedHeader => {
//               newItem[modifiedHeader] = item[modifiedHeaders[modifiedHeader]];
//           });
//           return newItem;
//       });
      
//       const ws = XLSX.utils.json_to_sheet(modifiedData, {
//           header: Object.keys(modifiedHeaders)
//       });

//       XLSX.utils.sheet_add_aoa(ws, [['Total Received', getTotalReceived(filteredData)]], { origin: 'L1' });
//       XLSX.utils.sheet_add_aoa(ws, [['Total Received', getTotalReceived(filteredData)]], { origin: -1 });
//       const colWidths = [];
//         Object.keys(modifiedHeaders).forEach(header => {
//             colWidths.push({ wch: header.length + 5 }); // Adjust the additional 5 as needed
//         });
//         ws['!cols'] = colWidths;
//       XLSX.utils.book_append_sheet(wb, ws, tableName);
//   });

//   XLSX.writeFile(wb, 'All_Tables.xlsx');
// };
const downloadAllTablesExcel = () => {
  const wb = XLSX.utils.book_new();
  const paymentModes = ['cash', 'card', 'online', 'pos', 'upi'];
  
  paymentModes.forEach(mode => {
      const filteredData = filterDataByMode(mode);
      const tableName = mode.charAt(0).toUpperCase() + mode.slice(1);
      const modifiedHeaders = {};
      
      // Remove underscores and capitalize the first letter of each word
      Object.keys(filteredData[0] || {}).forEach(key => {
          const modifiedHeader = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          modifiedHeaders[modifiedHeader] = key;
      });
      
      const modifiedData = filteredData.map(item => {
          const newItem = {};
          Object.keys(modifiedHeaders).forEach(modifiedHeader => {
              newItem[modifiedHeader] = item[modifiedHeaders[modifiedHeader]];
          });
          return newItem;
      });
      
      const ws = XLSX.utils.json_to_sheet(modifiedData, {
          header: Object.keys(modifiedHeaders)
      });

      XLSX.utils.sheet_add_aoa(ws, [['Total Received', getTotalReceived(filteredData)]], { origin: 'L1' });
      XLSX.utils.sheet_add_aoa(ws, [['Total Received', getTotalReceived(filteredData)]], { origin: -1 });

      // Adjust column widths
      const colWidths = [];
      Object.keys(modifiedHeaders).forEach((header, index) => {
          if (index === 4) {
              // Set the width of the 5th column to be three times wider than the other columns
              colWidths.push({ wch: (header.length + 5) * 3 });
          } else {
              colWidths.push({ wch: header.length + 5 });
          }
      });
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, tableName);
  });

  XLSX.writeFile(wb, 'All_Tables.xlsx');
};

  return (
    <div className="flex flex-col mt-20 ml-10">
      <h1 className="text-xl font-bold mb-4 text-blue-800">Mango Leaf Lake Resort</h1>
      <div className='flex justify-between'>
        <p className="mb-2 font-bold ">Cash Book</p>
        <div className="relative inline-block text-left">
          <select className="border p-2 rounded ml-2 mr-5" onChange={(e) => handleDownloadOption(e.target.value)}>
            <option value="">Download</option>
            <option value="Pdf">PDF </option>
            <option value="Excel">Excel</option>
          </select>
          <IconButton onClick={() => handleDownloadOption(document.querySelector('select').value)}>
            <DownloadIcon />
          </IconButton>
        </div>
      </div>
      <div className="flex mb-4  ">
        <div className="mr-4">
          <label>Start Date: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label>End Date: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            className="border p-2 rounded"
          />
        </div>
      </div>
      <div className="mb-4">
        <label>Filter by Payment Mode: </label>
        <select className="border p-2 rounded ml-2" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
          <option value="all">All</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="online">Online</option>
          <option value="pos">POS</option>
          <option value="upi">UPI</option>
        </select>
      </div>

      <Table data={filterDataByMode(paymentMode)} />

      <div className="mt-4">
        <h2>Total Amount Received: {getTotalReceived(filterDataByMode(paymentMode))}</h2>
      </div>
    </div>
  );
};

const Table = ({ data }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 mt-4 mb-4 shadow-md">
      <thead className="bg-blue-500 text-white">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Reference No.</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Receipt No.</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Company</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">OTA Reference No.</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Invoice No.</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Conversion Rate</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Received</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Payments</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Balance Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User ID</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative group max-w-[250px]"><span className="truncate block">{row.description}</span>
                  <span className="absolute hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-lg py-1 ">
                    {row.description}
                   </span> </td>
            {/* <td className="py-1 px-2 border-b border-gray-200 border-r border-gray-500 border-dashed relative group max-w-[100px] ">
                 */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.reference_no}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.receipt_no}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.company}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.ota_reference_no}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.invoice_no}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.conversion_rate}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.received}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.payments}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.balance_amount}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.user_id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Report2;
