const Product = require('../models/Product')
const StockAdjustment = require('../models/StockAdjustment')

const userResource = require('../resources/userResource');
const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');

exports.getAll = async () => {
    try {
        return {
            data: await Product.find({ deletedAt: null })
        }
    } catch (error) {
        throw new ValidationException(error)
    }
}

exports.findById = async (data) => {
    if (!data?.id) {
        throw new ValidationException("Missing parameter")
    }

    if (!isValidObjectId(data?.id)) {
        throw new ValidationException("Invalid object ID")
    }

    try {
        return {
            data: await Product.findOne({ _id: data?.id, deletedAt: null })
        }
    } catch (error) {
        throw new ValidationException(error)
    }
}

exports.create = async (data, user) => {
    const createData = {
        code: data?.code,
        name: data?.name,
        category: data?.category,
        department: data?.department,
        remark: data?.remark,
        isActive: data?.isActive,
        price: data?.price,
        cost: data?.cost,
        discount: data?.discount,
        warehouseQuantity: data?.warehouseQuantity,
        history: [
            {
                event: "Product Created",
                type: "add",
                quantity: data?.warehouseQuantity[0]?.quantity,
                user: userResource.logResource(user),
                timestamps: now()
            }
        ]
    }

    try {
        const created = await new Product(createData).save()
        return {
            data: created._doc
        }
    } catch (error) {
        throw new ValidationException(error)
    }
}

exports.update = async (data, user) => {

    const updateData = {
        name: data?.name,
        category: data?.category,
        department: data?.department,
        remark: data?.remark,
        isActive: data?.isActive,
        price: data?.price,
        cost: data?.cost,
        discount: data?.discount,
    }

    const findProduct = await Product.findOne({ _id: data?._id, deletedAt: null });
    if (!findProduct) {
        throw new ValidationException("Invalid Product")
    }
    const historyData = [...findProduct.history]
    const newHistoryItem = {
        event: "Product Updated",
        type: null,
        quantity: null,
        user: userResource.logResource(user),
        timestamps: now()
    }
    historyData.push(newHistoryItem)
    updateData.history = historyData


    try {
        const updated = await Product.findByIdAndUpdate(
            data?._id,
            {
                $set: {
                    ...updateData,
                },
            },
            { new: true }
        );

        return {
            data: updated._doc
        }
    } catch (error) {
        console.log(error);

        throw new ValidationException(error)
    }
}

exports.delete = async (req, user) => {
    const findProduct = await Product.findOne({ _id: req?._id, deletedAt: null });
    if (!findProduct) {
        throw new ValidationException("Invalid Product")
    }
    const historyData = [...findProduct.history]
    const newHistoryItem = {
        event: "Product Deleted",
        type: null,
        quantity: null,
        user: userResource.logResource(user),
        timestamps: now()
    }
    historyData.push(newHistoryItem)

    try {
        const updated = await Product.findByIdAndUpdate(
            req?._id,
            {
                $set: {
                    deletedAt: now(),
                    history: historyData
                },
            },
            { new: true }
        );
        return {
            data: updated._doc
        }
    } catch (error) {
        console.log(error);
        throw new ValidationException(error)
    }
}



exports.stockAdjustment = async (data, user) => {
    const createData = {
        date: data?.date,
        type: data?.type,
        reason: data?.reason,
        description: data?.description,
        createdBy: userResource.logResource(user),
        items: data?.items,
    }

    try {

        const created = await new StockAdjustment(createData).save()

        for (let index = 0; index < data?.items.length; index++) {
            const item = data?.items[index];
            const product = await Product.findOne({ code: item?.code }).lean()
            if (product) {
                const historyData = [...product.history]
                const newHistoryItem = {
                    event: "Stock Adjustment",
                    type: data?.type,
                    quantity: item?.quantity,
                    user: userResource.logResource(user),
                    stockAdjustment: created._doc?._id,
                    timestamps: now()
                }
                historyData.push(newHistoryItem)

                const warehouseQuantity = [...product.warehouseQuantity]
                const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
                const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")


                let newItem = {
                    ...warehouseItem,
                    quantity: data?.type == "add" ? parseFloat(warehouseItem?.quantity) + parseFloat(item?.quantity) : parseFloat(warehouseItem?.quantity) - parseFloat(item?.quantity)
                }
                warehouseQuantity.splice(findIndex, 1, newItem)


                await Product.findByIdAndUpdate(
                    product?._id,
                    {
                        $set: {
                            warehouseQuantity: warehouseQuantity,
                            history: historyData
                        },
                    },
                    { new: true }
                );
            }
        }

        return {
            data: created._doc
        }

    } catch (error) {
        throw new ValidationException(error)
    }
}