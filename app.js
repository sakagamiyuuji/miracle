const express = require("express");
const { body, validationResult } = require("express-validator"); // Import validation functions
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
    const alert = req.query.alert; // Read alert query parameter
    res.render("contact/contact", {
      title: "Contact",
      contacts,
      alert,
      error: null,
    });
  } catch (err) {
    res.render("contact/contact", {
      title: "Contact",
      contacts: null,
      alert: null,
      error: "No contact saved",
    });
  }
});

// Validation middleware
const contactValidation = [
  body("fullName").notEmpty().withMessage("Full name is required."),
  body("email").isEmail().withMessage("Invalid email address."),
  body("phoneNumber")
    .matches(
      /^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$/
    )
    .withMessage("Invalid phone number."),
];

app.post("/contact/addContact", contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const alert = errors
      .array()
      .map((err) => err.msg)
      .join(", "); // Collect errors
    return res.redirect(`/contact?alert=${encodeURIComponent(alert)}`); // Redirect with alert
  }

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

app.post("/contact/updateContact", contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const alert = errors
      .array()
      .map((err) => err.msg)
      .join(", "); // Collect errors
    return res.redirect(`/contact?alert=${encodeURIComponent(alert)}`); // Redirect with alert
  }

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
