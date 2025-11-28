-- CREATE DATABASE job_portal;
-- USE job_portal;



-- CREATE TABLE users (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     full_name VARCHAR(100),
--     email VARCHAR(100) UNIQUE,
--     password_hash VARCHAR(255),
--     role ENUM('jobseeker','employer','admin'),
--     phone VARCHAR(20),
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );


-- CREATE TABLE job_seeker_profile (
--     user_id INT PRIMARY KEY,
--     education TEXT,
--     experience TEXT,
--     resume_path VARCHAR(255),
--     skills JSON,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );


-- CREATE TABLE employer_profile (
--     user_id INT PRIMARY KEY,
--     company_name VARCHAR(100),
--     company_description TEXT,
--     company_website VARCHAR(100),
--     company_logo VARCHAR(255),
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );


-- CREATE TABLE jobs (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     employer_id INT,
--     title VARCHAR(150),
--     description TEXT,
--     requirements TEXT,
--     work_location VARCHAR(100),
--     salary_range VARCHAR(100),
--     posted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (employer_id) REFERENCES users(id)
-- );


-- CREATE TABLE job_applications (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     job_id INT,
--     applicant_id INT,
--     status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
--     applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (job_id) REFERENCES jobs(id),
--     FOREIGN KEY (applicant_id) REFERENCES users(id)
-- );


CREATE TABLE resume_analysis (
    user_id INT,
    extracted_skills JSON,
    recommended_roles JSON,
    improvement_suggestions TEXT,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);









