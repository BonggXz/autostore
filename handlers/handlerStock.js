const Stock = require('../schemas/stock');
const Sold = require('../schemas/sold');

async function addStock(code, data) {
    let stock = await Stock.findOne({ code });

    const dataArray = data.split('\n').map(item => item.trim()).filter(item => item.length > 0);

    if (!stock) {
        return { success: false, message: 'Kode tidak ditemukan.' };
    }

    stock.data.push(...dataArray);
    await stock.save();
    return { success: true, newCount: stock.data.length };
}

async function deleteStock(code) {
    const result = await Stock.deleteOne({ code });
    return result.deletedCount > 0;
}

async function getAllStocks() {
    try {
        const stocks = await Stock.find({});
        return stocks.map(stock => ({ code: stock.code, desc: stock.desc, harga: stock.harga, count: stock.data.length }));
    } catch (err) {
        console.error(err)
    }
}

async function soldHistory() {
    try {
        const solds = await Sold.findOne({});
        return solds.sold;
    } catch (err) {
        console.error(err)
    }
}

async function buyStock(code, count) {
    const stock = await Stock.findOne({ code });

    if (stock && stock.data.length >= count) {
        const boughtData = stock.data.splice(0, count);
        await stock.save();
        return boughtData;
    } else {
        return false;
    }
}

module.exports = { addStock, deleteStock, getAllStocks, buyStock, soldHistory };
