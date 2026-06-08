let employees = [];

window.onload = function() {
       // --- MANA SHU YANGI QISMNI QO'SHASAN ---
    if (!document.getElementById('price-container')) {
        const savedPrice = localStorage.getItem('moshinaNarxi') || 50000;
        const priceDiv = document.createElement('div');
        priceDiv.id = 'price-container';
        priceDiv.style.cssText = 'margin-bottom: 15px; display: inline-block; background: #607d8b; color: white; padding: 8px 15px; border-radius: 5px; font-weight: bold; font-family: sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
        priceDiv.innerHTML = `
            Qo'shimcha moshina: 
            <input type="text" id="moshina-price" value="${savedPrice}" oninput="validateNumber(this); updatePrice()" style="width: 80px; padding: 3px; border-radius: 3px; border: none; margin-left: 10px; font-weight: bold; text-align: center; color: black;">
            <span style="margin-left: 5px;">so'm</span>
        `;
        const tbody = document.getElementById('table-body');
        if(tbody) {
            const table = tbody.closest('table');
            table.parentNode.insertBefore(priceDiv, table);
        }
    }
    // --------------------------------------
    loadData();
};



function getDaysCount() {
    const monthVal = document.getElementById('report-month').value;
    if (!monthVal) return 31;
    const [year, month] = monthVal.split('-');
    return new Date(year, month, 0).getDate();
}

function renderHeaders() {
    const days = getDaysCount();
    document.getElementById('top-month-th').colSpan = days + 6; 
    
    let html = `
        <th>№</th>
        <th>Ism Familiya</th>
        <th>Lavozim</th>
        <th>Kunlik pul</th>
    `;
    for(let i = 1; i <= days; i++) {
        html += `<th class="day-cell-${i}" onmouseover="highlightColumn(${i})" onmouseout="removeHighlight(${i})">${i}</th>`;
    }
    html += `
        <th>Moshinalar & Kunlik</th>
        <th>Jami summa</th>
    `;
    document.getElementById('days-header-row').innerHTML = html;
}
// ========================================================


// Senda turg'an keyingi funksiya o'z joyida qoladi:
function updatePrice() {
    localStorage.setItem('moshinaNarxi', document.getElementById('moshina-price').value);
    employees.forEach(emp => calculateTotal(emp.id));
}



     
function updatePrice() {
    localStorage.setItem('moshinaNarxi', document.getElementById('moshina-price').value);
    employees.forEach(emp => calculateTotal(emp.id));
}



function renderTable() {
    renderHeaders(); // <-- Sarlavhani birinchi chizamiz
    
    const tbody = document.getElementById('table-body');
    const daysCount = getDaysCount(); // Oy kunlari: 28, 30 yoki 31
    const colspanTotal = daysCount + 6; // Kataklar sonini avtomat topadi

    if (employees.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colspanTotal}" style="text-align:center; padding: 20px;">Ro\'yxat bo\'sh</td></tr>`;
    } else {
        tbody.innerHTML = employees.map((emp, i) => createRowHTML(emp, i + 1)).join('');
        
        tbody.innerHTML += `
            <tr style="background: #607d8b; color: white; font-weight: bold;">
                <td colspan="${colspanTotal}" style="text-align: center;">
                    JAMI OYLIK: <span id="grand-total-sum">0</span>
                </td>
            </tr>`;
            
        employees.forEach(emp => {
            if (emp.savedData) {
                const posInput = document.getElementById(`pos-${emp.id}`);
                const wageInput = document.getElementById(`wage-${emp.id}`);
                if(posInput) posInput.value = emp.savedData.pos || "";
                if(wageInput) wageInput.value = emp.savedData.wage || "";
                
                // 31 o'rniga daysCount ishlatildi
                for(let i = 1; i <= daysCount; i++) {
                    const p = document.getElementById(`plus-${i}-${emp.id}`);
                    const m = document.getElementById(`minus-${i}-${emp.id}`);
                    if(p) p.value = emp.savedData[`plus-${i}`] || "";
                    if(m) m.value = emp.savedData[`minus-${i}`] || "";
                }
                calculateTotal(emp.id);
            }
        });
    }
    saveData();
}
             
        function createRowHTML(emp, number) {
    const posInput = document.getElementById(`pos-${emp.id}`);
    const posVal = posInput ? posInput.value : (emp.savedData && emp.savedData.pos ? emp.savedData.pos : "");
    const isOperator = posVal.trim().toLowerCase() === 'operator';
    const daysCount = getDaysCount(); // <--- YANGI: Kunlar sonini aqlli aniqlaydi
    
    let days = '';
    for(let i = 1; i <= daysCount; i++) { // <--- 31 o'rniga daysCount qo'yildi
        days += `<td class="day-cell-${i}" onmouseover="highlightColumn(${i})" onmouseout="removeHighlight(${i})" style="padding: 0;">






                    <input type="text" id="plus-${i}-${emp.id}" oninput="validateSymbol(this); calculateTotal(${emp.id})" style="border:none; width: 100%; text-align:center; display:block; border-bottom:${isOperator ? '1px solid #ccc' : 'none'};">
                    ${isOperator ? `<input type="text" id="minus-${i}-${emp.id}" oninput="validateNumber(this); calculateTotal(${emp.id})" style="border:none; width: 100%; text-align:center; display:block;">` : ''}
                 </td>`;
    }

    return `<tr id="row-${emp.id}">
            <td style="text-align:center;">${number}</td>
            <td style="position: relative; text-align: left; padding-left: 10px; padding-right: 30px;">
                ${emp.name}
                <button class="delete-btn" onclick="removeEmployee(${emp.id})">×</button>
            </td>
            <td><input type="text" id="pos-${emp.id}" value="${posVal}" onblur="updateRow(${emp.id})" style="width: 80px;"></td>
            <td><input type="text" id="wage-${emp.id}" oninput="validateNumber(this); calculateTotal(${emp.id})" style="width: 70px;"></td>
            ${days}
            <td><input type="text" id="extra-${emp.id}" readonly style="width: 70px; background:#f9f9f9; text-align:center;"></td>
            <td class="emp-total" id="total-${emp.id}" style="font-weight:bold; text-align:center;">0</td></tr>`;
}

function calculateTotal(empId) {

    


    const wage = parseFloat(document.getElementById(`wage-${empId}`).value) || 0;
    const moshinaNarxi = parseFloat(localStorage.getItem('moshinaNarxi') || 50000);



    let total = 0, totalPlusSoni = 0, totalMoshinaSoni = 0;
    
    let savedData = { pos: document.getElementById(`pos-${empId}`).value, wage: wage };

    const daysCount = getDaysCount(); // <--- YANGI: Kunlar sonini aqlli aniqlaydi
    for(let i = 1; i <= daysCount; i++) { // <--- 31 o'rniga daysCount qo'yildi
        const plusVal = document.getElementById(`plus-${i}-${empId}`).value;
        const minusEl = document.getElementById(`minus-${i}-${empId}`);

   


        // 1. Plyuslarni Hamma Lavozim uchun hisoblash
        if (plusVal !== '') {
               if (plusVal === '0.5') {
                      totalPlusSoni +=0.5;
                      total += wage /2;
               }else {
            const plusCount = (plusVal.match(/\+/g) || []).length;
            totalPlusSoni += plusCount;
            total += plusCount * wage;
        }}
        
        // 2. Moshina sonlarini faqat Operatorlar uchun hisoblash
        if(minusEl && minusEl.value !== '') {
            totalMoshinaSoni += parseFloat(minusEl.value) || 0;
        }
        
        savedData[`plus-${i}`] = plusVal;
        savedData[`minus-${i}`] = minusEl ? minusEl.value : "";
    }
    
    // Extra qatoriga Plyuslarni har doim yozamiz
    // Agar operator bo'lsa Plyus + Moshina (format: +X|MY), bo'lmasa faqat +X
    const extraField = document.getElementById(`extra-${empId}`);
     if (totalMoshinaSoni > 0) {
        extraField.value = `${totalPlusSoni}K|${totalMoshinaSoni}ta`;
    } else {
        extraField.value = `${totalPlusSoni}K`;
    }
    
    // Umumiy Jami hisoblash
    let totalSumma = total + (totalMoshinaSoni * moshinaNarxi);
    document.getElementById(`total-${empId}`).innerText = totalSumma.toLocaleString();
    
    const emp = employees.find(e => e.id === empId);
    if(emp) emp.savedData = savedData;
    
    saveData();
    updateGrandTotal();
}

function updateGrandTotal() {
    let grandSum = 0;
    document.querySelectorAll('.emp-total').forEach(el => {
        let tozaRaqam = el.innerText.replace(/[^0-9]/g, '');
         grandSum += parseFloat(tozaRaqam || 0);
    });
    const grandEl = document.getElementById('grand-total-sum');
    if (grandEl) grandEl.innerText = grandSum.toLocaleString();
}

function getStorageKey() {
    const month = document.getElementById('report-month').value;
    return `${month}_employees`;
}

function saveData() {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(employees));
}

function loadData() {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    employees = saved ? JSON.parse(saved) : [];
    renderTable();
}

function updateRow(empId) {
    calculateTotal(empId); // Avval bor raqamlarni yo'qotmaslik uchun xotiraga saqlab olamiz
    renderTable(); // Keyin butun jadvalni toza qilib qayta chizamiz
}

function validateSymbol(input) { 
    let toza = input.value.replace(/[^+\-0\.5]/g, '');
    if (toza.includes('+') || toza.includes('-')) {
        input.value = toza.substring(0, 2);
    }else {
        input.value = toza.substring(0, 3); }}


function validateNumber(input) { input.value = input.value.replace(/[^0-9]/g, ''); }
function addEmployee() { const name = prompt("Ism Familiya:"); if(name) { employees.push({id: Date.now(), name}); renderTable(); } }
function removeEmployee(id) { if(confirm("O'chirmoqchimisiz?")) { employees = employees.filter(e => e.id !== id); renderTable(); } }
function highlightColumn(d) { document.querySelectorAll(`.day-cell-${d}`).forEach(c => c.classList.add('highlight-column')); }
function removeHighlight(d) { document.querySelectorAll(`.day-cell-${d}`).forEach(c => c.classList.remove('highlight-column')); }





