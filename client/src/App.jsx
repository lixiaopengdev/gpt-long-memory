import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import"./App.css"
import Welcome from './components/Welcome';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar';
import { useContext } from 'react';
import { ChatContext } from './components/ChatContext';
import { GoogleLogin, googleLogout} from "@react-oauth/google"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Auth from './components/Auth/Auth';



function App() {

  const {
    loading,
    loadingCustomization,
    open,
    setOpen,
    setCustomizedPrompt,
    customizedInput,
    setCustomizedInput,
    handleCustomization
  } = useContext(ChatContext)


  return (
    <div className='gradient-bg-welcome'>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Welcome/>}/>
          <Route path='/oauth' element={<Auth/>}/>
        </Routes>
        {/* <Welcome/> */}
    </div>
  )
}

export default App;