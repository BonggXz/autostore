const mongoose = require('mongoose')

const dataSchema = mongoose.Schema({
    world:{
        type: String,
        required: true,
    },
    owner:{
        type: String,
        required: true,
    },
    bot:{
        type: String,
        required: true,
    },

},{
    timestamps: true
})

module.exports = mongoose.model('Depo',dataSchema)