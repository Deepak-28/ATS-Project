import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { FaUsers, FaBriefcase, FaUserTie, FaBuilding } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Navbar from "../admin/Navbar";
import "./Dashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  ArcElement
);

function Dashboard() {
const notify = () => toast.error("This is a success message!",{position:"top-right"}
    
  );
  const navigate = useNavigate();
  const [applicantsData, setApplicantsData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [stats, setStats] = useState({
    companies: 0,
    jobs: 0,
    applications: 0,
    candidates: 0,
    users: 0,
  });
  const getJobs = async () => {
    try {
      const res = await axios.get("/job/all"); // Adjust this endpoint to your API
      setJobData(res.data);
      // console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };
  const getDetails = async () => {
    try {
      const res = await axios.get("/company/stats");
      const { companies, jobs, applications, candidates, users } = res.data;
      setStats({ companies, jobs, applications, candidates, users });
    } catch (err) {
      console.error("failed to fetch", err);
    }
  };
  const getData = async () => {
    try {
      const res = await axios.get("/application/applicants");
      setApplicantsData(res.data);
    } catch (err) {
      console.error("Failed to Fetch the Data", err);
    }
  };
  const JobsCount = () => {
    const uniqueJobs = new Set(
      applicantsData.map((applicant) => applicant.jobId)
    );
    return uniqueJobs.size;
  };
  const offerSent = () => {
    const offerCount = applicantsData.filter(
      (item) => item.status.toLowerCase() === "offered"
    );
    return offerCount.length;
  };
  const Shortlisted = () => {
    const statusCount = applicantsData.filter(
      (item) => item.status.toLowerCase() === "shortlist"
    );
    return statusCount.length;
  };
  const interviewStatus = () => {
    const applicantCount = applicantsData.filter(
      (item) => item.status.toLowerCase() === "interview"
    );
    return applicantCount.length;
  };
  const appliedStatus = () => {
    const appliedCount = applicantsData.filter(
      (item) => item.status.toLowerCase() === "applied"
    );
    return appliedCount.length;
  };
  const rejectedStatus = () => {
    const rejectedCount = applicantsData.filter(
      (item) => item.status.toLowerCase() === "rejected"
    );
    return rejectedCount.length;
  };
  const totalCount = applicantsData.length;
  // Count jobs per company
  const companyJobCounts = jobData.reduce((acc, job) => {
    acc[job.companyName] = (acc[job.companyName] || 0) + 1;
    return acc;
  }, {});
  // Total jobs (optional for percentages)
  const totalJobs = Object.values(companyJobCounts).reduce((a, b) => a + b, 0);

  const sourcePieData = {
    labels: ["Applied", "Shortlisted", "Interview", "Offered", "Rejected"],
    datasets: [
      {
        label: "Applicants",
        data: [
          totalCount,
          Shortlisted(),
          interviewStatus(),
          offerSent(),
          rejectedStatus(),
        ],
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
        formatter: (value) => `${((value / totalCount) * 100).toFixed(1)}%`,
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
        data: [
          totalCount,
          Shortlisted(),
          interviewStatus(),
          offerSent(),
          rejectedStatus(),
        ], // example data
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
    getData();
    getJobs();
    getDetails();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <div className="dashboard-container">
          <div className="dashboard-heading df al jcsb  ">
            <h2>Dashboard</h2>
            {/* <IoSettingsOutline size={20} /> */}
          </div>
          <div className="summary-cards">
            <div
              className="card df g10 al"
              onClick={() => navigate("/company")}
            >
             
              <div>
                <FaBuilding />
              </div>
               <div>
               Companies: <strong>{stats.companies}</strong>
              </div>
            </div>
            <div className="card df g10 al"
            onClick={()=>navigate("/allUsers")}>
              
              <div>
                <FaUsers />
              </div>
              <div>
              Users: <strong>{stats.users}</strong>
              </div>
            </div>
            <div
              className="card df al g10"
              onClick={() => navigate("/alljobs")}
            >
             
              <div>
                <FaBriefcase />
              </div>
               <div>
                Jobs: <strong>{stats.jobs}</strong>
              </div>
            </div>
            <div className="card df al g10"
            onClick={()=> navigate("/applicants")}>
              <div>
                <FaUserTie />
              </div>
              <div>
                Candidates: <strong>{stats.candidates}</strong>
              </div>
            </div>
          </div>
          <div className="dashboard-main">
            <div className="chart-section">
              <h3>Job Status Overview</h3>
              <Bar data={data} options={options} />
            </div>
            <div className="chart-section">
              <h3>Applicants </h3>
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
export default Dashboard;
