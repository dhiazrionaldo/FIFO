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