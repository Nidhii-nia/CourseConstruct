import React from 'react'
import WorkspaceProvider from './provider'

//server-side
function WorkspaceLayout({children}) {
  return (
    <WorkspaceProvider>
        {children}
    </WorkspaceProvider>
  )
}

export default WorkspaceLayout