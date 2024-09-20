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
                                        SELECT * FROM 
                                        (
                                        SELECT 
                                                a.id,
                                                a.stock_in_id AS source_id,
                                                e.item_name,
                                                e.kode_sku,
                                                a.transaction_date,
                                                a.transaction_type,
                                                a.transaction_qty,
                                                a.before_qty,
                                                b.qty AS storage_qty,
                                                NULL AS order_qty,
                                                NULL AS lounge_qty,
                                                a.created_by,
                                                a.created_datetime,
                                                a.modified_by,
                                                a.modified_datetime
                                        FROM dbo.transaction_history AS a 
                                        LEFT JOIN dbo.storage_stocks AS b
                                        ON a.stock_in_id = b.id
                                        RIGHT JOIN dbo.item_master AS e
                                        ON b.item_id = e.id 
                                        WHERE CAST(a.transaction_date AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)

                                        UNION ALL

                                        SELECT 
                                                a.id,
                                                a.order_id AS source_id,
                                                e.item_name,
                                                e.kode_sku,
                                                a.transaction_date,
                                                a.transaction_type,
                                                a.transaction_qty,
                                                a.before_qty,
                                                NULL AS storage_qty,
                                                b.qty  AS order_qty,
                                                NULL AS lounge_qty,
                                                a.created_by,
                                                a.created_datetime,
                                                a.modified_by,
                                                a.modified_datetime
                                        FROM dbo.transaction_history AS a 
                                        LEFT JOIN dbo.[order] AS b
                                        ON a.order_id = b.id
                                        RIGHT JOIN dbo.item_master AS e
                                        ON b.item_id = e.id 
                                        WHERE CAST(a.transaction_date AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)

                                        UNION ALL

                                        SELECT 
                                                a.id,
                                                a.lounge_id AS source_id,
                                                e.item_name,
                                                e.kode_sku,
                                                a.transaction_date,
                                                a.transaction_type,
                                                a.transaction_qty,
                                                a.before_qty,
                                                NULL AS storage_qty,
                                                NULL AS order_qty,
                                                b.qty AS lounge_qty,
                                                a.created_by,
                                                a.created_datetime,
                                                a.modified_by,
                                                a.modified_datetime
                                        FROM dbo.transaction_history AS a 
                                        LEFT JOIN dbo.lounge_stocks AS b
                                        ON a.lounge_id = b.id
                                        RIGHT JOIN dbo.item_master AS e
                                        ON b.item_id = e.id 
                                        WHERE CAST(a.transaction_date AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                        ) History
                                        GROUP BY kode_sku, kode_sku, transaction_type, source_id, transaction_date, id, item_name, storage_qty, order_qty, lounge_qty, transaction_qty, before_qty,created_by, created_datetime, modified_by, modified_datetime   

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

export async function getHistorybyKodeSKU(item){
    const pool = await poolPromise;
    const {kode_sku, from, to} = item
    
    try {
        const result = await pool.request()
                                        .input('kode_sku', sql.NVarChar(255), kode_sku)
                                        .input('startDate', sql.DateTime, from)
                                        .input('endDate', sql.DateTime, to)
                                        .query(`
                                                SELECT * FROM 
                                                (
                                                SELECT 
                                                        a.id,
                                                        a.stock_in_id AS source_id,
                                                        e.item_name,
                                                        e.kode_sku,
                                                        a.transaction_date,
                                                        a.transaction_type,
                                                        a.transaction_qty,
                                                        a.before_qty,
                                                        b.qty AS storage_qty,
                                                        NULL AS order_qty,
                                                        NULL AS lounge_qty,
                                                        a.created_by,
                                                        a.created_datetime,
                                                        a.modified_by,
                                                        a.modified_datetime
                                                FROM dbo.transaction_history AS a 
                                                LEFT JOIN dbo.storage_stocks AS b
                                                ON a.stock_in_id = b.id
                                                RIGHT JOIN dbo.item_master AS e
                                                ON b.item_id = e.id 

                                                UNION ALL

                                                SELECT 
                                                        a.id,
                                                        a.order_id AS source_id,
                                                        e.item_name,
                                                        e.kode_sku,
                                                        a.transaction_date,
                                                        a.transaction_type,
                                                        a.transaction_qty,
                                                        a.before_qty,
                                                        NULL AS storage_qty,
                                                        b.qty  AS order_qty,
                                                        NULL AS lounge_qty,
                                                        a.created_by,
                                                        a.created_datetime,
                                                        a.modified_by,
                                                        a.modified_datetime
                                                FROM dbo.transaction_history AS a 
                                                LEFT JOIN dbo.[order] AS b
                                                ON a.order_id = b.id
                                                RIGHT JOIN dbo.item_master AS e
                                                ON b.item_id = e.id 

                                                UNION ALL

                                                SELECT 
                                                        a.id,
                                                        a.lounge_id AS source_id,
                                                        e.item_name,
                                                        e.kode_sku,
                                                        a.transaction_date,
                                                        a.transaction_type,
                                                        a.transaction_qty,
                                                        a.before_qty,
                                                        NULL AS storage_qty,
                                                        NULL AS order_qty,
                                                        b.qty AS lounge_qty,
                                                        a.created_by,
                                                        a.created_datetime,
                                                        a.modified_by,
                                                        a.modified_datetime
                                                FROM dbo.transaction_history AS a 
                                                LEFT JOIN dbo.lounge_stocks AS b
                                                ON a.lounge_id = b.id
                                                RIGHT JOIN dbo.item_master AS e
                                                ON b.item_id = e.id 
                                                ) History
                                                WHERE CAST(transaction_date AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE) AND kode_sku = @kode_sku
                                              `)

        return result.recordset
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}