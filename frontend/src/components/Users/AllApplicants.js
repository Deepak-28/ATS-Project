import React from 'react'
import Navbar from '../admin/Navbar';


function AllApplicants() {
  return (
    <div className="admin-container">
      <Navbar/>
    {/* Sidebar */}
    <div
           className={`sidebar ${sidebarOpen ? "active" : ""}`}
           ref={sidebarRef}
         >
           <ul>
             <li className=" df al jcsb  ">
               <Link to="#">
                 <GiHamburgerMenu onClick={toggleSidebar} />  
               </Link><span className="w100 ">Super Admin </span>
             </li>
             <li>
               <Link to="/superAdmin">
                 <FaHome /> Home
               </Link>
             </li>
             <li>
               <Link to="/alljobs">
                 <FaEdit /> Jobs
               </Link>
             </li>
             
             <li>
               <Link to='#'><FaUserTie/>Applicants
               </Link>
             </li>
             <li>
               <Link to="/allUsers">
                 <FaUsers /> Users
               </Link>
             </li>
             <li>
               <Link to='/fieldCreation'><TbLayoutGridAdd/>Fields
               </Link>
             </li>
             <li>
               <Link to="/workFlow">
                 <GoWorkflow /> Workflow
               </Link>
             </li>
             
             <li>
               <Link to='#'><MdDashboard/>Dashboard
               </Link>
             </li>
             <li>
               <Link to="/">
                 <BiLogOutCircle />
                 Logout
               </Link>
             </li>
           </ul>
         </div>

    {/* Content Area */}
    <div className="admin-container">
      <div className="df h10 al ">
        {!sidebarOpen && (
          <button className="menu-btn" onClick={toggleSidebar}>
            <GiHamburgerMenu className="menu_icon" />
          </button>
        )}
        <h2 className="job-heading mt15">Applicants</h2>
      </div>

      <table className="job-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>User ID</th>
            <th>Role</th>
            <th>Email</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, idx) => {
              const company = companies.find(
                (c) => Number(c.id) === Number(user.cid)
              );
              return (
                <tr key={user.id}>
                  <td>{idx + 1}</td>
                  <td>{user.id}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{company?.name || "-"}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  )
}

export default AllApplicants