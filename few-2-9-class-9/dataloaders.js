const DataLoader = require('dataloader')
const Item = require('./models/Item')

const batchItems = async (model, keys) => {
  return await model.find({ _id: { $in: keys }}).toArray()
}

const itemLoader = () => {
  return {
    itemLoader: new DataLoader(keys => batchItems(Item, keys),
    { cacheKeyFn: key => key.toString() })
  }
}
module.exports = itemLoader
