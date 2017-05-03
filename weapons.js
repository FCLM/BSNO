/**
 * Created by Dylan on 03-May-17.
 */
const prequest  = require('prequest');
// Files
const api_key   = require('./api_key.js');
const mWeapons  = require('./models/weapons.js');
const bookshelf = require('./bookshelf.js');

async function getWeapons() {
    return new Promise((resolve, reject) => {
        const url = 'http://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/item?item_type_id=26&c:limit=5000&c:hide=,skill_set_id,is_vehicle_weapon,item_type_id,faction_id,max_stack_size,image_set_id,image_path,is_default_attachment&c:lang=en';
        prequest(url).then(function (body) {
            if (body === undefined) {
                console.error(Date.now() + ' getWeapons (returned undefined) ');
                resolve(0);
            } else if (body.hasOwnProperty('item_list')) {
                body.item_list.forEach(function(item) {
                    let obj = {
                        item_id: "-1",
                        category_id: "-1",
                        name: "-1",
                        description: "-1",
                        image_id: "-1"
                    };
                    // check if item response from dbg has each json key before updating to object
                    if (item.hasOwnProperty('item_id')) obj.item_id = item.item_id;
                    if (item.hasOwnProperty('item_category_id')) obj.category_id = item.item_category_id;
                    if (item.hasOwnProperty('name')) obj.name = item.name.en;
                    if (item.hasOwnProperty('description')) obj.description = item.description.en;
                    if (obj.description.length > 254) obj.description = obj.description.substring(0,254);
                    if (item.hasOwnProperty('image_id')) obj.image_id = item.image_id;
                    // Add object to database
                    //console.log(obj);
                    mWeapons.forge(obj).save(null, {method: 'insert'}).then(function (result) {

                    }).catch(function (error) {
                        console.error('Inserting Weapons ' + error);
                        console.error(obj);
                    });
                });
            }
        }).catch(function (err) {
            console.error(Date.now() + ' getWeapons ' + err);
            return reject(err);
        });
    })
}

exports.getWeapons = getWeapons;