import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaHome,
  FaUserTie,
  FaBriefcase,
  FaGlobe,
  FaBuilding,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { BiLogOutCircle } from "react-icons/bi";
import { GoWorkflow } from "react-icons/go";
import { TbLayoutGridAdd } from "react-icons/tb";
import { LuFileSpreadsheet, LuUsers } from "react-icons/lu";
import { IoSettingsSharp } from "react-icons/io5";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { CgUserList } from "react-icons/cg";

const SidebarMenu = ({ isOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openNestedDropdown, setOpenNestedDropdown] = useState(null);
  const role = localStorage.getItem("role");
  const cid = localStorage.getItem("cid");

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
    if (name !== "settings") {
      setOpenNestedDropdown(null);
    }
  };

  const closeDropdown = () => setOpenDropdown(null);

  return (
    <div className={`sidebar ${isOpen ? "active" : ""}`}>
      <ul>
        <li>
          {role === "SuperAdmin" && (
            <Link to="/dashboard">
              <FaHome /> Home
            </Link>
          )}
          {(role === "admin" || role === "recruiter") && (
            <Link to={`/admin/${cid}`}>
              <FaHome /> Home
            </Link>
          )}
        </li>

        {/* Jobs Dropdown */}
        <li onClick={() => toggleDropdown("jobs")}>
          <div className="dropdown-toggle ">
            <div>
              <FaBriefcase /> Jobs{" "}
            </div>
            <div>
              {openDropdown === "jobs" ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>
        </li>
        {openDropdown === "jobs" && (
          <ul className="submenu">
            <li>
              <Link to="/alljobs" onClick={closeDropdown}>
                <FaClipboardList />
                All Jobs
              </Link>
            </li>
            <li>
              <Link to="/Job" onClick={closeDropdown}>
                <MdOutlineLibraryAdd />
                Create Job
              </Link>
            </li>
          </ul>
        )}
        {role !== "SuperAdmin" && (
          <li>
            <Link to="/applicants">
              <FaUserTie />
              Applicants
            </Link>
          </li>
        )}
        {role === "SuperAdmin" && (
          <li onClick={() => toggleDropdown("candidates")}>
            <div className="dropdown-toggle">
              <div>
                <CgUserList /> Candidates{" "}
              </div>
              <div>
                {openDropdown === "candidates" ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>
            </div>
            {openDropdown === "candidates" && (
              <ul className="submenu">
                <li>
                  <Link to="/applicants" onClick={closeDropdown}>
                    <FaUserTie />
                    Applicants
                  </Link>
                </li>
                <li>
                  <Link to="/candidates" onClick={closeDropdown}>
                    <LuUsers />
                    Candidates
                  </Link>
                </li>
              </ul>
            )}
          </li>
        )}

        {role === "SuperAdmin" && (
          <li>
            <Link to="/company">
              <FaBuilding /> Companies
            </Link>
          </li>
        )}

        <li>
          {role === "SuperAdmin" && (
            <Link to="/allUsers">
              <FaUsers /> Users
            </Link>
          )}
          {role === "admin" && (
            <Link to={`/users/${cid}`}>
              <FaUsers /> Users
            </Link>
          )}
        </li>

        {/* Settings Dropdown */}
        {role === "SuperAdmin" && (
          <li onClick={() => toggleDropdown("settings")}>
            <div className="dropdown-toggle">
              <div>
                <IoSettingsSharp />
                Settings{" "}
              </div>
              <div>
                {openDropdown === "settings" ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>
            </div>
          </li>
        )}
        {openDropdown === "settings" && (
          <ul className="submenu">
            <li>
              <Link to="/template">
                <LuFileSpreadsheet /> Template{" "}
              </Link>
            </li>
            <li>
              <Link to="/fieldCreation">
                <TbLayoutGridAdd /> Field
              </Link>
            </li>
            <li>
              <Link to="/workFlow">
                <GoWorkflow /> Workflow
              </Link>
            </li>
            <li>
              <Link to="/portal">
                <FaGlobe /> Portal
              </Link>
            </li>
          </ul>
        )}
        <li onClick={() => localStorage.clear()}>
          <Link to="/">
            <BiLogOutCircle /> Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SidebarMenu;
