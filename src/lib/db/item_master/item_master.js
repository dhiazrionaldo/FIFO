import sql from 'mssql'
import poolPromise from '@/lib/db'

export const maxDuration = 60;

export async function getItemMaster(){
    const pool = await poolPromise;
    try {
        const result = await pool.request().query(`SELECT a.id, a.kode_sku, a.item_name, a.category_id, b.category_name, a.price, a.storage_minimum_stock, a.lounge_minimum_stock,
                                                   a.created_by, a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime 
                                                   FROM dbo.item_master AS a
                                                   INNER JOIN dbo.sku_category_master AS b
                                                   ON a.category_id = b.id
                                                   ORDER BY ISNULL(a.modified_datetime, a.created_datetime) DESC`);
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getItembyId(id){
    const pool = await poolPromise;
    try {
        const result = await pool.request()
                                 .input('id', sql.Int, id)
                                 .query(`SELECT a.id, a.kode_sku, a.item_name, a.category_id, b.category_name, a.price, a.storage_minimum_stock, a.lounge_minimum_stock,
                                                a.created_by, a.created_datetime, ISNULL(a.modified_by, a.created_by) AS modified_by, ISNULL(a.modified_datetime, a.created_datetime) AS modified_datetime
                                         FROM item_master AS a
                                         INNER JOIN dbo.sku_category_master AS b
                                         ON a.category_id = b.id
                                         WHERE a.id = @id
                                         ORDER BY ISNULL(a.modified_datetime, a.created_datetime) DESC`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function createItemMaster(item){
    const pool = await poolPromise;
    try {
        const {kode_sku, item_name, category_id, price, storage_minimum_stock, lounge_minimum_stock, created_by} = item;
        const result = await pool.request()
                                .input('kode_sku', sql.NVarChar, kode_sku)
                                .input('item_name', sql.NVarChar, item_name)
                                .input('category_id', sql.Int, category_id)
                                .input('price', sql.Int, price)
                                .input('storage_minimum_stock', sql.Int, storage_minimum_stock)
                                .input('lounge_minimum_stock', sql.Int, lounge_minimum_stock)
                                .input('created_by', sql.NVarChar, created_by)
                                .query(`INSERT INTO dbo.item_master (kode_sku, item_name, category_id, price, storage_minimum_stock, lounge_minimum_stock, created_by, created_datetime) 
                                        VALUES (@kode_sku, @item_name, @category_id, @price, @storage_minimum_stock, @lounge_minimum_stock, @created_by, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time')`);
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function editItemMaster(id, item){
    const pool = await poolPromise;
    try {
        const {kode_sku, item_name, category_id, price, storage_minimum_stock, lounge_minimum_stock, modified_by} = item;
        const result = await pool.request()
                                .input('kode_sku', sql.NVarChar, kode_sku)
                                .input('item_name', sql.NVarChar, item_name)
                                .input('category_id', sql.Int, category_id)
                                .input('price', sql.Int, price)
                                .input('storage_minimum_stock', sql.Int, storage_minimum_stock)
                                .input('lounge_minimum_stock', sql.Int, lounge_minimum_stock)
                                .input('modified_by', sql.NVarChar, modified_by)
                                .input('id', sql.Int, id)
                                .query(`UPDATE dbo.item_master 
                                        SET kode_sku = @kode_sku, item_name = @item_name, category_id = @category_id, price = @price, storage_minimum_stock = @storage_minimum_stock, lounge_minimum_stock = @lounge_minimum_stock, modified_by = @modified_by, modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time' 
                                        WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function deleteItemMaster(id){
    const pool = await poolPromise;s
    try {
        const result = await pool.request()
                                .input('id', sql.Int, id)
                                .query(`DELETE FROM dbo.item_master WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}