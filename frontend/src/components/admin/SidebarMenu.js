import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaHome, FaUserTie, FaBriefcase,FaGlobe,FaUser  } from 'react-icons/fa';
import { BiLogOutCircle } from 'react-icons/bi';
import { GoWorkflow } from 'react-icons/go';
import { TbLayoutGridAdd } from 'react-icons/tb';
import { FaBuilding } from "react-icons/fa";

const SidebarMenu = ({ isOpen, toggleSidebar }) => {
  const role = localStorage.getItem("role");
  const cid = localStorage.getItem("cid");

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`}>
      <ul>
        <li>
          {role === "SuperAdmin" && (
            <Link to="/dashboard"><FaHome /> Home</Link>
          )}
          {role === "admin" && cid && (
            <Link to={`/admin/${cid}`}><FaHome /> Home</Link>
          )}
        </li>
        <li><Link to="/alljobs"><FaBriefcase /> Jobs</Link></li>
        <li><Link to="/applicants"><FaUserTie /> Applicants</Link></li>
        <li>{role === 'SuperAdmin' &&(<Link to='/company'><FaBuilding/>Companies</Link>)}</li>
        <li>
          {role === "SuperAdmin" && <Link to="/allUsers"><FaUsers /> Users</Link>}
          {role === "admin" && <Link to={`/users/${cid}`}><FaUsers /> Users</Link>}
        </li>
        {/* <li><Link><FaUser/>Admin</Link> </li> */}
        <li><Link to="/fieldCreation"><TbLayoutGridAdd /> Fields</Link></li>
        <li><Link to="/workFlow"><GoWorkflow /> Workflow</Link></li>
        <li><Link to="/portal"><FaGlobe/>Portal</Link></li>
        <li onClick={() => localStorage.clear()}>
          <Link to="/"><BiLogOutCircle /> Logout</Link>
        </li>
      </ul>
    </div> 
  );
};

export default SidebarMenu;
