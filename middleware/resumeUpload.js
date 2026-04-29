import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb) =>{
    if(file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
            cb(null, true);
        }else{
            cb(new Error('Invalid file type. Only PDF and DOCX are allowed'), false)
        }    
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 5 * 1024 * 1024} 
});

export default upload;