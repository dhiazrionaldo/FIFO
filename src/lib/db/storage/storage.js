import sql from 'mssql'
import poolPromise from '@/lib/db'

export const maxDuration = 60;

export async function getStorage(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`SELECT a.id, a.item_id, c.item_name, c.category_id AS sku_category_id, c.kode_sku, c.price AS unit_price, a.total_price, b.category_name AS category_name, a.qty, a.opening_balance, a.closing_balance, a.waisted_qty, a.date_in, 
                                         a.created_by, a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime
                                         FROM dbo.storage_stocks AS a
                                         INNER JOIN dbo.item_master AS c
                                         ON a.item_id = c.id
                                         INNER JOIN dbo.sku_category_master AS b
                                         ON c.category_id  = b.id
                                         WHERE a.qty > 0 AND CAST(a.date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                         ORDER BY ISNULL(a.created_datetime, a.modified_datetime) DESC`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getAllStorage(){
    const pool = await poolPromise;
    try {
        const result = await pool.request()
                                 .query(`SELECT a.id, a.item_id, c.item_name, c.kode_sku, c.category_id AS sku_category_id, c.price AS unit_price, a.total_price, b.category_name AS category_name, a.qty, a.date_in, 
                                         a.created_by, a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime
                                         FROM dbo.storage_stocks AS a
                                         INNER JOIN dbo.item_master AS c
                                         ON a.item_id = c.id
                                         INNER JOIN dbo.sku_category_master AS b
                                         ON c.category_id  = b.id
                                         ORDER BY ISNULL(a.created_datetime, a.modified_datetime) DESC`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getStoragebyId(id){
    const pool = await poolPromise;
    try {
        const result = await pool.request()
                                 .input('id', sql.Int, id)
                                 .query(`SELECT * FROM storage_stocks WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function createStorage(item){
    const pool = await poolPromise;
    try {
        const {item_id, qty, price, created_by} = item;
        
        const result = await pool.request()
                                .input('item_id', sql.Int, item_id)
                                .input('qty', sql.Int, qty)
                                .input('price', sql.Int, price)
                                .input('created_by', sql.NVarChar, created_by)
                                .output('id', sql.Int)
                                .query(`INSERT INTO dbo.storage_stocks (item_id, date_in, qty, opening_balance, total_price, created_by, created_datetime) 
                                        OUTPUT INSERTED.id, INSERTED.item_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in
                                        VALUES (@item_id, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', @qty, @qty, (@price * @qty), @created_by, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time')`);
        
        const stockInId = result.recordset[0].id;
        const transactionDateTime = result.recordset[0].date_in;
        const transactionQty = result.recordset[0].qty;
        const createdBy = result.recordset[0].created_by;
        const createdDateTime = result.recordset[0].created_datetime;

        await pool.request()
                            .input('stock_in_id', sql.Int, stockInId)
                            .input('transaction_date', sql.DateTime, transactionDateTime)
                            .input('transaction_type', sql.NVarChar, 'STORAGE IN')
                            .input('transaction_qty', sql.Int, transactionQty)
                            .input('created_by', sql.NVarChar, createdBy)
                            .input('created_datetime', sql.DateTime, createdDateTime)
                            .query(`INSERT INTO dbo.transaction_history (stock_in_id, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
                                    VALUES (@stock_in_id, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);

        return result.recordsets;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function storageOpeningBalance(items){
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        for(const item of items){
            const result = await pool.request()
                                .input('id', sql.Int, item.id)
                                .input('item_id', sql.Int, item.item_id)
                                .input('qty', sql.Int, item.qty)
                                .input('price', sql.Int, item.price)
                                .input('created_by', sql.NVarChar, item.created_by)
                                .query(`UPDATE dbo.storage_stocks SET opening_balance = @qty, qty = @qty, modified_by = @created_by, date_in = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time'
                                        OUTPUT INSERTED.id, INSERTED.item_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in
                                        WHERE id = @id
                                    `);
        
            const stockInId = result.recordset[0].id;
            const transactionDateTime = result.recordset[0].modified_datetime;
            const transactionQty = result.recordset[0].qty;
            const createdBy = result.recordset[0].created_by;
            const createdDateTime = result.recordset[0].created_datetime;

            await pool.request()
                                .input('stock_in_id', sql.Int, stockInId)
                                .input('transaction_date', sql.DateTime, transactionDateTime)
                                .input('transaction_type', sql.NVarChar, 'STORAGE OPENING BALANCE')
                                .input('transaction_qty', sql.Int, transactionQty)
                                .input('created_by', sql.NVarChar, createdBy)
                                .input('created_datetime', sql.DateTime, createdDateTime)
                                .query(`INSERT INTO dbo.transaction_history (stock_in_id, transaction_date, transaction_type, transaction_qty, created_by, created_datetime, modified_by, modified_datetime)
                                        VALUES (@stock_in_id, @transaction_date, @transaction_type, @transaction_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);

        }

        await transaction.commit();

        return {message: 'Opening balance has created successfully'}
    } catch (error) {
        console.log(error)
        throw new Error('Error set opening balance: ' + error);
    }
}

export async function storageClosingBalance(items) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        // const { unit_price, qty, modified_by } = item;
        await transaction.begin();
        for(const item of items) {
            // Fetch the current quantity
            const currentQty = await pool.request()
            .input('id', sql.Int, item.id)
            .query(`SELECT qty FROM dbo.storage_stocks WHERE id = @id`);

            const beforeQty = currentQty.recordset[0]?.qty;

            // Calculate the discrepancy
            const discrepancy = beforeQty - item.qty;

            // Update the storage_stocks table, including waisted_qty
            const result = await pool.request()
                .input('unit_price', sql.Int, item.unit_price)
                .input('qty', sql.Int, item.qty)
                .input('modified_by', sql.NVarChar, item.modified_by)
                .input('waisted_qty', sql.Int, discrepancy)
                .input('id', sql.Int, item.id)
                .query(`UPDATE dbo.storage_stocks 
                        SET total_price = (@unit_price * @qty), 
                            date_in = SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time', 
                            closing_balance = @qty,
                            qty = @qty, 
                            waisted_qty = @waisted_qty,
                            modified_by = @modified_by, 
                            modified_datetime = SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time' 
                        OUTPUT INSERTED.id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in 
                        WHERE id = @id`);

            const stockInId = result.recordset[0].id;
            const transactionDateTime = result.recordset[0].date_in;
            const transactionQty = result.recordset[0].qty;
            const createdBy = result.recordset[0].created_by;
            const createdDateTime = result.recordset[0].created_datetime;

            // Insert into transaction_history
            await pool.request()
                .input('stock_in_id', sql.Int, stockInId)
                .input('transaction_date', sql.DateTime, transactionDateTime)
                .input('transaction_type', sql.NVarChar, 'STORAGE CLOSING BALANCE')
                .input('transaction_qty', sql.Int, transactionQty)
                .input('created_by', sql.NVarChar, createdBy)
                .input('created_datetime', sql.DateTime, createdDateTime)
                .input('before_qty', sql.Int, beforeQty)
                .input('waisted_qty', sql.Int, discrepancy)
                .query(`INSERT INTO dbo.transaction_history 
                        (stock_in_id, before_qty, transaction_date, transaction_type, transaction_qty, waisted_qty, created_by, created_datetime, modified_by, modified_datetime)
                        VALUES (@stock_in_id, @before_qty, @transaction_date, @transaction_type, @transaction_qty, @waisted_qty, @created_by, @created_datetime, @created_by, @created_datetime)`);

        }
        
        await transaction.commit()

        return {message: 'Closing balance has created successfully'}
    } catch (error) {
        console.log(error);
        throw new Error('Error handling storage closing balance: ' + error);
    }
}


export async function editStorage(id, item){
    const pool = await poolPromise;
    try {
        const {price, qty, modified_by} = item;
        const currentQty = await pool.request()
                                     .input('id', sql.Int, id)
                                     .query(`SELECT qty FROM dbo.storage_stocks`);
        const beforeQty = currentQty.recordset[0]?.qty;
        
        const result = await pool.request()
                                .input('price', sql.Int, price)
                                .input('qty', sql.Int, qty)
                                .input('modified_by', sql.NVarChar, modified_by)
                                .input('id', sql.Int, id)
                                .query(`UPDATE dbo.storage_stocks SET total_price = (@price * @qty), date_in = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', qty = @qty, modified_by = @modified_by, modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time' 
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
                            .input('transaction_type', sql.NVarChar, 'EDIT STORAGE')
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

export async function editStockOut(id, item){
    const pool = await poolPromise;
    try {
        const {item_id, qty, date_in, modified_by} = item;
        const currentQty = await pool.request()
                                     .input('id', sql.Int, id)
                                     .query(`SELECT qty FROM dbo.storage_stocks`);
        const beforeQty = currentQty.recordset[0]?.qty;
        const afterQty = beforeQty - qty;
        
        const result = await pool.request()
                                .input('item_id', sql.Int, item_id)
                                .input('date_in', sql.NVarChar, date_in)
                                .input('qty', sql.Int, afterQty)
                                .input('modified_by', sql.NVarChar, modified_by)
                                .input('id', sql.Int, id)
                                .query(`UPDATE dbo.storage_stocks SET item_id = @item_id, date_in = @date_in, qty = (qty - @qty), modified_by = @modified_by, modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time' 
                                        OUTPUT INSERTED.id, INSERTED.item_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.date_in 
                                        WHERE id = @id`);

        const stockInId = result.recordset[0].id;
        const itemId = result.recordset[0].id;
        const transactionDateTime = result.recordset[0].date_in;
        const transactionQty = qty;
        const createdBy = result.recordset[0].created_by;
        const createdDateTime = result.recordset[0].created_datetime;
                                
        await pool.request()
                            .input('stock_in_id', sql.Int, stockInId)
                            .input('transaction_date', sql.DateTime, transactionDateTime)
                            .input('transaction_type', sql.NVarChar, 'STORAGE STOCK OUT')
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


export async function deleteStorage(id){
    const pool = await poolPromise;
    console.log(id);
    try {
        const result = await pool.request()
                                .input('id', sql.Int, id)
                                .query(`DELETE FROM dbo.storage_stocks WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}