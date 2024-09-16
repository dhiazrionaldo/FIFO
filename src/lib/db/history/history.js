import sql from 'mssql'
import poolPromise from '@/lib/db'

export const maxDuration = 60;

export async function getHistory(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`
                                        SELECT * FROM (
                                        SELECT 
                                            a.id,
                                            a.stock_in_id AS stock_id,
                                            c.item_name,
                                            a.transaction_date ,
                                            a.transaction_type ,
                                            a.transaction_qty ,
                                            a.before_qty,
                                            b.qty AS current_qty,
                                            a.created_by ,
                                            a.created_datetime ,
                                            a.modified_by ,
                                            a.modified_datetime 
                                        FROM dbo.transaction_history AS a
                                        INNER JOIN dbo.storage_stocks AS b
                                        ON a.stock_in_id = b.id
                                        INNER JOIN dbo.item_master AS c
                                        ON b.item_id = c.id
                                        WHERE CAST(a.transaction_date AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)

                                        UNION ALL 
                                        
                                        SELECT 
                                            a.id,
                                            a.order_id AS stock_id,
                                            c.item_name,
                                            a.transaction_date ,
                                            a.transaction_type ,
                                            a.transaction_qty ,
                                            a.before_qty,
                                            d.qty AS current_qty,
                                            a.created_by ,
                                            a.created_datetime ,
                                            a.modified_by ,
                                            a.modified_datetime 
                                        FROM dbo.transaction_history AS a
                                        INNER JOIN dbo.[order] AS d
                                        ON a.order_id = d.id
                                        INNER JOIN dbo.item_master AS c
                                        ON d.item_id = c.id
                                        WHERE CAST(a.transaction_date AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                        ) History
                                        ORDER BY ISNULL(created_datetime, modified_datetime) DESC
                                 `);
        // const result = await pool.request().query(`
        //                                           	SELECT 
        //                                                 a.id,
        //                                                 a.stock_in_id AS stock_id,
        //                                                 b.item_name,
        //                                                 a.transaction_date ,
        //                                                 a.transaction_type ,
        //                                                 a.transaction_qty ,
        //                                                 a.before_qty,
        //                                                 b.qty AS current_qty,
        //                                                 a.created_by ,
        //                                                 a.created_datetime ,
        //                                                 a.modified_by ,
        //                                                 a.modified_datetime 
        //                                             FROM dbo.transaction_history AS a
        //                                             INNER JOIN dbo.stock_in AS b
        //                                             ON a.stock_in_id = b.id
                                                    
        //                                             UNION ALL
        //                                             SELECT 
        //                                                 a.id,
        //                                                 a.stock_out_id AS stock_id,
        //                                                 b.item_name,
        //                                                 a.transaction_date ,
        //                                                 a.transaction_type ,
        //                                                 a.transaction_qty ,
        //                                                 a.before_qty,
        //                                                 b.qty AS current_qty,
        //                                                 a.created_by ,
        //                                                 a.created_datetime ,
        //                                                 a.modified_by ,
        //                                                 a.modified_datetime 
        //                                             FROM dbo.transaction_history AS a
        //                                             INNER JOIN dbo.stock_out AS b
        //                                             ON a.stock_in_id = b.id
                                                    
        //                                           `);
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}