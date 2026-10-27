const bookService = require("../services/bookService");

// GET /api/books
const getAllBooks = async (req, res) => {
    try {
        const books = await bookService.getAllBooks();

        return res.status(200).json({
            success: true,
            data: books
        });
    } catch (error) {
        console.error("Loi getAllBooks:", error.message);

        return res.status(500).json({
            success: false,
            message: "Loi khi lay danh sach sach."
        });
    }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "BookID phai la so nguyen duong."
            });
        }

        const book = await bookService.getBookById(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay sach."
            });
        }

        return res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        console.error("Loi getBookById:", error.message);

        return res.status(500).json({
            success: false,
            message: "Loi khi lay chi tiet sach."
        });
    }
};

// POST /api/books
const createBook = async (req, res) => {
    try {
        const {
            Title,
            Author,
            Description,
            CategoryID,
            Language
        } = req.body;

        if (
            typeof Title !== "string" ||
            Title.trim().length === 0 ||
            Title.trim().length > 250
        ) {
            return res.status(400).json({
                success: false,
                message: "Title la bat buoc va toi da 250 ky tu."
            });
        }

        if (Author != null && typeof Author !== "string") {
            return res.status(400).json({
                success: false,
                message: "Author phai la chuoi hoac null."
            });
        }

        if (Author && Author.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Author khong duoc vuot qua 200 ky tu."
            });
        }

        if (Description != null && typeof Description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Description phai la chuoi hoac null."
            });
        }

        if (Language != null && typeof Language !== "string") {
            return res.status(400).json({
                success: false,
                message: "Language phai la chuoi hoac null."
            });
        }

        if (Language && Language.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Language khong duoc vuot qua 10 ky tu."
            });
        }

        let parsedCategoryID = null;

        if (
            CategoryID !== undefined &&
            CategoryID !== null &&
            CategoryID !== ""
        ) {
            parsedCategoryID = Number(CategoryID);

            if (
                !Number.isInteger(parsedCategoryID) ||
                parsedCategoryID <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "CategoryID phai la so nguyen duong hoac null."
                });
            }
        }

        const book = await bookService.createBook({
            Title,
            Author,
            Description,
            CategoryID: parsedCategoryID,
            Language
        });

        return res.status(201).json({
            success: true,
            message: "Them sach thanh cong!",
            data: book
        });
    } catch (error) {
        console.error("Loi createBook:", error.message);

        if (error.number === 547) {
            return res.status(400).json({
                success: false,
                message: "CategoryID khong ton tai trong bang Categories."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Loi khi them sach."
        });
    }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "BookID phai la so nguyen duong."
            });
        }

        const {
            Title,
            Author,
            Description,
            CategoryID,
            Language
        } = req.body;

        if (
            typeof Title !== "string" ||
            Title.trim().length === 0 ||
            Title.trim().length > 250
        ) {
            return res.status(400).json({
                success: false,
                message: "Title la bat buoc va toi da 250 ky tu."
            });
        }

        if (Author != null && typeof Author !== "string") {
            return res.status(400).json({
                success: false,
                message: "Author phai la chuoi hoac null."
            });
        }

        if (Author && Author.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Author khong duoc vuot qua 200 ky tu."
            });
        }

        if (Description != null && typeof Description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Description phai la chuoi hoac null."
            });
        }

        if (Language != null && typeof Language !== "string") {
            return res.status(400).json({
                success: false,
                message: "Language phai la chuoi hoac null."
            });
        }

        if (Language && Language.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Language khong duoc vuot qua 10 ky tu."
            });
        }

        let parsedCategoryID = null;

        if (
            CategoryID !== undefined &&
            CategoryID !== null &&
            CategoryID !== ""
        ) {
            parsedCategoryID = Number(CategoryID);

            if (
                !Number.isInteger(parsedCategoryID) ||
                parsedCategoryID <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "CategoryID phai la so nguyen duong hoac null."
                });
            }
        }

        const updatedBook = await bookService.updateBook(id, {
            Title,
            Author,
            Description,
            CategoryID: parsedCategoryID,
            Language
        });

        if (!updatedBook) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay sach de cap nhat."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cap nhat sach thanh cong!"
        });
    } catch (error) {
        console.error("Loi updateBook:", error.message);

        if (error.number === 547) {
            return res.status(400).json({
                success: false,
                message: "CategoryID khong ton tai trong bang Categories."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Loi khi cap nhat sach."
        });
    }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "BookID phai la so nguyen duong."
            });
        }

        const deleted = await bookService.deleteBook(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay sach de xoa."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xoa sach thanh cong!"
        });
    } catch (error) {
        console.error("Loi deleteBook:", error.message);

        return res.status(500).json({
            success: false,
            message: "Loi khi xoa sach."
        });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
