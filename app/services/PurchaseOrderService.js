const PurchaseOrder = require("../models/PurchaseOrder");
const PurchaseOrderReceived = require("../models/PurchaseOrderReceived");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const { apiUrl } = require("../config");
const moment = require('moment');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const userResource = require("../resources/userResource");
const { ValidationException } = require("../exceptions");
const { now, isValidObjectId } = require("mongoose");

const { formatNumberWithPrefix, formatMoney } = require('../helper')

exports.getAll = async (data) => {
  const page = data?.page ?? 1
  const search = data?.search ?? ""
  const regex = new RegExp(search, 'i');

  const purchaseOrders = await PurchaseOrder.paginate({
    deletedAt: null,
    $or: [
      { code: regex },
      { ['supplier.code']: regex }
    ]
  },
    {
      lean: true,
      page,
      limit: 50,
    })

  const docs = await Promise.all(purchaseOrders?.docs?.map(async (row) => {
    const supplier = await Supplier.findOne({ code: row?.supplier?.code }).lean()
    return {
      ...row,
      supplier
    }
  }))

  purchaseOrders.docs = docs

  try {
    return {
      data: purchaseOrders,
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.getAllNoPaginate = async (data) => {
  try {
    let purchaseOrders = await PurchaseOrder.find({ deletedAt: null }).lean()

    if (data?.type == "por") {
      purchaseOrders = purchaseOrders?.filter(row => {
        const filterItems = row?.items?.filter(itemRow => Number(itemRow?.receivableQuantity) > 0)
        if (filterItems?.length == 0) {
          return false
        }
        return true
      })
    }

    const purchaseOrderMapped = await Promise.all(purchaseOrders?.map(async (row) => {
      const supplier = await Supplier.findOne({ code: row?.supplier?.code }).lean()
      return {
        ...row,
        supplier
      }
    }))
    return {
      data: purchaseOrderMapped
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.findByCode = async (data) => {
  if (!data?.code) {
    throw new ValidationException("Missing parameter");
  }

  const purchaseOrder = await PurchaseOrder.findOne({ code: data?.code, deletedAt: null }).lean()
  if (!purchaseOrder) {
    throw new ValidationException("Purchase Order not found");
  }
  if (purchaseOrder?.isReceiveCreated) {
    throw new ValidationException("Unable To Update Purchase Order Receive(s) Created");
  }
  purchaseOrder.supplier = await Supplier.findOne({ code: purchaseOrder?.supplier?.code })
  try {
    return {
      data: purchaseOrder
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.create = async (req, user) => {
  //check supplier
  const supplier = await Supplier.findOne({
    _id: req?.supplier?._id,
    deletedAt: null,
  }).lean();
  let errorObject = {};
  if (!supplier) {
    errorObject = { ...errorObject, supplier: "Invalid Supplier" };
  }

  //checkItems
  for (let index = 0; index < req?.items.length; index++) {
    const item = req?.items[index];
    const product = await Product.findOne({ code: item?.code });
    if (!product) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]: "Invalid Product",
      };
    }
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const mappedItems = await Promise.all(req?.items?.map(async (row) => {
    const product = await Product.findOne({ code: row?.code }).lean();
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    const discountAmount =
      (parseFloat(subTotal) * parseFloat(row?.discount)) / 100;
    return {
      ...row,
      name: product?.name,
      discountAmount,
      receivableQuantity: row?.quantity,
      subTotal,
      total: subTotal - discountAmount,
    };
  }));

  const totalDiscount = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.discountAmount);
  }, 0);

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const history = {
    event: "Created",
    user: userResource.logResource(user),
    timestamps: now(),
  };

  const requestData = {
    code: req?.code,
    orderDate: req?.orderDate,
    requiredDate: req?.requiredDate,
    remark: req?.remark,
    supplier: req?.supplier,
    items: mappedItems,
    totalDiscount,
    subTotal,
    total: subTotal - totalDiscount,
    history: [history],
  };
  try {
    return {
      data: await new PurchaseOrder(requestData).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.update = async (req, user) => {
  let errorObject = {};

  const purchaseOrder = await PurchaseOrder.findOne({ _id: req?._id }).lean();

  if (!purchaseOrder) {
    errorObject = { ...errorObject, code: "Invalid Purchase order" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  //check supplier
  const supplier = await Supplier.findOne({
    _id: req?.supplier?._id,
    deletedAt: null,
  }).lean();
  if (!supplier) {
    errorObject = { ...errorObject, supplier: "Invalid Supplier" };
  }

  //checkItems
  for (let index = 0; index < req?.items.length; index++) {
    const item = req?.items[index];
    const product = await Product.findOne({ code: item?.code });
    if (!product) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]: "Invalid Product",
      };
    }
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const mappedItems = await Promise.all(req?.items?.map(async (row) => {
    const product = await Product.findOne({ code: row?.code }).lean();
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    const discountAmount =
      (parseFloat(subTotal) * parseFloat(row?.discount)) / 100;
    return {
      ...row,
      name: product?.name,
      discountAmount,
      receivableQuantity: row?.quantity,
      subTotal,
      total: subTotal - discountAmount,
    };
  }));

  const history = [...purchaseOrder?.history];

  const historyItem = {
    event: "Update",
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem);

  const totalDiscount = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.discountAmount);
  }, 0);

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const requestData = {
    code: req?.code,
    orderDate: req?.orderDate,
    requiredDate: req?.requiredDate,
    remark: req?.remark,
    supplier: req?.supplier,
    items: mappedItems,
    totalDiscount,
    subTotal,
    total: subTotal - totalDiscount,
    history,
  };
  try {
    const updated = await PurchaseOrder.findByIdAndUpdate(
      req?._id,
      {
        $set: { ...requestData },
      },
      { new: true }
    );
    return {
      data: updated._doc,
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.delete = async (req, user) => {
  const purchaseOrder = await PurchaseOrder.findOne({ _id: req?._id, deletedAt: null }).lean()
  if (!purchaseOrder) {
    throw new ValidationException("Invalid Purchase Order")
  }

  const historyData = [...purchaseOrder.history]
  const historyItem = {
    event: "Deleted",
    user: userResource.logResource(user),
    timestamps: now(),
  };
  historyData.push(historyItem)

  try {
    const updated = await PurchaseOrder.findByIdAndUpdate(
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
    throw new ValidationException(error);
  }
};

exports.nextNumber = async () => {
  try {
    const documentCount = await PurchaseOrder.countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, "PO"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}

exports.print = async (data) => {
  try {
    const purchaseOrder = await PurchaseOrder.findOne({ code: data?.code }).lean()
    purchaseOrder.supplier = await Supplier.findOne({ code: purchaseOrder.supplier.code }).lean()
    const templatePath = path.join('files', 'templatesPDF', 'purchaseOrder.html');
    const companyImage = path.join('public', 'images', 'companyIcon.png');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    const items = purchaseOrder?.items.map(item => {
      const itemSubtotal = item.quantity * item.rate
      const itemDiscount = item.discount > 0 ? (itemSubtotal * item.discount) / 100 : 0
      const itemTotal = itemSubtotal - itemDiscount
      return (
        `
      <tr>
        <td>
          <div class="font-medium" >${item.name}</div>
          <small>
          ${item.code}
          </small>
        </td>
        <td>${item.remark || "-"}</td>
        <td align="right" >${item.quantity}</td>
        <td align="right" >${formatMoney(item.rate)}</td>
        <td align="right" >${item.discount + "%"}</td>
        <td align="right" >${formatMoney(itemTotal)}</td>
      </tr>
    `
      )
    }).join('');

    htmlContent = htmlContent.replace(/{{PO}}/g, purchaseOrder?.code);
    htmlContent = htmlContent.replace(/{{apiUrl}}/g, apiUrl);
    htmlContent = htmlContent.replace(/{{supplier}}/g, purchaseOrder?.supplier?.code + " | " + purchaseOrder?.supplier?.name);
    htmlContent = htmlContent.replace(/{{items}}/g, items);
    htmlContent = htmlContent.replace(/{{remark}}/g, purchaseOrder?.remark);
    htmlContent = htmlContent.replace(/{{orderDate}}/g, moment(purchaseOrder?.orderDate).format("YYYY-MM-DD"));
    htmlContent = htmlContent.replace(/{{requiredDate}}/g, moment(purchaseOrder?.requiredDate).format("YYYY-MM-DD"));
    htmlContent = htmlContent.replace(/{{subTotal}}/g, formatMoney(purchaseOrder?.subTotal));
    htmlContent = htmlContent.replace(/{{totalDiscount}}/g, formatMoney(purchaseOrder?.totalDiscount));
    htmlContent = htmlContent.replace(/{{total}}/g, formatMoney(purchaseOrder?.total));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      // path: path.join('files', 'generated', 'text.pdf'),
      format: 'A4',
      printBackground: true,
    });
    await browser.close();
    return {
      pdfBuffer
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}