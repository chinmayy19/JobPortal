import React, { useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/job/JobCard";

const sampleJobs = [
  { id: 1, title: "Frontend Developer", company: "ABC Pvt Ltd", experience: "1-3 yrs", location: "Remote" },
  { id: 2, title: "Backend Developer (.NET)", company: "Tech Solutions", experience: "2-5 yrs", location: "Bengaluru" },
  { id: 3, title: "AI/ML Engineer", company: "DataSpark", experience: "0-2 yrs", location: "Hyderabad" },
]

const Home = () => {
  const [query, setQuery] = useState("")

  const filtered = sampleJobs.filter(j => (
    j.title.toLowerCase().includes(query.toLowerCase()) ||
    j.company.toLowerCase().includes(query.toLowerCase())
  ))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find your dream job faster</h1>
          <p className="text-lg opacity-90 mb-8">Millions of jobs from top companies — tailored to your skills.</p>

          <div className="max-w-2xl mx-auto flex shadow-lg rounded overflow-hidden">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              type="text"
              placeholder="Search job title or company"
              className="flex-1 p-4 text-gray-800"
            />
            <button className="bg-black text-white px-6">Search</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Featured Jobs</h2>
            <p className="text-gray-600">Hand-picked roles you may like</p>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <div>Openings <strong className="text-black">120</strong></div>
            <div>Companies <strong className="text-black">45</strong></div>
            <div>Remote <strong className="text-black">32</strong></div>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map(job => (
              <JobCard key={job.id} title={job.title} company={job.company} experience={job.experience} location={job.location} />
            ))}
          </div>
        </section>

        <section className="text-center py-12">
          <Link to="/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg">Create your account</Link>
        </section>
      </main>
    </div>
  );
};

export default Home;
