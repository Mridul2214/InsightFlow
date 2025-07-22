import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/pages/Profile';
import Createpost from './components/pages/Createpost';
import Createvideo from './components/pages/Createvideo';
import Createblog from './components/pages/Crreateblog';
import Home from './components/pages/Home';
// import YoutubeFeed from './components/YoutubeFeed';
import Contact from './components/pages/Contact';
import About from './components/pages/About';
import EditProfile from './components/pages/Editprofile';
import PostDetail from './components/PostDetail';
import ProfileView from './components/pages/Profileview';
import Blogdetail from './components/Blogdetail';
import VideoDetail from './components/Videodetail';
import HistoryView from './components/pages/Historyview';
import YourContent from './components/pages/Yourcontent';
import EditPost from './components/pages/Editpost';
import EditVideo from './components/pages/Editvideo';
import EditBlogPage from './components/pages/Editblog';
import AdminDashboard from './components/admindashboard/Adminpage';
import Likedcontent from './components/pages/Likedcontent';
import Subcription from './components/pages/Subcription';
import AdminLogin from './components/admindashboard/Adminlogin';
import SearchResults from './components/pages/Searchresult';


const App = () => {
  const isAuthenticated = localStorage.getItem('token');

  return (
            
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        
        <Route path='/adminpage/*' element={<AdminDashboard/>}/>
       <Route path='/adminlogin' element={<AdminLogin/>}/>
        <Route path="/*" element={<Layout> 
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/createpost" element={isAuthenticated ? <Createpost /> : <Navigate to="/login" />} />
            <Route path="/createvideo" element={isAuthenticated ? <Createvideo /> :<Navigate to="/login"/>} />
            <Route path="/createblog" element={ isAuthenticated ? <Createblog />:<Navigate to ="login"/>} />
            <Route path='/contact' element={<Contact/>}/>
            <Route path='/about' element={<About/>}/>
            <Route path='/edit-profile' element={<EditProfile/>}/>
            <Route path='/posts/:postId' element={<PostDetail/>}/>
            <Route path='/blogs/:blogId' element={<Blogdetail/>}/>
            <Route path='/videos/:videoId' element={<VideoDetail/>}/>
            <Route path="/profile/:userId" element={<ProfileView />} />
            <Route path='/subcription' element={<Subcription/>}/>
            <Route path='/search' element={<SearchResults/>}/>
            {/* <Route path='/video/youtube/:id' element={<Videopage type='youtube'/>}/> */}
            {/* <Route path='youtube' element={<YoutubeFeed/>}/> */}
            <Route path="/" element={<Home/>} />
            <Route path='/posts' element={<Home/>}/>
            <Route path='/videos' element={<Home/>}/>
            <Route path='/blogs' element={<Home/>}/>
            <Route path='/?sort=recent' element={<Home/>}/>
            <Route path='/?sort=popular' element={<Home/>}/>
            <Route path='/?sort=trending' element={<Home/>}/>
            <Route path='/your-content' element={<YourContent/>}/> 
            <Route path='/edit-post/:id' element={<EditPost/>}/> 
            <Route path='/edit-video/:id' element={<EditVideo/>}/> 
            <Route path='/edit-blog/:id' element={<EditBlogPage/>}/>  
            <Route path='/users/:userId/liked-content' element={<Likedcontent/>}/>    
            <Route path='/history' element={<HistoryView/>}/>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>} />
      </Routes>
    </BrowserRouter>
            
  );
};

export default App;
