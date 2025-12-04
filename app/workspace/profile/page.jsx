import { UserProfile } from '@clerk/nextjs';
import React from 'react'

function Profile() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage your Profile</h2>
      <div className="max-w-4xl mx-auto">
        <UserProfile routing="hash" />
      </div>
    </div>
  )
}

export default Profile;