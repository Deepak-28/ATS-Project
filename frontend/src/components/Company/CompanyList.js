import React, { useEffect, useRef, useState } from 'react';
import './CompanyList.css';
import { MdOutlineLibraryAdd } from "react-icons/md"; 
import { FaUser, FaEdit, FaHome } from "react-icons/fa";
import { GoOrganization, GoWorkflow } from "react-icons/go";
import { GiHamburgerMenu } from "react-icons/gi";

import { Link } from 'react-router-dom';
import axios from 'axios';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const getCompany = async () => {
    try {
      const res = await axios.get('/company/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  useEffect(() => {
    getCompany();
  }, []);

  return (
    <div className="company-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "active" : ""}`} ref={sidebarRef}>
        <ul>
          <li><GiHamburgerMenu onClick={toggleSidebar} /></li>
          <li><Link to ='/superAdmin'><FaHome/>Home</Link></li>
          <li><Link to="/Users"><FaUser /> Users</Link></li>
          <li><Link to="/jobs"><FaEdit /> Jobs</Link></li>
          <li><Link to="/company"><GoOrganization /> Company</Link></li>
          <li><Link to="#"><GoWorkflow /> Workflow</Link></li>
        </ul>
      </div>

      {/* Header */}
      <div className='c-header'>
        <nav className="navbar">
          {!sidebarOpen && (
            <button className="menu-btn" onClick={toggleSidebar}>
              <GiHamburgerMenu className="menu_icon" />
            </button>
          )}
        </nav>
        <h2 className="company-heading">Companies</h2>
        <div className="c-btn">
          <Link to="/addcompany">
            <MdOutlineLibraryAdd size={24} />
          </Link>
        </div>
      </div>

      {/* Table */}
      <table className="job-table">
        <thead>
          <tr>
            <th>Company Code</th>
            <th>Name</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company, index) => (
            <tr key={index}>
              <td>{company.code || `C${100 + index}`}</td>
              <td>{company.name}</td>
              <td>{company.country}, {company.state}</td>
              <td>actions</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyList;
