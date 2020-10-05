const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin-oluwasegun:$Champion22@cluster0.u0dzv.mongodb.net/todolistDB1', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your Todolist!"
});

const item2 = new Item ({
    name: "Hit the + button to add new items"
});

const item3 = new Item ({
    name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

//const items = [];
const customItems = [];

app.get("/", function(req, res){
    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if (err) {
                    console.log(err)
                } else {
                    console.log ("Successfully added defaultItems to DB");
                }
            });
            res.redirect("/");
        }else {
            res.render("list", {listTitle: "Today", listOfItems: foundItems});
        }
    });
    
});


app.get("/:customList", function(req, res){
    const customTitle = _.capitalize(req.params.customList);

    List.findOne({name: customTitle}, function(err, foundList){
        if (!err) {
            if (!foundList) {
                //Create a new list.
                const list = new List ({
                    name: customTitle,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customTitle);
            } else {
                //Show an existing list.
                res.render("list", {listTitle: foundList.name, listOfItems: foundList.items});
            }
        }
    })

    

    
});

/*app.post("/customList", function(req, res){
    const listItem = req.body.newActivity;
    customItems.push(listItem);
    console.log(customItems);
    res.redirect("/customList");
})*/

app.post("/", function(req, res) {
    const newItem = req.body.newActivity;
    const listName = req.body.list;
 
    const item = new Item ({
        name: newItem
    });

    if (listName === "Today") {
        item.save();
    res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

    

   /* if (listName === "Today"){
     items.push(newItem);
     res.redirect("/");
    } else {
     customItems.push(newItem);
     res.redirect("/" + listName);
    }*/
     
 
 });

 app.post("/delete", function(req, res){
     const checkedItemId = req.body.checkbox;
     const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if (err){
                console.log(err)
            } else {
                console.log("Successfully removed item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

     
 });

app.listen(3000, function(){
    console.log("Server started on port 3000");
});