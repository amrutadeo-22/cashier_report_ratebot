

import React, { useState, useEffect } from 'react';
import Fundin from './Fundi';
import Fundout from './Fundo';
import { Button, Dialog, DialogContent, DialogActions, DialogTitle, IconButton } from '@mui/material';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { initialReportData } from './Data';

const Cash = () => {
  const [fundinVisible, setFundinVisible] = useState(false);
  const [fundoutVisible, setFundoutVisible] = useState(false);
  const [data, setData] = useState([]);
  const [openingAmount, setOpeningAmount] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [savedOpeningAmount, setSavedOpeningAmount] = useState('');
  const [savedDiscrepancyReason, setSavedDiscrepancyReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    cash: false,
    upi: false,
    online: false,
    pos: false,
    card: false,
  });
  const [fundInEntries, setFundInEntries] = useState([]);
  const [fundOutEntries, setFundOutEntries] = useState([]);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      const payload = {
        date: '2024-06-07',
        hotel_code: '100087',
      };

      setIsLoading(true);
      try {
        const response = await axios.post('http://192.168.0.151:7070/daily_payment_data_for_close_counter', payload, {
          timeout: 5000,
        });
        const apiData = response.data;
        if (Array.isArray(apiData.data)) {
          const fetchedData = apiData.data.map((item, index) => ({
            id: item.id || index + 1,
            method: item.name || 'Unknown',
            fundsAvailable: item.available_balance || 0,
            withdrawals: item.withdrawals || 0,
            collections: item.collections || 0,
            balance: item.available_balance || 0,
            discrepancies: item.discrepancies || 'N/A',
            added: item.added || 0,
          }));

          setData(fetchedData);
        } else {
          console.error('Unexpected API response format:', apiData);
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.error('Error fetching data from API: Request timed out');
        } else {
          console.error('Error fetching data from API:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataFromAPI();
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem('reportEntries');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          setFundInEntries(parsedData.filter((entry) => entry.status === 'in'));
          setFundOutEntries(parsedData.filter((entry) => entry.status === 'out'));
        } else {
          setFundInEntries([]);
          setFundOutEntries([]);
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        setFundInEntries([]);
        setFundOutEntries([]);
      }
    } else {
      const initialData = initialReportData.map((entry, index) => ({
        ...entry,
        id: index + 1,
      }));
      setFundInEntries(initialData.filter((entry) => entry.status === 'in'));
      setFundOutEntries(initialData.filter((entry) => entry.status === 'out'));
    }
  }, []);

  useEffect(() => {
    const allEntries = [...fundInEntries, ...fundOutEntries];
    localStorage.setItem('reportEntries', JSON.stringify(allEntries));
  }, [fundInEntries, fundOutEntries]);

  const addFundInEntry = (entry) => {
    const updatedEntries = [...fundInEntries, entry];
    setFundInEntries(updatedEntries);
    localStorage.setItem('reportEntries', JSON.stringify([...updatedEntries, ...fundOutEntries]));
  };

  const addFundOutEntry = (entry) => {
    const updatedEntries = [...fundOutEntries, entry];
    setFundOutEntries(updatedEntries);
    localStorage.setItem('reportEntries', JSON.stringify([...fundInEntries, ...updatedEntries]));
  };

  const renderLoadingSpinner = () => {
    return (
      <div className="flex items-center justify-center text-surface dark:text-white">
        <div className="rounded-full border-t-4 border-b-4 border-blue-500 w-12 h-12 animate-spin"></div>
        <strong className="ml-10">Loading...</strong>
      </div>
    );
  };

  const updateData = async (method, amount, transactionType, providerOrCollector, comments) => {
    const commonPayload = {
      hotel_code: 100087,
      name: 'Sudeep Gowda',
      comments: comments || 'No comments provided',
      date: new Date().toISOString().split('T')[0],
      next_day_opening_amount: 0,
    };

    const addPayload = {
      ...commonPayload,
      card: method === 'card' ? amount : 0,
      cash: method === 'cash' ? amount : 0,
      online: method === 'online' ? amount : 0,
      upi: method === 'upi' ? amount : 0,
      pos: method === 'pos' ? amount : 0,
      visa: method === 'visa' ? amount : 0,
      wallet: method === 'wallet' ? amount : 0,
      total_payment: amount,
    };

    const withdrawPayload = {
      ...commonPayload,
      card: method === 'card' ? amount : 0,
      cash: method === 'cash' ? amount : 0,
      master_card: method === 'master_card' ? amount : 0,
      upi: method === 'upi' ? amount : 0,
      visa: method === 'visa' ? amount : 0,
      wallet: method === 'wallet' ? amount : 0,
      pos: method === 'pos' ? amount : 0,
      total_payment: amount,
    };

    console.log('Sending payload:', transactionType === 'in' ? addPayload : withdrawPayload);

    setIsLoading(true);
    try {
      const response = await axios.post(transactionType === 'in' ? 'http://192.168.0.151:7070/add_fund_to_cash_counter' : 'http://192.168.0.151:7070/withdraw_fund_from_cash_counter', transactionType === 'in' ? addPayload : withdrawPayload, {
        timeout: 10000,
      });

      console.log('API response:', response);

      if (response.status === 200) {
        const newData = data.map((item) => {
          if (item.method === method) {
            if (transactionType === 'in') {
              return {
                ...item,
                fundsAvailable: item.fundsAvailable + amount,
                added: item.added + amount,
                balance: item.balance + amount,
              };
            } else if (transactionType === 'out') {
              return {
                ...item,
                fundsAvailable: item.fundsAvailable - amount,
                withdrawals: item.withdrawals + amount,
                balance: item.balance - amount,
              };
            }
          }
          return item;
        });
        setData(newData);
      } else {
        console.error('Error in API response:', response);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('Error making API call: Request timed out');
      } else {
        console.error('Error making API call:', error);
      }
    } finally {
      setIsLoading(false);
    }

    const entry = { method, amount, providerOrCollector, comments, status: transactionType };
    if (transactionType === 'in') {
      addFundInEntry(entry);
    } else {
      addFundOutEntry(entry);
    }
  };

  const handleFundinClick = () => {
    setFundinVisible(true);
  };

  const handleFundoutClick = () => {
    setFundoutVisible(true);
  };

  const handleFundinClose = () => {
    setFundinVisible(false);
  };

  const handleFundoutClose = () => {
    setFundoutVisible(false);
  };

  const handleSaveChanges = () => {
    setSavedOpeningAmount(openingAmount);
    setSavedDiscrepancyReason(discrepancyReason);
    setOpeningAmount('');
    setDiscrepancyReason('');
  };

  const handleDownloadFile = () => {
    const headers = {
      id: 'ID',
      method: 'Payment Method',
      fundsAvailable: 'Funds Available',
      withdrawals: 'Withdrawals',
      collections: 'Collections',
      balance: 'Available Balance',
      discrepancies: 'Discrepancies',
      added: 'Added',
    };

    const mappedData = data.map((item) => ({
      [headers.id]: item.id,
      [headers.method]: item.method,
      [headers.fundsAvailable]: item.fundsAvailable,
      [headers.withdrawals]: item.withdrawals,
      [headers.collections]: item.collections,
      [headers.balance]: item.balance,
      [headers.discrepancies]: item.discrepancies,
      [headers.added]: item.added,
    }));

    const ws = XLSX.utils.json_to_sheet(mappedData, {
      header: Object.values(headers),
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'cash_counter_data.xlsx');
  };

  const toggleSection = (method) => {
    setOpenSections((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  return (
    <div className="flex flex-col justify-center h-screen p-2 ml-12">
      <div className="flex">
        <h1 className="text-3xl font-bold mx-auto">Cash Counter</h1>
        <DownloadIcon className="flex justify-end mt-3 mr-8 cursor-pointer" onClick={handleDownloadFile} />
      </div>
      <div className="bg-white shadow-md rounded p-4">
        <table className="w-full">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">#</th>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">Payment Method</th>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">Funds Available</th>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">Withdrawals</th>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">Collections</th>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">Available Balance</th>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">Discrepancies</th>
              <th className="px-4 py-2 border-b border-gray-200 border-r border-gray-500 text-left">Added</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  {renderLoadingSpinner()}
                </td>
              </tr>
            ) : Array.isArray(data) ? (
              data.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 border-b border-gray-200 border-l border-r border-gray-500">{item.id}</td>
                  <td className="px-4 py-2 border-b border-gray-200 border-r border-gray-500">{item.method}</td>
                  <td className="px-4 py-2 border-b border-gray-200 border-r border-gray-500">{item.fundsAvailable}</td>
                  <td className="px-4 py-2 border-b border-gray-200 border-r border-gray-500">{item.withdrawals}</td>
                  <td className="px-4 py-2 border-b border-gray-200 border-r border-gray-500">{item.collections}</td>
                  <td className="px-4 py-2 border-b border-gray-200 border-r border-gray-500">{item.balance}</td>
                  <td className="px-4 py-2 border-b border-gray-200 border-r border-gray-500">{item.discrepancies}</td>
                  <td className="px-4 py-2 border-b border-gray-200 border-r border-gray-500">{item.added}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {savedOpeningAmount && (
          <div className="mt-4">
            <strong>Next Day Opening Amount:</strong> {savedOpeningAmount}
          </div>
        )}
        {savedDiscrepancyReason && (
          <div className="mt-4">
            <strong>Reason for Discrepancies:</strong> {savedDiscrepancyReason}
          </div>
        )}
      </div>
      <div className="flex justify-center mt-10">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 pr-6 rounded" onClick={handleFundinClick}>
          Fund In
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4" onClick={handleFundoutClick}>
          Fund Out
        </button>
      </div>
      <Dialog open={fundinVisible} onClose={handleFundinClose}>
        <DialogTitle>Fund In</DialogTitle>
        <DialogContent>
          <Fundin onClose={handleFundinClose} onSubmit={updateData} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFundinClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={fundoutVisible} onClose={handleFundoutClose}>
        <DialogTitle>Fund Out</DialogTitle>
        <DialogContent>
          <Fundout onClose={handleFundoutClose} onSubmit={updateData} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFundoutClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <div className="flex justify-center mt-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="openingAmount">
            Next Day Opening Amount:
          </label>
          <input
            id="openingAmount"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={openingAmount}
            onChange={(e) => setOpeningAmount(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="discrepancyReason">
            Reason for Discrepancies:
          </label>
          <input
            id="discrepancyReason"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={discrepancyReason}
            onChange={(e) => setDiscrepancyReason(e.target.value)}
          />
        </div>
      </div>
      {/* <div className="flex justify-center mt-4">
        <Link to="/report" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          View Report
        </Link>
      </div> */}
      <div className="flex justify-center mt-4">
        <Link to="/report2" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          View Report
        </Link>
      </div>
    </div>
  );
};

export default Cash;
