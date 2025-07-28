import multer from 'multer'
import path from 'path'

const storage = multer.diskstorage({
    detination:function(req,File,cb){
        cb(null,'uploads/');

    },
    filename: function(req,File,cb) {
        cb(null,Date.now()+path.extname(file.orginalname));
    },
});

const upload =multer({ storage});

export default upload

