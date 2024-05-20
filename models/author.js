const mongoose = require("mongoose");
const Book = require("../models/book");

const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

AuthorSchema.virtual("name").get(function () {
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  return fullname;
});

AuthorSchema.virtual("url").get(function () {
  return `/catalog/author/${this._id}`;
});


AuthorSchema.virtual("lifespan").get(function () {
  let birth = this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth) : null;
  let death = this.date_of_death ? DateTime.fromJSDate(this.date_of_death) : null;
  birth = birth ? birth.toLocaleString(DateTime.DATE_MED) : 'Unknown';
  death = death ? death.toLocaleString(DateTime.DATE_MED) : 'Unknown';
  return `${birth} - ${death}`;
});

module.exports = mongoose.model("Author", AuthorSchema);
