import React from 'react';
import { Routes,Route } from 'react-router-dom';
import Home from '../pages/Home';
import Roadmaps from '../pages/Roadmaps';
import Roadmap from '../pages/Roadmap';
import Dashobard from '../pages/Dashobard';
import Login from '../pages/Login';
import AddConcept from '../pages/AddConcept';
import AddRoadmap from '../pages/AddRoadmap';
import ManageRoadmaps from '../pages/ManageRoadmaps';
import ManageConcepts from '../pages/ManageConcepts';
import PopularRoadmaps from '../pages/PopularRoadmaps';
import AddBlog from '../pages/AddBlog';
import AddResource from '../pages/AddResource';
import ManageBlogs from '../pages/ManageBlogs';
import ManageResources from '../pages/ManageResources';
import Resources from '../pages/Resources';
import Post from '../pages/Post';
import Blogs from '../pages/Blogs';
import EditBlog from '../pages/EditBlog';
function Routex() {
  return (
       <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/roadmaps" element={<Roadmaps/>} />
        <Route path='/roadmaps/:roadmapname' element={<Roadmap />} />
        <Route path='/dashboard' element={<Dashobard />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/addconcept' element={<AddConcept/>}/>
        <Route path='/addroadmap' element={<AddRoadmap/>}/>
        <Route path='/manageroadmaps' element={<ManageRoadmaps/>}/>
        <Route path='/manageconcepts' element={<ManageConcepts/>}/>
        <Route path='/popular' element={<PopularRoadmaps />} />
        <Route  path='/addblog' element={<AddBlog/>}/>
        <Route  path='/manageblogs' element={<ManageBlogs/>}/>
        <Route  path='/addresource' element={<AddResource/>}/>
        <Route  path='/manageresources' element={<ManageResources/>}/>
        <Route  path='/blog' element={<Blogs/>}/>
        <Route  path='/resources' element={<Resources/>}/>
        <Route  path='/post/:postname/:blog_id' element={<Post/>}/>
      <Route path='/editblog/:id' element={<EditBlog />}/>

      </Routes>
   )
}

export default Routex
