const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("layout", "layouts/main"); // Specify the default layout
app.use(express.static("public"));

// Function to read contacts from JSON file
const readContacts = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "data", "contacts.json"),
      "utf-8",
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      }
    );
  });
};

// Function to write contacts to JSON file
const writeContacts = (contacts) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(__dirname, "data", "contacts.json"),
      JSON.stringify(contacts, null, 2),
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

app.get("/", (req, res) => {
  res.render("home/home", { title: "Home" });
});

app.get("/contact", async (req, res) => {
  try {
    const contacts = await readContacts();
    res.render("contact/contact", { title: "Contact", contacts, error: null });
  } catch (err) {
    res.render("contact/contact", {
      title: "Contact",
      contacts: null,
      error: "No contact saved",
    });
  }
});

app.post("/contact/addContact", async (req, res) => {
  const { fullName, phoneNumber, email } = req.body;
  try {
    const contacts = await readContacts();
    contacts.push({ fullName, phoneNumber, email });
    await writeContacts(contacts);
    res.redirect("/contact");
  } catch (err) {
    res.render("contact/contact", {
      title: "Contact",
      contacts: null,
      error: "Error saving contact",
    });
  }
});

app.post("/contact/updateContact", async (req, res) => {
  const { id, fullName, phoneNumber, email } = req.body;
  try {
    const contacts = await readContacts();
    contacts[id] = { fullName, phoneNumber, email };
    await writeContacts(contacts);
    res.redirect("/contact");
  } catch (err) {
    res.render("contact/contact", {
      title: "Contact",
      contacts: null,
      error: "Error updating contact",
    });
  }
});

app.post("/contact/deleteContact", async (req, res) => {
  const { id } = req.body;
  try {
    const contacts = await readContacts();
    contacts.splice(id, 1);
    await writeContacts(contacts);
    res.redirect("/contact");
  } catch (err) {
    res.render("contact/contact", {
      title: "Contact",
      contacts: null,
      error: "Error deleting contact",
    });
  }
});

app.get("/about", (req, res) => {
  res.render("about/about", { title: "About" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
