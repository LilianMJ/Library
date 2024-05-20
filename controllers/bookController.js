const Book = require("../models/book");
const Author = require("../models/author");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display the main page with book and author counts.
exports.index = asyncHandler(async (req, res, next) => {
  const [numBooks, numAuthors] = await Promise.all([
    Book.countDocuments({}).exec(),
    Author.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    author_count: numAuthors,
  });
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();

  res.render("book_list", { title: "Book List", book_list: allBooks });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("author").exec();

  if (book === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("book_detail", {
    title: book.title,
    book: book,
  });
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors,
  });
});

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array (dummy function since we removed genres).
  (req, res, next) => {
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
    });

    if (!errors.isEmpty()) {
      const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
      res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        book: book,
        errors: errors.array(),
      });
    } else {
      await book.save();
      res.redirect(book.url);
    }
  }),
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("author").exec();

  if (book === null) {
    res.redirect("/catalog/books");
  }

  res.render("book_delete", {
    title: "Delete book",
    book: book,
  });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect("/catalog/books");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("author").exec();

  if (book === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("book_form", {
    title: "Update Book",
    authors: (await Author.find().sort({ family_name: 1 }).exec()),
    book: book,
  });
});

// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array (dummy function since we removed genres).
  (req, res, next) => {
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      res.render("book_form", {
        title: "Update Book",
        authors: (await Author.find().sort({ family_name: 1 }).exec()),
        book: book,
        errors: errors.array(),
      });
    } else {
      await Book.findByIdAndUpdate(req.params.id, book, {});
      res.redirect(book.url);
    }
  }),
];
