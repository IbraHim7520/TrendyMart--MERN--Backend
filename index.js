require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = 3000
//middlewares
app.use(express.json())
app.use(cors())

//Database
const {MongoClient , ServerApiVersion, ObjectId} = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.9vvyx12.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
app.get('/', (req, res)=>{
    res.send("Helloooww Trendy Mart")
})
const client = new MongoClient(uri, {
    serverApi:{
        version: ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true
    }
})

async function run() {
    try{
    console.log("Successfully connected to MongoDB!");
    
    const Database = client.db("Trendy-Mart")
    const UserRole = Database.collection("UserRole")
    const SellerRequest = Database.collection("SellerRequest");
    const Products = Database.collection("Products")
    const cart = Database.collection("ProductCart")

    app.post('/add-userrole', async(req , res)=>{
       try{
        const roleInfo = req.body.RoleInfo;
        const res = await UserRole.insertOne(roleInfo)
        req.send(res)
        console.log(roleInfo)
       }catch{
        res.status(400).send({message: "Unable to insert"});
       }
        
    })
    app.get('/get-role/:email', async(req , res)=>{
       try{
            const requestEmail = req.params.email;
       const qry = { Email: requestEmail};
       const result = await UserRole.findOne(qry);
       res.send(result)
       }catch{
        res.status(400).send({message: "Unabe to find Data"})
       }
    })
    app.post("/seller-req", async(req , res)=>{
        try{
        const reqInfo = req.body.data 
        const result = await SellerRequest.insertOne(reqInfo);
        if(result){
            res.send(result)
        }else{
            res.status(500).send({message:"Internal Server Error!"})
        }
        }catch{
            res.status(503).send({message: "Service Unavailable"})
        }
    })

    app.get('/seller-reqs/:email', async(req, res)=>{
        const email = req.params.email;
        const qry = {
            SellerEmail: email
        }
        const requestInfo = await SellerRequest.findOne(qry);
       res.send(requestInfo)
    })
    app.post('/post-product', async(req , res) =>{
        const productData = req.body.ProductData
        productData.OfferPrice = parseInt(productData.OfferPrice)
        productData.Price = parseInt(productData.Price)
        productData.Quantity = parseInt(productData.Quantity)
        
        try{
            const result = await Products.insertOne(productData);
            res.send(result)
        }catch{
            res.status(400).send({message: "Something went wrong!" })
        }
    })
    app.get('/seller-products/:email', async(req , res)=>{
        const sellerEmail = req.params.email
        const qury = {Owner: sellerEmail};
        try{
            const response = await Products.find(qury).toArray()
            res.send(response)
        }catch{
            res.status(400).send({message: "No Data found!"})
        }
    })
    app.get('/popular-products', async(req , res)=>{
        const productsData = await Products.find().sort(
            {
                Ratings: -1
            }
        ).limit(10).toArray();
        res.send(productsData);
    })
    app.get('/all-products', async(req , res)=>{
        try{
                const response = await Products.find().toArray()
                res.send(response);
        }catch{
            res.status(401).send({message: "Somethin is wrong! Please try again later"})
        }
    })
    app.get('/one-product/:id', async(req , res)=>{
        const productID = req.params.id;
        const IDQry = {_id: new ObjectId(productID)}
        try{
            const response = await Products.findOne(IDQry)
            res.send(response)
        }catch{
            res.status(401).send({message: "Something went wron!"})
        }
    })

    app.post('/add-cart', async(req , res)=>{
        const productData = req.body.data
        try{
            const id = productData?._id
            const findResult = await cart.findOne({
                _id: id
            })
            if(findResult){
                 res.send({message: "Items already added."})
                return
            }
               
                console.log(findResult)
            
            const postingResult = await cart.insertOne(productData)
            res.send(postingResult)
        }catch{
            res.status(400).send({message: "Something went wrong!"})
        }

    })

    }finally{
    }
}
run().catch(console.dir)

app.listen(port, ()=>{
    console.log("Server running")
})