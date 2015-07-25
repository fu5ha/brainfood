var globals = {};

$(document).ready(function() {
    riot.mount('inventory', {mounted : inventoryMounted, addItemToBag: addItemToBag, deleteItem: deleteItem, renewData: renewData});
    riot.mount('bagview', {mounted: bagviewMounted, saveBagToDatabase: saveBagToDatabase});
    riot.mount('new-item', {createNewItem: createNewItem});
    riot.mount('order', {mounted: orderMounted, renewData: renewOrderData, submitSchool: submitSchool});
    riot.mount('new-school', {createNewSchool: createNewSchool});
    $.getJSON('/api/bags', function(data) {
        globals.bags = data;
    });
    riot.route('inventory');
    riot.route(function(collection, id, action) {
        if (collection === 'order') {
            $('inventory').hide();
            $('order').show();
            $('#new-button').attr("href", "#new-school");
            $('#new-button button').text("Add School");
            $('#top-button').attr("href", "#submitall");
            $('#top-button button').text("Submit All");
            $('.main-bottom-bar button.inventory').hide();
            var update = function() {
                globals.order.update();
            }
            globals.order.trigger('renewData', update);
        } else if (collection === 'inventory') {
            $('order').hide();
            $('inventory').show();
            $('#new-button').attr("href", "#new-item");
            $('#new-button button').text("Add Food Item");
            $('#top-button').attr("href", "#bagView");
            $('#top-button button').text("View Bag");
            $('.main-bottom-bar button.inventory').show();
            var update = function () {
                globals.inventory.trigger('stock-changed');
            }
            globals.inventory.trigger('renewData', update);
        } else if (collection === 'submitall'){
            submitAllSchools();
        }
    });
});

function assignAll() {
    console.log("assign")
    var selected_index = $('.bag-select').first().prop('selectedIndex')
    console.log(selected_index)
    $('.bag-select').prop('selectedIndex', selected_index);
}

function submitAllSchools() {
    $.getJSON('/api/schools', function(data) {
        var schools = data;
        for (var i=0;i<schools.length;i++) {
            var school = schools[i]
            schoolSubmitted(school._id);
        }
    });
}

function schoolSubmitted(schoolID) {
    globals.order.trigger('school-submitted', schoolID);
}


function removeInventory(schoolID, callback) {
    var school = {}
    $.getJSON('/api/school/'+schoolID, function(data) {
        school = data;
        var num_bags = school.bags;
        var bag = school.bag;
        for (var i=0;i<bag.items.length;i++) {
            var item = bag.items[i].item;
            var items_per_bag = bag.items[i].number;
            var total = (items_per_bag * num_bags) * -1;
            $.ajax({
                url: '/api/item/inc/'+item._id,
                type: 'PUT',
                data: JSON.stringify({"stock" : total}),
                contentType: 'application/json',
                success: function(data){
                    callback(true)
                },
                error: function() {
                    callback(false)
                }
            });
        }
    });
}

function removeSchool(schoolID) {
    $.ajax({
        url: '/api/school/'+schoolID,
        type: 'DELETE',
        success: function(data) {
            var update = function() {
                globals.order.update();
            }
            globals.order.trigger('renewData', update);
        }
    });
}

function submitSchool(schoolID, bagID) {
    var bag = {}
    $.getJSON('/api/bag/'+bagID, function(data) {
        bag = data;
        $.ajax({
            url: '/api/school/'+schoolID,
            type: 'PUT',
            data: JSON.stringify({"bag" : bag}),
            contentType: 'application/json',
            success: function(data){
                var callback = function(success) {
                    if (success) {
                        removeSchool(schoolID);
                    }
                }
                removeInventory(schoolID, callback);
            }
        });
    });
}

function orderMounted(tag) {
    var data_array = [];
    $.getJSON('/api/schools', function(data) {
        data_array.push(data);
        $.getJSON('/api/bags', function(data1) {
            data_array.push(data1);
            tag.trigger('data_loaded', data_array);
        });
    });
    globals.order = tag;
    $('order').hide()
}

function inventoryMounted(tag) {
    $.getJSON('/api/items', function(data) {
        tag.trigger('data_loaded', data);
    });
    globals.inventory = tag;
}

function renewOrderData(callback) {
    var data_array = [];
    $.getJSON('/api/schools', function(data) {
        data_array[0] = data;
        $.getJSON('/api/bags', function(data1) {
            data_array[1] = data1;
            callback(data_array);
        });
    });
}

function renewData(callback) {
    $.getJSON('/api/items', function(data) {
        callback(data);
    });
}

function bagviewMounted(tag) {
    globals.bagview = tag;
}

function addItemToBag(itemID) {
    $.getJSON('/api/item/' + itemID, function(data) {
        globals.bagview.trigger('item-added', data);
    });
}

function deleteSelected() {
    globals.inventory.trigger('delete-selected');
}

function deleteItem(itemID) {
    $.ajax({
        url: 'api/item/'+itemID,
        type: 'DELETE',
        success: function(res) {}
    });
    var update = function () {
        globals.inventory.trigger('stock-changed');
    }
    globals.inventory.trigger('renewData', update);
}

function quantityChanged(obj) {
    globals.bagview.trigger('quantity-changed', obj);
}

function removeItemFromBag(itemID) {
    globals.bagview.trigger('remove-item', itemID);
}

function saveBagToDatabase(bag, callback) {
    var unique = true;
    for (var i=0;i<globals.bags.length;i++) {
        if (globals.bags[i].name === bag.name) {
            unique = false;
        }
    }

    if (unique) {
        $.ajax({
            url: 'api/bags',
            type: 'POST',
            data: JSON.stringify(bag),
            contentType: 'application/json',
            success: function(result) {
                callback(true);
            },
            error: function() {
                callback(false);
            }
        });
        $.getJSON('/api/bags', function(data) {
            globals.bags = data;
        });
    } else {
        $.ajax({
            url: 'api/bag/name/' + bag.name,
            type: 'PUT',
            data: JSON.stringify(bag),
            contentType: 'application/json',
            success: function(result) {
                callback(true);
            },
            error: function() {
                callback(false);
            }
        });
    }
}

function createNewItem(item, callback) {
    $.ajax({
        url: 'api/items',
        type: 'POST',
        data: JSON.stringify(item),
        contentType: 'application/json',
        success: function(result) {
            var update = function () {
                globals.inventory.trigger('stock-changed');
            }
            globals.inventory.trigger('renewData', update);
            callback(true);
        },
        error: function() {
            callback(false);
        }
    });
}

function createNewSchool(school, callback) {
    $.ajax({
        url: 'api/schools',
        type: 'POST',
        data: JSON.stringify(school),
        contentType: 'application/json',
        success: function(result) {
            var update = function() {
                globals.order.update();
            }
            globals.order.trigger('renewData', update);
            callback(true);
        },
        error: function() {
            callback(false);
        }
    });
}

function selectAll(cb) {
    globals.inventory.trigger('select-all', cb);
}

function changeStock(itemID) {
    var stock_val = document.getElementById(itemID+'-stock').value;
    var json = JSON.stringify({ stock: stock_val });
    $.ajax({
        url: 'api/item/' + itemID,
        type: 'PUT',
        data: json,
        contentType: 'application/json',
        success: function(result) {}
    });
    globals.inventory.trigger('stock-changed');
}