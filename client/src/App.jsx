import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Screen from './pages/Screen'

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/screen/:roomid' element={<Screen />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App