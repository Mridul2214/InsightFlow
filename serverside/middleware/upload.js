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


// exports.checkUserBanStatus = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (user.isBanned) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Your account is banned from uploading content' 
//       });
//     }
//     next();
//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to verify account status' 
//     });
//   }
// };