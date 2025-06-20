import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaHome, FaUserTie, FaBriefcase, FaGlobe,
  FaBuilding, FaClipboardList
} from 'react-icons/fa';
import { BiLogOutCircle } from 'react-icons/bi';
import { GoWorkflow } from 'react-icons/go';
import { TbLayoutGridAdd } from 'react-icons/tb';
import { LuFileSpreadsheet } from "react-icons/lu";
import { IoSettingsSharp } from "react-icons/io5";
import { MdOutlineLibraryAdd } from "react-icons/md";
// <- make sure this CSS file is created

const SidebarMenu = ({ isOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const role = localStorage.getItem("role");
  const cid = localStorage.getItem("cid");

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdown = () => setOpenDropdown(null);

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

        {/* Jobs Dropdown */}
        <li onClick={() => toggleDropdown("jobs")}>
          <span className="dropdown-toggle">
            <FaBriefcase /> Jobs {openDropdown === "jobs" ? "▾" : "▸"}
          </span>
        </li>
        {openDropdown === "jobs" && (
          <ul className="submenu">
            <li><Link to="/alljobs" onClick={closeDropdown}><FaClipboardList/>All Jobs</Link></li>
            <li><Link to="/Job" onClick={closeDropdown}><MdOutlineLibraryAdd/>Create Job</Link></li>
          </ul>
        )}

        <li><Link to="/applicants"><FaUserTie /> Candidates</Link></li>

        {role === 'SuperAdmin' && (
          <li><Link to='/company'><FaBuilding /> Companies</Link></li>
        )}

        <li>
          {role === "SuperAdmin" && <Link to="/allUsers"><FaUsers /> Users</Link>}
          {role === "admin" && <Link to={`/users/${cid}`}><FaUsers /> Users</Link>}
        </li>

        {/* Settings Dropdown */}
        <li onClick={() => toggleDropdown("settings")}>
          <span className="dropdown-toggle">
             <IoSettingsSharp />Settings {openDropdown === "settings" ? "▾" : "▸"}
          </span>
        </li>
        {openDropdown === "settings" && (
          <ul className="submenu">
            <li><Link to="/template" onClick={closeDropdown}><LuFileSpreadsheet/>Template</Link></li>
            <li><Link to="/fieldCreation" onClick={closeDropdown}><TbLayoutGridAdd />Field</Link></li>
          </ul>
        )}

        <li><Link to="/workFlow"><GoWorkflow /> Workflow</Link></li>
        <li><Link to="/portal"><FaGlobe /> Portal</Link></li>
        <li onClick={() => localStorage.clear()}>
          <Link to="/"><BiLogOutCircle /> Logout</Link>
        </li>
      </ul>
    </div>
  );
};

export default SidebarMenu;
