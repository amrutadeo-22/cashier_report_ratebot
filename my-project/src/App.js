// import logo from './logo.svg';
// import './App.css';
// import Cash from './Cash/Cash';
// // import Report from './Cash/Report';

// function App() {
//   return (
//     <div className="App ">
      
//       <Cash/>
//       {/* <Report/> */}
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cash from './Cash/Cash';
import Report2 from './Cash/Report2';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Cash />} />
          {/* <Route path="/report" element={<Report />} /> */}
          <Route path="/report2" element={<Report2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
