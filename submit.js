let API_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders';
let API_KEY = '41056890-bf5a-4257-8b49-7ba891db32da';


export function formatDate(inputDate) { 
    const [year, month, day] = inputDate.split('-');
    return `${day}.${month}.${year}`;
}

export function addNotification(textNotification) {
    let textNotificationDiv = document
        .querySelector("#text-notification");
    let textNotificationTitle = document
        .querySelector("#text-notification-title");
    let textNotificationBtn = document
        .querySelector("#close-notification-btn");
    textNotificationDiv.style.display = "flex";
    textNotificationTitle.style.display = "block";
    textNotificationTitle
        .textContent = textNotification;
    textNotificationBtn.style.display = "block";
}

function resetAllOrder() {
    const form = document.getElementById("form-con");
    if (form) {
        form.reset(); 
    }
 
    const selectedDishesContainer = document
        .querySelector(".main-shop-list");  
    selectedDishesContainer.innerHTML = '';

    localStorage.clear();

    let hideEmptyNotification = document.getElementById("empty-basket");
    hideEmptyNotification.style.display = "block";        
} 

function sendDataToServer(formData) { 
    fetch(`${API_URL}?api_key=${API_KEY}`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => { 
            addNotification("Заказ успешно создан!");
            resetAllOrder();
            console.log('Ответ сервера:', data);
        })
        .catch(error => {
            addNotification('Произошла ошибка при отправке данных.');
            console.error('Ошибка:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => { 
    const submitButton = document.querySelector('#submit-btn');
    const closeButton = document.querySelector('#close-notification-btn');
    const deliveryDateInput = document.querySelector('#delivery_date');
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate .getDate() - 1);
 
    deliveryDateInput.setAttribute('min', yesterdayDate
        .toISOString().split('T')[0]);

    closeButton.addEventListener('click', (event) => {
        let textNotificationDiv = document
            .querySelector("#text-notification");
        let textNotificationTitle = document
            .querySelector("#text-notification-title");
        let textNotificationBtn = document
            .querySelector("#close-notification-btn");
        
        textNotificationBtn.style.display = "none";
        textNotificationDiv.style.height = "0px";
        textNotificationDiv.style.borderTop = "none";
        textNotificationTitle.style.display = "none";
    });

    submitButton.addEventListener('click', (event) => {
        event.preventDefault(); 
 
        const form = document.getElementById("form-con");
        const formData = new FormData(form);
        const formattedDate = formatDate(deliveryDateInput.value); 
        formData.delete("delivery_date");
        formData.append("delivery_date", formattedDate);
        
        if (!form.checkValidity()) {
            addNotification("Заполните все обязательные поля!");
        }

        const deliveryDate = new Date(deliveryDateInput.value); 
        if (deliveryDate <= yesterdayDate) {
            addNotification("Дата или время не может быть в прошлом!");
        }

     
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const itemId = item.getAttribute('data-id');
            if (itemId) {
                formData.append('good_ids', itemId);
            }
        }); 
        if (menuItems.length === 0) {
            addNotification("Выберите блюда для отправки заказа!");
            
        } else {
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
    
            // Отправка данных на сервер
            sendDataToServer(formData);
        }
    });

    
});