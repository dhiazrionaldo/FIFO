import sql from 'mssql'
import poolPromise from '@/lib/db'

export const maxDuration = 60;

export async function getTotalExpense(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange;
    
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`
                                        SELECT 'STORAGE' AS source, SUM(total_price) AS total_price FROM dbo.storage_stocks
                                        WHERE CAST(date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)

                                        UNION ALL

                                        SELECT 'LOUNGE' AS source, SUM(total_price) AS total_price FROM dbo.lounge_stocks
                                        WHERE CAST(date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                        `);

        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getTotalStock(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange;
    
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`
                                        SELECT 'STORAGE' AS source, SUM(qty) AS total_qty FROM dbo.storage_stocks
                                        WHERE CAST(date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)

                                        UNION ALL

                                        SELECT 'LOUNGE' AS source, SUM(qty) AS total_qty FROM dbo.lounge_stocks
                                        WHERE CAST(date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                        `);

        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getTotalWaisted(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange;
    
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`
                                        SELECT 'STORAGE' AS source, SUM(waisted_qty) AS total_qty FROM dbo.storage_stocks
                                        WHERE CAST(date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)

                                        UNION ALL

                                        SELECT 'LOUNGE' AS source, SUM(waisted_qty) AS total_qty FROM dbo.lounge_stocks
                                        WHERE CAST(date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                        `);

        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getTotalWaistedExpense(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange;
    
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`
                                        SELECT 'STORAGE' AS source, SUM(b.price * a.waisted_qty) AS total_price FROM dbo.storage_stocks AS a
                                        RIGHT OUTER JOIN dbo.item_master AS b
                                        ON a.item_id = b.id
                                        WHERE CAST(a.date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                        
                                        UNION ALL

                                        SELECT 'LOUNGE' AS source, SUM(b.price * a.waisted_qty) AS total_price FROM dbo.lounge_stocks AS a
                                        RIGHT OUTER JOIN dbo.item_master AS b
                                        ON a.item_id = b.id
                                        WHERE CAST(a.date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                        `);

        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getStorageExpenseOverview(){
    const pool = await poolPromise;

    try {
        const result = await pool.request()
                                 .query(`
                                        WITH Months AS (
                                            SELECT 1 AS MonthNum
                                            UNION ALL
                                            SELECT 2
                                            UNION ALL
                                            SELECT 3
                                            UNION ALL
                                            SELECT 4
                                            UNION ALL
                                            SELECT 5
                                            UNION ALL
                                            SELECT 6
                                            UNION ALL
                                            SELECT 7
                                            UNION ALL
                                            SELECT 8
                                            UNION ALL
                                            SELECT 9
                                            UNION ALL
                                            SELECT 10
                                            UNION ALL
                                            SELECT 11
                                            UNION ALL
                                            SELECT 12
                                        )
                                        SELECT 
                                            FORMAT(DATEADD(MONTH, M.MonthNum - 1, '1900-01-01'), 'MMMM') AS [month],
                                            ISNULL(SUM(ss.total_price), 0) AS storage,
                                            ISNULL(SUM(ls.total_price),0) AS lounge
                                        FROM Months M
                                        LEFT JOIN dbo.storage_stocks ss
                                            ON M.MonthNum = MONTH(ss.date_in)
                                        LEFT JOIN dbo.lounge_stocks ls
                                            ON M.MonthNum = MONTH(ls.date_in)
                                        GROUP BY M.MonthNum
                                        ORDER BY M.MonthNum
                                        `);
        return result.recordset;
    } catch (error) {
        console.log(error);
        throw new Error('Error' + error)   
    }
}