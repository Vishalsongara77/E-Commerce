import React from 'react'

const PopUp = ({ children, className = '' }) => {
  return (
    <div className={`${className} animate-fade-in`}>
      {children}
    </div>
  )
}

export default PopUp