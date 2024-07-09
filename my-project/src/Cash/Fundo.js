

// import React, { useState } from 'react';

// const Fundout = ({ onClose, onSubmit }) => {
//   const [method, setMethod] = useState('');
//   const [amount, setAmount] = useState(0);
//   const [collector, setCollector] = useState('');
//   const [comments, setComments] = useState('');

//   const handleMethodChange = (e) => {
//     setMethod(e.target.value);
//   };

//   const handleAmountChange = (e) => {
//     setAmount(Number(e.target.value));
//   };

//   const handleCollectorChange = (e) => {
//     setCollector(e.target.value);
//   };

//   const handleCommentsChange = (e) => {
//     setComments(e.target.value);
//   };

//   const handleSubmit = () => {
//     if (method && amount) {
//       onSubmit(method, amount, 'out', collector, comments);
//       onClose();
//     }
//   };

//   return (
//     <div className='p-4'>
//       <h1 className='p-1 text-lg font-bold'>Funds Withdrawals</h1>
//       <div className='p-2 flex flex-col space-y-4'>
//         <div className='flex items-center'>
//           <select className='pr-2 flex-grow p-2 border rounded' value={method} onChange={handleMethodChange}>
//             <option value="">Mode of Payment</option>
//             <option value="card">Credit Card</option>
//             <option value="cash">Cash</option>
//             <option value="upi">UPI</option>
//             <option value="online">Online Payment Gateway</option>
//             <option value="pos">Payment Collected via POS</option>
//           </select>
//           <input className='p-2 border rounded ml-2 w-32' type='number' value={amount} onChange={handleAmountChange} />
//         </div>
//         <div className='flex items-center'>
//           <label className='pr-4 w-1/3 font-semibold'>Funds Collector</label>
//           <input className='p-2 border rounded flex-grow' type='text' value={collector} onChange={handleCollectorChange} />
//         </div>
//         <div className='flex items-center'>
//           <label className='pr-4 w-1/3 font-semibold'>Any Comments</label>
//           <input className='p-2 border rounded flex-grow' type='text' value={comments} onChange={handleCommentsChange} />
//         </div>
//       </div>
//       <div className='flex justify-end space-x-4'>
//         <button className='p-2 border rounded ml-2' onClick={handleSubmit}>Withdraw Funds</button>
//         <button className='p-2 border rounded ml-2' onClick={onClose}>Cancel</button>
//       </div>
//     </div>
//   );
// };

// export default Fundout;
import React, { useState } from 'react';

const Fundout = ({ onClose, onSubmit }) => {
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState(0);
  const [collector, setCollector] = useState('');
  const [comments, setComments] = useState('');

  const handleMethodChange = (e) => {
    setMethod(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(Number(e.target.value));
  };

  const handleCollectorChange = (e) => {
    setCollector(e.target.value);
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  const handleSubmit = () => {
    if (method && amount) {
      onSubmit(method, amount, 'out', collector, comments);
      onClose();
    }
  };

  return (
    <div className="p-4">
      <h1 className="p-1 text-lg font-bold">Funds Withdrawals</h1>
      <div className="p-2 flex flex-col space-y-4">
        <div className="flex items-center">
          <select className="pr-2 flex-grow p-2 border rounded" value={method} onChange={handleMethodChange}>
            <option value="">Mode of Payment</option>
            <option value="card">Credit Card</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="online">Online Payment Gateway</option>
            <option value="pos">Payment Collected via POS</option>
          </select>
          <input className="p-2 border rounded ml-2 w-32" type="number" value={amount} onChange={handleAmountChange} />
        </div>
        <div className="flex items-center">
          <label className="pr-4 w-1/3 font-semibold">Funds Collector</label>
          <input className="p-2 border rounded flex-grow" type="text" value={collector} onChange={handleCollectorChange} />
        </div>
        <div className="flex items-center">
          <label className="pr-4 w-1/3 font-semibold">Any Comments</label>
          <input className="p-2 border rounded flex-grow" type="text" value={comments} onChange={handleCommentsChange} />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button className="p-2 border rounded ml-2" onClick={handleSubmit}>Withdraw Funds</button>
        <button className="p-2 border rounded ml-2" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default Fundout;
