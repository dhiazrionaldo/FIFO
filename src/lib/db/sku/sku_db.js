import sql from 'mssql'
import poolPromise from '@/lib/db'

export const maxDuration = 60;

export async function getSKU(){
    const pool = await poolPromise;
    try {
        const result = await pool.request().query(`SELECT id, category_name, description, created_by, created_datetime, ISNULL(modified_by, created_by) AS modified_by, ISNULL(modified_datetime, created_datetime) AS modified_datetime FROM sku_category_master`);
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function getSKUbyId(id){
    const pool = await poolPromise;
    try {
        const result = await pool.request()
                                 .input('id', sql.Int, id)
                                 .query(`SELECT * FROM sku_category_master WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function createSKU(item){
    const pool = await poolPromise;
    try {
        const {category_name, description, created_by} = item;
        const result = await pool.request()
                                .input('category_name', sql.NVarChar, category_name)
                                .input('description', sql.NVarChar, description)
                                .input('created_by', sql.NVarChar, created_by)
                                .query(`INSERT INTO dbo.sku_category_master (category_name, description, created_by, created_datetime) 
                                        VALUES (@category_name, @description, @created_by, SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time')`);
        return result.recordset;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching items: ' + error);
    }
}

export async function editSKU(id, item){
    const pool = await poolPromise;
    try {
        const {category_name, description, modified_by} = item;
        const result = await pool.request()
                                .input('category_name', sql.NVarChar, category_name)
                                .input('description', sql.NVarChar, description)
                                .input('modified_by', sql.NVarChar, modified_by)
                                .input('id', sql.Int, id)
                                .query(`UPDATE dbo.sku_category_master SET category_name = @category_name, description = @description, modified_by = @modified_by, modified_datetime = SYSDATETIMEOFFSET()  AT TIME ZONE 'SE Asia Standard Time' 
                                        WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}

export async function deleteSKU(id){
    const pool = await poolPromise;
    console.log(id);
    try {
        const result = await pool.request()
                                .input('id', sql.Int, id)
                                .query(`DELETE FROM dbo.sku_category_master WHERE id = @id`);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching items: ' + error);
    }
}