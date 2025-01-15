let API_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods';

function Product(actual_price, discount_price, name, id) {
    this.actual_price = actual_price,
    this.name = name, 
    this.discount_price = discount_price,
    this.id = id;
}

window.products = {};

function saveProducts(data) {
    products = data.map(item => new Product(
        item.actual_price,
        item.discount_price,
        item.name,
        item.id
    ));

}

async function loadMenu() {    
    const searchParams = new URLSearchParams({
        'api_key': '41056890-bf5a-4257-8b49-7ba891db32da'
    });

    fetch(`${API_URL}?${searchParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data); 
            saveProducts(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.addEventListener('DOMContentLoaded', loadMenu());