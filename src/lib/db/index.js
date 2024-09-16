import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE
};

const poolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool => {
    console.log('Connected to SQL Server');
    return pool;
})
.catch(error => {
    console.error('Error connecting to SQL Server: ', error);
    throw error;
})

export default poolPromise;