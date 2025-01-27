//********* helper variably **********/
let activeFoodItems = [];
let activeCartItems = [];

function menu_responsive() {
    let menuToggle = document.getElementById('menu-toggle');
    let menuList = document.getElementById('menu-list');

    menuToggle.addEventListener('click', function() {
        menuList.classList.toggle('active');    
    });
}
//********* function init **********//
(() => {
    menu_responsive();
    foodCategories();
    categoryByFoodItems('https://course.divinecoder.com/food/random/6');
    removeItemFormCart();
    quantityHandler();
    clearAllTableItem();
})();

//********* helper function **********/
function foodCart(food) {
    let facilities = food.facilities.split(', ').map(item => {
        return `<li class="position-relative">${item}</li>`;
    });
    return `<div class="col-lg-4 col-md-6 mb-4">
                    <div class="food-cart-item">
                        <div class="img position-relative">
                            <img class="img-fluid w-100" src="${food.image}" alt="img">
                            <div class="overlay position-absolute d-flex align-items-center">
                                <span>Price: ${food.price}/=</span>
                                <i class="fa-solid fa-star"></i>
                                <span> ${food.rating} (${food.rating_count})</span>
                            </div>
                        </div>
                        <div class="text">
                            <h4 class="pb-2">${food.name}</h4>
                            <ul class="list-unstyled d-flex flex-wrap">
                                ${facilities.join('')}
                            </ul>
                        </div>
                        <a data-id=${food.id} href="#" class="${food.isAddedToCart ? "active" : ''} add-to-cart d-flex justify-content-center align-items-center text-decoration-none">
                            <i class="fa-solid fa-cart-plus"></i>
                            <span class="d-inline-block">${food.isAddedToCart ? "Added to cart" : 'Add to cart'}</span>
                        </a>
                    </div>
                </div>`
}
async function categoryByFoodItems(link, callback = () => {}) {
        try {
        let response = await fetch(link);
        let data = await response.json();

        data = Array.isArray(data) ? data : data.data;

        activeFoodItems = data.map(item => {
            checkActivity = activeCartItems.some(activeItems => activeItems.id == item.id)
            return {
                ...item,
                isAddedToCart : checkActivity,
            };
        })
        
        document.getElementById('food_gallery').innerHTML = activeFoodItems.map(food => foodCart(food)).join('');
        callback();
        addToCartHandler()
    } catch (error) {
        console.log(error);
    }
} 

function appendCartItemToHtml() {
    let cartHtml = (food) => {
        return `<tr>
                <td>
                    <img src="${food.image}" alt="img">
                </td>
                <td>
                    <span class="title">${food.name}</span>
                </td>
                <td>
                    <span class="price">Tk: ${food.price}</span>
                </td>
                <td>
                    <div class="quantity-area d-flex align-items-center">
                        <span class="quantity d-block mr-2">${food.quantity}</span>
                        <div class="plus-minus">
                            <ul class="d-flex list-unstyled m-0">
                                <li data-id=${food.id} class="quantity-increment d-flex justify-content-center align-items-center"><i class="fa-solid fa-minus"></i></li>
                                <li data-id=${food.id} class="quantity-decrement d-flex justify-content-center align-items-center"><i class="fa-solid fa-plus"></i></li>
                            </ul>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="total">Tk: ${food.total}</span>
                </td>
                <td>
                    <span class="action">
                        <i data-id=${food.id} class="delete-cart-item fa-solid fa-trash-can"></i>
                    </span>
                </td>
            </tr>`;
    };
    let cartItemLoping = activeCartItems.map(food => {
        return cartHtml(food)
    })
    document.getElementById('cart-item-tabla').innerHTML = cartItemLoping .join('');
}

//******* handler function *********/
async function foodCategories() {
    try {
        let response = await fetch('https://course.divinecoder.com/food-categories')
        let data = await response.json(); 
        document.getElementById('category_list').innerHTML = data.map(item => `<li data-id="${item.id}"><a class="text-decoration-none d-inline-block text-uppercase" href="#">${item.name}</a></li>`).join('');
        foodItemsBtCategory() 
    } catch (error) {
        console.log(error);
    }
}

function foodItemsBtCategory() {
    let lis = document.querySelectorAll('#category_list li')
    let finalLiList = Array.from(lis).map(li => {
        li.addEventListener('click', function (event) {
            event.preventDefault();
            let categoryId = li.getAttribute('data-id');
            li.classList.add('active');
           categoryByFoodItems(`https://course.divinecoder.com/food/by-category/${categoryId}/6`, () => {
            li.classList.remove('active');
           })                                       
        })
    })   
}

function cartItemCount() {
    let cartItemElement = document.querySelectorAll('.cart_item_count');
    let count = activeCartItems.length
    count = count > 9 ? count : '0'+ count;
    Array.from(cartItemElement).forEach(element =>{
        if (count > 0) {
            element.classList.remove('d-none')
        } else {
            element.classList.add('d-none')
        }
        element.textContent = count;
    })
}

function addToCartHandler() {
    let addToCartBtn = document.querySelectorAll('.add-to-cart');
    Array.from(addToCartBtn).forEach(btn => {
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            let id = btn.getAttribute('data-id');
            let cartItem = activeFoodItems.find(item => {
                return item.id == id
            })
            let checkActivity = activeCartItems.some(item => item.id == id);
            if (checkActivity == false) {
                activeCartItems.push({
                    id: cartItem.id,
                    image: cartItem.image,
                    price:Number(cartItem.price),
                    name: cartItem.name,
                    quantity:1,
                    total:Number(cartItem.price)
                });
            }
            cartItemCount();
            appendCartItemToHtml();
            changeButtonDesign(id);
            totalCount();
        })
    })
}

function changeButtonDesign(id) {
    let myButton = document.querySelector(`.add-to-cart[data-id="${id}"]`)    
    myButton.classList.toggle('active');
    if(myButton.classList.contains('active')) {
        myButton.querySelector('span').textContent = 'Added to cart';
    } else {
        myButton.querySelector('span').textContent = 'Add to cart';
    }
}

function removeItemFormCart() {
    let cartTabla = document.getElementById('cart-item-tabla');
    cartTabla.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-cart-item')) {
            let id = event.target.getAttribute('data-id');
            activeCartItems = activeCartItems.filter(function(item) {
                return item.id != id;
            })
            cartItemCount();
            appendCartItemToHtml();
            changeButtonDesign(id);
        }
    }) 
}

function totalCount() {
   let count = activeCartItems.reduce((total, runningItem) => {
        return (total + runningItem.total);
    }, 0)
    let totalText = `Total Amount: ${count.toFixed(2)} Tk`;
    document.getElementById('total-count-element').innerHTML = totalText;
};

function quantityHandler() {
    let cartTabla = document.getElementById('cart-item-tabla');
    cartTabla.addEventListener('click', function(event) {
        if (event.target.closest('.quantity-decrement')) {
            let id = event.target.closest('.quantity-decrement').getAttribute('data-id');
            let targetItem = activeCartItems.find(item => item.id == id);
            if (targetItem.quantity < 5) {
                targetItem = {
                    ...targetItem,
                    quantity: targetItem.quantity + 1,
                    total: targetItem.total + targetItem.price,
                }
                activeCartItems = activeCartItems.map(item => {
                    if (item.id == id) {
                        return targetItem;
                    } else {
                        return item;
                    }
                })
                appendCartItemToHtml()
                totalCount()
            }
        }
        if (event.target.closest('.quantity-increment')) {
            let id = event.target.closest('.quantity-increment').getAttribute('data-id');
            let targetItem = activeCartItems.find(item => item.id == id);
            if (targetItem.quantity > 1) {
                targetItem = {
                    ...targetItem,
                    quantity: targetItem.quantity - 1,
                    total: targetItem.total - targetItem.price,
                }
                activeCartItems = activeCartItems.map(item => {
                    if (item.id == id) {
                        return targetItem;
                    } else {
                        return item;
                    }
                })
                appendCartItemToHtml()
                totalCount()
            }
        }
    }) 
}

// function clearAllTableItem() {
// //   let clearElement =  document.getElementById('clear-table-all-item');
// //   clearElement.addEventListener('click', function (event) { 
// //   })
// document.getElementById('clear-table-all-item').addEventListener('click', function() {
//     const tableBody = document.querySelector('#cartTable tbody');
//     tableBody.innerHTML = ''; // Clear all rows from the table
//     alert('All items cleared from the cart!');
// });  
// }




// document.getElementById('clearAll').addEventListener('click', function() {
//     const tableBody = document.querySelector('#cartTable tbody');
//     tableBody.innerHTML = ''; // Clear all rows from the table
//     alert('All items cleared from the cart!');
// });