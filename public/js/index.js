const carticon = document.querySelector(".carticon");
const close_cart = document.querySelector(".close_cart");
const clear_cart = document.querySelector(".clear_cart");
const remove = document.querySelector(".remove");
const in_cart = document.querySelector(".fa-chevron-up");
const de_cart = document.querySelector(".fa-chevron-down");
const cart_open = document.querySelector(".cart_open");
const cart_overlay = document.querySelector(".cart_overlay");
const cart_total = document.querySelector(".cart_total");
const cart_content = document.querySelector(".cart_content");
const products_center = document.querySelector(".products_center");

// CART
let cart = [];
//the info of all the items in cart will be in this array
// button 
let buttonsDOM=[];
// all the add to cart buttons will be here along with their ids will be saved here

//GET PRODUCTS

class Products{
  //get all the info about products
  async getProducts() 
  //this function will return the title img url price and id 
  {
    try {
      let result = await fetch("products/products.json");
      let data = await result.json();

      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image};
      });
      return products; //products is a obj with title price id image of each product
      //like products.title gives title of all products
    } catch (error) {
      console.log(error);
    }
  }
}

// DISPLAY PRODUCTS

class UI 
//contains all the functions to display info in the page
{
  displayProducts(products) 
  //display a single from json url
  {
    let result = "";
    products.forEach((product) => {
      result += `  
            <!-- SINGLE PRODUCTS -->
            <article class="product">
                <div class="img_container">
                    <img class="product_img" src=${product.image} alt="product">
                    <button class="addcart" data-id=${product.id}>
                        <i class="fa fa-cart-plus">Add to Cart</i>
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>`;
    });
    products_center.innerHTML = result;
  }


  getBagButtons() {
    const bag_buttons = [...document.querySelectorAll(".addcart")];
    //get all the buttons with class addcart
    buttonsDOM= bag_buttons
    bag_buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      //ie if the id of button is same as the id of any ele in cart array(ie the item is in the cart)
      if (inCart) 
      // if the id is same them change the botton text and disable it 
      {
        button.innerText = "In Cart";
        button.disabled = true;
      } 
      else
      //add event listener on all the buttons 
      {
        button.addEventListener("click", (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;

          //get product from products
          let cartItem = { ...Storage.getItem(id), amount: 1 };
          // when the addcart button is clicked take the id of button and in localstorage =>products find a item with that same id 
          //and store the details of that item in cartItem along with amount=1

          //add it to cart
          cart = [...cart, cartItem];
          //speread operator is used to get all the previous content of cart 
          //now cart which was an empty array will have the details of item of wich the addcart button was clicked 

          //save it in local storage
          Storage.saveCart(cart);
          //  make a key named cart in add the details of all the all the items that are added to cart \

          //set cart value
          this.setCartValue(cart);
          //set the total of items at the bottom

          //display cart items
          this.addCartItem(cartItem);
          //show the added items in the cart 

          //show cart
          this.showCart()
          //when clicked on add to cart button the cart will be visible 
        });
      }
    });
  }
  setCartValue(cart) 
  //set the total according to the value and no of item in the cart
  {
    let tempTotal = 0;
    // let itemsTotal=0;
    cart.map((items) => {
      tempTotal += items.price * items.amount;
    });
    cart_total.innerText = parseFloat(tempTotal.toFixed(2));
    console.log(cart_total);
  }

  addCartItem(item ) 
  //from cart array take the details of the item and use them to fill up the cart 

  {
    const div = document.createElement("div");
    div.classList.add("cart_item");
    div.innerHTML = `
                    <div class="cart_img">
                        <img src=${item.image} alt="product">
                    </div>
                    <div class="info">
                        <h4>${item.title}</h4>
                        <h5>${item.price}</h5>
                        <span class="remove" data-id=${item.id}>Remove</span>
                    </div>
                    <div class="in_de">
                        <i class="fa fa-chevron-up" data-id=${item.id}></i>
                        <h4>${item.amount}</h4> 
                        <i class="fa fa-chevron-down" data-id=${item.id}></i>
                    </div>`;

                    cart_content.prepend(div)
                    console.log(cart_content) 
                  }
 
  
  showCart()
  //display the cart
  {
    cart_overlay.classList.add("show_overlay")
    cart_open.classList.add("show_cart")
  }

  closeCart()
  // close the cart
  {
    cart_overlay.classList.remove("show_overlay")
    cart_open.classList.remove("show_cart")
  }

  setUpApp()
  // when the page will load  from localstorage take cart 
  // with setCartValueset the total art value 
  // with populate  as the page is refreshed place the items again in cart
  // and addeventlisteners to cart open and close buttons
  {
    cart=Storage.getCart()
    //if there exist an array named cart in localstorage then get it else retun an empty array
    this.setCartValue(cart)
    this.populate(cart)
    carticon.addEventListener("click",this.showCart)
    close_cart.addEventListener("click",this.closeCart)
  }

  populate(cart)
  //put the items added to cart again in the cart 
  {
    cart.forEach(item=>{this.addCartItem(item)})
  }

  cartLogic()
  // set the logic for clear_cart and remove button 
  {
    clear_cart.addEventListener("click",()=>{
      this.clearCart()
    })
    cart_content.addEventListener("click",event=>{
      if(event.target.classList.contains("remove")){
        let remove= event.target
        let id = remove.dataset.id
        cart_content.removeChild(remove.parentElement.parentElement)
        this.removeItem(id)

      }
      else if (event.target.classList.contains("fa-chevron-up")){
        let add_amount= event.target
        let id =add_amount.dataset.id
        let tempItem=cart.find(item=>item.id===id)
        tempItem.amount=tempItem.amount+1
        Storage.saveCart(cart)
        this.setCartValue(cart)
        add_amount.nextElementSibling.innerText=tempItem.amount
      }
      else if (event.target.classList.contains("fa-chevron-down")){
        let lower_amount= event.target
        let id = lower_amount.dataset.id
        let tempItem= cart.find(item=>item.id ===id )
        tempItem.amount=tempItem.amount-1
        if(tempItem.amount>0){
          Storage.saveCart(cart)
          this.setCartValue(cart)
          lower_amount.previousElementSibling.innerText=tempItem.amount
        }
        else if(tempItem.amount==0){
          cart_content.removeChild(lower_amount.parentElement.parentElement)
          this.removeItem(id)
          
        }
        
      }
    })
  }
  clearCart()
  
  { 
    let cartItems=cart.map(item=>item.id)
    // cartItems is the array of all the id of ele that are in cart 
    cartItems.forEach(id=>this.removeItem(id))
    // take each ele by its id and remove it 
    while(cart_content.children.length>1)
    // keep removing items untill cart_content has only 1 child ie the cart_footer or cleaar cart button
    {
      cart_content.removeChild(cart_content.children[0])
    }
    this.closeCart( )
  }

  removeItem(id)
  {
    cart=cart.filter(item=> item.id!==id)
    //move every item to cart except the one with id 
    //  so that the modified cart wont have the item with given id  
    this.setCartValue(cart)
    // set the total value of cart 
    Storage.saveCart(cart)
    // save the modified cart in local storage
    let button= this.getsSingleButton(id)
    // once the ite is removed change the text from in to add to cart again 
    button.disabled=false
    button.innerHTML=`<i class="fa fa-cart-plus">Add to Cart</i>`

  }
  getsSingleButton(id){
    return buttonsDOM.find(buttons=>buttons.dataset.id===id)
  }
}




// LOCAL STORAGE
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getItem(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((item) => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart(){
    return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[]
    //if there exist an array named cart in localstorage then get it else retun an empty array
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpApp()
  products
    .getProducts()
    //get the products from json file and save price title img and id of each
    .then((products) => { 
      ui.displayProducts(products);
      // using the price title img and id from getProducts() display the products in products_center
      Storage.saveProducts(products);
      //make key by name products in local storage and save the data of all products in string format
    })
    .then(() => {
      ui.getBagButtons();

      ui.cartLogic()
    });
});

function collaspe() {
  let x = document.getElementById("navid");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}
