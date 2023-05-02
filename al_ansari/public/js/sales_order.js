frappe.ui.form.on("Sales Order",{
    before_save : function(frm){
        item_rate(frm)
        // validate_posting_date(frm)
    }
})


function item_rate(frm){
   
        (frm.doc.items || []).forEach(function(item_rate){

            if (item_rate.rate < item_rate.price_list_rate){
                frappe.throw(__("Item rate is below price list rate"))
            }
        })
}

function validate_posting_date(frm) {
    if(frm.transaction_date){
        var currentdate = get_today()
        if (frm.transaction_date != currentdate){
            frappe.throw(__("Transaction Date should be equal to current date"))
        }
    }
    
}


frappe.ui.form.on("Sales Order Item",{
    qty : function(frm,cdt,cdn){
        let row = locals[cdt][cdn]

        frappe.call({
            method: 'frappe.client.get_value',
            args: {
                'doctype': 'Bin',
                'filters': {'item_code': row.item_code, 'warehouse':row.warehouse},
                'fieldname': [
                    'reserved_qty',
                    'reserved_qty_for_production',
                    'reserved_qty_for_sub_contract'
                ]
            },
            callback: function(r) {
                if (!r.exc) {
                    // code snippet
                    var reserved_qty = r.message.reserved_qty || 0
                    var reserved_qty_for_production = r.message.reserved_qty_for_production || 0
                    var reserved_qty_for_sub_contract = r.message.reserved_qty_for_sub_contract || 0
                    var total_reserved = reserved_qty + reserved_qty_for_production + reserved_qty_for_sub_contract || 0
                    if (total_reserved > 0) {
                        frappe.msgprint(__("Some stock is already reserved please check <br><b> Total Reserved: {0} </b> \
                        <br>Reserved Quantity: {1} <br>Reserved Qty for Production: {2} \
                        <br>Reserved Qty for Sub Contract: {3}\
                        ",[total_reserved,reserved_qty,reserved_qty_for_production,reserved_qty_for_sub_contract]))
                    } else {
                        frappe.msgprint(__("No Reserved Qty found for this item"))
                    }
                }
            }
        });
    }
})