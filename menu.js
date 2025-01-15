let API_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods';

function handleProductClick(event) {
    const productCard = event.target.closest('.menu-item');  
    const productId = productCard.getAttribute('data-id');  
 
    let selectedProducts = JSON.parse(localStorage
        .getItem('selectedProducts')) || [];
    if (!selectedProducts.includes(productId)) {
        selectedProducts.push(productId);  
    }
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
 
    productCard.style.border = "2px solid #007bff";  
}
 
function restoreSelectedProducts() {
    const selectedProducts = JSON.parse(localStorage
        .getItem('selectedProducts')) || [];
    
    const allProductCards = document.querySelectorAll('.menu-item');
    allProductCards.forEach(productCard => {
        const productId = productCard.getAttribute('data-id');
        
        if (selectedProducts.includes(productId)) {
            productCard.style.border = "3px solid #add8e6";  
        }
    });
}
 
function handleNewProducts() {
    const selectedProducts = JSON.parse(localStorage
        .getItem('selectedProducts')) || [];

    const allProductCards = document.querySelectorAll('.menu-item');
    allProductCards.forEach(productCard => {
        const productId = productCard.getAttribute('data-id');
        if (selectedProducts.includes(productId) && !productCard.style.border) {
            productCard.style.border = "3px solid #add8e6";  
        }
    });
}

function renderMenu(products) {
    for (let product of products) {
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
        discountPercent
            .textContent = parseInt(((product.actual_price - 
            product.discount_price) 
            / product.actual_price) * 100) + "%";
        discountPercent.className = "discount-percent";

        let addButton = document.createElement("button");
        addButton.className = "button";
        addButton.textContent = "Добавить";
        addButton.addEventListener("click", handleProductClick);

        
        let section = document.body.querySelector(".main-shop-list");
 
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
        
    }
}

async function loadMenu(sortOrder, numPage) {    
    const searchParams = new URLSearchParams({
        'api_key': '41056890-bf5a-4257-8b49-7ba891db32da',
        'page': numPage ? numPage : 1,
        'per_page': '10',
        'sort_order': sortOrder
    });

    fetch(`${API_URL}?${searchParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data); 
            renderMenu(data.goods); 
            if (numPage == data._pagination.per_page) {
                document.querySelector("#btn-download").style.display = "none";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    let numPage = 1;  
    loadMenu("rating_desc", numPage);  
    setTimeout(restoreSelectedProducts, 500);

    document.querySelector("#btn-download")
        .addEventListener("click", function () {
            const value = document.querySelector("#category-list").value;
            numPage += 1;  
            loadMenu(value, numPage);  
            setTimeout(handleNewProducts, 300);
        });
});


document.querySelector("#category-list").addEventListener('change', (event) => {
    const sortValue = event.target.value;
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.remove());
    loadMenu(sortValue);
});
