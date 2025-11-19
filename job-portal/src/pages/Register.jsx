import React from 'react'

const Register = () => {
  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Full name" className="w-full p-3 border rounded" />
        <input type="email" placeholder="Email" className="w-full p-3 border rounded" />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Create account</button>
      </form>
    </div>
  )
}

export default Register
