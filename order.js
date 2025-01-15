import { 
    addNotification,
    formatDate,
} from "./submit.js";

let API_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders';
let API_KEY = '41056890-bf5a-4257-8b49-7ba891db32da';

function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
} 
function calculateTotalPrice(products, goodIds) {
    let totalPrice = 0; 
    
    goodIds.forEach(ident => {
        for (let prod of products) {
            if (prod.id == ident) {
                totalPrice += prod.discount_price || prod.actual_price; 
            }
        }
    });

    return totalPrice;
}

function getAllNames(products, goodIds) {
    let name = ""; 
    let shortName = "";
    goodIds.forEach(ident => {
        for (let prod of products) {
            if (prod.id == ident) {
                name += prod.name; 
                shortName += prod.name.substring(0, 61) + " ";
            }
        }
    });

    return [name, shortName];
}

function watchOrder(order, totalPrice, names) {
    let section = document.getElementById("modal-window-watch");
    section.style.display = "block";
    let overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    let dataCreate = document.body.querySelector(".modal-window-time");
    dataCreate.textContent = formatDateTime(order.created_at);
     
    let fullName = document.body.querySelector(".modal-window-name");
    fullName.textContent = order.full_name;

    let phoneNumber = document.body.querySelector(".modal-window-phone");
    phoneNumber.textContent = order.phone;

    let email = document.body.querySelector(".modal-window-email");
    email.textContent = order.email;

    let deliveryAddress = document.body
        .querySelector(".modal-window-address");
    deliveryAddress.textContent = formatDate(order.delivery_address);

    let deliveryDate = document.body
        .querySelector(".modal-window-delivery-date");
    deliveryDate.textContent = formatDate(order.delivery_date);

    let deliveryTime = document.body
        .querySelector(".modal-window-delivery-time");
    deliveryTime.textContent = order.delivery_interval;

    let deliveryName = document.body.querySelector(".modal-window-dishes");
    deliveryName.textContent = names;

    let deliveryPrice = document.body
        .querySelector(".modal-window-total-price");
    deliveryPrice.textContent = totalPrice + " ₽";

    let deliveryComment = document.body.querySelector(".modal-window-comment");
    deliveryComment.textContent = order.comment || "Нет";
} 

async function finalDeleteOrder(orderId) { 
    fetch(`${API_URL}/${orderId}?api_key=${API_KEY}`,
        {method: 'DELETE'})
        .then(response => response.json())
        .then(addNotification("Успешно удалено"))
        .catch(error => {
            addNotification("Error" + error);
        });

    let modalWindow = document.getElementById("modal-window-delete");
    modalWindow.style.display = "none"; 
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";

    const ordersTables = document.querySelectorAll(".row-table"); 
    ordersTables.forEach(item => {
        const itemId = item.getAttribute('data-id');
        if (itemId == orderId) {
            item.innerHTML = "";
        }
    });
}

function deleteOrder(orderId) {
    let section = document.getElementById("modal-window-delete");
    section.style.display = "block";
    let overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    
    let deleteBtn = document.getElementById('delete-btn');
    deleteBtn.addEventListener('click', (event) => finalDeleteOrder(orderId));
}

async function finalEditOrder(orderId) {
    event.preventDefault(); 
    
    const yesterdayDate = new Date();
    const deliveryDateInput = document.querySelector('#delivery_date');
    const form = document.getElementById("edit-form");
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

    for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    fetch(`${API_URL}/${orderId}?api_key=${API_KEY}`, {
        method: 'PUT',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => { 
            console.log('Ответ сервера:', data);
            let modalWindow = document.getElementById("modal-window-edit");
            modalWindow.style.display = "none"; 
            const overlay = document.getElementById("overlay");
            overlay.style.display = "none";
            location.reload();
            // addNotification("Заказ успешно обновлен!");
        }) 
        .catch(error => {
            addNotification('Произошла ошибка при обновлении данных.');
            console.error('Ошибка:', error);
        });
}

function editOrder(order, totalPrice, names) {
    let section = document.getElementById("modal-window-edit");
    section.style.display = "block";
    let overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    let dataCreate = document.body.querySelector(".modal-window-time-edit");
    dataCreate.textContent = formatDateTime(order.created_at);

    let deliveryName = document.body.querySelector(".modal-window-dishes-edit");
    deliveryName.textContent = names;

    let deliveryPrice = document.body
        .querySelector(".modal-window-total-price-edit");
    deliveryPrice.textContent = totalPrice + " ₽";

    let fullName = document.getElementById("full_name");
    fullName.value = order.full_name;

    let phone = document.getElementById('phone');
    phone.value = order.phone;
    
    let email = document.getElementById('email');
    email.value = order.email;
    
    let deliveryAddress = document.getElementById('delivery_address');
    deliveryAddress.value = order.delivery_address;

    let deliverDate = document.getElementById('delivery_date');
    deliverDate.value = order.delivery_date;

    let deliverInterval = document.getElementById('delivery_interval');
    deliverInterval.value = order.delivery_interval;

    let comment = document.getElementById('comment');
    comment.value = order.comment;

    let editBtn = document.getElementById('save-btn');
    editBtn.addEventListener('click', (event) => finalEditOrder(order.id));
}

function renderOrder(orders) {
    console.log(products);

    let orderNum = 1;
    const ordersTable = document.getElementById("orders-table");
    for (let order of orders) {
        // console.log(order);
        const row = document.createElement("tr");
        row.setAttribute("data-id", order.id);
        row.className = "row-table";
        let namesProduct = getAllNames(products, order.good_ids)[0];
        let totalPrice = calculateTotalPrice(products, order.good_ids);
        row.innerHTML = `
            <td>${orderNum}.</td>
            <td class="data-create">${formatDateTime(order.created_at)}</td>    
            <td>${namesProduct}</td>
            <td>${totalPrice} ₽</td>
            <td>${formatDate(order.delivery_date)}
            <br>${order.delivery_interval}</td>
            `;

        
        ordersTable.appendChild(row);

        let tdSection = document.createElement('td');
        tdSection.className = "table-icon-con";

        let aBtnWatch = document.createElement('a');
        aBtnWatch.href = "#";

        let watchButton = document.createElement('i');
        watchButton.classList
            .add('bi', 'bi-eye-fill', 'table-icons', 'watch-btn');
        watchButton.setAttribute("data-id", order.id);
        watchButton.addEventListener("click", function (event) {
            watchOrder(order, totalPrice, namesProduct); 
        });

        let aBtnEdit = document.createElement('a');
        aBtnEdit.href = "#";

        let editButton = document.createElement('i');
        editButton
            .classList.add('bi', 'bi-pencil-fill', 'table-icons', 'edit-btn');
        editButton.setAttribute("data-id", order.id);
        editButton.addEventListener("click", function (event) {
            editOrder(order, totalPrice, namesProduct); 
        });

        let aBtnDelete = document.createElement('a');
        aBtnDelete.href = "#";

        let deleteButton = document.createElement('i');
        deleteButton
            .classList.add('bi', 'bi-trash3-fill', 'table-icons', 'delete-btn');
        deleteButton.setAttribute("data-id", order.id);
        deleteButton.addEventListener("click", function (event) {
            deleteOrder(order.id); 
        });

        row.append(tdSection);
        tdSection.append(aBtnWatch);
        aBtnWatch.append(watchButton);
        tdSection.append(aBtnEdit);
        aBtnEdit.append(editButton);
        tdSection.append(aBtnDelete);
        aBtnDelete.append(deleteButton);

        orderNum++;
    }
}
 
function resetListOrder() {

}

async function loadOrder() {    
    const searchParams = new URLSearchParams({
        'api_key': '41056890-bf5a-4257-8b49-7ba891db32da'
    });

    fetch(`${API_URL}?${searchParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data); 
            renderOrder(data); 
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


document.addEventListener('DOMContentLoaded', () => {
    loadOrder();
    let overlay = document.getElementById("overlay");
    let modalWatch = document.getElementById("modal-window-watch");
    let closeModalWatchBtn = document.getElementById("close-modal-watch");
    let okModalWatchBtn = document.getElementById("ok-watch-btn");
    closeModalWatchBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        modalWatch.style.display = "none";
    });
    okModalWatchBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        modalWatch.style.display = "none";
    });
    
    let modalDelete = document.getElementById("modal-window-delete");
    let closeModalDeleteBtn = document.getElementById('close-modal-delete');
    let cancelBtn = document.getElementById('cancel-btn');
    closeModalDeleteBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        modalDelete.style.display = "none";
    });
    cancelBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        modalDelete.style.display = "none";
    });

    let modalEdit = document.getElementById("modal-window-edit");
    let closeModalEditBtn = document.getElementById('close-modal-edit');
    let cancelEditBtn = document.getElementById('cancel-edit-btn');
    closeModalEditBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        modalEdit.style.display = "none";
    });
    cancelEditBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        modalEdit.style.display = "none";
    });
    
});