// @ts-nocheck
const fs = require('fs');
Array.prototype.removeAt = function removeAt(index) {
    this.splice(index, 1);
}

const rawData = fs.readFileSync('data.json');
const data = JSON.parse(rawData);
const items = data.items;

const otherItems = items.filter(item => item.type != 1);
const loginsItems = items.filter(item => item.type == 1);
const cleanList = [];
const removeList = [];

loginsItems.forEach(item => {
    if (item?.login?.uris?.length) {
        const dupExists = cleanList.some(cleanItem => {
            if (urisIntersection(cleanItem?.login?.uris, item?.login?.uris)) {
                const checkUsernames = cleanItem.login.username === item.login.username;
                const checkPasswords = cleanItem.login.password === item.login.password;
                if (checkUsernames && checkPasswords) {
                    removeList.push(item);
                    return true
                }
            }

            return false;
        })
        if (!dupExists) {
            cleanList.push(item);
        }
    } else {
        cleanList.push(item);
    }
});

console.log(loginsItems.length, cleanList.length);

fs.writeFileSync('clean.json', JSON.stringify({ ...data, items: [...otherItems, ...cleanList] }));
fs.writeFileSync('removed.json', JSON.stringify({ items: [...removeList] }));
fs.writeFileSync('names.json', JSON.stringify({ items: [...removeList.map(i => ({
    name: i.name,
    username: i.login?.username,
    password: i.login?.password
}))] }));

function urisIntersection(uris1, uris2) {
    if (!uris1 || !uris2) return false;

    const urls1 = uris1.map(({uri}) => getHostname(uri)).filter(i => i !== null);
    const urls2 = uris2.map(({uri}) => getHostname(uri)).filter(i => i !== null);

    if (!urls1.length || !uris2.length) return false;

    return urls1.filter(value => urls2.includes(value)).length;
}

function getHostname(string) {
    try {
      return (new URL(string)).hostname.replace(/^(www\.)?/i, '');
    } catch (_) {
      return null;
    }
}
