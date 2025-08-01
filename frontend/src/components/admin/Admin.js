import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaUsers, FaBriefcase, FaUserTie, FaFolderOpen } from "react-icons/fa";
import "../Job/JobList.css";
import Navbar from "./Navbar";
import { Bar, Pie } from "react-chartjs-2";
import { IoSettingsOutline } from "react-icons/io5";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  ArcElement
);

function Admin() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState({});
  const [stats, setStats] = useState({
    usersCount: 0,
    applicationCount: 0,
    activeJobsCount: 0,
    jobCount: 0,
  });
  const getCompany = async () => {
    try {
      const res = await axios.get(`/company/${cid}`);
      setCompany(res.data);
    } catch (error) {
      console.error("Error fetching company:", error);
    }
  };
  const getDetails = async () => {
    const res = await axios.get(`/company/details/${cid}`);
    const { usersCount, applicationCount, activeJobsCount, jobCount } =
      res.data;
    setStats({ usersCount, applicationCount, activeJobsCount, jobCount });
  };
  const getStatus = async ()=>{
    const res = await axios.get(`/application/application-status/${cid}`);
    console.log(res.data);
    
  }
  const sourcePieData = {
    labels: ["Applied", "Shortlisted", "Interview", "Offered", "Rejected"],
    datasets: [
      {
        label: "Applicants",
        data: [50, 20, 15, 5, 10],
        backgroundColor: [
          "#f5a623",
          "#f44336",
          "#9b59b6",
          "#1abc9c",
          "#e74c3c",
        ],
        borderWidth: 1,
      },
    ],
  };

  const sourcePieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        formatter: (value) => `${((value / 100) * 100).toFixed(1)}%`,
        color: "#fff",
      },
      legend: {
        position: "right",
      },
    },
  };

  const data = {
    labels: ["Applied", "Shortlisted", "Interview", "Offered", "Rejected"],
    datasets: [
      {
        label: "Applicants",
        data: [50, 20, 15, 5, 10],
        backgroundColor: "#4a90e2",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  useEffect(() => {
    getCompany();
    getDetails();
    getStatus();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="navbar">
          <div className="df jcsb al w100">
            <h2 className="ml10">{company.name}</h2>
            <div className="c-btn"></div>
          </div>
        </nav>
        <div className="dashboard-container">
          <div className="summary-cards">
            <div
              className="card df al g10"
              onClick={() => navigate("/alljobs")}
            >
              <div>
                <FaBriefcase />
              </div>
              <div>
                Total Jobs: <strong>{stats.jobCount}</strong>
              </div>
            </div>
            <div
              className="card df al g10"
              onClick={() => navigate("/applicants")}
            >
              <div>
                <FaFolderOpen />
              </div>
              <div>
                Active Jobs: <strong>{stats.activeJobsCount}</strong>
              </div>
            </div>
            <div
              className="card df g10 al"
              onClick={() => navigate("/company")}
            >
              <div>
                <FaUserTie />
              </div>
              <div>
                Applicants: <strong>{stats.applicationCount}</strong>
              </div>
            </div>
            <div
              className="card df g10 al"
              onClick={() => navigate("/allUsers")}
            >
              <div>
                <FaUsers />
              </div>
              <div>
                Users: <strong>{stats.usersCount}</strong>
              </div>
            </div>
          </div>
          <div className="dashboard-main">
            <div className="chart-section">
              <div className="df fdr jcsb w90">
                <h3>Job Status Overview</h3>
                <IoSettingsOutline size={15} className="cursor-pointer" />
              </div>
              <div className="bar-chart-container">
                <Bar data={data} options={options} />
              </div>
            </div>
            <div className="chart-section">
              <div className="df fdr jcsb w90">
                <h3>Applicants </h3>
                <IoSettingsOutline size={15} className="cursor-pointer" />
              </div>
              
              <div className="pie-chart-container">
                <Pie data={sourcePieData} options={sourcePieOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
