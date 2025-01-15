import {
    addNotification
} from "./submit.js";

let API_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods';

function getSelectedProductsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('selectedProducts')) || [];
}

function deleteProduct(productId, products) {
    let allProductsInBasket = document.querySelectorAll('.menu-item');

    allProductsInBasket.forEach(item => {
        const itemId = item.getAttribute('data-id');
        if (itemId == productId) {
            item.style.display = "none";
            const selectedProducts = getSelectedProductsFromLocalStorage(); 
            const newProducts = selectedProducts
                .filter((number) => Number(number) !== productId);
            localStorage.clear();
            
            localStorage
                .setItem("selectedProducts", JSON.stringify(newProducts));
            const productPrice = products.find(p => p.id === productId)
                .discount_price || 
                products.find(p => p.id === productId).actual_price;

            const totalPriceElement = document.getElementById('total-price');
            const currentTotal = parseInt(totalPriceElement
                .textContent.match(/\d+/)); 
            const newTotal = currentTotal - productPrice;
            totalPriceElement.textContent = `Итоговая стоимость: ${newTotal} ₽`;
        }

        addNotification("Продукт удален из корзины");
        
    }); 
    const selectedProducts = getSelectedProductsFromLocalStorage(); 
    
    if (selectedProducts.length === 0) {
        let hideEmptyNotification = document.getElementById("empty-basket");
        hideEmptyNotification.style.display = "block";        
    }
}

function renderBasket(products) { 
    const selectedProducts = getSelectedProductsFromLocalStorage();  
    if (selectedProducts.length != 0) {
        let hideEmptyNotification = document.getElementById('empty-basket');
        hideEmptyNotification.style.display = 'none';        
    }
    
    const productsInBasket = [];
    let totalSum = 0;

    // Проходим по каждому продукту
    for (let product of products) { 
        if (selectedProducts.includes(String(product.id))) {
            productsInBasket.push(product);
            totalSum += product.discount_price || product.actual_price;
        }
    }

    const totalPriceElement = document.getElementById('total-price');
    totalPriceElement.textContent = `Итоговая стоимость: ${totalSum + 500} ₽`;
 
    const section = document.body.querySelector('.main-shop-list');
    section.innerHTML = '';  

    // Рендерим только выбранные продукты
    productsInBasket.forEach(product => {
        let productCard = document.createElement('div');
        productCard.className = "menu-item";
        productCard.setAttribute("data-id", product.id);
        productCard.style.flexFlow = "column";

        let productImgDiv = document.createElement('div');
        productImgDiv.className = "image-div";

        let productImg = document.createElement('img');
        productImg.className = "product-img";
        productImg.src = product.image_url;

        let productDiv = document.createElement('div');
        productDiv.className = "product-div";

        let productName = document.createElement('p');
        productName.textContent = product.name;
        productName.className = "product-name";

        let ratingDiv = document.createElement('div');
        ratingDiv.className = "rating-div";

        let productRating = document.createElement('p');
        productRating.textContent = product.rating;
        productRating.className = "product-rating";

        let priceDiv = document.createElement('div');
        priceDiv.className = "price-div";

        let productPrice = document.createElement('p');
        productPrice.textContent = `${product.discount_price} ₽`;
        productPrice.className = "product-price";

        let discountPrice = document.createElement('p');
        discountPrice.textContent = `${product.actual_price} ₽`;
        discountPrice.className = "discount-price";

        let discountPercent = document.createElement('p');
        discountPercent.textContent = parseInt(((product.actual_price - 
            product.discount_price) / product.actual_price) * 100) + "%";
        discountPercent.className = "discount-percent";

        let addButton = document.createElement("button");
        addButton.className = "button";
        addButton.textContent = "Удалить";
        addButton.addEventListener("click", () => 
            deleteProduct(product.id, products));

        section.append(productCard);
        productCard.append(productImgDiv);
        productImgDiv.append(productImg);
        productCard.append(productDiv);
        productDiv.append(productName);
        productDiv.append(ratingDiv);
        ratingDiv.append(productRating);

        const fullStars = Math.floor(product.rating);  
        const halfStar = product.rating % 1 >= 0.5;  
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);  
        for (let i = 0; i < fullStars; i++) {
            let starRatingFill = document.createElement('i');
            starRatingFill.classList.add('bi', 'bi-star-fill', 'star-rating');
            ratingDiv.appendChild(starRatingFill);
        }
        if (halfStar) {
            let starRatingHalf = document.createElement('i');
            starRatingHalf.classList.add('bi', 'bi-star-half', 'star-rating');
            ratingDiv.appendChild(starRatingHalf);
        }
        for (let i = 0; i < emptyStars; i++) {
            let starRatingEmpty = document.createElement('i');
            starRatingEmpty.classList.add('bi', 'bi-star', 'star-rating');
            ratingDiv.appendChild(starRatingEmpty);
        }

        productDiv.append(priceDiv);
        if (product.discount_price) {
            priceDiv.append(productPrice);
            priceDiv.append(discountPrice);
            priceDiv.append(discountPercent);
        } else {
            productPrice.textContent = product.actual_price;
            priceDiv.append(productPrice);
        }
        productDiv.append(addButton);
    });
}

async function loadMenu() {    
    const searchParams = new URLSearchParams({
        'api_key': '41056890-bf5a-4257-8b49-7ba891db32da'
    });

    fetch(`${API_URL}?${searchParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data); 
            renderBasket(data); 
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.addEventListener('DOMContentLoaded', loadMenu());