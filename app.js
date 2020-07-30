//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart
let cart = [];   // placing info and getting info
let buttonDom= []; 

//for getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const title = item.title;
                const price = item.price;
                const id = item.id;
                const image = item.url;
                return {title,price,id,image}
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

//for getting all the items from Products and  displaying them or manipulating  product or getting them from local storage
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            `;
            
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
       const buttons = [...document.querySelectorAll(".bag-btn")];
       buttonDom = buttons;
       buttons.forEach(button => {
           let id = button.dataset.id;
           let inCart = cart.find(item => item.id === id);
           if(inCart) {
               button.innerHTML = "in Cart";
               button.disabled = true;
           }
          
               button.addEventListener("click", event => {
                   event.target.innerText = "in Cart";
                   event.target.disabled = true;
                   //get product from products(storage) based on ID
                   let cartItem = {...Storage.getProduct(id), amount:1}; 
                   //add product to the cart
                   cart = [...cart,cartItem];
                   //save the cart in local storage
                    Storage.saveCart(cart);
                   //set cart values
                   this.setCartValues(cart);
                   //display cart item when clicked on the button
                    this.addCartItem(cartItem);
                   //show the cart overlay
                   this.showCart();
               });
           
       })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;  
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    setupCart() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });

        cartContent.addEventListener("click", event => {
            if(event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;
                if (tempItem.amount>0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })

    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length>0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id) {
        //to get the specific button that was used to add that item into the cart
        return buttonDom.find(button => button.dataset.id === id);
    }
}

//local storage class
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products')); //since we stored it as string so we in to parse it
        return products.find(item => item.id === id)
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart))
    }

    static getCart() {
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
    }
}

document.addEventListener("DOMContentLoaded",()=> {
    const ui = new UI();
    const products = new Products();

   
    ui.setupCart();
    products.getProducts().then(data => {
        ui.displayProducts(data)
        Storage.saveProducts(data);
    }).then(()=> {
        ui.getBagButtons();
        ui.cartLogic();
    });
        
});