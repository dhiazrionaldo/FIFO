import sql from 'mssql'
import poolPromise from '@/lib/db'

export const maxDuration = 60;

export async function getLoungeOrder(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`
                                         SELECT a.id, a.item_id, c.item_name, c.category_id, d.category_name, a.qty, 
                                            a.deliver_qty, a.order_date, a.created_by, 
                                                a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime, a.storage_id, a.status, a.total_price, c.price AS unit_price
                                         FROM dbo.[order] AS a
                                         INNER JOIN dbo.storage_stocks AS b
                                         ON a.storage_id = b.id
                                         INNER JOIN dbo.item_master AS c
                                         ON a.item_id = c.id
                                         INNER JOIN dbo.sku_category_master AS d
                                         ON c.category_id = d.id 
                                         WHERE CAST(a.order_date AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                         ORDER BY ISNULL(a.created_datetime, a.modified_datetime) DESC`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getLoungeOrderbyId(id){
    const pool = await poolPromise;
    try {
        const result = await pool.request()
                                 .input('id', sql.Int, id)
                                 .query(`SELECT * FROM dbo.[order] WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getAllOrder(){
    const pool = await poolPromise;
    try {
        const result = await pool.request()
                                 .query(`SELECT  a.id, 
                                            a.item_id, 
                                            b.item_name, 
                                            b.kode_sku, 
                                            b.category_id AS sku_category_id, 
                                            b.price AS unit_price, 
                                            a.total_price, 
                                            b.category_id,
                                            c.category_name AS category_name, 
                                           -- (a.qty - ISNULL(a.deliver_qty,0)) AS qty,
                                            a.qty,
                                            a.status,
											a.storage_id,
                                    a.created_by, a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime
                                    FROM dbo.[order] AS a 
                                    INNER JOIN dbo.item_master AS b
                                    ON a.item_id = b.id 
                                    INNER JOIN dbo.sku_category_master AS c
                                    ON b.category_id = c.id 
                                    WHERE a.status = 'ORDER'
                                    ORDER BY ISNULL(a.created_datetime, a.modified_datetime) DESC`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function createLoungeOrder(items){
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        for(const item of items) {
            const result = await pool.request()
                                .input('item_id', sql.Int, item.item_id)
                                .input('qty', sql.Int, item.qty)
                                .input('price', sql.Int, item.unit_price)
                                .input('created_by', sql.NVarChar, item.created_by)
                                .input('storage_id', sql.Int, item.id)
                                .output('id', sql.Int)
                                .query(`INSERT INTO dbo.[order] (item_id, qty, total_price, order_date, created_by, created_datetime, storage_id, status) 
                                        OUTPUT INSERTED.id, INSERTED.item_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.order_date
                                        VALUES (@item_id, @qty, (@price * @qty), SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', @created_by, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', @storage_id, 'ORDER')`);
        
            const stockInId = result.recordset[0].id;
            const transactionDateTime = result.recordset[0].order_date;
            const transactionQty = result.recordset[0].qty;
            const createdBy = result.recordset[0].created_by;
            const createdDateTime = result.recordset[0].created_datetime;

            await pool.request()
                                .input('order_id', sql.Int, stockInId)
                                .input('transaction_date', sql.DateTime, transactionDateTime)
                                .input('transaction_type', sql.NVarChar, 'LOUNGE ORDER')
                                .input('transaction_qty', sql.Int, transactionQty)
                                .input('created_by', sql.NVarChar, createdBy)
                                .input('created_datetime', sql.DateTime, createdDateTime)
                                .query(`INSERT INTO dbo.transaction_history (order_id, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
                                        VALUES (@order_id, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);
        }
        
        await transaction.commit()

        return  { message: 'Lounge order and transaction history created successfully' };
    } catch (error) {
        console.log(error)
        throw new Error('Error create lounge order: ' + error);
    }
}

export async function editLoungeOrder(id, item){
    const pool = await poolPromise;
    try {
        const {qty, status, modified_by} = item;
        const currentQty = await pool.request()
                                     .input('id', sql.Int, id)
                                     .query(`SELECT qty FROM dbo.[order]`);
        const beforeQty = currentQty.recordset[0]?.qty;

        const result = await pool.request()
                                .input('sku_category_id', sql.Int, sku_category_id)
                                .input('item_name', sql.NVarChar, item_name)
                                .input('qty', sql.Int, qty)
                                .input('modified_by', sql.NVarChar, modified_by)
                                .input('status', sql.NVarChar, status)
                                .input('id', sql.Int, id)
                                .query(`UPDATE dbo.[order] SET order_date = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', qty = @qty, status = @status, modified_by = @modified_by, modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time' 
                                        OUTPUT INSERTED.id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in 
                                        WHERE id = @id`);

        const stockInId = result.recordset[0].id;
        const transactionDateTime = result.recordset[0].date_in;
        const transactionQty = result.recordset[0].qty;
        const createdBy = result.recordset[0].created_by;
        const createdDateTime = result.recordset[0].created_datetime;
                                
        await pool.request()
                            .input('stock_in_id', sql.Int, stockInId)
                            .input('transaction_date', sql.DateTime, transactionDateTime)
                            .input('transaction_type', sql.NVarChar, 'Update ORDER')
                            .input('transaction_qty', sql.Int, transactionQty)
                            .input('created_by', sql.NVarChar, createdBy)
                            .input('created_datetime', sql.DateTime, createdDateTime)
                            .input('before_qty', sql.Int, beforeQty)
                            .query(`INSERT INTO dbo.transaction_history (stock_in_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
                                    VALUES (@stock_in_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);
        
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function deliverOrder(item) {
    const pool = await poolPromise;

    try {
        const {id, storage_id, qty, item_id, unit_price, created_by} = item;

        // Get current order quantity and id
        const currentQty = await pool.request()
                                     .input('id', sql.Int, id)
                                     .query(`SELECT id, qty FROM dbo.[order] WHERE id = @id`);
        const beforeQty = currentQty.recordset[0]?.qty;
        const order_id = currentQty.recordset[0]?.id;

        // Get current storage stock quantity
        const storage_qty = await pool.request()
                                      .input('storage_id', sql.Int, storage_id)
                                      .query(`SELECT qty FROM dbo.storage_stocks WHERE id = @storage_id`);
        const storageQty = storage_qty.recordset[0].qty;

        // Check if a lounge stock record exists for the given storage_id
        const loungeRecord = await pool.request()
                                       .input('storage_id', sql.Int, storage_id)
                                       .query(`SELECT id, qty FROM dbo.lounge_stocks WHERE storage_id = @storage_id`);

        if (loungeRecord.recordset.length > 0) {
            // If lounge stock exists, update the qty by adding the new qty
            const existingLoungeQty = loungeRecord.recordset[0].qty;
            const newLoungeQty = existingLoungeQty + qty;

            await pool.request()
                      .input('storage_id', sql.Int, storage_id)
                      .input('qty', sql.Int, newLoungeQty)
                      .input('unit_price', sql.Int, unit_price)
                      .input('modified_by', sql.NVarChar, created_by)
                      .query(`UPDATE dbo.lounge_stocks 
                              SET qty = @qty, 
                                  total_price = (@unit_price * @qty), 
                                  modified_by = @modified_by, 
                                  modified_datetime = SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time'
                              WHERE storage_id = @storage_id`);

            const loungeId = loungeRecord.recordset[0].id;
            const transactionDateTime = new Date();

            // Insert into transaction_history (for update case)
            await pool.request()
                      .input('lounge_id', sql.Int, loungeId)
                      .input('transaction_date', sql.DateTime, transactionDateTime)
                      .input('transaction_type', sql.NVarChar, 'DELIVER TO LOUNGE')
                      .input('transaction_qty', sql.Int, qty)
                      .input('created_by', sql.NVarChar, created_by)
                      .input('created_datetime', sql.DateTime, transactionDateTime)
                      .input('before_qty', sql.Int, existingLoungeQty)
                      .query(`INSERT INTO dbo.transaction_history 
                              (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
                              VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', @created_by, SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time')`);
        } else {
            // If no existing lounge stock, insert a new record
            const result = await pool.request()
                                     .input('qty', sql.Int, qty)
                                     .input('item_id', sql.Int, item_id)
                                     .input('created_by', sql.NVarChar, created_by)
                                     .input('unit_price', sql.Int, unit_price)
                                     .input('storage_id', sql.Int, storage_id)
                                     .input('order_id', sql.Int, order_id)
                                     .query(`INSERT INTO dbo.lounge_stocks 
                                             (item_id, storage_id, order_id, total_price, date_in, qty, created_by, created_datetime)
                                             OUTPUT INSERTED.id, INSERTED.order_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in 
                                             VALUES (@item_id, @storage_id, @order_id, (@unit_price * @qty), SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', @qty, @created_by, SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time')`);

            const loungeId = result.recordset[0].id;
            const transactionDateTime = result.recordset[0].date_in;

            // Insert into transaction_history (for insert case)
            await pool.request()
                      .input('lounge_id', sql.Int, loungeId)
                      .input('transaction_date', sql.DateTime, transactionDateTime)
                      .input('transaction_type', sql.NVarChar, 'DELIVER TO LOUNGE')
                      .input('transaction_qty', sql.Int, qty)
                      .input('created_by', sql.NVarChar, created_by)
                      .input('created_datetime', sql.DateTime, transactionDateTime)
                      .input('before_qty', sql.Int, beforeQty)
                      .query(`INSERT INTO dbo.transaction_history 
                              (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
                              VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', @created_by, SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time')`);
        }

        // Update the order table
        await pool.request()
                  .input('id', sql.Int, id)
                  .input('storage_id', sql.Int, storage_id)
                  .input('qty', sql.Int, qty)
                  .input('modified_by', sql.NVarChar, created_by)
                  .query(`UPDATE dbo.[order] 
                          SET deliver_qty = @qty, 
                              qty = (qty - @qty),
                              modified_by = @modified_by, 
                              modified_datetime = SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', 
                              status = CASE 
                                         WHEN (qty-@qty) = 0 THEN 'DELIVERED' 
                                         ELSE 'ORDER' 
                                       END
                          WHERE id = @id AND storage_id = @storage_id`);

        // Update storage stock
        const remainingQty = storageQty - qty;
        await pool.request()
                .input('storage_id', sql.Int, storage_id)
                .input('qty', sql.Int, remainingQty)
                .input('unit_price', sql.Int, unit_price)
                .input('modified_by', sql.NVarChar, created_by)
                .query(`UPDATE dbo.[storage_stocks] SET 
                                modified_by = @modified_by, 
                                modified_datetime = SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', 
                                qty = @qty, 
                                total_price = (@unit_price * @qty)
                        WHERE id = @storage_id`);

        return true;
    } catch (error) {
        console.log(error);
        throw new Error('Error processing the order delivery: ' + error);
    }
}

// export async function deliverOrder(item) {
//     const pool = await poolPromise;

//     try {
//         const {id, storage_id, qty, item_id, unit_price, created_by} = item;

//         // Get current order quantity and id
//         const currentQty = await pool.request()
//                                      .input('id', sql.Int, id)
//                                      .query(`SELECT id, qty FROM dbo.[order] WHERE id = @id`);
//         const beforeQty = currentQty.recordset[0]?.qty;
//         const order_id = currentQty.recordset[0]?.id;
//         const orderQty = currentQty.recordset[0]?.qty;

//         // Get current storage stock quantity
//         const storage_qty = await pool.request()
//                                       .input('storage_id', sql.Int, storage_id)
//                                       .query(`SELECT qty FROM dbo.storage_stocks WHERE id = @storage_id`);
//         const storageQty = storage_qty.recordset[0].qty;

//         const lounge_qty = await pool.request()
//                                             .input('storage_id', sql.Int, storage_id)
//                                             .query(`SELECT qty FROM dbo.lounge_stocks WHERE storage_id = @storage_id`);
//         const loungeQty = lounge_qty.recordset[0].qty;

//         if((storageQty+loungeQty) == orderQty){
//             console.log('masok kondisi puol order qty');
//         }

//         // Insert into lounge_stocks table
//         const result = await pool.request()
//                                  .input('qty', sql.Int, qty)
//                                  .input('item_id', sql.Int, item_id)
//                                  .input('created_by', sql.NVarChar, created_by)
//                                  .input('unit_price', sql.Int, unit_price)
//                                  .input('storage_id', sql.Int, storage_id)
//                                  .input('order_id', sql.Int, order_id)
//                                  .query(`INSERT INTO dbo.lounge_stocks (item_id, storage_id, order_id, total_price, date_in, qty, created_by, created_datetime)
//                                          OUTPUT INSERTED.id, INSERTED.order_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in 
//                                          VALUES (@item_id, @storage_id, @order_id, (@unit_price * @qty), SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', @qty, @created_by, SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time')`);

//         const loungeId = result.recordset[0].id;
//         const transactionDateTime = result.recordset[0].date_in;
//         const transactionQty = result.recordset[0].qty;
//         const createdBy = result.recordset[0].created_by;
//         const createdDateTime = result.recordset[0].created_datetime;

//         // Update order table
//         await pool.request()
//                   .input('id', sql.Int, id)
//                   .input('storage_id', sql.Int, storage_id)
//                   .input('qty', sql.Int, qty)
//                   .input('modified_by', sql.NVarChar, created_by)
//                   .query(`UPDATE dbo.[order] SET 
//                                   qty = (qty - @qty),
//                                   deliver_qty = @qty, 
//                                   modified_by = @modified_by, 
//                                   modified_datetime = SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', 
//                                   status = CASE 
//                                              WHEN (qty-@qty) = 0 THEN 'DELIVERED' 
//                                              ELSE 'ORDER' 
//                                            END
//                           WHERE id = @id AND storage_id = @storage_id`);

//         // Insert into transaction_history
//         await pool.request()
//                   .input('lounge_id', sql.Int, loungeId)
//                   .input('transaction_date', sql.DateTime, transactionDateTime)
//                   .input('transaction_type', sql.NVarChar, 'DELIVER TO LOUNGE')
//                   .input('transaction_qty', sql.Int, transactionQty)
//                   .input('created_by', sql.NVarChar, createdBy)
//                   .input('created_datetime', sql.DateTime, createdDateTime)
//                   .input('before_qty', sql.Int, beforeQty)
//                   .query(`INSERT INTO dbo.transaction_history (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
//                           VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);

//         // Handle storage stock logic: delete if no stock left, update if stock remains
//         // if ((storageQty - qty) === 0) {
//         //     // Delete from storage if qty becomes 0
//         //     await pool.request()
//         //               .input('storage_id', sql.Int, storage_id)
//         //               .query('DELETE FROM dbo.[storage_stocks] WHERE id = @storage_id');

//         //     // Insert deletion into transaction_history
//         //     await pool.request()
//         //               .input('lounge_id', sql.Int, loungeId)
//         //               .input('transaction_date', sql.DateTime, transactionDateTime)
//         //               .input('transaction_type', sql.NVarChar, 'DELETE STORAGE')
//         //               .input('transaction_qty', sql.Int, transactionQty)
//         //               .input('created_by', sql.NVarChar, createdBy)
//         //               .input('created_datetime', sql.DateTime, createdDateTime)
//         //               .input('before_qty', sql.Int, beforeQty)
//         //               .query(`INSERT INTO dbo.transaction_history (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
//         //                       VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);
//         // } else {
//             // Update storage stock
//             const remainingQty = storageQty - qty;
//             await pool.request()
//                       .input('storage_id', sql.Int, storage_id)
//                       .input('qty', sql.Int, remainingQty)
//                       .input('unit_price', sql.Int, unit_price)
//                       .input('modified_by', sql.NVarChar, created_by)
//                       .query(`UPDATE dbo.[storage_stocks] SET 
//                                       modified_by = @modified_by, 
//                                       modified_datetime = SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', 
//                                       qty = @qty, 
//                                       total_price = (@unit_price * @qty)
//                               WHERE id = @storage_id`);

//             // Insert update into transaction_history
//             // await pool.request()
//             //           .input('lounge_id', sql.Int, loungeId)
//             //           .input('transaction_date', sql.DateTime, transactionDateTime)
//             //           .input('transaction_type', sql.NVarChar, 'DELIVER TO LOUNGE')
//             //           .input('transaction_qty', sql.Int, transactionQty)
//             //           .input('created_by', sql.NVarChar, createdBy)
//             //           .input('created_datetime', sql.DateTime, createdDateTime)
//             //           .input('before_qty', sql.Int, beforeQty)
//             //           .query(`INSERT INTO dbo.transaction_history (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
//             //                   VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);
//         // }

//         return result.recordset;
//     } catch (error) {
//         console.log(error);
//         throw new Error('Error processing the order delivery: ' + error);
//     }
// }

// export async function deliverOrder(item){
//     const pool = await poolPromise;

//     try {
//         const {id, storage_id, qty, item_id, unit_price, created_by} = item;
//         const currentQty = await pool.request()
//                                      .input('id', sql.Int, id)
//                                      .query(`SELECT id, qty FROM dbo.[order]`);
//         const beforeQty = currentQty.recordset[0]?.qty;
//         const order_id = currentQty.recordset[0]?.id;

//         const storage_qty = await pool.request()
//                                       .input('storage_id', sql.Int, storage_id)
//                                       .query(`SELECT qty FROM dbo.storage_stocks WHERE id = @storage_id`)
//         const storageQty = storage_qty.recordset[0].qty;
        
//         const result = await pool.request()
//                                         .input('qty', sql.Int, qty)
//                                         .input('item_id', sql.Int, item_id)
//                                         .input('created_by', sql.NVarChar, created_by)
//                                         .input('unit_price', sql.Int, unit_price)
//                                         .input('storage_id', sql.Int, storage_id)
//                                         .input('order_id', sql.Int, order_id)
//                                         .query(`INSERT INTO dbo.lounge_stocks (item_id, storage_id, order_id, total_price, date_in, qty, created_by, created_datetime)
//                                                 OUTPUT INSERTED.id, INSERTED.order_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in 
//                                                 VALUES (@item_id, @storage_id, @order_id, (@unit_price * @qty), SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', @qty, @created_by, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time')`);

//         const loungeId = result.recordset[0].id;
//         const transactionDateTime = result.recordset[0].date_in;
//         const transactionQty = result.recordset[0].qty;
//         const createdBy = result.recordset[0].created_by;
//         const createdDateTime = result.recordset[0].created_datetime;

//         await pool.request()
//                             .input('id', sql.Int, id)
//                             .input('storage_id', sql.Int, storage_id)
//                             .input('qty', sql.Int, qty)
//                             .input('modified_by', sql.NVarChar, created_by)
//                             .query(`UPDATE dbo.[order] SET 
//                                                 deliver_qty = @qty, 
//                                                 modified_by = @modified_by, 
//                                                 modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', 
//                                                 status = CASE 
//                                                                 WHEN (qty-@qty) = 0 THEN 'DELIVERED' 
//                                                                 ELSE 'ORDER' 
//                                                          END
//                                     WHERE id = @id AND storage_id = @storage_id`)
        
//         await pool.request()
//                             .input('lounge_id', sql.Int, loungeId)
//                             .input('transaction_date', sql.DateTime, transactionDateTime)
//                             .input('transaction_type', sql.NVarChar, 'DELIVER TO LOUNGE')
//                             .input('transaction_qty', sql.Int, transactionQty)
//                             .input('created_by', sql.NVarChar, createdBy)
//                             .input('created_datetime', sql.DateTime, createdDateTime)
//                             .input('before_qty', sql.Int, beforeQty)
//                             .query(`INSERT INTO dbo.transaction_history (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
//                                     VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);

//         if((storageQty-qty) == 0){
//             await pool.request()
//                                 .input('storage_id', sql.Int, storage_id)
//                                 .query('DELETE FROM dbo.[storage_stocks] WHERE id = @storage_id')

//             await pool.request()
//                                 .input('lounge_id', sql.Int, loungeId)
//                                 .input('transaction_date', sql.DateTime, transactionDateTime)
//                                 .input('transaction_type', sql.NVarChar, 'DELETE STORAGE')
//                                 .input('transaction_qty', sql.Int, transactionQty)
//                                 .input('created_by', sql.NVarChar, createdBy)
//                                 .input('created_datetime', sql.DateTime, createdDateTime)
//                                 .input('before_qty', sql.Int, beforeQty)
//                                 .query(`INSERT INTO dbo.transaction_history (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
//                                         VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);
//         }else{
//             await pool.request()
//                             .input('id', sql.Int, id)
//                             .input('storage_id', sql.Int, storage_id)
//                             .input('qty', sql.Int, qty)
//                             .input('modified_by', sql.NVarChar, created_by)
//                             .input('unit_price', sql.Int, unit_price)
//                             .query(`UPDATE dbo.[storage_stocks] SET 
//                                                 modified_by = @modified_by, 
//                                                 modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', 
//                                                 qty = (qty-@qty), 
//                                                 total_price = (@unit_price * @qty)
//                                     WHERE id = @storage_id`)
//             await pool.request()
//                             .input('lounge_id', sql.Int, loungeId)
//                             .input('transaction_date', sql.DateTime, transactionDateTime)
//                             .input('transaction_type', sql.NVarChar, 'DELIVER TO LOUNGE')
//                             .input('transaction_qty', sql.Int, transactionQty)
//                             .input('created_by', sql.NVarChar, createdBy)
//                             .input('created_datetime', sql.DateTime, createdDateTime)
//                             .input('before_qty', sql.Int, beforeQty)
//                             .query(`INSERT INTO dbo.transaction_history (lounge_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
//                                     VALUES (@lounge_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);
                
//         }
        
                                
        
//         return result.recordset;
//     } catch (error) {
//         console.log(error)
//         throw new Error('Error fetching items: ' + error);        
//     }
// }

export async function editStockOut(id, item){
    const pool = await poolPromise;
    try {
        const {status, qty, order_date, modified_by} = item;
        const currentQty = await pool.request()
                                     .input('id', sql.Int, id)
                                     .query(`SELECT qty FROM dbo.[order]`);
        const beforeQty = currentQty.recordset[0]?.qty;
        const afterQty = beforeQty - qty;
        
        const result = await pool.request()
                                .input('sku_category_id', sql.Int, sku_category_id)
                                .input('status', sql.NVarChar, 'ORDER STOCK')
                                .input('order_date', sql.NVarChar, order_date)
                                .input('qty', sql.Int, afterQty)
                                .input('modified_by', sql.NVarChar, modified_by)
                                .input('id', sql.Int, id)
                                .query(`UPDATE dbo.[order] SET status = @status, order_date = @order_date, qty = qty - @qty, modified_by = @modified_by, modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time' 
                                        OUTPUT INSERTED.id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in 
                                        WHERE id = @id`);

        const stockInId = result.recordset[0].id;
        const transactionDateTime = result.recordset[0].date_in;
        const transactionQty = qty;
        const createdBy = result.recordset[0].created_by;
        const createdDateTime = result.recordset[0].created_datetime;
                                
        await pool.request()
                            .input('stock_in_id', sql.Int, stockInId)
                            .input('transaction_date', sql.DateTime, transactionDateTime)
                            .input('transaction_type', sql.NVarChar, 'stock_out')
                            .input('transaction_qty', sql.Int, transactionQty)
                            .input('created_by', sql.NVarChar, createdBy)
                            .input('created_datetime', sql.DateTime, createdDateTime)
                            .input('before_qty', sql.Int, beforeQty)
                            .query(`INSERT INTO dbo.transaction_history (stock_in_id, before_qty, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
                                    VALUES (@stock_in_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);
                                
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}


export async function deleteLoungeOrder(id){
    const pool = await poolPromise;
    console.log(id);
    try {
        const result = await pool.request()
                                .input('id', sql.Int, id)
                                .query(`DELETE FROM dbo.[order] WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}