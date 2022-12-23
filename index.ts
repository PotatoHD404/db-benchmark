const { Client } = require('pg');
const fs = require('fs');

// Before running the script you need to create table with indexes in your database

    // CREATE TABLE test_count (
    //     id INT NOT NULL,
    //     fni INT NULL,
    //     fwi INT NULL,
    //     fni_nn INT NOT NULL,
    //     fwi_nn INT NOT NULL,
    //     PRIMARY KEY (id)
    // );
    // CREATE INDEX test_count_fwi ON test_count (fwi);
    // CREATE INDEX test_count_fwi_nn ON test_count (fwi_nn);

async function main() {
    const client = new Client(
        {
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            port: 5432,
          }
    )
    await client.connect()
    
    await client.query(`TRUNCATE TABLE test_count;`);


    
    
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
      }
    
    
    let funcs = {
        "COUNT(*)": "SELECT COUNT(*) FROM test_count;",
        "COUNT(1)": "SELECT COUNT(1) FROM test_count;",
        "COUNT(id)": "SELECT COUNT(id) FROM test_count;",
        "COUNT(fni)": "SELECT COUNT(fni) FROM test_count;",
        "COUNT(fwi)": "SELECT COUNT(fwi) FROM test_count;",
        "COUNT(fni_nn)": "SELECT COUNT(fni_nn) FROM test_count;",
        "COUNT(fwi_nn)": "SELECT COUNT(fwi_nn) FROM test_count;",
    }
    
    
    let count = 0;
    
    let results = {
        "titles": [],
        "COUNT(*)": [],
        "COUNT(1)": [],
        "COUNT(id)": [],
        "COUNT(fni)": [],
        "COUNT(fwi)": [],
        "COUNT(fni_nn)": [],
        "COUNT(fwi_nn)": [],
}
    
    while (count <= 1e7) {
        for (let func in funcs) {
            var startTime = performance.now();
            let res = await client.query(funcs[func]);
            results[func].push(performance.now() - startTime);
        }
        results["titles"].push(count);

        let n = [];

        for (let i = 0; i < 1000; i++) {
            
            // get random boolean
            let randomBoolean = Math.random() >= 0.5;
            let cnt1;
            if(randomBoolean)
                 cnt1 = getRandomInt(0, 1e5);
            else
                 cnt1 = null;
            randomBoolean = Math.random() >= 0.5;
            let cnt2;
            if(randomBoolean)
                 cnt2 = getRandomInt(0, 1e5);
            else
                 cnt2 = null;
            let c = {
                id: count + i,
                fni: cnt1,
                fwi: cnt2,
                fni_nn: getRandomInt(0, 1e5),
                fwi_nn: getRandomInt(0, 1e5)
            };
            n.push(c);
        }
        // add rows to table
        await client.query("INSERT INTO test_count (id, fni, fwi, fni_nn, fwi_nn) VALUES " +
         n.map((c) => `(${c.id}, ${c.fni}, ${c.fwi}, ${c.fni_nn}, ${c.fwi_nn})`).join(",") + ";");
        console.log(count)
        count += 1000;

        fs.writeFile("./postgres/results3.json", JSON.stringify(results), function(err) {
            if(err) {
                return console.log(err);
            }
        });
    }
    
    
    
    await client.end()
}

main()