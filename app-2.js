var controlBudget = (function(){

    var Expense = function(value, description,id) {
        this.value = value;
        this.description = description;
        this.id = id;
        this.percentage = -1;
    };

    Expense.prototype.calcperc = function(totalInc) {
        if(totalInc > 0){
            this.percentage = Math.round(this.value / totalInc * 100);
        } else {
            this.percentage = -1;
        }
    }

    var Income = function(value, description,id) {
        this.value = value;
        this.description = description;
        this.id = id;
    };

    var calcSum = function(type) {
        var sum = 0;

        data.items[type].forEach(function(cur){
            sum += cur.value;
        })

        return sum;
    }

    var data = {
        items:{
            exp:[],
            inc:[]
        },
        total:{
            totalExp:0,
            totalInc:0
        },
        totalBudget:0,
        totalPercentage:-1
    };

    return {
        addItem: function(obj){
            var item, ID;

            if(data.items[obj.type].length > 0){
                ID = data.items[obj.type][data.items[obj.type].length-1].id + 1;
            }else {
                ID = 0;
            }

            if(obj.type === "exp"){
                item = new Expense(obj.value,obj.description, ID);
            } else {
                item = new Income(obj.value,obj.description, ID);
            } 

            data.items[obj.type].push(item);

            return item;
        },

        calcPercentage: function(){

            data.total.totalInc = calcSum("inc");
            data.total.totalExp = calcSum("exp");

            data.totalBudget = data.total.totalInc - data.total.totalExp;

            if(data.total.totalInc > 0){
                data.totalPercentage = Math.round(data.total.totalExp / data.total.totalInc * 100)
            } else {
                data.totalPercentage = -1;
            }

        },

        getPercentage: function() {
            return {
                exp: data.total.totalExp,
                inc: data.total.totalInc,
                budget:  data.totalBudget,
                percentage:  data.totalPercentage
            }
        },

        deleteItem: function(id,tp) {
            var arr,index;

            arr = data.items[tp].map(function(cur){
                return cur.id;
            });

            index = arr.indexOf(id);

            data.items[tp].splice(index,1);
        },

        calcIndividualPercentage: function() {
            data.items.exp.forEach(function(cur){
                cur.calcperc(data.total.totalInc);
            })
        },

        getIndividualPercentage: function(){
            var arr = data.items.exp.map(function(cur){
                return cur.percentage;
            });

            return arr;
        },

        test : function(){
            console.log(data);
        }
    }

})();

var controlUI = (function(){
    
    var DOMstrings = {
        addType: ".add__type",
        addDescription: ".add__description",
        addValue: ".add__value",
        addBtn: ".add__btn",
        expensesList: ".expenses__list",
        incomeList: ".income__list",
        budgetValue: ".budget__value",
        budgetIncome: ".budget__income--value",
        budgetExpenses: ".budget__expenses--value",
        budgetPercentage: ".budget__expenses--percentage",
        budgetMonth: ".budget__title--month",
        container: ".container",
        itemPercentage: ".item__percentage"
    };

    var listForEach = function(lists,func){
        for(var i = 0; i < lists.length ; i++){
            func(lists[i], i);
        }
    };

    var formatNum = function(num, type){
        var splitString,int,dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        if(num !== "0.00"){
            splitString= num.split(".");

            int = splitString[0];
            dec = splitString[1];

            if(int.length > 3) {
                int = int.substr(0,int.length-3) + "," + int.substr(int.length-3,3);
            }

            console.log(int);


            return (type === "inc" ? "+" : "-") + " " + int + "." + dec;

        } else {
            return num;
        }
        
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.addType).value,
                description: document.querySelector(DOMstrings.addDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.addValue).value) 
            }
        },

        displayItem: function(obj,type){
            var html, newHtml,element;

            if(type == "exp"){
                element = document.querySelector(DOMstrings.expensesList);
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else{
                element = document.querySelector(DOMstrings.incomeList);
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = html.replace("%id%",obj.id);
            newHtml = newHtml.replace("%description%",obj.description);
            newHtml = newHtml.replace("%value%",formatNum(obj.value,type));

            element.insertAdjacentHTML("beforeend",newHtml);
        },

        displayPercentage: function(obj){
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMstrings.budgetValue).textContent =  formatNum(obj.budget,type);
            document.querySelector(DOMstrings.budgetIncome).textContent =  formatNum(obj.inc,"inc");
            document.querySelector(DOMstrings.budgetExpenses).textContent = formatNum(obj.exp, "exp");

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.budgetPercentage).textContent = "---";
            }
        },

        displayIndividualPercentage: function(arrPerc){
            var fields = document.querySelectorAll(DOMstrings.itemPercentage);

            listForEach(fields,function(cur,index){
                if(arrPerc[index] > 0){
                    cur.textContent = arrPerc[index] + "%";
                } else {
                    cur.textContent = "---";
                }
            });
        },

        displayDate: function() {
            var date,year,month,months;

            date = new Date();

            year = date.getFullYear();
            month = date.getMonth();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            document.querySelector(DOMstrings.budgetMonth).textContent = months[month] + " " + year;
        },

        removeItem: function(id) {
            document.getElementById(id).parentNode.removeChild(document.getElementById(id));
        },

        toggleClass: function() {
            var fields = document.querySelectorAll(DOMstrings.addType + "," + DOMstrings.addDescription + "," + DOMstrings.addValue);

            listForEach(fields,function(cur){
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.addBtn).classList.toggle("red");
        },

        getDOM: function() {
            return DOMstrings;
        }
    }
})();

var controlApp = (function(ctrlBudget, ctrlUI){

    var DOM = ctrlUI.getDOM();

    var setEventHandler = function(){
        document.querySelector(DOM.addBtn).addEventListener("click",addItemList);

        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13){
                addItemList();
            }
        });

        document.querySelector(DOM.container).addEventListener("click",removeItemList)

        document.querySelector(DOM.addType).addEventListener("change",ctrlUI.toggleClass);

    };

    var clearInput = function() {
        var fields,arr;

        fields = document.querySelectorAll(DOM.addDescription + "," + DOM.addValue);

        arr = Array.prototype.slice.call(fields);

        arr.forEach(function(el){
            el.value = "";
        });

        arr[0].focus();

    };

    var updateBudget = function() {
        var budgetObj;

        // calculate budget and percentage
        ctrlBudget.calcPercentage();

        // get budget and percentage from budgetcontroller
        budgetObj = ctrlBudget.getPercentage();

        // display budget and percentage on UI
        ctrlUI.displayPercentage(budgetObj);
    };

    var updatePercentage = function() {
        var arr;

        // calculate individual percentage
        ctrlBudget.calcIndividualPercentage();

        // get individual percentage
        arr = ctrlBudget.getIndividualPercentage();

        // display individual percentage
        ctrlUI.displayIndividualPercentage(arr)
    };

    var addItemList = function() {
        var inputs,item
        // get an input from UI
       inputs = ctrlUI.getInput();

       clearInput();

       if(inputs.description !== "" && !isNaN(inputs.value) && inputs.value !== ""){

           //add an input to budget controller
           item = ctrlBudget.addItem(inputs);

           //display item on UI
           ctrlUI.displayItem(item,inputs.type);

           //calculate budget and percentage
           updateBudget();

           //calculate individual percentage
           updatePercentage();

       }
    };

    var removeItemList = function(event) {
        var htmlID,newHtmlID,ID,type;

        htmlID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(htmlID) {
            newHtmlID = htmlID.split("-");

            type = newHtmlID[0];
            ID = parseInt(newHtmlID[1]);

            // delete an item from data structure
            ctrlBudget.deleteItem(ID, type);

            // remove child element on UI
            ctrlUI.removeItem(htmlID);

            //calculate budget and percentage
             updateBudget();

            //calculate individual percentage
             updatePercentage();
        }
    }

    return {
        init: function(){
            console.log("Application starts");

            ctrlUI.displayPercentage({
                exp: 0,
                inc: 0,
                budget:  0,
                percentage:  -1
            })

            ctrlUI.displayDate();

            setEventHandler();
        }
    }
})(controlBudget,controlUI);

controlApp.init();