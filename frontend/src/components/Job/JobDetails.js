import { useParams, useNavigate } from "react-router-dom";
import './JobDetails.css';
import axios from "axios";
import { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";

const JobDetails = () => {
    const { slug, jid } = useParams();
    const [job, setJob] = useState({});
    const [applied, setApplied] = useState(false);
    const navigate = useNavigate();

    const fetchJobDetails = async () => {
        try {
            const res = await axios.get(`/job/${jid}`);
            setJob(res.data);
        } catch (err) {
            console.error("Error fetching job details:", err);
        }
    };
    // const checkApplicationStatus = async () => {
    //     try {
    //         const res = await axios.get(`/application/status`, {
    //             params: { candidateId, jobId: jid }
    //         });
    //         setApplied(res.data.applied);
    //     } catch (err) {
    //         console.error("Error checking application status:", err);
    //     }
    // };
    const handleApply = async () => {  
            // navigate(`/application/${jid}/${candidateId}`);
    };
    const handleCancel = () => {
        // navigate(`/candidate/${candidateId}`);
    };
    useEffect(() => {
        fetchJobDetails();
        // checkApplicationStatus();
    }, []);

    return (
        <div className="job-details-container">
            <div className="job-details">
                <div className="job-details-header df jc fdc">
                    <h2>{job.jobTitle}</h2>
                    <p><span className="highlight">{job.companyName}</span></p>
                    <p className="details">
                        <FaBriefcase /> {job.jobExperience} years | <MdOutlineAvTimer /> {job.jobType} | <IoLocationOutline /> {job.jobLocation}
                    </p>
                </div>
                <div className="job-details-body ">
                    <p className="mt10"><strong>Description:</strong><br />{job.jobDescription}</p>
                    <p><strong>Skills Required:</strong><br />{job.skills}</p>
                </div>
            </div>

            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
            {
                !applied
                    ? <button className="apply-button" onClick={handleApply}>Apply</button>
                    : <button className="apply-button" disabled>Applied</button>
            }
        </div>
    );
};

export default JobDetails;
