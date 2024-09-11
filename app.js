const express = require("express");
const morgan = require("morgan");
const YAML = require('yaml')
const fs = require("fs")
const app = express();
var cors = require("cors");

const fileUpload = require('express-fileupload');
const { authMiddleware } = require("./app/middleware");
const { handleException } = require("./app/exceptions");


const swaggerUI = require("swagger-ui-express");
const file = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)


const globalValidationHelper = require('./app/validations/globalValidationHelper')

//routes
const {
  UserRoutes,
  RoleRoutes,
  SupplierRoutes,
  CustomerRoutes,
  ProductRoutes,
  SalesRepRoutes,
  PurchaseOrderRoutes,
  PurchaseOrderReceivedRoutes,
  PurchaseOrderStockReturnRoutes,
  InvoiceRoutes
} = require('./app/routes')


const db = require("./app/database");
db.connect();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: "100mb", extended: true }));
app.use(fileUpload());

app.use('/uploads', express.static('uploads'))
app.use('/permissions', express.static('permissions'))

globalValidationHelper.init()


app.get("/", (req, res) => {
  const { version, name, author } = require("./package.json");
  res.json({
    service: {
      name,
      version,
      author
    },
  });
});

app.use('/api-docs', swaggerUI.serve);
app.get('/api-docs', swaggerUI.setup(swaggerDocument));

//Routes
app.use('/users', UserRoutes)
app.use('/roles', authMiddleware, RoleRoutes)
app.use('/suppliers', authMiddleware, SupplierRoutes)
app.use('/customers', authMiddleware, CustomerRoutes)
app.use('/products', authMiddleware, ProductRoutes)
app.use('/salesRep', authMiddleware, SalesRepRoutes)
app.use('/purchaseOrder', authMiddleware, PurchaseOrderRoutes)
app.use('/purchaseOrderReceived', authMiddleware, PurchaseOrderReceivedRoutes)
app.use('/purchaseOrderReturnStock', authMiddleware, PurchaseOrderStockReturnRoutes)
app.use('/invoice', authMiddleware, InvoiceRoutes)

app.use(handleException);

module.exports = app;