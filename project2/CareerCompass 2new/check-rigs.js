import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('miners.db');

// Check mining rigs details
db.all(`
    SELECT 
        id,
        name,
        status,
        hashrate,
        ip_address
    FROM mining_rigs
    ORDER BY id
`, (err, rigs) => {
    if (err) {
        console.error("Error querying rigs:", err);
        return;
    }
    console.log("\nCurrent Mining Rigs:");
    rigs.forEach(rig => {
        console.log(`\nID: ${rig.id}`);
        console.log(`Name: ${rig.name}`);
        console.log(`Status: ${rig.status}`);
        console.log(`Hashrate: ${rig.hashrate} TH/s`);
        console.log(`IP: ${rig.ip_address}`);
    });
    
    // Count rigs by category
    let antCount = rigs.filter(r => r.id.includes('ant')).length;
    let teraCount = rigs.filter(r => r.id.includes('tera')).length;
    let whatCount = rigs.filter(r => r.id.includes('what')).length;
    let avalCount = rigs.filter(r => r.id.includes('aval')).length;
    
    console.log("\nRig Summary:");
    console.log(`Antminers: ${antCount}`);
    console.log(`TERA miners: ${teraCount}`);
    console.log(`Whatsminers: ${whatCount}`);
    console.log(`Avalon miners: ${avalCount}`);
    console.log(`Total rigs: ${rigs.length}`);
    
    db.close();
});
