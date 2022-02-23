const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helper')
var userHelper=require('../helpers/user-helper')
/* GET home page. */
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

router.get('/', async function  (req, res, next) {
 let user=req.session.user
 let cartCount=null
 if(req.session.user){
  cartCount= await userHelper.getCartCount(req.session.user._id)
 }
 
  productHelper.getAllProducts().then((products)=>{
   res.render('user/view-products',{products,user,cartCount})
})
})
router.get('/login',(req,res)=>{   
  if(req.session.user){
      res.redirect('/')
  }else{
      res.render('user/login',{"loginErr":req.session.userLoginErr})
      req.session.userLoginErr=false
  }   
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((data)=>{
    
    req.session.user=response
    req.session.user.loggedIn=true
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{   
    if(response.status){  
      req.session.user=response.user  
      req.session.user.loggedIn=true
      
      res.redirect('/')     
    }else{
      req.session.userLoginErr="Invalid username or password"      
      res.redirect('/login')
    }
  })
})
router.get('/logOut',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false 
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
 let products=await userHelper.getCartProduct(req.session.user._id)
 let totalValue=0
 if(products.length>0){
   totalValue=await userHelper.getTotalAmount(req.session.user._id)
 }
 
   res.render('user/cart',{products,user:req.session.user,totalValue})
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call");
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelper.getTotalAmount(req.body.user)
   res.json(response)
  })
})
router.get('/place-order',verifyLogin, async (req,res)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user._id})
})
router.post('/place-order',async(req,res)=>{
  let products= await userHelper.getCartProductList(req.body.userId)
  let totalPrice=await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    console.log( orderId);
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
      })
    }
    

  })
  console.log(req.body)
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user._id})
})
router.get('/orders-list',async(req,res)=>{
 
  let orders= await userHelper.getUserOrders(req.session.user._id)
  res.render('user/orders-list',{user:req.session.user,orders})
})
router.get('/view-order-product/:id',async(req,res)=>{
let products=await userHelper.getOrderProducts(req.params.id)

  res.render('user/view-order-product',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
 userHelper.verifyPayment(req.body).then(()=>{
 userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
   console.log('Payment Successfull');
   res.json({status:true})
 })
 }).catch((err)=>{
   console.log(err);
   res.json({status:false,errMsg:''})
 })
})
router.get('/my-profile',(req,res)=>{
  res.render('user/my-profile',{user:req.session.user})
})



module.exports = router;
