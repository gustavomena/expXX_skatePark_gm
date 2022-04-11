require('dotenv').config();

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function newSkater(email, skater_name, password, experience_yrs, specialty, photo, valid) {
    try {
        const result = await pool.query("INSERT INTO skaters (email, skater_name, password, experience_yrs, specialty, photo, valid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING*;",
        [`${email}`, `${skater_name}`, `${password}`, `${experience_yrs}`, `${specialty}`, `${photo}`, `${valid}`]
        );
        return result.rows;
    } catch (e) {
        return e;
    }
}

async function getSkaters() {
    try {
        const result = await pool.query("SELECT * FROM skaters ORDER BY id");
        return result.rows;
    } catch (e) {
        return e;
    }
}

async function setSkater(email, skater_name, password, experience_yrs, specialty) {
    try {
        const result = await pool.query("UPDATE skaters SET skater_name=$2, password=$3, experience_yrs=$4, specialty=$5 WHERE email=$1 RETURNING*;",
        [`${email}`, `${skater_name}`, `${password}`, `${experience_yrs}`, `${specialty}`]
        );
        return result.rows;
    } catch (e) {
        return e;
    }
}

async function setValid(id, valid) {
    try {
        const result = await pool.query("UPDATE skaters SET valid=$2 WHERE id=$1 RETURNING*",
        [`${id}`, `${valid}`]
        );
    } catch (e) {
        return e;
        
    }
}

async function deleteSkater(id) {
    try {
        const result = await pool.query("DELETE FROM skaters WHERE id=$1",
        [`${id}`]
        );
    } catch (e) {
        return e;
    }
}



module.exports = {newSkater, getSkaters, setSkater, setValid, deleteSkater};