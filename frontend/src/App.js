import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import Login from './components/login/Login';
import CandidateLogin from './components/login/CandidateLogin';
import CompanyCreate from './components/admin/CompanyCreate';
import CreateUser from './components/Users/CreateUser';
import AddUser from './components/Users/AddUser';
import EditUser from './components/Users/EditUser';
import JobCreate from './components/Job/JobCreate';
import JobDetails from './components/Job/JobDetails';
import Application from './components/Users/Application';
import Admin from './components/admin/Admin';
import DynamicFieldBuilderPage from './components/FieldBuilder/DynamicFieldBuilderPage';
import WorkflowBuilder from './components/WorkFlow/WorkFlowBuilder';
import AllJobs from './components/Job/AllJobs';
import CompanyUsers from './components/Users/AllUsers';
import Applicants from './components/Users/Applicants';
import Dashboard from './components/admin/Dashboard';
import ApplicantDetail from './components/Users/ApplicantDetails';
import ApplicantsByJob from './components/Users/ApplicantsByJob';
import Portal from './components/Job/Portal';
import PublicJobPage from './components/Users/PublicJobPage';
import AdminJobDetails from './components/Job/AdminJobDetails';
import JobTemplate from './components/Job/JobTemplate';
import Profile from './components/Users/Profile';
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Login/>}/>
    <Route path='/login/:slug' element={<CandidateLogin/>}/>
    <Route path='/login/:slug/:jid' element={<CandidateLogin/>}/>
    <Route path='/company' element={<CompanyCreate/>}/>
    <Route path='/Users/:cid' element={<CreateUser/>}/>
    <Route path='/addUser/:userId' element={<AddUser/>}/>
    <Route path='/addUser' element={<AddUser/>}/>
    <Route path='/editUser/:uid/:cid' element={<EditUser/>}/>
    <Route path='/allUsers' element={<CompanyUsers/>}/>
    <Route path='/allUsers/:CompanyId' element={<CompanyUsers/>}/>
    <Route path='/Applicants' element={<Applicants/>}/>
    <Route path='/Candidates' element={<Applicants/>}/>
    <Route path='/addJob/:cid' element={<JobCreate/>}/>
    <Route path='/Job/:id' element={<JobCreate/>}/>
    <Route path='/Job' element={<JobCreate/>}/>
    <Route path='/job/:slug/:jid' element={<JobDetails/>}/>
    <Route path='/job/jobdetail/:id' element={<AdminJobDetails/>}/>
    <Route path='/alljobs' element={<AllJobs/>}/>
    <Route path='/template' element={<JobTemplate/>}/>
    <Route path="/company/:companyId/jobs" element={<AllJobs />} />
    <Route path='/application/:slug/:jid/:candidateId' element={<Application />} />
    <Route path="/applicants/:jid/:id" element={<ApplicantDetail />} />
    <Route path="/applicants/:id" element={<ApplicantDetail />} />
    <Route path='/applicants/job/:jobId' element={<ApplicantsByJob/>}/> 
    <Route path='/admin/:cid' element={<Admin/>}/>
    <Route path='/fieldCreation' element={<DynamicFieldBuilderPage/>}/>
    <Route path='/workFlow' element={<WorkflowBuilder/>}/>
    <Route path='/dashboard' element={<Dashboard/>}/>
    <Route path='/portal' element={<Portal/>}/>
    <Route path="/careers/:slug" element={<PublicJobPage />} />
    <Route path='/profile/:slug/:id' element={<Profile/>} />
   </Routes>
    <Toaster position="top-right" />
   </BrowserRouter>
  );
}

export default App;
