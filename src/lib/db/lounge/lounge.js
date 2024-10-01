import sql from 'mssql'
import poolPromise from '@/lib/db'

export const maxDuration = 60;

export async function getLoungeData(dateRange){
    const pool = await poolPromise;
    const {from, to} = dateRange
    try {
        const result = await pool.request()
                                 .input('startDate', sql.DateTime, from)
                                 .input('endDate', sql.DateTime, to)
                                 .query(`
                                         SELECT a.id, a.item_id, c.item_name, c.category_id, d.category_name, a.qty, a.opening_balance, a.closing_balance, a.waisted_qty
                                            a.date_in, a.created_by, c.kode_sku,
                                                a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime, a.storage_id, a.total_price, c.price AS unit_price
                                         FROM dbo.[lounge_stocks] AS a
                                         INNER JOIN dbo.item_master AS c
                                         ON a.item_id = c.id
                                         INNER JOIN dbo.sku_category_master AS d
                                         ON c.category_id = d.id 
                                         WHERE A.QTY > 0 AND CAST(a.date_in AS DATE) BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
                                         ORDER BY ISNULL(a.created_datetime, a.modified_datetime) DESC`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getAllLounge(){
    const pool = await poolPromise;
    try {
        const result = await pool.request()
                                 .query(`SELECT a.id, a.item_id, c.item_name, c.kode_sku, c.category_id AS sku_category_id, c.price AS unit_price, a.total_price, b.category_name AS category_name, a.qty, a.date_in, 
                                         a.created_by, a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime
                                         FROM dbo.lounge_stocks AS a
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
                                .query(`INSERT INTO dbo.[order] (item_id, qty, opening_balance, total_price, order_date, created_by, created_datetime, storage_id, status) 
                                        OUTPUT INSERTED.id, INSERTED.item_id, INSERTED.qty, INSERTED.created_by, INSERTED.created_datetime, INSERTED.order_date
                                        VALUES (@item_id, @qty, @qty, (@price * @qty), SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', @created_by, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', @storage_id, 'ORDER')`);
        
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
        throw new Error('Error fetching items: ' + error);
    }
}

export async function loungeOpeningBalance(items){
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
                                .query(`UPDATE dbo.lounge_stocks SET opening_balance = @qty, qty = @qty, modified_by = @created_by, date_in = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time'
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
                                .input('transaction_type', sql.NVarChar, 'LOUNGE OPENING BALANCE')
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

export async function loungeClosingBalance(items) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        // const { unit_price, qty, modified_by } = item;
        await transaction.begin();
        for(const item of items) {
            // Fetch the current quantity
            const currentQty = await pool.request()
            .input('id', sql.Int, item.id)
            .query(`SELECT qty FROM dbo.lounge_stocks WHERE id = @id`);

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
                .query(`UPDATE dbo.lounge_stocks 
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
                .input('transaction_type', sql.NVarChar, 'LOUNGE CLOSING BALANCE')
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

export async function deliverOrder(item){
    const pool = await poolPromise;

    try {
        const {id, storage_id, qty, item_id, unit_price, created_by} = item;
        const result = await pool.request()
                                        .input('qty', sql.Int, qty)
                                        .input('item_id', sql.Int, item_id)
                                        .input('created_by', sql.NVarChar, created_by)
                                        .input('unit_price', sql.Int, unit_price)
                                        .input('storage_id', sql.Int, storage_id)
                                        .query(`INSERT INTO dbo.lounge_stocks (item_id, storage_id, total_price, date_in, qty, created_by, created_datetime)
                                                VALUES (@item_id, @storage_id, (@unit_price * @qty), SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', @qty, @created_by, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time')`);
        await pool.request()
                            .input('id', sql.Int, id)
                            .input('storage_id', sql.Int, storage_id)
                            .input('qty', sql.Int, qty)
                            .input('modified_by', sql.NVarChar, created_by)
                            .query(`UPDATE dbo.[order] SET 
                                                deliver_qty = @qty, 
                                                modified_by = @modified_by, 
                                                modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time', 
                                                qty = (qty-@qty), 
                                                status = CASE 
                                                                WHEN (qty-@qty) = 0 THEN 'DELIVERED' 
                                                                ELSE 'ORDER' 
                                                         END
                                    WHERE id = @id AND storage_id = @storage_id`)
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);        
    }
}

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