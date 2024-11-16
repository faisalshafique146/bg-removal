import multer from "multer";

// Multer configuration
const storage = multer.diskStorage({
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

export default upload;