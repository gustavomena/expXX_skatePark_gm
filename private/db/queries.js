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
        const result = await pool.query("INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING*;",
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
        const result = await pool.query("UPDATE skaters SET nombre=$2, password=$3, anos_experiencia=$4, especialidad=$5 WHERE email=$1 RETURNING*;",
        [`${email}`, `${skater_name}`, `${password}`, `${experience_yrs}`, `${specialty}`]
        );
        return result.rows;
    } catch (e) {
        return e;
    }
}

async function setValid(id, valid) {
    try {
        const result = await pool.query("UPDATE skaters SET estado=$2 WHERE id=$1 RETURNING*",
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