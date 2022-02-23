var express = require('express');
const { render } = require('../app');
var router = express.Router();
var productHelper=require('../helpers/product-helper')
const adminHelper=require('../helpers/admin-helper')
const fs = require('fs');
const { response } = require('express');
const { resolve } = require('path');
const { runInNewContext } = require('vm');

/* GET users listing. */
router.get('/', function(req, res, next) {
  let admin=req.session.admin
 productHelper.getAllProducts().then((products)=>{
  
  res.render('admin/view-products',{admin:true,products,admin});
 })
 
});

router.get('/add-products',function(req,res){
  res.render('admin/add-products')
})
router.post('/add-products',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)

  productHelper.addProduct(req.body,(insertedId)=>{
    let image=req.files.Image
    
     image.mv('./public/product-images/'+insertedId+'.jpg',(err)=>{
       if(!err){
        res.render('admin/add-products')
       }
      
     })
    
  })
})
 router.get('/delete-product/:id',(req,res)=>{
   let proId=req.params.id
   console.log(proId);
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
 })
 router.get('/edit-product/:id',async(req,res)=>{
   let product=await productHelper.getProductDetails(req.params.id)
   res.render('admin/edit-product',{product})
 })
 router.post('/edit-product/:id',(req,res)=>{
   productHelper.updateProduct(req.params.id,req.body).then(()=>{
     res.redirect('/admin/')
     let id =req.params.id
     if(req.files.Image){
      let image=req.files.Image    
      image.mv('./public/product-images/'+id+'.jpg')
     }
   })
 })
 router.get('/adminlogin',(req,res)=>{ 
   if(req.session.loggedIn){
    res.redirect('/admin')
   }else{
    res.render('admin/adminlogin',{"logginErr":req.session.adminLoginErr})
    req.session.adminLoginErr=false
   }
    
  
})
router.get('/admin-signup',(req,res)=>{
  res.render('admin/admin-signup')
})
router.post('/admin-signup',(req,res)=>{
  adminHelper.doAdminSignup(req.body).then((response)=>{
    
    req.session.admin=response.admin
    req.session.admin.loggedIn=true
    res.redirect('/admin')
  })
})
router.post('/adminlogin',(req,res)=>{
  adminHelper.doAdminLogin(req.body).then((response)=>{
    
    if(response.status){
      req.session.admin=response.admin
      console.log();
      req.session.admin.loggedIn=true
      
      res.redirect('/admin')
    }else{
      req.session.adminLoginErr="Invalid username or password"
      res.redirect('/admin/adminlogin')
    }

    
  })
})
router.get('/all-orders',(req,res)=>{
  res.render('admin/all-orders',(orders))
})

    
  


module.exports = router;
