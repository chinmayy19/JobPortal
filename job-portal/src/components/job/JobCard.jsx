import React from 'react'

const JobCard = ({ title, company, experience, location }) => {
  return (
    <div className="job-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,background:'linear-gradient(135deg,var(--accent),var(--accent-2))',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>J</div>
            <div>
              <div className="job-title">{title}</div>
              <div className="job-meta">{company} • {location}</div>
            </div>
          </div>
        </div>

        <div style={{textAlign:'right'}}>
          <div className="job-meta">{experience}</div>
          <div style={{marginTop:12,display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn ghost">Details</button>
            <button className="btn">Apply</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobCard
