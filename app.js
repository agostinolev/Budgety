// The code will be divided in three controller

//Budget controller

var budgetController = ( function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPerc = function(totalInc) {
		if (totalInc > 0) {
			this.percentage = Math.round(this.value/ totalInc * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPerc = function () {
		return this.percentage;
	}

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},

		totals: {
			exp: 0,
			inc: 0
		},
		
		budget: 0,
		percentage: -1
	};

	var calcTotals = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(current,){
			sum += current.value;
		});
		return sum;
	}

	return {
		
		addItem: function (type, descr, val){
			var newItem, ID;
			if(data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			if (type === 'inc')	{
				newItem = new Income(ID, descr,val);
			} else if (type === 'exp'){
				newItem = new Expense(ID, descr,val);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},

		removeItem: function(type, id){
			var ids, indexID;
			ids = data.allItems[type].map(function(current){
				return current.id
			});

			indexID = ids.indexOf(id);

			data.allItems[type].splice(indexID,1);
		},

		calcBudget: function() {
			data.totals.exp = calcTotals('exp');
			data.totals.inc = calcTotals('inc');
			data.budget = data.totals.inc - data.totals.exp;
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}

		},

		calcPercentages: function() {
			data.allItems.exp.forEach( function(current){
				current.calcPerc(data.totals.inc)
			});
		},

		getPercentages: function () {
			var percentages = data.allItems.exp.map ( function(current){
				return current.getPerc();
			});
			return percentages;
		},

		getBudget: function(){
			return {
				totalExp: data.totals.exp,
				totalInc: data.totals.inc,
				totalBudget: data.budget,
				totalPerc: data.percentage
			};
		},

		testing: function(){
			return data;
		}

	};

}) ();




// UI controller
var UIController = ( function(){

	var nodeListForEach = function( list, callback ) {
		for (var i = 0; i < list.length; i ++){
			callback(list[i],i);
		}
	};
	
	var formatNumber = function(num, type) {

		var numSplit, int, dec,sign;
		num = Math.abs(num);
		if (num === 0) type = 'null';

		num = num.toFixed(2);


		numSplit = num.split('.');
		int = numSplit[0];
		dec = numSplit[1];

		if(int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		};

		if (type === 'exp') {
			sign = '-';
		} else if (type === 'inc') {
			sign = '+';
		} else if (type === 'null') {
			sign = '';
		}

		return sign + int + '.' + dec;
	};


	var DOMstrings = {
		addBtn: '.add__btn',
		addType: '.add__type',
		addDescription: '.add__description',
		addValue: '.add__value',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetValue: '.budget__value',
		budgetIncome: '.budget__income--value',
		budgetExpenses: '.budget__expenses--value',
		budgetPercentage: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		monthLabel: '.budget__title--month'
	};

	return {
		getDOM: function() {
			return DOMstrings;
		},

		getInput: function() {
			var description = document.querySelector(DOMstrings.addDescription).value;
			var value = parseFloat(document.querySelector(DOMstrings.addValue).value);
			if(description === "") {
				document.querySelector(DOMstrings.addDescription).classList.add('error');
				document.querySelector(DOMstrings.addDescription).placeholder = 'The description is empty!';
			} else {
				document.querySelector(DOMstrings.addDescription).classList.remove('error');
				document.querySelector(DOMstrings.addDescription).placeholder = 'Add description';
			}
			if (isNaN(value)){
				document.querySelector(DOMstrings.addValue).classList.add('error');
				document.querySelector(DOMstrings.addValue).placeholder = 'Empty';
			} else {
				document.querySelector(DOMstrings.addValue).classList.remove('error');
				document.querySelector(DOMstrings.addValue).placeholder = 'Value';
			}

			return {
				type: document.querySelector(DOMstrings.addType).value,
				description: description,
				value: value
			}
		},

		addListItem: function(obj, type){
			var element, html, newhtml;
			if (type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp'){
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data			
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		removeListItem: function(itemID){

			el = document.getElementById(itemID);
            el.parentNode.removeChild(el);

		},

		upgPercentages: function(totPerc){

			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach ( fields, function (current, index){
				if (totPerc[index] > 0) {
					current.textContent = totPerc[index] + '%';
				} else {
					current.textContent = '---';
				}

			});

		},

		clearFields: function(){
			var fields, fieldsArr;
            
			fields = document.querySelectorAll(DOMstrings.addDescription + ', ' + DOMstrings.addValue);
            
			fieldsArr = Array.prototype.slice.call(fields);
            
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
            
			fieldsArr[0].focus();
		},

		upgBudget: function(obj) {
			var type = (obj.totalBudget > 0) ? 'inc' : 'exp';

			document.querySelector(DOMstrings.budgetExpenses).textContent = formatNumber(obj.totalExp,'exp');
			document.querySelector(DOMstrings.budgetIncome).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.totalBudget, type);
			if (obj.totalPerc > 0) {
				document.querySelector(DOMstrings.budgetPercentage).textContent = obj.totalPerc +'%';
			} else {
				document.querySelector(DOMstrings.budgetPercentage).textContent = '---';
			}
		},

		displayMonth: function(){
			var now, month, months, year;

			now = new Date();

			year = now.getFullYear();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();

			document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;

		},

		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.addType + ',' +
				DOMstrings.addValue + ',' +
				DOMstrings.addDescription				
			);

			nodeListForEach(fields, function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.addBtn).classList.toggle('red');

		}


	};


}) ();



// the main controller, that would be the bridge between the two previous

var mainController = ( function(bdgtCont,UICont) {
	

	var upgradeBudget = function() {

		//calculate the budget
		bdgtCont.calcBudget();
		// return the budget
		var budget = bdgtCont.getBudget();

		// display the budget to the UI
		UICont.upgBudget(budget);

	};


	var ctrlAddItem = function(){
		// get input from the UI, that means from the page
		var input = UICont.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value !== 0){
			// pass the input values to the budget controller
			newItem = bdgtCont.addItem(input.type, input.description, input.value);

			// add the new item to the UI
			UICont.addListItem(newItem, input.type);

			// clear the fields
			UICont.clearFields();

			//calculate and upgrade the new budget
			upgradeBudget();

			//upgrade percentages
			updatePercentages();
		}
	};

	var ctrlRemoveItem = function(event){

		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		splitID = itemID.split('-');
		type = splitID[0];
		ID = splitID[1];

		// remove element from the budget
		bdgtCont.removeItem(type,ID);

		// remove element from the UI
		UICont.removeListItem(itemID);

		//calculate and upgrade the new budget
		upgradeBudget();

		//upgrade percentages
		updatePercentages();

	};

	var updatePercentages = function() {

		// calculate the percentage for all objects
		bdgtCont.calcPercentages();

		//obtain percentages 
		var percentages = bdgtCont.getPercentages();

		// upgradt the percentages to the UI
		UICont.upgPercentages(percentages);

	};

	var setupEventListeners = function() {
		var DOM = UICont.getDOM();
		document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event){
				if(event.keyCode === 13 || event.which === 13){
					ctrlAddItem();
				}
		});

		document.querySelector(DOM.container).addEventListener('click',ctrlRemoveItem);

		document.querySelector(DOM.addType).addEventListener('change', UICont.changedType);
	};


	return {
		init: function(){

			// set init to 0
			UICont.displayMonth();
			UICont.upgBudget({
				totalExp: 0,
				totalInc: 0,
				totalBudget: 0,
				totalPerc: -1
			});
			setupEventListeners();
		}
	}



})(budgetController,UIController);

mainController.init();