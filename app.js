function fetchData(numOfPages) {
    return fetch('https://api.valantis.store:41000/', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth': MD5('Valantis_' + y + m + d),
        },
        body: JSON.stringify({
            action: 'get_ids',
            params: {
                "offset": 50 * (numOfPages - 1),
                "limit": 50
            }
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const dataId = [];
            data.result.forEach(item=>dataId.push(item))
            return dataId;
        })
        .catch(error => {
            console.log(error);
            displayError();
            return 0;
        });
}

function spreadFilteredData(data) {
    const len = data.length;
    let spreadMassive = [];
    let j = 0;
    for (let i = 0; i < len; i++) {
        if (!spreadMassive[j]) {
            spreadMassive[j] = [];
        }
        spreadMassive[j].push(data[i]);
        if ((i + 1) % 50 === 0) {
            j++;
        }
    }
    return spreadMassive;
}
function filterFetchData(category, value) {
    const params = {};
    params[category] = value;
    return fetch('https://api.valantis.store:41000/', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth': MD5('Valantis_' + y + m + d),
        },
        body: JSON.stringify({
            action: "filter",
            params: params
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const dataId = [];
            data.result.forEach(item=>dataId.push(item))
            return dataId;
        })
        .catch(error => {
            console.log(error);
            displayError();
            return 0;
        });
}
function get_items(dataId) {
    return fetch('https://api.valantis.store:41000/', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth': MD5('Valantis_' + y + m + d),
        },
        body: JSON.stringify({
            "action": "get_items",
            "params": {"ids": dataId}//"ids": [""]
        })
    })
        .then(response => response.json())
        .then(data => {
            // обрабатываем полученные данные
            const resultMassive = [];
            data.result.forEach(item => resultMassive.push(item));
            return resultMassive;
        })
        .catch(error => {
            console.log(error);
            displayError();
            return 0;
        });
}

function uniqueArray(array){
    return array.reduce((unique, item) => {
        const existingItem = unique.find(element => element.id === item.id);
        if (!existingItem) {
            unique.push(item);
        }
        return unique;
    }, []);
}

function cards(data){
    const cardContainer = document.getElementById('card-container');
    for (let i = 0; i < data.length; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        let brandName = data[i].brand;
        if  (brandName === null){
            brandName = 'Неизвестный'
        }
        card.innerHTML=`
        <div class="name">${data[i].product}</div>
        <div class="brand">бренд: ${brandName}</div>
        <div class="price">цена: ${data[i].price}</div>
        <div class="id">id: ${data[i].id}</div>
    `;
        cardContainer.appendChild(card);
    }
}

async function displayList(numOfPage, option, value){
    let dataId = [];
    if (option === 'get_ids'){
        dataId = await fetchData(numOfPage);
        const items_info = await get_items(dataId);
        const unique_items_info = uniqueArray(items_info);
        cards(unique_items_info)
    } else if (option === 'filter_price'){
        dataId = await filterFetchData('price', parseInt(value));
        const dataIdOfPage = spreadFilteredData(dataId);
        len = dataIdOfPage.length;
        if (len === 0){
            EmptyList()
        } else {
            const items_info = await get_items(dataIdOfPage[numOfPage-1]);
            const unique_items_info = uniqueArray(items_info)
            cards(unique_items_info)
        }
    } else if (option === 'filter_product'){
        dataId = await filterFetchData('product', value);
        const dataIdOfPage = spreadFilteredData(dataId);
        len = dataIdOfPage.length;
        console.log(dataIdOfPage)
        console.log(len)
        if (len === 0){
            EmptyList()
        } else {
            const items_info = await get_items(dataIdOfPage[numOfPage-1]);
            const unique_items_info = uniqueArray(items_info)
            cards(unique_items_info)
        }
    } else if (option === 'filter_brand'){
        dataId = await filterFetchData('brand', value);
        const dataIdOfPage = spreadFilteredData(dataId);
        len = dataIdOfPage.length;
        if (len === 0){
            EmptyList()
        } else {
            const items_info = await get_items(dataIdOfPage[numOfPage-1]);
            const unique_items_info = uniqueArray(items_info)
            cards(unique_items_info)
        }
    } else {
        console.log('error in option')
        displayError();
    }
}
function displayError(){
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ``;
    const text = document.createElement('div')
    text.textContent = 'Ошибка на сервере, перезагрузите страницу'
    cardContainer.appendChild(text)
}

function displayPagination(numOfPage){
    const pagination = document.getElementById('pagination');
    const pagesBtnNext = document.createElement("div");
    const pagesBtnCur = document.createElement("div");
    const pagesBtnPrev = document.createElement("div");
    if (numOfPage!==1){
        pagesBtnPrev.innerText=`<< Предыдущая`;
        pagesBtnPrev.classList.add('pagination__item-prev');
        pagination.appendChild(pagesBtnPrev);
        displayPaginationBtn(pagesBtnPrev, -1, numOfPage)
    } else {
        pagesBtnPrev.innerText=``;
        pagesBtnPrev.classList.add('pagination__item-prev')
        pagination.appendChild(pagesBtnPrev)
    }
    pagesBtnCur.innerText=`${numOfPage} стр`;
    pagesBtnCur.classList.add('pagination__item--active');
    pagesBtnNext.innerText=`Следующая >>`;
    pagesBtnNext.classList.add('pagination__item-next');
    pagination.appendChild(pagesBtnCur);
    pagination.appendChild(pagesBtnNext);
    displayPaginationBtn(pagesBtnNext, 1, numOfPage)
}
function displayPaginationBtn(pagesBtn, direction, numOfPage){
    pagesBtn.addEventListener("click", async ()=>{

        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML=``;
        await displayList(numOfPage+direction, 'get_ids');
        const pagination = document.getElementById('pagination');
        pagination.innerHTML=``;
        displayPagination(numOfPage+direction)
    });
}
function displayPaginationFilter(numOfPage, value, len,option){
    const pagination = document.getElementById('pagination');
    pagination.innerHTML=``;
    const pagesBtnNext = document.createElement("div");
    const pagesBtnCur = document.createElement("div");
    const pagesBtnPrev = document.createElement("div");
    if (numOfPage!==1){
        pagesBtnPrev.innerText=`<< Предыдущая`;
        pagesBtnPrev.classList.add('pagination__item-prev');
        pagination.appendChild(pagesBtnPrev);
        displayPaginationBtnFilter(pagesBtnPrev, -1, numOfPage, value)
    } else {
        pagesBtnPrev.innerText=``;
        pagesBtnPrev.classList.add('pagination__item-prev')
        pagination.appendChild(pagesBtnPrev)
    }

    pagesBtnCur.innerText=`${numOfPage} стр`;
    pagesBtnCur.classList.add('pagination__item--active');
    pagination.appendChild(pagesBtnCur);

    if (numOfPage >= len){
        pagesBtnNext.innerText=``;
        pagesBtnNext.classList.add('pagination__item-next');
        pagination.appendChild(pagesBtnNext);
    } else {
        pagesBtnNext.innerText=`Следующая >>`;
        pagesBtnNext.classList.add('pagination__item-next');
        pagination.appendChild(pagesBtnNext);
        displayPaginationBtnFilter(pagesBtnNext, 1, numOfPage, value, option)
    }
}

function displayPaginationBtnFilter(pagesBtn, direction, numOfPage, value, option){
    pagesBtn.addEventListener("click", async ()=>{

        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML=``;
        await displayList(numOfPage+direction, option, value);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML=``;
        displayPaginationFilter(numOfPage+direction, value, len, option)
    });
}

function EmptyList(){ //выбрать фильтр или стандартный id список для displayList
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ``;
    const text = document.createElement('div')
    text.textContent = 'Товаров по подобранному фильтру не найдено'
    cardContainer.appendChild(text)
}
function getValuePriceFilter() {
    const input = document.getElementById("price_to");
    const priceBtn = document.getElementById("price_btn")
    priceBtn.addEventListener("click", async (event)=>{
        event.preventDefault();
        const value = input.value;
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = ``;
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = ``;
        await displayList(1, 'filter_price',value);
        displayPaginationFilter(1, value, len,'filter_price');
    })
}

function getValueBrandFilter(obj) {
    obj.addEventListener("click", async(event)=>{
        event.preventDefault();
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = ``;
        await displayList(1, 'filter_brand',obj.textContent);
        displayPaginationFilter(1, obj.textContent, len, 'filter_brand');
    })
}

function getValueProductFilter() {
    const input = document.getElementById("product-name");
    const productBtn = document.getElementById("product_btn")
    productBtn.addEventListener("click", async (event)=>{
        event.preventDefault();
        const value = input.value;
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = ``;
        await displayList(1, 'filter_product',value);
        displayPaginationFilter(1, value, len, 'filter_product');
    })
}

function deleteFilters(){
    const deleteFilterButton = document.getElementById('deleteFilter');
    deleteFilterButton.addEventListener('click', ()=>{
        location.reload();
    })
}

function filterControlPanel(){ //панель фильтра
    const priceButton = document.getElementById('priceBtn');
    const priceSet = document.getElementById('priceSet');
    const brandsButton = document.getElementById('brandsBtn');
    const brandsSet = document.getElementById('brandsSet');
    const productButton = document.getElementById('productBtn');
    const productSet = document.getElementById('productSet');
    let priceDoubleClick = 0;
    let brandDoubleClick = 0;
    let productDoubleClick = 0;
    const funcDoubleClick = function (typeDoubleClick, Button){
        if (typeDoubleClick === 0){
            Button.classList.remove('activeBtn')
        }
    }
    const clearBrandList = function (typeDoubleClick, brandList) {
        if (typeDoubleClick === 0){
            brandList.innerHTML=``;
        }
    }
    priceButton.addEventListener('click', function() {
        priceButton.classList.add('activeBtn');
        priceSet.style.display = (priceSet.style.display === 'block') ? 'none' : 'block';
        priceDoubleClick = (priceDoubleClick === 1) ? 0:1;
        funcDoubleClick(priceDoubleClick, priceButton)
    });
    brandsButton.addEventListener('click', async function () {
        let fetchedBrandLists = await brandList();
        brandsButton.classList.add('activeBtn');
        const brandsList = document.getElementById('brandsList');
        for (let value of fetchedBrandLists) {
            let div = document.createElement("div");
            div.classList.add("brandName")
            div.textContent = value;
            brandsList.appendChild(div);
            getValueBrandFilter(div);
        }
        brandDoubleClick = (brandDoubleClick === 1) ? 0:1;
        clearBrandList(brandDoubleClick, brandsList);
        funcDoubleClick(brandDoubleClick, brandsButton)
        brandsSet.style.display = (brandsSet.style.display === 'block') ? 'none' : 'block';
    });
    productButton.addEventListener('click', function() {
        productSet.style.display = (productSet.style.display === 'block') ? 'none' : 'block';
        productButton.classList.add('activeBtn');
        productDoubleClick = (productDoubleClick === 1) ? 0:1;
        funcDoubleClick(productDoubleClick, productButton)
    });
}

function brandList(){
    return fetch('https://api.valantis.store:41000/', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth': MD5('Valantis_' + y + m + d),
        },
        body: JSON.stringify({
            action: 'get_fields',
            params: {
                "field": "brand",
                "limit": 1000,
            }
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const dataSet = new Set(data.result);
            return dataSet;
        })
        .catch(error => {
            console.log(error);
            displayError();
            return 0;
        });
}

const MD5=function(d){d=unescape(encodeURIComponent(d));result=M(V(Y(X(d),8*d.length)));return result.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_};
const currDate = new Date();
const y = currDate.getUTCFullYear();
const m = String(currDate.getUTCMonth() + 1).padStart(2, '0');
const d = String(currDate.getUTCDate()).padStart(2, '0');
let len; //длина массива ID товаров подобранных по фильтру

displayList(1, 'get_ids')
displayPagination(1)
getValuePriceFilter()
getValueProductFilter()
filterControlPanel();
deleteFilters();
